export const module5 = {
  id: 5,
  title: 'Interaction & Input',
  description: 'Add interactivity to 3D objects. Learn about raycasting, click events, and how XR applications respond to user input.',
  theory: {
    sections: [
      { type: 'heading', content: 'Making 3D Objects Interactive' },
      { type: 'text', content: 'A 3D scene is static until you add interaction. In XR, interaction means the user can click, hover, grab, or point at objects — and the objects respond. This is what makes XR feel alive.' },
      { type: 'heading', content: 'How Does Clicking Work in 3D?' },
      { type: 'text', content: 'When you click on a 2D button, the browser knows exactly which element you clicked because everything is flat. In 3D, it\'s more complex. The system uses a technique called raycasting.' },
      { type: 'highlight', content: 'Raycasting: An invisible ray shoots from your cursor (or controller) into the 3D scene. The first object that ray hits is the one you\'re interacting with. It\'s like pointing a laser pointer into a room.' },
      { type: 'heading', content: 'Event Handlers in 3D' },
      {
        type: 'list', items: [
          'onClick — Fires when the user clicks on an object.',
          'onPointerOver — Fires when the cursor hovers over an object.',
          'onPointerOut — Fires when the cursor leaves an object.',
          'onPointerDown / onPointerUp — More granular press and release events.'
        ]
      },
      { type: 'text', content: 'In XR headsets, these events are triggered by controllers or hand tracking instead of a mouse — but the concept is identical.' },
      { type: 'highlight', content: 'In the exercise below, you\'ll add a click handler to a box that toggles its color between blue and red. This is the foundation of all XR interaction.' },
    ]
  },
  handsOn: {
    task: 'Make the box change color to red when clicked, and return to blue when clicked again.',
    starterCode: `using UnityEngine;

public class InteractionController : MonoBehaviour
{
    public GameObject box;

    void Start()
    {
        // Add a click handler to the box
        // Use: box.GetComponent<Renderer>().material.color = Color.red; for red
        // Use: box.GetComponent<Renderer>().material.color = Color.blue; for blue
    }
}`,
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
    completionMessage: 'Your box is now interactive! Click handlers are the foundation of all XR interaction — whether it\'s clicking with a mouse or pointing with a VR controller.'
  }
}
