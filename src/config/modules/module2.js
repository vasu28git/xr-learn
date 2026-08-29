export const module2 = {
  id: 2,
  title: '3D Space & Coordinates',
  description: 'Understand X, Y, and Z axes. Learn how to position objects in three-dimensional space using world coordinates.',
  theory: {
    sections: [
      { type: 'heading', content: 'Understanding 3D Space' },
      { type: 'text', content: 'In 2D (like a flat screen), you only need two numbers to place something: X (horizontal) and Y (vertical). In 3D, you add a third axis: Z (depth). Together, X, Y, and Z define any point in three-dimensional space.' },
      { type: 'highlight', content: 'Think of it like this: X goes left and right. Y goes up and down. Z goes forward and backward (toward you and away from you).' },
      { type: 'heading', content: 'Position, Rotation, Scale' },
      { type: 'text', content: 'Every 3D object has three fundamental properties:' },
      {
        type: 'list', items: [
          'Position — Where the object is in space. Defined by (X, Y, Z) coordinates.',
          'Rotation — How the object is oriented. Measured in radians or degrees around each axis.',
          'Scale — How big the object is. A scale of 1 is the default size. Scale 2 means double the size.'
        ]
      },
      { type: 'heading', content: 'World Space vs Local Space' },
      { type: 'text', content: 'World space is the global coordinate system — the same for every object. Position (0, 0, 0) is the center of the world. Local space is relative to an object\'s parent. If a child object is at local position (1, 0, 0) and its parent is at world position (5, 0, 0), the child\'s world position is (6, 0, 0).' },
      { type: 'highlight', content: 'In the exercise below, you\'ll move a blue box to a green target by setting its X, Y, and Z position values. Watch the XYZ axes in the scene to understand which direction each axis points.' },
    ]
  },
  handsOn: {
    task: 'Move the blue box to the glowing green target by setting its X, Y, and Z position.',
    starterCode: `// Move the box to the target position
// X goes left/right, Y goes up/down, Z goes forward/back
box.position.x = 0
box.position.y = 0
box.position.z = 0`,
    scene: {
      objects: [
        { id: 'box', type: 'box', position: [0, 0.5, 0], color: '#4488ff', size: [1, 1, 1] },
        { id: 'target', type: 'sphere', position: [3, 2, -1], color: '#44ff88', emissive: '#44ff88', emissiveIntensity: 0.4, size: [0.5, 32, 32], isTarget: true },
      ],
      lights: [
        { type: 'ambient', intensity: 0.3, color: '#4060ff' },
        { type: 'directional', intensity: 0.8, position: [5, 8, 3] },
      ]
    },
    allowedAPI: ['box.position.x', 'box.position.y', 'box.position.z'],
    targetState: { x: 3, y: 2, z: -1 },
    completionMessage: 'You got it — you just placed an object in 3D space using world coordinates. Every object in XR exists at a specific (X, Y, Z) position.'
  }
}
