export const module4 = {
  id: 4,
  title: '3D Model Import & Asset Pipeline',
  description: 'Learn how imported 3D assets need proper placement, scaling, and collision setup before they can feel believable in XR.',
  theory: {
    sections: [
      { type: 'heading', content: 'Why Assets Need Work Before Use' },
      { type: 'text', content: 'A 3D model from a file format like GLB or OBJ often looks correct in a modeling tool but still needs cleanup before it works in XR. Common issues include a shifted pivot point, incorrect scale, and missing collision data.' },
      { type: 'highlight', content: 'A model is not just a mesh — it also includes transforms, normals, and sometimes collision bounds. XR scenes depend on these values being correct or the object will feel broken or unstable.' },
      { type: 'heading', content: 'Common Asset Problems' },
      { type: 'list', items: [
        'Off-center pivot — the object rotates around the wrong point.',
        'Wrong scale — it is too large, too small, or distorted.',
        'Missing collider — it can pass through a floor or other objects.',
        'Incorrect orientation — the model does not sit correctly in world space.'
      ]},
      { type: 'text', content: 'The asset pipeline is the process of taking a model, adjusting its transform, validating scale, and preparing it for interaction in the app. This is why real XR projects spend time in modeling, import, and testing phases.' },
      { type: 'heading', content: 'Fixing the Asset' },
      { type: 'text', content: 'The most common fixes are adjusting the pivot, resetting scale, and adding a collision shape. Only after these steps does the model feel like it belongs in the immersive scene.' },
      { type: 'highlight', content: 'In this exercise, you will repair a model that starts in a broken state: its pivot is offset, its size is wrong, and it has no collider. Fix it before the scene is ready.' },
    ]
  },
  handsOn: {
    task: 'Repair the imported model by centering its pivot, resetting its scale, and adding a collider so it behaves correctly in the scene.',
    starterCode: `// Fix the imported model before use
// The object starts off-center, scaled wrong, and has no collider.
model.position.x = 0
model.position.y = 0.5
model.position.z = 0
model.scale.x = 1
model.scale.y = 1
model.scale.z = 1
scene.fixPivot(model)
scene.resetScale(model)
scene.addCollider(model)`,
    scene: {
      objects: [
        { id: 'model', type: 'box', position: [0, 0.8, 0], color: '#ff8f5a', size: [1.5, 1.5, 1.5], isTarget: true },
        { id: 'floor', type: 'box', position: [0, -0.25, 0], color: '#2a344e', size: [4, 0.4, 4] },
      ],
      lights: [
        { type: 'ambient', intensity: 0.4, color: '#4e6bff' },
        { type: 'directional', intensity: 0.9, position: [5, 8, 3] },
      ]
    },
    allowedAPI: ['model.position.x', 'model.position.y', 'model.position.z', 'model.scale.x', 'model.scale.y', 'model.scale.z', 'scene.fixPivot', 'scene.resetScale', 'scene.addCollider'],
    targetState: { pivotAligned: true, scaleCorrect: true, colliderAdded: true },
    completionMessage: 'The model is now aligned, scaled correctly, and ready for interaction. This is the real asset pipeline behind production XR experiences.'
  }
}
