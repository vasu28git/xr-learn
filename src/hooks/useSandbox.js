import { useState, useCallback } from 'react'
import { module1 } from '../config/modules/module1'
import { module2 } from '../config/modules/module2'
import { module3 } from '../config/modules/module3'
import { module4 } from '../config/modules/module4'
import { module5 } from '../config/modules/module5'
import { module6 } from '../config/modules/module6'
import { module7 } from '../config/modules/module7'
import { module8 } from '../config/modules/module8'
import { module9 } from '../config/modules/module9'
import { module10 } from '../config/modules/module10'
import { module11 } from '../config/modules/module11'

const modules = {
  1: module1,
  2: module2,
  3: module3,
  4: module4,
  5: module5,
  6: module6,
  7: module7,
  8: module8,
  9: module9,
  10: module10,
  11: module11,
}

function getInitialState(moduleId) {
  switch (moduleId) {
    case 1:
      return {
        virtualClicked: false,
        anchoredClicked: false,
      }
    case 2:
      return {
        box: {
          position: { x: 0, y: 0.5, z: 0 },
        },
      }
    case 3:
      return {
        table: { position: { x: 0, y: 0.25, z: 0 }, moved: false },
        box1Parent: null,
        box2Parent: null,
      }
    case 4:
      return {
        light: { intensity: 0.5 },
        material: { color: '#ffffff', roughness: 0.5, metalness: 0.0 },
      }
    case 5:
      return {
        box: {
          color: '#4488ff',
          hasClickHandler: false,
          clickHandler: null,
        },
      }
    case 6:
      return {
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
    default:
      return {}
  }
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

export function useSandbox(moduleId) {
  const id = Number(moduleId)
  const [sceneState, setSceneState] = useState(() => getInitialState(id))
  const [lastError, setLastError] = useState(null)

  const runCode = useCallback(
    (code) => {
      setLastError(null)

      const api = buildModuleAPI(id, setSceneState, () => sceneState)

      try {
        const keys = Object.keys(api)
        const values = Object.values(api)
        const fn = new Function(...keys, code)
        fn(...values)
      } catch (error) {
        setLastError(error.message)
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
