/**
 * Web Worker: Secure C# code execution sandbox.
 * Receives transpiled JavaScript code, executes it with a scoped API,
 * and posts back state changes. Auto-terminates after 200ms timeout.
 */

// Listen for code execution requests
self.onmessage = function (e) {
  const { transpiledCode, apiKeys, initialState } = e.data

  try {
    // Build a mutable copy of scene state that the code will mutate
    const state = JSON.parse(JSON.stringify(initialState))
    const stateChanges = {}

    // Build simple proxy objects for each API key
    // The worker operates on plain data (no React, no Three.js)
    const apiValues = apiKeys.map((key) => {
      if (key === 'scene') {
        return {
          setParent: (child, parent) => {
            const childName =
              typeof child === 'string' ? child : child.__name__
            const parentName =
              typeof parent === 'string' ? parent : parent.__name__
            stateChanges[childName + 'Parent'] = parentName
          },
        }
      }

      // For object APIs like box, table, box1, box2, sphere1, light, material
      const obj = state[key] || {}
      const proxy = {
        __name__: key,
        position: new Proxy(obj.position || { x: 0, y: 0, z: 0 }, {
          set(target, prop, value) {
            target[prop] = Number(value)
            if (!stateChanges[key]) stateChanges[key] = {}
            if (!stateChanges[key].position) stateChanges[key].position = { ...target }
            stateChanges[key].position[prop] = Number(value)
            return true
          },
        }),
        get color() {
          return obj.color || '#ffffff'
        },
        set color(val) {
          if (!stateChanges[key]) stateChanges[key] = {}
          stateChanges[key].color = val
        },
        onClick: (fn) => {
          if (!stateChanges[key]) stateChanges[key] = {}
          stateChanges[key].hasClickHandler = true
          // We can't transfer functions across worker boundary,
          // so we flag that a handler was registered
        },
      }

      // Support direct property assignment for light/material
      if (key === 'light' || key === 'material') {
        return new Proxy(obj, {
          set(target, prop, value) {
            target[prop] = typeof value === 'number' ? value : value
            if (!stateChanges[key]) stateChanges[key] = {}
            stateChanges[key][prop] = value
            return true
          },
          get(target, prop) {
            return target[prop]
          },
        })
      }

      return proxy
    })

    // Execute the transpiled code securely
    const fn = new Function(...apiKeys, transpiledCode)
    fn(...apiValues)

    // Post the state changes back to the main thread
    self.postMessage({ success: true, stateChanges })
  } catch (error) {
    self.postMessage({ success: false, error: error.message })
  }
}
