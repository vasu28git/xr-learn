import React, { useState, useCallback } from 'react'
import { module1 } from '../config/modules/module1'
import { module2 } from '../config/modules/module2'
import { module3 } from '../config/modules/module3'
import { module4 } from '../config/modules/module4'
import { module5 } from '../config/modules/module5'
import { module6 } from '../config/modules/module6'
import { api } from '../lib/api'
import { executeXrCommands } from '../utils/xrCommandExecutor'

const modules = { 1: module1, 2: module2, 3: module3, 4: module4, 5: module5, 6: module6 }

function getInitialState(moduleId) {
  let state = {}
  switch (moduleId) {
    case 1:
      state = {
        virtualClicked: false,
        anchoredClicked: false,
      }
      break
    case 2:
      state = {
        box: {
          position: { x: 0, y: 0.5, z: 0 },
        },
      }
      break
    case 3:
      state = {
        table: { position: { x: 0, y: 0.25, z: 0 }, moved: false },
        box1Parent: null,
        box2Parent: null,
      }
      break
    case 4:
      state = {
        light: { intensity: 0.5 },
        material: { color: '#ffffff', roughness: 0.5, metalness: 0.0 },
      }
      break
    case 5:
      state = {
        box: {
          color: '#4488ff',
          hasClickHandler: false,
          clickHandler: null,
        },
      }
      break
    case 6:
      state = {
        box1: { position: { x: 0, y: 0.5, z: 0 }, color: '#4488ff' },
        box2: { position: { x: 2, y: 0.5, z: 0 }, color: '#ff8844' },
        sphere1: { position: { x: -2, y: 1, z: 2 }, color: '#44ff88' },
        light: { intensity: 0.8 },
        material: { color: '#4488ff', roughness: 0.5, metalness: 0.0 },
        objectsPositioned: 0,
        parentChildSet: false,
        hasClickHandler: false,
        parents: {},
        clickHandlers: {},
      }
      break
    default:
      state = {}
  }
  return { ...state, hasRun: false }
}

