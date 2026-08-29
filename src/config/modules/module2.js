export const module2 = {
  id: 2,
  title: 'Motion Tracking & Coordinates',
  description: 'Understand how XR systems track movement in 3D space and use coordinates to position objects precisely.',
  theory: {
    sections: [
      { type: 'heading', content: 'What Is Motion Tracking?' },
      { type: 'text', content: 'Motion tracking is how a system understands where the user, controller, or object is in space. In XR, this often means tracking position and orientation across X, Y, and Z axes so that digital content can move with the physical world.' },
      { type: 'highlight', content: 'The position of an object is a coordinate: a value for its horizontal movement, vertical movement, and depth. When a system tracks motion, it is continuously updating those values.' },
      { type: 'heading', content: 'The Coordinate System' },
      { type: 'list', items: [
        'X — left and right movement.',
        'Y — up and down movement.',
        'Z — forward and backward movement, toward or away from the camera.'
      ]},
      { type: 'text', content: 'A device or object can be anchored to a world coordinate system, which lets developers place virtual objects in a stable, predictable layout. This is the foundation for user movement, camera control, and spatial alignment.' },
      { type: 'heading', content: 'Why Coordinates Matter in XR' },
      { type: 'text', content: 'If the coordinates are wrong, an object appears in the wrong place, floats unexpectedly, or feels disconnected from the scene. Real XR systems continuously calculate these values to keep the scene accurate and responsive.' },
      { type: 'highlight', content: 'In this exercise, you will match a target position by setting the box’s X, Y, and Z values. You are essentially teaching the scene where the object should live in 3D space.' },
    ]
  },
  handsOn: {
    task: 'Move the blue box to the glowing green target by setting its X, Y, and Z position values.',
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
    completionMessage: 'You matched the target position! In XR, motion tracking and coordinate placement are what keep digital objects anchored and believable in the scene.'
  }
}
