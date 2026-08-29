export const module8 = {
  id: 8,
  title: 'Interaction Design',
  description: 'Learn how to design good XR interactions so users can click, point, grab, and manipulate objects with confidence.',
  theory: {
    sections: [
      { type: 'heading', content: 'What Makes an Interaction Feel Good?' },
      { type: 'text', content: 'A good XR interaction is clear, timely, and easy to understand. Users should know what they are interacting with, what happens when they do it, and whether the system responded.' },
      { type: 'highlight', content: 'The best interfaces do not overwhelm the user. They use familiar input patterns and provide immediate feedback, so the experience feels responsive instead of confusing.' },
      { type: 'heading', content: 'Core Interaction Patterns' },
      { type: 'list', items: [
        'Tap or click — fast input for single actions.',
        'Hover or focus — shows the user that an object is actionable.',
        'Grab and drag — lets the user manipulate an object in space.',
        'State change — the object updates its color, movement, or behavior after input.'
      ]},
      { type: 'text', content: 'Interaction design in XR is about making virtual actions feel natural. The user should feel as if they are working with an object rather than simply triggering a button.' },
      { type: 'heading', content: 'Feedback and Intent' },
      { type: 'text', content: 'When a user points at an object, the system should give feedback: highlight it, change color, or show a cursor. This lets the user know the object is interactive and prevents confusion.' },
      { type: 'highlight', content: 'In this exercise, you will add a click handler to a box so it responds when the user chooses it. This is the foundation of interaction design in XR.' },
    ]
  },
  handsOn: {
    task: 'Add a click handler to the box so it changes color when selected and resets when clicked again.',
    starterCode: `// Add a click handler to make the object interactive.
box.onClick(function() {
  // Toggle between blue and red.
  // Example: box.color = '#ff4444'
})`,
    scene: {
      objects: [
        { id: 'box', type: 'box', position: [0, 1, 0], color: '#4488ff', size: [1.5, 1.5, 1.5] },
      ],
      lights: [
        { type: 'ambient', intensity: 0.3, color: '#4060ff' },
        { type: 'directional', intensity: 0.8, position: [5, 8, 3] },
      ]
    },
    allowedAPI: ['box.onClick', 'box.color'],
    targetState: { hasClickHandler: true },
    completionMessage: 'The object is now responsive to input. This is how XR designers create actions that feel immediate, intentional, and understandable.'
  }
}
