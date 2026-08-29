export const module4 = {
  id: 4,
  title: 'Lighting & Materials',
  description: 'Discover how lights and materials interact to create realistic 3D appearances. Control color, roughness, metalness, and light intensity.',
  theory: {
    sections: [
      { type: 'heading', content: 'Light Makes Everything Visible' },
      { type: 'text', content: 'In the real world, you can\'t see anything without light. The same is true in 3D rendering. Without lights in your scene, everything would be pitch black. Different types of lights create different effects.' },
      { type: 'heading', content: 'Types of Light' },
      { type: 'list', items: [
        'Ambient Light — Lights everything equally from all directions. No shadows. Think of it as the base brightness of a room.',
        'Directional Light — Light that comes from one direction, like the sun. Creates clear shadows. All rays are parallel.',
        'Point Light — Light that radiates from a single point in all directions, like a light bulb. Gets dimmer with distance.',
        'Spot Light — Like a flashlight. Emits a cone of light from a point in a specific direction.'
      ]},
      { type: 'heading', content: 'Materials: How Surfaces React to Light' },
      { type: 'text', content: 'A material defines how an object\'s surface looks. The same object can look like plastic, metal, glass, or wood — all by changing its material properties.' },
      { type: 'list', items: [
        'Color — The base color of the surface.',
        'Roughness — How rough or smooth the surface is. 0 = perfectly smooth (mirror-like). 1 = completely rough (matte).',
        'Metalness — Whether the surface looks metallic. 0 = non-metal (plastic, wood). 1 = full metal (chrome, gold).'
      ]},
      { type: 'highlight', content: 'In the exercise below, you\'ll adjust light intensity and material properties to match a target appearance. Experiment with the values to understand how each property affects the visual result.' },
    ]
  },
  handsOn: {
    task: 'Match the target appearance — adjust the light and material so your sphere looks like the target on the right.',
    starterCode: `// Adjust light and material properties
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
    completionMessage: 'Your sphere matches the target! You\'ve learned how lighting and materials work together to create the appearance of objects in 3D.'
  }
}
