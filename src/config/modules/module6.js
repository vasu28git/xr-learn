export const module6 = {
  id: 6,
  title: 'Light Estimation & Materials',
  description: 'Understand how lighting and materials define the look and feel of XR objects, from emotional tone to realistic reflections.',
  theory: {
    sections: [
      { type: 'heading', content: 'Light Makes Everything Visible' },
      { type: 'text', content: 'In XR, a scene is only visible if there is light. Realistic lighting is what makes a digital object feel grounded, readable, and believable. Different lighting conditions create different emotional responses and visual clarity.' },
      { type: 'highlight', content: 'A scene with poor lighting can hide important information, flatten the depth, and make objects look unrealistic. Good lighting adds atmosphere, direction, and focus.' },
      { type: 'heading', content: 'Materials and Surface Response' },
      { type: 'list', items: [
        'Color — the base tint of the object.',
        'Roughness — how soft or mirror-like the surface feels.',
        'Metalness — whether it behaves like metal or a non-metal material.'
      ]},
      { type: 'text', content: 'Materials tell the renderer how light should bounce off a surface. A rough matte sphere behaves differently than a polished metallic one, even if both have the same color.' },
      { type: 'heading', content: 'Indoor and Outdoor Light Estimation' },
      { type: 'text', content: 'In AR experiences, the app may estimate the lighting conditions from the environment and match the virtual object to it. This makes a virtual chair look natural in a room instead of feeling like a flat overlay.' },
      { type: 'highlight', content: 'In this exercise, you will adjust the point light intensity and material values to match a target object. The goal is to balance brightness, color, roughness, and metalness for a realistic result.' },
    ]
  },
  handsOn: {
    task: 'Match the target appearance by tuning the light intensity and material settings on the left sphere.',
    starterCode: `// Adjust the scene lighting and material so it matches the target.
light.intensity = 0.5
material.color = '#ffffff'
material.roughness = 0.5
material.metalness = 0.0`,
    scene: {
      objects: [
        { id: 'sphere', type: 'sphere', position: [-2, 1.5, 0], color: '#ffffff', size: [1.2, 64, 64] },
        { id: 'targetSphere', type: 'sphere', position: [2, 1.5, 0], color: '#ff6644', size: [1.2, 64, 64], isTarget: true, roughness: 0.2, metalness: 0.8 },
      ],
      lights: [
        { type: 'ambient', intensity: 0.3, color: '#4060ff' },
        { type: 'directional', intensity: 0.8, position: [5, 8, 3] },
        { type: 'point', intensity: 1.0, position: [0, 4, 2], color: '#ffffff' },
      ]
    },
    allowedAPI: ['light.intensity', 'material.color', 'material.roughness', 'material.metalness'],
    targetState: { intensity: 1.2, color: '#ff6644', roughness: 0.2, metalness: 0.8 },
    completionMessage: 'The sphere matches the target! This is the same design logic XR creators use to make virtual objects feel natural and professionally lit.'
  }
}
