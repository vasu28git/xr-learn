export const module1 = {
  id: 1,
  title: 'What Is XR?',
  description: 'Learn the difference between AR, VR, and MR. Understand how extended reality works — right in your browser, no headset needed.',
  theory: {
    sections: [
      { type: 'heading', content: 'Welcome to Extended Reality' },
      { type: 'text', content: 'Extended Reality (XR) is an umbrella term that covers all immersive technologies — Virtual Reality (VR), Augmented Reality (AR), and Mixed Reality (MR). These technologies change how we see and interact with the world around us.' },
      { type: 'highlight', content: 'You don\'t need a headset to learn XR. Modern browsers can render 3D scenes, simulate spatial interactions, and even access device sensors — making your browser a powerful XR learning environment.' },
      { type: 'heading', content: 'The Three Types of XR' },
      { type: 'list', items: [
        'Virtual Reality (VR) — Fully immersive. You\'re placed inside a completely digital world. Everything you see is computer-generated. Think: gaming, virtual tours, training simulations.',
        'Augmented Reality (AR) — Overlays digital content onto the real world. The real world is still visible, but enhanced with virtual objects. Think: Pokémon GO, IKEA furniture preview, navigation arrows on streets.',
        'Mixed Reality (MR) — Digital objects interact with the real world. A virtual ball can bounce off your real desk. This blends AR and VR concepts.'
      ]},
      { type: 'heading', content: 'How Does Browser-Based XR Work?' },
      { type: 'text', content: 'Browser-based XR uses WebXR, Three.js, and related technologies to render 3D scenes directly in your browser. The GPU on your device handles the rendering, and JavaScript controls the logic — positions, animations, interactions, and physics.' },
      { type: 'highlight', content: 'Key insight: In VR, objects float freely in a virtual space with no connection to the physical world. In AR, objects are anchored to real-world surfaces — they stay in place as you move around.' },
      { type: 'text', content: 'In the hands-on exercise below, you\'ll see two objects in a 3D scene. One floats freely (representing VR) and one is anchored to a surface (representing AR). Click each object to reveal its label and understand the distinction.' },
    ]
  },
  handsOn: {
    task: 'Look around the scene. Can you identify which object represents AR (anchored to a surface) and which represents VR (floating freely)? Click each object to reveal its label.',
    starterCode: '// This module is visual only.\n// Click the objects in the 3D scene to reveal their labels.\n// Rotate the camera by dragging, zoom with scroll.\n\n// 🔵 One object floats freely in space (VR)\n// 🟢 One object sits on the surface (AR)',
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
    completionMessage: 'You identified both objects! The floating one represents VR (fully virtual) and the anchored one represents AR (attached to a real surface). This is the core difference between AR and VR.'
  }
}
