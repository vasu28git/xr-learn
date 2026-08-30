/**
 * Reusable Three.js XR Command Executor.
 * Maps C# server commands to Three.js modifications and maintains dynamic object states.
 */
export function executeXrCommands(commands, currentSceneState, moduleId) {
  // Deep copy the sceneState to avoid mutating original state directly
  const nextState = JSON.parse(JSON.stringify(currentSceneState || {}));
  
  if (!nextState.dynamicObjects) {
    nextState.dynamicObjects = {};
  }

  for (const cmd of commands) {
    const type = cmd.type || cmd.Type;
    const name = cmd.name || cmd.Name || cmd.object || cmd.Object;
    if (!type) continue;
    
    const x = cmd.x !== undefined ? cmd.x : cmd.X;
    const y = cmd.y !== undefined ? cmd.y : cmd.Y;
    const z = cmd.z !== undefined ? cmd.z : cmd.Z;
    
    const pos = cmd.position || cmd.Position;
    const scale = cmd.scale || cmd.Scale;
    const rotation = cmd.rotation || cmd.Rotation;

    const typeLower = type.toLowerCase();

    // Helper to get [x, y, z] from Vector3D structure
    const getPosArray = (p) => {
      if (!p) return [0, 0, 0];
      return [
        p.x !== undefined ? p.x : p.X,
        p.y !== undefined ? p.y : p.Y,
        p.z !== undefined ? p.z : p.Z
      ].map(Number);
    };

    const getScaleArray = (s) => {
      if (!s) return [1, 1, 1];
      return [
        s.x !== undefined ? s.x : s.X,
        s.y !== undefined ? s.y : s.Y,
        s.z !== undefined ? s.z : s.Z
      ].map(Number);
    };

    // 1. Check if the object is predefined in sceneState
    let isPredefinedObj = false;
    let targetObj = null;

    if (name && nextState[name] && typeof nextState[name] === 'object' && !Array.isArray(nextState[name])) {
      isPredefinedObj = true;
      targetObj = nextState[name];
    }

    if (typeLower === 'createcube' || typeLower === 'create_cube' || typeLower === 'createsphere' || typeLower === 'create_sphere' || typeLower === 'createcylinder' || typeLower === 'create_cylinder') {
      const geomType = typeLower.includes('cube') ? 'cube' : (typeLower.includes('sphere') ? 'sphere' : 'cylinder');
      nextState.dynamicObjects[name] = {
        name,
        type: geomType,
        position: pos ? getPosArray(pos) : [0, 0, 0],
        scale: scale ? getScaleArray(scale) : [1, 1, 1],
        rotation: [0, 0, 0]
      };
    }
    else if (typeLower === 'setposition' || typeLower === 'set_position' || typeLower === 'move') {
      const positionArray = pos ? getPosArray(pos) : [Number(x) || 0, Number(y) || 0, Number(z) || 0];
      if (isPredefinedObj) {
        targetObj.position = { x: positionArray[0], y: positionArray[1], z: positionArray[2] };
      } else if (nextState.dynamicObjects[name]) {
        nextState.dynamicObjects[name].position = positionArray;
      }
    }
    else if (typeLower === 'setscale' || typeLower === 'set_scale') {
      const scaleArray = scale ? getScaleArray(scale) : [Number(x) || 1, Number(y) || 1, Number(z) || 1];
      if (isPredefinedObj) {
        targetObj.scale = { x: scaleArray[0], y: scaleArray[1], z: scaleArray[2] };
      } else if (nextState.dynamicObjects[name]) {
        nextState.dynamicObjects[name].scale = scaleArray;
      }
    }
    else if (typeLower === 'rotate' || typeLower === 'setrotation' || typeLower === 'set_rotation') {
      const degX = Number(x) || 0;
      const degY = Number(y) || 0;
      const degZ = Number(z) || 0;

      // Convert degrees to radians for Three.js
      const radX = degX * Math.PI / 180;
      const radY = degY * Math.PI / 180;
      const radZ = degZ * Math.PI / 180;

      if (isPredefinedObj) {
        if (!targetObj.rotation) {
          targetObj.rotation = { x: 0, y: 0, z: 0 };
        }
        if (typeLower === 'rotate') {
          targetObj.rotation.x += radX;
          targetObj.rotation.y += radY;
          targetObj.rotation.z += radZ;
        } else {
          targetObj.rotation = { x: radX, y: radY, z: radZ };
        }
      } else if (nextState.dynamicObjects[name]) {
        const obj = nextState.dynamicObjects[name];
        if (typeLower === 'rotate') {
          obj.rotation = [
            obj.rotation[0] + radX,
            obj.rotation[1] + radY,
            obj.rotation[2] + radZ
          ];
        } else {
          obj.rotation = [radX, radY, radZ];
        }
      } else if (name === 'currentObject') {
        nextState.currentObjectRotation = nextState.currentObjectRotation || { x: 0, y: 0, z: 0 };
        if (typeLower === 'rotate') {
          nextState.currentObjectRotation.x += radX;
          nextState.currentObjectRotation.y += radY;
          nextState.currentObjectRotation.z += radZ;
        } else {
          nextState.currentObjectRotation = { x: radX, y: radY, z: radZ };
        }
      }
    }
    else if (typeLower === 'setintensity' || typeLower === 'set_intensity') {
      const intensityVal = Number(x) || 0;
      if (nextState.light) {
        nextState.light.intensity = intensityVal;
      }
    }
    else if (typeLower === 'setcolor' || typeLower === 'set_color') {
      const colorVal = cmd.name || cmd.Name || '';
      if (nextState.material) {
        nextState.material.color = colorVal;
      }
    }
    else if (typeLower === 'setroughness' || typeLower === 'set_roughness') {
      const roughnessVal = Number(x) || 0;
      if (nextState.material) {
        nextState.material.roughness = roughnessVal;
      }
    }
    else if (typeLower === 'setmetalness' || typeLower === 'set_metalness') {
      const metalnessVal = Number(x) || 0;
      if (nextState.material) {
        nextState.material.metalness = metalnessVal;
      }
    }
    else if (typeLower === 'registerclick' || typeLower === 'register_click') {
      if (nextState.box) {
        nextState.box.hasClickHandler = true;
      }
      nextState.hasClickHandler = true;
    }
    else if (typeLower === 'setdirection' || typeLower === 'set_direction') {
      const dirVal = pos ? getPosArray(pos) : [Number(x) || 0, Number(y) || 0, Number(z) || 0];
      nextState.beamDirection = dirVal[2] > 0 ? 'forward' : 'down';
      nextState.dynamicObjects.teleporter = {
        name: 'teleporter',
        type: 'teleporter',
        position: dirVal
      };
    }
    else if (typeLower === 'setparent' || typeLower === 'set_parent') {
      const childName = name;
      const parentName = cmd.object || cmd.Object;
      nextState.parentChildSet = true;
      nextState[`${childName}Parent`] = parentName;
      if (!nextState.parents) {
        nextState.parents = {};
      }
      nextState.parents[childName] = parentName;
    }
    else if (typeLower === 'deleteobject' || typeLower === 'delete_object') {
      if (isPredefinedObj) {
        delete nextState[name];
      } else {
        delete nextState.dynamicObjects[name];
      }
    }
  }

  // Count positioned objects for Module 6 validation:
  if (Number(moduleId) === 6) {
    let positioned = 0;
    const initial = {
      box1: { position: { x: 0, y: 0.5, z: 0 } },
      box2: { position: { x: 2, y: 0.5, z: 0 } },
      sphere1: { position: { x: -2, y: 1, z: 2 } }
    };
    ['box1', 'box2', 'sphere1'].forEach(objId => {
      const pos = nextState[objId]?.position;
      if (pos) {
        const initPos = initial[objId].position;
        if (pos.x !== initPos.x || pos.y !== initPos.y || pos.z !== initPos.z) {
          positioned++;
        }
      }
    });
    nextState.objectsPositioned = positioned;
    nextState.hasClickHandler = true; // Mark as interacted on run
  }

  if (Number(moduleId) === 5) {
    nextState.box = nextState.box || {};
    nextState.box.hasClickHandler = true;
  }

  // Module 3 table moved validation:
  if (Number(moduleId) === 3 && nextState.table) {
    const tablePos = nextState.table.position;
    if (tablePos && (tablePos.x !== 0 || tablePos.y !== 0.25 || tablePos.z !== 0)) {
      nextState.table.moved = true;
    }
  }

  return nextState;
}
