export const challenges = [
  {
    id: 1,
    title: 'Build Your First Block',
    difficulty: 'beginner',
    category: 'hierarchy',
    xp: 100,
    description: 'In XR development, everything starts with simple primitives. Spawn a cube named "box" at position (0, 1, 0) with scale (1, 1, 1).',
    hint: 'Use xr.CreateCube("box", new Vector3(0f, 1f, 0f), new Vector3(1f, 1f, 1f));',
    starterCode: `using UnityEngine;

public class TransformController : MonoBehaviour
{
    void Start()
    {
        // Spawn a cube named "box" at position (0, 1, 0)
        // Tip: Use xr.CreateCube("box", new Vector3(x, y, z), new Vector3(sx, sy, sz));
        
    }
}`,
    scene: { objects: [], lights: [{ type: 'ambient', intensity: 0.3, color: '#4060ff' }, { type: 'directional', intensity: 0.8, position: [5, 8, 3] }] },
    initialState: {},
    validation: {
      rules: [
        { type: 'OBJECT_EXISTS', name: 'box' },
        { type: 'OBJECT_TYPE', name: 'box', expected: 'cube' },
        { type: 'POSITION', name: 'box', expected: [0, 1, 0], tolerance: 0.1 },
      ]
    }
  },
  {
    id: 2,
    title: 'Spawn Sphere and Cylinder',
    difficulty: 'beginner',
    category: 'hierarchy',
    xp: 120,
    description: 'Combine multiple shapes. Spawn a sphere named "ball" at position (-1, 2, 0) and a cylinder named "column" at position (1.5, 0.5, -1).',
    hint: 'Use xr.CreateSphere("ball", ...) and xr.CreateCylinder("column", ...).',
    starterCode: `using UnityEngine;

public class TransformController : MonoBehaviour
{
    void Start()
    {
        // Spawn a sphere named "ball" at (-1, 2, 0)
        // Spawn a cylinder named "column" at (1.5, 0.5, -1)
        
    }
}`,
    scene: { objects: [], lights: [{ type: 'ambient', intensity: 0.3, color: '#4060ff' }, { type: 'directional', intensity: 0.8, position: [5, 8, 3] }] },
    initialState: {},
    validation: {
      rules: [
        { type: 'OBJECT_EXISTS', name: 'ball' },
        { type: 'OBJECT_TYPE', name: 'ball', expected: 'sphere' },
        { type: 'POSITION', name: 'ball', expected: [-1, 2, 0], tolerance: 0.1 },
        { type: 'OBJECT_EXISTS', name: 'column' },
        { type: 'OBJECT_TYPE', name: 'column', expected: 'cylinder' },
        { type: 'POSITION', name: 'column', expected: [1.5, 0.5, -1], tolerance: 0.1 },
      ]
    }
  },
  {
    id: 3,
    title: 'Center Vector Positioning',
    difficulty: 'beginner',
    category: 'vectors',
    xp: 150,
    description: 'Find the midpoint between two pillars. pillarA is at (4, 1, 2) and pillarB is at (-2, 3, -4). Position the "bridge" exactly between them.',
    hint: 'Formula: midpoint = (A + B) / 2. Output is (1, 2, -1).',
    starterCode: `using UnityEngine;

public class TransformController : MonoBehaviour
{
    public GameObject pillarA;
    public GameObject pillarB;
    public GameObject bridge;

    void Start()
    {
        // Calculate the midpoint between pillarA and pillarB
        // Position the bridge at the midpoint
        
    }
}`,
    scene: {
      objects: [
        { id: 'pillarA', type: 'box', position: [4, 1, 2], color: '#4488ff', size: [0.5, 2, 0.5] },
        { id: 'pillarB', type: 'box', position: [-2, 3, -4], color: '#ff8844', size: [0.5, 2, 0.5] },
        { id: 'bridge', type: 'box', position: [0, 0, 0], color: '#ffaa44', size: [1.2, 0.2, 1.2] },
      ],
      lights: [{ type: 'ambient', intensity: 0.3, color: '#4060ff' }, { type: 'directional', intensity: 0.8, position: [5, 8, 3] }]
    },
    initialState: {
      pillarA: { position: { x: 4, y: 1, z: 2 } },
      pillarB: { position: { x: -2, y: 3, z: -4 } },
      bridge: { position: { x: 0, y: 0, z: 0 } },
    },
    validation: {
      rules: [
        { type: 'POSITION', name: 'bridge', expected: [1, 2, -1], tolerance: 0.15 },
      ]
    }
  },
  {
    id: 4,
    title: 'Scaling a Gateway',
    difficulty: 'intermediate',
    category: 'vectors',
    xp: 180,
    description: 'An archway needs to span a pathway. Resize the predefined object "gate" to a local scale of (3.0, 4.5, 0.5).',
    hint: 'Set gate.transform.localScale = new Vector3(3f, 4.5f, 0.5f);',
    starterCode: `using UnityEngine;

public class TransformController : MonoBehaviour
{
    public GameObject gate;

    void Start()
    {
        // Scale the gateway to width=3.0, height=4.5, depth=0.5
        
    }
}`,
    scene: {
      objects: [{ id: 'gate', type: 'box', position: [0, 1.5, 0], color: '#6366f1', size: [1, 1, 1] }],
      lights: [{ type: 'ambient', intensity: 0.3, color: '#4060ff' }, { type: 'directional', intensity: 0.8, position: [5, 8, 3] }]
    },
    initialState: { gate: { position: { x: 0, y: 1.5, z: 0 }, scale: { x: 1, y: 1, z: 1 } } },
    validation: {
      rules: [
        { type: 'COMMAND_USED', commandType: 'setscale' },
        { type: 'SCALE', name: 'gate', expected: [3.0, 4.5, 0.5], tolerance: 0.1 },
      ]
    }
  },
  {
    id: 5,
    title: 'Rotate Solar Panel',
    difficulty: 'intermediate',
    category: 'vectors',
    xp: 200,
    description: 'Align the solar panel structure to point at the sunlight. Rotate the predefined "panel" object by 45 degrees around the Y-axis and -15 degrees around the X-axis.',
    hint: 'Use panel.transform.Rotate(new Vector3(-15f, 45f, 0f));',
    starterCode: `using UnityEngine;

public class TransformController : MonoBehaviour
{
    public GameObject panel;

    void Start()
    {
        // Rotate the solar panel to point at the sun (Y = 45, X = -15)
        
    }
}`,
    scene: {
      objects: [{ id: 'panel', type: 'box', position: [0, 1, 0], color: '#3b82f6', size: [2, 0.1, 1] }],
      lights: [{ type: 'ambient', intensity: 0.2 }, { type: 'directional', intensity: 0.8, position: [5, 5, 0] }]
    },
    initialState: { panel: { position: { x: 0, y: 1, z: 0 }, rotation: { x: 0, y: 0, z: 0 } } },
    validation: {
      rules: [
        { type: 'COMMAND_USED', commandType: 'rotate' },
        { type: 'ROTATION', name: 'panel', expected: [-15, 45, 0], tolerance: 2 },
      ]
    }
  },
  {
    id: 6,
    title: 'Parenting and Hierarchy',
    difficulty: 'intermediate',
    category: 'hierarchy',
    xp: 220,
    description: 'Assemble a basic hover drone hierarchy. Create a cylinder named "drone" at (0, 3, 0) and a cube named "turbine" at (0, 3.5, 0). Then parent the turbine to the drone.',
    hint: 'Create objects using xr, then assign turbine parent to drone with xr.SetParent("turbine", "drone");',
    starterCode: `using UnityEngine;

public class TransformController : MonoBehaviour
{
    void Start()
    {
        // 1. Create a cylinder named "drone" at (0, 3, 0)
        // 2. Create a cube named "turbine" at (0, 3.5, 0)
        // 3. Set drone as turbine's parent using xr.SetParent("turbine", "drone")
        
    }
}`,
    scene: { objects: [], lights: [{ type: 'ambient', intensity: 0.3, color: '#4060ff' }, { type: 'directional', intensity: 0.8, position: [5, 8, 3] }] },
    initialState: {},
    validation: {
      rules: [
        { type: 'OBJECT_EXISTS', name: 'drone' },
        { type: 'OBJECT_TYPE', name: 'drone', expected: 'cylinder' },
        { type: 'OBJECT_EXISTS', name: 'turbine' },
        { type: 'CHILD_OF', child: 'turbine', parent: 'drone' },
      ]
    }
  },
  {
    id: 7,
    title: 'Spacing with Variables',
    difficulty: 'intermediate',
    category: 'vectors',
    xp: 240,
    description: 'Use a dynamic spacing variable to lay out streetlights. Create two cubes: "light1" at position (-spacing, 2, 0) and "light2" at position (spacing, 2, 0), where spacing = 4.0.',
    hint: 'Declare a float spacing = 4.0f. Pass new Vector3(-spacing, 2, 0) to xr.CreateCube.',
    starterCode: `using UnityEngine;

public class TransformController : MonoBehaviour
{
    void Start()
    {
        float spacing = 4.0f;
        // Create "light1" and "light2" spaced out by spacing variable
        
    }
}`,
    scene: { objects: [], lights: [{ type: 'ambient', intensity: 0.3, color: '#4060ff' }, { type: 'directional', intensity: 0.8, position: [5, 8, 3] }] },
    initialState: {},
    validation: {
      rules: [
        { type: 'OBJECT_EXISTS', name: 'light1' },
        { type: 'POSITION', name: 'light1', expected: [-4, 2, 0], tolerance: 0.1 },
        { type: 'OBJECT_EXISTS', name: 'light2' },
        { type: 'POSITION', name: 'light2', expected: [4, 2, 0], tolerance: 0.1 },
        { type: 'DISTANCE', name1: 'light1', name2: 'light2', expected: 8.0, tolerance: 0.2 },
      ]
    }
  },
  {
    id: 8,
    title: 'Conditional Light Switches',
    difficulty: 'advanced',
    category: 'interaction',
    xp: 280,
    description: 'In virtual environments, lighting changes based on environmental states. We have a "sensor" object at (0, 1.5, 0). Check sensor Y position: if it is greater than 1.0, set Light.intensity to 3.0. Otherwise, set it to 0.5.',
    hint: 'Use if (sensor.transform.position.y > 1.0f) { Light.intensity = 3.0f; } else { ... }',
    starterCode: `using UnityEngine;

public class TransformController : MonoBehaviour
{
    public GameObject sensor;

    void Start()
    {
        // Read sensor.transform.position.y
        // Adjust Light.intensity conditionally (target is > 1.0f -> 3.0f)
        
    }
}`,
    scene: {
      objects: [{ id: 'sensor', type: 'sphere', position: [0, 1.5, 0], color: '#f59e0b', size: [0.4, 16, 16] }],
      lights: [{ type: 'ambient', intensity: 0.2 }]
    },
    initialState: { sensor: { position: { x: 0, y: 1.5, z: 0 } }, light: { intensity: 0.2 } },
    validation: {
      rules: [
        { type: 'CODE_FEATURE', pattern: 'if\\s*\\(', description: 'an if conditional statement' },
        { type: 'LIGHT_INTENSITY', expected: 3.0, tolerance: 0.1 },
      ]
    }
  },
  {
    id: 9,
    title: 'Spiral Steps Loop',
    difficulty: 'advanced',
    category: 'hierarchy',
    xp: 300,
    description: 'Construct a spiral staircase of 5 steps using a loop. Spawn cubes named "step0" through "step4". Each step i should be located at (Mathf.Sin(i), i * 0.5, Mathf.Cos(i)).',
    hint: 'Use: for (int i = 0; i < 5; i++) { xr.CreateCube("step" + i, ...) }',
    starterCode: `using UnityEngine;

public class TransformController : MonoBehaviour
{
    void Start()
    {
        // Loop 5 times (0 to 4) to spawn "step0" through "step4"
        // Position each at (Mathf.Sin(i), i * 0.5f, Mathf.Cos(i))
        
    }
}`,
    scene: { objects: [], lights: [{ type: 'ambient', intensity: 0.3, color: '#4060ff' }, { type: 'directional', intensity: 0.8, position: [5, 8, 3] }] },
    initialState: {},
    validation: {
      rules: [
        { type: 'CODE_FEATURE', pattern: 'for\\s*\\(|while\\s*\\(', description: 'a loop construct (for or while)' },
        { type: 'OBJECT_COUNT', min: 5, type: 'cube' },
        { type: 'OBJECT_EXISTS', name: 'step0' },
        { type: 'OBJECT_EXISTS', name: 'step4' },
        { type: 'COMMAND_COUNT', commandType: 'createcube', min: 5 },
      ]
    }
  },
  {
    id: 10,
    title: 'Satellite Construction',
    difficulty: 'advanced',
    category: 'interaction',
    xp: 350,
    description: 'Assemble a satellite. Create a cylinder "mast" at (0, 1, 0). Create a sphere "dish" at (0, 2.5, 0) with scale (2, 0.5, 2). Parent "dish" to "mast".',
    hint: 'Use xr.CreateCylinder("mast", ...) and xr.CreateSphere("dish", ...) then xr.SetParent("dish", "mast");',
    starterCode: `using UnityEngine;

public class TransformController : MonoBehaviour
{
    void Start()
    {
        // 1. Create a cylinder named "mast" at (0, 1, 0)
        // 2. Create a sphere named "dish" at (0, 2.5, 0) with scale (2, 0.5, 2)
        // 3. Set mast as parent of dish using xr.SetParent("dish", "mast")
        
    }
}`,
    scene: { objects: [], lights: [{ type: 'ambient', intensity: 0.3, color: '#4060ff' }, { type: 'directional', intensity: 0.8, position: [5, 8, 3] }] },
    initialState: {},
    validation: {
      rules: [
        { type: 'OBJECT_EXISTS', name: 'mast' },
        { type: 'OBJECT_TYPE', name: 'mast', expected: 'cylinder' },
        { type: 'OBJECT_EXISTS', name: 'dish' },
        { type: 'OBJECT_TYPE', name: 'dish', expected: 'sphere' },
        { type: 'SCALE', name: 'dish', expected: [2, 0.5, 2], tolerance: 0.1 },
        { type: 'CHILD_OF', child: 'dish', parent: 'mast' },
      ]
    }
  }
]