function buildModuleAPI(moduleId, updateState, getState) {
  switch (moduleId) {
    case 1:
      return {}

    case 2: {
      const box = {
        position: new Proxy(
          { x: 0, y: 0.5, z: 0 },
          {
            set(target, prop, value) {
              if (['x', 'y', 'z'].includes(prop)) {
                target[prop] = Number(value)
                updateState(prev => ({
                  ...prev,
                  box: {
                    ...prev.box,
                    position: { ...prev.box.position, [prop]: Number(value) },
                  },
                }))
                return true
              }
              return false
            },
          }
        ),
      }
      return { box }
    }

    case 3: {
      const table = {
        position: new Proxy(
          { x: 0, y: 0.25, z: 0 },
          {
            set(target, prop, value) {
              if (['x', 'y', 'z'].includes(prop)) {
                target[prop] = Number(value)
                updateState(prev => ({
                  ...prev,
                  table: {
                    ...prev.table,
                    position: { ...prev.table.position, [prop]: Number(value) },
                    moved: true,
                  },
                }))
                return true
              }
              return false
            },
          }
        ),
      }
      const box1 = { id: 'box1' }
      const box2 = { id: 'box2' }
      const scene = {
        setParent: (child, parent) => {
          if (child?.id && parent === table) {
            updateState(prev => ({
              ...prev,
              [child.id + 'Parent']: 'table',
            }))
          }
        },
      }
      return { table, box1, box2, scene }
    }

    case 4: {
      const light = new Proxy(
        { intensity: 0.5 },
        {
          set(target, prop, value) {
            if (prop === 'intensity') {
              target[prop] = Number(value)
              updateState(prev => ({
                ...prev,
                light: { ...prev.light, intensity: Number(value) },
              }))
              return true
            }
            return false
          },
        }
      )
      const material = new Proxy(
        { color: '#ffffff', roughness: 0.5, metalness: 0.0 },
        {
          set(target, prop, value) {
            if (['color', 'roughness', 'metalness'].includes(prop)) {
              target[prop] = prop === 'color' ? String(value) : Number(value)
              updateState(prev => ({
                ...prev,
                material: {
                  ...prev.material,
                  [prop]: prop === 'color' ? String(value) : Number(value),
                },
              }))
              return true
            }
            return false
          },
        }
      )
      return { light, material }
    }

    case 5: {
      const box = {
        _color: '#4488ff',
        get color() {
          return this._color
        },
        set color(value) {
          this._color = String(value)
          updateState(prev => ({
            ...prev,
            box: { ...prev.box, color: String(value) },
          }))
        },
        onClick: (fn) => {
          if (typeof fn === 'function') {
            updateState(prev => ({
              ...prev,
              box: { ...prev.box, hasClickHandler: true, clickHandler: fn },
            }))
          }
        },
      }
      return { box }
    }

    case 6: {
      const createObject = (id, defaults) => {
        const obj = {
          _color: defaults.color,
          position: new Proxy(
            { ...defaults.position },
            {
              set(target, prop, value) {
                if (['x', 'y', 'z'].includes(prop)) {
                  target[prop] = Number(value)
                  updateState(prev => {
                    const newState = {
                      ...prev,
                      [id]: {
                        ...prev[id],
                        position: { ...prev[id]?.position, [prop]: Number(value) },
                      },
                    }
                    // Count positioned objects
                    let positioned = 0
                      ;['box1', 'box2', 'sphere1'].forEach(objId => {
                        const pos = newState[objId]?.position
                        if (pos) {
                          const initial = getInitialState(6)[objId]?.position
                          if (
                            pos.x !== initial?.x ||
                            pos.y !== initial?.y ||
                            pos.z !== initial?.z
                          ) {
                            positioned++
                          }
                        }
                      })
                    newState.objectsPositioned = positioned
                    return newState
                  })
                  return true
                }
                return false
              },
            }
          ),
          get color() {
            return this._color
          },
          set color(value) {
            this._color = String(value)
            updateState(prev => ({
              ...prev,
              [id]: { ...prev[id], color: String(value) },
            }))
          },
          onClick: (fn) => {
            if (typeof fn === 'function') {
              updateState(prev => ({
                ...prev,
                hasClickHandler: true,
                clickHandlers: { ...prev.clickHandlers, [id]: fn },
              }))
            }
          },
        }
        return obj
      }

      const box1 = createObject('box1', {
        position: { x: 0, y: 0.5, z: 0 },
        color: '#4488ff',
      })
      const box2 = createObject('box2', {
        position: { x: 2, y: 0.5, z: 0 },
        color: '#ff8844',
      })
      const sphere1 = createObject('sphere1', {
        position: { x: -2, y: 1, z: 2 },
        color: '#44ff88',
      })

      const light = new Proxy(
        { intensity: 0.8 },
        {
          set(target, prop, value) {
            if (prop === 'intensity') {
              target[prop] = Number(value)
              updateState(prev => ({
                ...prev,
                light: { ...prev.light, intensity: Number(value) },
              }))
              return true
            }
            return false
          },
        }
      )

      const material = new Proxy(
        { color: '#4488ff', roughness: 0.5, metalness: 0.0 },
        {
          set(target, prop, value) {
            if (['color', 'roughness', 'metalness'].includes(prop)) {
              target[prop] = prop === 'color' ? String(value) : Number(value)
              updateState(prev => ({
                ...prev,
                material: {
                  ...prev.material,
                  [prop]: prop === 'color' ? String(value) : Number(value),
                },
              }))
              return true
            }
            return false
          },
        }
      )

      const scene = {
        setParent: (child, parent) => {
          if (child && parent) {
            updateState(prev => ({
              ...prev,
              parentChildSet: true,
              parents: {
                ...prev.parents,
                [child.id || 'unknown']: parent.id || 'unknown',
              },
            }))
          }
        },
      }

      // Add id properties for scene.setParent
      box1.id = 'box1'
      box2.id = 'box2'
      sphere1.id = 'sphere1'

      return { box1, box2, sphere1, light, material, scene }
    }

    default:
      return {}
  }
}

