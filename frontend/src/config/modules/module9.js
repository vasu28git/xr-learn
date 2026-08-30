export const module9 = {
  id: 9,
  title: 'Hand & Controller Interaction',
  description: 'Explore how XR systems model hand and controller gestures, including pointing, grabbing, and releasing objects in space.',
  theory: {
    sections: [
      { type: 'heading', content: 'Hands and Controllers in XR' },
      { type: 'text', content: 'In XR, user input often comes from tracked hands or handheld controllers. These inputs let the person point at objects, move them around, and interact with the scene naturally.' },
      { type: 'highlight', content: 'A controller is not just a button device — it is a spatial object with position and orientation. The app can use it as a pointer or a tool for direct manipulation.' },
      { type: 'heading', content: 'Grab and Release Mechanics' },
      { type: 'list', items: [
        'Grab — the user picks up or attaches an object to their hand or controller.',
        'Release — the object is dropped back into the scene.',
        'Tracking — the object follows the hand or controller as it moves.',
        'Collision — the object stays attached until the user releases it.'
      ]},
      { type: 'text', content: 'This is a common pattern in immersive interfaces: a pointer indicates where the user is aiming, and a grab action attaches an object to the user’s input device so it can be moved around the space.' },
      { type: 'heading', content: 'Why This Feels Natural' },
      { type: 'text', content: 'When a system updates the object position smoothly as the controller moves, it feels like direct manipulation. This is the same design logic behind virtual tools, object placement, and scene editing in XR apps.' },
      { type: 'highlight', content: 'In this exercise, you will simulate a hand/controller stand-in and attach a block to it. The goal is to grab the object, move it, and release it at the correct point.' },
    ]
  },
  handsOn: {
    task: 'Use the controller stand-in to grab a box, move it with the pointer, and release it at a valid position.',
    starterCode: `using UnityEngine;

public class HandController : MonoBehaviour
{
    public GameObject controller;
    public GameObject box;

    void Start()
    {
        // Simulate a tracked controller with grab/release actions.
        // Move the controller to pick up the box, then release it.
        controller.transform.position = new Vector3(0f, 1f, 0f);
        
        // controller.GetComponent<Grabber>().Grab(box);
        // controller.GetComponent<Grabber>().Release(box);
    }
}`,
    scene: {
      objects: [
        { id: 'controller', type: 'box', position: [0, 1, 0], color: '#b39ddb', size: [0.7, 0.7, 1.2], isTarget: true },
        { id: 'box', type: 'box', position: [1.5, 1, 0], color: '#81d8c8', size: [0.9, 0.9, 0.9] },
      ],
      lights: [
        { type: 'ambient', intensity: 0.4, color: '#4e7bff' },
        { type: 'directional', intensity: 0.8, position: [5, 8, 3] },
      ]
    },
    allowedAPI: ['controller.position.x', 'controller.position.y', 'controller.position.z', 'controller.grab', 'controller.release', 'box.position.x', 'box.position.y', 'box.position.z'],
    targetState: { grabbed: true, released: true },
    completionMessage: 'You simulated a controller-driven grab-and-release flow. This is a core interaction pattern in XR, from object manipulation to scene editing.'
  }
}
