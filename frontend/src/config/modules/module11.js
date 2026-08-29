export const module11 = {
  id: 11,
  title: 'Capstone: Build Your First XR Scene',
  description: 'Combine positioning, parenting, interaction, lighting, materials, and physics into your own complete XR scene.',
  theory: {
    sections: [
      { type: 'heading', content: 'Putting It All Together' },
      { type: 'text', content: 'Congratulations — you have now explored the main building blocks of XR development. In real projects, the creative work is not in one single concept, but in combining them into a scene that feels coherent, interactive, and believable.' },
      { type: 'heading', content: 'Quick Recap' },
      { type: 'list', items: [
        'Module 1: XR includes AR, VR, and MR experiences.',
        'Module 2: Objects live in 3D coordinate space.',
        'Module 3: Parent-child relationships keep objects moving together.',
        'Module 4: Asset placement and transform cleanup matter before use.',
        'Module 5: Plane classification helps validate surface placement.',
        'Module 6: Light and materials shape how an object looks.',
        'Module 7: Depth and occlusion determine what is visible.',
        'Module 8: Interaction design turns objects into tools and controls.',
        'Module 9: Controllers and hand tracking enable direct manipulation.',
        'Module 10: Physics adds momentum, gravity, and bounce.'
      ]},
      { type: 'highlight', content: 'This final challenge is not about a single correct answer. It is about composing multiple systems into one scene: object placement, hierarchy, interaction, lighting, and at least one physics-enabled object.' },
      { type: 'heading', content: 'Tips for Your Final Scene' },
      { type: 'list', items: [
        'Start with at least two objects in position.',
        'Create one parent-child relationship to show structured scene logic.',
        'Add at least one click interaction for responsiveness.',
        'Use lighting and materials to set mood and readability.',
        'Make one object physics-enabled so the scene feels alive.'
      ]},
      { type: 'text', content: 'All previously introduced operations are available in this final sandbox. Use them freely and build something you are proud to call your first XR scene.' },
    ]
  },
  handsOn: {
    task: 'Build a scene with two or more objects, at least one parent-child relationship, at least one interaction, and at least one physics-enabled object.',
    starterCode: `// Your first complete XR scene
// Use positioning, parenting, lighting, interaction, and physics.
box1.position.x = 0
box1.position.y = 1
box1.position.z = 0

box2.position.x = 2
box2.position.y = 1
box2.position.z = 0

scene.setParent(box2, box1)
light.intensity = 1.0

box1.onClick(function() {
  // make the object react to interaction
})

ball.setGravity(9.8)
ball.setRestitution(0.8)
ball.applyForce(0, 2, 0)`,
    scene: {
      objects: [
        { id: 'box1', type: 'box', position: [0, 0.5, 0], color: '#4488ff', size: [1, 1, 1] },
        { id: 'box2', type: 'box', position: [2, 0.5, 0], color: '#ff8844', size: [0.7, 0.7, 0.7] },
        { id: 'ball', type: 'sphere', position: [-2, 2, 0], color: '#44ff88', size: [0.6, 32, 32] },
        { id: 'sphere1', type: 'sphere', position: [-2, 1, 2], color: '#44ff88', size: [0.6, 32, 32] },
      ],
      lights: [
        { type: 'ambient', intensity: 0.3, color: '#4060ff' },
        { type: 'directional', intensity: 0.8, position: [5, 8, 3] },
      ]
    },
    allowedAPI: [
      'box1.position.x', 'box1.position.y', 'box1.position.z',
      'box2.position.x', 'box2.position.y', 'box2.position.z',
      'ball.position.x', 'ball.position.y', 'ball.position.z',
      'sphere1.position.x', 'sphere1.position.y', 'sphere1.position.z',
      'scene.setParent',
      'light.intensity', 'material.color', 'material.roughness', 'material.metalness',
      'box1.onClick', 'box2.onClick', 'ball.onClick', 'sphere1.onClick',
      'box1.color', 'box2.color', 'ball.color', 'sphere1.color',
      'ball.applyForce', 'ball.setGravity', 'ball.setRestitution'
    ],
    targetState: { objectsPositioned: 2, parentChildSet: true, hasClickHandler: true, physicsEnabled: true },
    completionMessage: 'Amazing work! You built a complete XR scene that combines spatial logic, hierarchy, interaction, materials, and physics. This is the foundation of real immersive experiences.'
  }
}
