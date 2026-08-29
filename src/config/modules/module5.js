export const module5 = {
  id: 5,
  title: 'Plane Classification',
  description: 'Learn how XR systems classify surfaces like floors, walls, and ceilings and validate whether an object is placed in a valid position.',
  theory: {
    sections: [
      { type: 'heading', content: 'What Is a Plane?' },
      { type: 'text', content: 'A plane is a flat surface in 3D space. In XR, understanding planes is critical because real-world environments are made of floor surfaces, walls, tables, and other flat areas that digital content can align to.' },
      { type: 'highlight', content: 'Plane detection is one of the key building blocks behind AR experiences. The system identifies a horizontal or vertical region and decides where it is safe to place a virtual object.' },
      { type: 'heading', content: 'Common Plane Types' },
      { type: 'list', items: [
        'Floor plane — a horizontal surface like ground or a room floor.',
        'Wall plane — a vertical surface like a wall or screen.',
        'Ceiling plane — a horizontal surface overhead, often less common in mobile AR but still important.'
      ]},
      { type: 'text', content: 'A placement system checks the object’s position and decides whether it is valid for a given plane. For example, a vase should sit on a floor or table, not floating in the air or embedded inside a wall.' },
      { type: 'heading', content: 'Why Validation Matters' },
      { type: 'text', content: 'In XR, the difference between a valid and invalid placement is often the difference between a convincing scene and a broken one. A world that understands surface classification feels more natural, safer, and easier to interact with.' },
      { type: 'highlight', content: 'In this exercise, you will classify the surface and validate the draggable object’s placement. The goal is to place the object on the correct plane and receive a successful result.' },
    ]
  },
  handsOn: {
    task: 'Classify the scene surface as a floor plane and validate that the draggable object sits on a valid surface position.',
    starterCode: `// Identify the surface type and validate placement
// The correct target is the FLOOR plane.
draggable.position.x = 0
draggable.position.y = 0.8
draggable.position.z = 0
scene.classifyPlane('floor')
scene.validatePlacement(draggable, 'floor')`,
    scene: {
      objects: [
        { id: 'draggable', type: 'box', position: [0, 0.8, 0], color: '#70b7ff', size: [0.8, 0.8, 0.8] },
        { id: 'floorPlane', type: 'box', position: [0, -0.1, 0], color: '#3f5a80', size: [4, 0.2, 4], isTarget: true },
        { id: 'wallPlane', type: 'box', position: [-2.5, 1.5, 0], color: '#ff9b6b', size: [0.2, 3, 3], label: 'Wall' },
        { id: 'ceilingPlane', type: 'box', position: [2.5, 3.2, 0], color: '#b0f2c2', size: [3, 0.2, 3], label: 'Ceiling' },
      ],
      lights: [
        { type: 'ambient', intensity: 0.4, color: '#5c7df8' },
        { type: 'directional', intensity: 0.8, position: [5, 8, 3] },
      ]
    },
    allowedAPI: ['draggable.position.x', 'draggable.position.y', 'draggable.position.z', 'scene.classifyPlane', 'scene.validatePlacement'],
    targetState: { planeType: 'floor', placementValid: true },
    completionMessage: 'The object is on a valid floor plane. That is exactly how XR systems decide whether an object placement is stable, understandable, and ready for interaction.'
  }
}