function preprocessCSharpCode(code, moduleId) {
  // If the code already contains class definition, leave it as is
  if (code.includes('class ') || code.includes('MonoBehaviour')) {
    return code
  }

  let js = code

  // Remove C# float suffix
  js = js.replace(/(\d+\.?\d*)\s*f\b/gi, '$1')

  // Convert transform.parent assignments
  js = js.replace(/(\w+)\.transform\.parent\s*=\s*(\w+)\.transform/g, 'xr.SetParent("$1", "$2")')

  // Convert scene.setParent calls
  js = js.replace(/scene\.setParent\((\w+),\s*(\w+)\)/g, 'xr.SetParent("$1", "$2")')

  // Convert transform.position assignments
  js = js.replace(/(\w+)\.transform\.position\s*=\s*/g, 'xr.SetPosition("$1", ')

  // Convert box.position.x/y/z assignments (Module 2)
  if (Number(moduleId) === 2) {
    let x = 0, y = 0.5, z = 0
    const mx = /box\.position\.x\s*=\s*([^;\n]+)/.exec(js)
    const my = /box\.position\.y\s*=\s*([^;\n]+)/.exec(js)
    const mz = /box\.position\.z\s*=\s*([^;\n]+)/.exec(js)
    if (mx) x = mx[1].trim()
    if (my) y = my[1].trim()
    if (mz) z = mz[1].trim()
    js = `xr.SetPosition("box", new Vector3(${x}, ${y}, ${z}));`
  }

  // Convert table.position.x assignment (Module 3)
  if (Number(moduleId) === 3) {
    const mt = /table\.position\.x\s*=\s*([^;\n]+)/.exec(js)
    const val = mt ? mt[1].trim() : 0
    js = js.replace(/table\.position\.x\s*=\s*([^;\n]+)/g, '')
    js += `\nxr.SetPosition("table", new Vector3(${val}, 0.25f, 0));`
  }

  // Convert property mappings for Light and Material
  js = js.replace(/light\.intensity/g, 'Light.intensity')
  js = js.replace(/material\.color/g, 'Material.color')
  js = js.replace(/material\.roughness/g, 'Material.roughness')
  js = js.replace(/material\.metalness/g, 'Material.metalness')

  // Strip click handlers so they don't cause compile errors
  js = js.replace(/(\w+)\.(onClick|OnClick)\([\s\S]*?\);?/gi, '')

  // Wrap in class template
  return `using UnityEngine;

public class StudentScript : MonoBehaviour
{
    void Start()
    {
        ${js}
    }
}`
}

export function useSandbox(moduleId) {
  const id = Number(moduleId)
  const [sceneState, setSceneState] = useState(() => getInitialState(id))
  const [lastError, setLastError] = useState(null)

  const runCode = useCallback(
    async (code) => {
      setLastError(null)
      try {
        const processedCode = preprocessCSharpCode(code, id)
        const res = await api.execute.run(processedCode)
        
        if (res.errors && res.errors.length > 0) {
          const firstErr = res.errors[0]
          setLastError(`${firstErr.kind.toUpperCase()} ERROR: ${firstErr.message} (Line ${firstErr.line}, Col ${firstErr.column})`)
          return
        }

        if (res.commands) {
          const commands = [...res.commands]
          // Inject RegisterClick commands if user added Click handler registration
          if (/box1\.(onClick|OnClick)/i.test(code)) commands.push({ Type: 'RegisterClick', Name: 'box1' })
          if (/box2\.(onClick|OnClick)/i.test(code)) commands.push({ Type: 'RegisterClick', Name: 'box2' })
          if (/box3\.(onClick|OnClick)/i.test(code)) commands.push({ Type: 'RegisterClick', Name: 'box3' })
          if (/box\.(onClick|OnClick)/i.test(code)) commands.push({ Type: 'RegisterClick', Name: 'box' })

          setSceneState((prev) => {
            const next = executeXrCommands(commands, prev, id)
            next.hasRun = true
            return next
          })
        }
      } catch (error) {
        setLastError(`Network Error: ${error.message}`)
      }
    },
    [id]
  )

  const handleSceneClick = useCallback(
    (objectId) => {
      if (id === 1) {
        setSceneState(prev => ({
          ...prev,
          [objectId + 'Clicked']: true,
        }))
      }
    },
    [id]
  )

  const resetState = useCallback(() => {
    setSceneState(getInitialState(id))
    setLastError(null)
  }, [id])

  return { sceneState, runCode, lastError, handleSceneClick, resetState, setSceneState }
}
