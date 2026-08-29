export const module1 = {
  id: 1,
  title: 'What Is XR?',
  description: 'Learn the difference between AR, VR, and MR and see how immersive experiences are built in the browser.',
  theory: {
    sections: [
      { type: 'heading', content: 'Welcome to Extended Reality' },
      { type: 'text', content: 'Extended Reality, or XR, is the umbrella term for immersive technologies that blend the digital and physical worlds. It includes Virtual Reality, Augmented Reality, and Mixed Reality, each creating a different kind of experience.' },
      { type: 'highlight', content: 'XR is not just about headsets. A browser can already render 3D scenes, simulate spatial relationships, and respond to user input — making it one of the best ways to learn the fundamentals.' },
      { type: 'heading', content: 'The Three XR Families' },
      { type: 'list', items: [
        'Virtual Reality (VR) — A fully digital world. The user is immersed in a simulated environment with no need for the real world to be visible.',
        'Augmented Reality (AR) — Digital content is layered on top of the real world, usually through a camera or display.',
        'Mixed Reality (MR) — Real and virtual objects interact with each other, so the digital layer feels spatially anchored to the environment.'
      ]},
      { type: 'heading', content: 'Why This Matters' },
      { type: 'text', content: 'XR is used in training, gaming, design review, education, and simulation. In every case, the key idea is the same: digital objects are positioned in space and respond to the user in real time.' },
      { type: 'highlight', content: 'The core difference is simple: VR replaces the world, AR adds to it, and MR makes the two work together. In this module, you will identify the two patterns visually in a 3D scene.' },
    ]
  },
  handsOn: {
    task: 'Look around the scene. Can you identify which object represents AR and which represents VR? Click each object to reveal its label.',
    starterCode: '// This module is visual only.\n// Click the objects in the 3D scene to reveal their labels.\n// Rotate the camera by dragging, and zoom with the mouse wheel.\n\n// 🔵 One object floats freely in space (VR)\n// 🟢 One object sits on a surface (AR)',
    scene: {
      objects: [
        { id: 'virtual', type: 'dodecahedron', position: [2, 3, -1], color: '#4488ff', label: 'Virtual (VR)', floating: true },
        { id: 'anchored', type: 'box', position: [-2, 0.5, 1], color: '#44ff88', label: 'Anchored (AR)', floating: false },
      ],
      lights: [
        { type: 'ambient', intensity: 0.3, color: '#4060ff' },
        { type: 'directional', intensity: 0.8, position: [5, 8, 3] },
      ]
    },
    allowedAPI: [],
    targetState: { virtualClicked: true, anchoredClicked: true },
    completionMessage: 'You identified both objects! The floating one represents VR, while the anchored one sits in the real-world space and represents AR. That is the core distinction behind immersive design.'
  }
}
