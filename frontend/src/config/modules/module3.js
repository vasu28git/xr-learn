export const module3 = {
  id: 3,
  title: 'Scene Hierarchy',
  description: 'Learn how parent-child relationships work in 3D scenes. Moving a parent moves all its children — the foundation of complex XR scenes.',
  theory: {
    sections: [
      { type: 'heading', content: 'What Is a Scene Graph?' },
      { type: 'text', content: 'A scene graph is a tree structure that organizes every object in a 3D scene. Each object can have a parent and multiple children. When you move, rotate, or scale a parent object, all of its children are affected too — they move together as a group.' },
      { type: 'highlight', content: 'Think of a scene graph like a family tree for 3D objects. A car body is the parent. Its wheels, doors, and windows are children. When the car moves forward, everything moves with it.' },
      { type: 'heading', content: 'Parent-Child Relationships' },
      {
        type: 'list', items: [
          'A child\'s position is relative to its parent (local space), not the world.',
          'Moving a parent moves all children. Moving a child only moves that child.',
          'Rotation and scale also propagate from parent to children.',
          'An object can only have one parent, but a parent can have many children.'
        ]
      },
      { type: 'heading', content: 'Why Does This Matter in XR?' },
      { type: 'text', content: 'In XR, scene hierarchy is everywhere. A virtual room is a parent of its furniture. A hand controller is a parent of the object it\'s holding. A solar system has the sun as the root, planets as children, and moons as grandchildren.' },
      { type: 'highlight', content: 'In the exercise below, you\'ll make two boxes children of a table. Then, when you move the table, the boxes will move with it — proving the parent-child relationship works.' },
    ]
  },
  handsOn: {
    task: 'Make box1 and box2 children of the table so that when you move the table, the boxes move with it.',
    starterCode: `// Make box1 and box2 children of the table
// Then move the table and see what happens
scene.setParent(box1, table)
scene.setParent(box2, table)
table.position.x = 0`,
    scene: {
      objects: [
        { id: 'table', type: 'box', position: [0, 0.25, 0], color: '#8866aa', size: [4, 0.5, 2] },
        { id: 'box1', type: 'box', position: [-1, 1, 0], color: '#ffaa44', size: [0.6, 0.6, 0.6] },
        { id: 'box2', type: 'box', position: [1, 1, 0], color: '#ffaa44', size: [0.6, 0.6, 0.6] },
      ],
      lights: [
        { type: 'ambient', intensity: 0.3, color: '#4060ff' },
        { type: 'directional', intensity: 0.8, position: [5, 8, 3] },
      ]
    },
    allowedAPI: ['scene.setParent', 'table.position.x', 'table.position.y', 'table.position.z'],
    targetState: { box1Parent: 'table', box2Parent: 'table', tableMoved: true },
    completionMessage: 'The boxes now move with the table. You\'ve just used scene hierarchy — one of the most important concepts in 3D and XR development.'
  }
}
