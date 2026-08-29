export const module3 = {
  id: 3,
  title: 'Anchors & Scene Hierarchy',
  description: 'Learn how XR scenes organize objects into parent-child relationships and how anchored objects move together as a group.',
  theory: {
    sections: [
      { type: 'heading', content: 'What Is an Anchor?' },
      { type: 'text', content: 'An anchor is a fixed point in space that makes an object feel grounded. In AR, an anchor might be a wall, a floor plane, or a tracked marker. In a 3D scene, it behaves like a stable reference point.' },
      { type: 'highlight', content: 'Anchors are essential because they prevent digital content from drifting or floating unpredictably. Without a frame of reference, the virtual scene loses meaning.' },
      { type: 'heading', content: 'Scene Graphs and Parents' },
      { type: 'list', items: [
        'A parent is a container or anchor that owns one or more child objects.',
        'A child inherits the parent’s movement, rotation, and scale.',
        'Moving the parent updates all children, which keeps spatial relationships consistent.',
        'This is how complex XR scenes stay organized and easier to manipulate.'
      ]},
      { type: 'text', content: 'Think of a chair in a room. The room is the world, the chair is one object, and any decorations attached to it are children. If the chair moves, the decorations move with it.' },
      { type: 'heading', content: 'Why it matters in XR' },
      { type: 'text', content: 'XR systems often need to attach virtual objects to a surface or a tracked device. Once anchored, those objects can be updated as the user moves through the scene, preserving the illusion that the scene is consistent and physically grounded.' },
      { type: 'highlight', content: 'In this exercise, you will make the boxes children of the table so they stay attached to it. Then you’ll move the table and watch the relationship update in real time.' },
    ]
  },
  handsOn: {
    task: 'Attach both boxes to the table so they move with it when the table is repositioned.',
    starterCode: `// Make box1 and box2 children of the table
// This creates a parent-child relationship.
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
    completionMessage: 'The boxes now stay attached to the table. You’ve used a real scene hierarchy pattern, which is how XR systems organize complex content into stable, moving groups.'
  }
}
