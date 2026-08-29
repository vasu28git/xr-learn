export const challenge1 = {
  id: 1,
  title: 'Vector Midpoint',
  difficulty: 'beginner',
  category: 'vectors',
  xp: 100,
  description: 'Calculate the exact midpoint between two cubes (cubeA and cubeB) and place the green sphere at that position.',
  hint: 'The midpoint formula is: midpoint = (A + B) / 2. Apply it to each axis (X, Y, Z).',
  starterCode: `// cubeA is at position (4, 1, 2)
// cubeB is at position (-2, 3, -4)
// Place the sphere at the exact midpoint

sphere.transform.position = new Vector3(0f, 0f, 0f);`,
  scene: {
    objects: [
      { id: 'cubeA', type: 'box', position: [4, 1, 2], color: '#4488ff', size: [0.8, 0.8, 0.8] },
      { id: 'cubeB', type: 'box', position: [-2, 3, -4], color: '#ff8844', size: [0.8, 0.8, 0.8] },
      { id: 'sphere', type: 'sphere', position: [0, 0, 0], color: '#44ff88', size: [0.5, 32, 32] },
    ],
    lights: [
      { type: 'ambient', intensity: 0.3, color: '#4060ff' },
      { type: 'directional', intensity: 0.8, position: [5, 8, 3] },
    ]
  },
  initialState: {
    cubeA: { position: { x: 4, y: 1, z: 2 } },
    cubeB: { position: { x: -2, y: 3, z: -4 } },
    sphere: { position: { x: 0, y: 0, z: 0 } },
  },
  tests: [
    {
      name: 'Sphere X is at midpoint ((4 + -2) / 2 = 1)',
      check: (state) => Math.abs((state.sphere?.position?.x ?? 0) - 1) <= 0.15,
    },
    {
      name: 'Sphere Y is at midpoint ((1 + 3) / 2 = 2)',
      check: (state) => Math.abs((state.sphere?.position?.y ?? 0) - 2) <= 0.15,
    },
    {
      name: 'Sphere Z is at midpoint ((2 + -4) / 2 = -1)',
      check: (state) => Math.abs((state.sphere?.position?.z ?? 0) - (-1)) <= 0.15,
    },
  ],
}
