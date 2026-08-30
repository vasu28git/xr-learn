export const module7 = {
  id: 7,
  title: 'Depth, Occlusion & Persistence',
  description: 'Understand how XR systems decide what is in front of something else and how scene state persists over time.',
  theory: {
    sections: [
      { type: 'heading', content: 'What Is Depth in XR?' },
      { type: 'text', content: 'Depth tells an XR system how far away objects are from the camera or from each other. It is one of the most important pieces of spatial understanding because it determines what is visible and what is hidden.' },
      { type: 'highlight', content: 'Without depth, everything would appear flat. A wall would not block the view, and objects would float without any sense of order or layering.' },
      { type: 'heading', content: 'Occlusion and Layering' },
      { type: 'list', items: [
        'Occlusion happens when one object blocks another from view.',
        'A wall can occlude an object behind it if the object is farther away in Z space.',
        'A box in front of a wall should remain visible while a box behind it should be hidden.',
        'Depth ordering is critical for believable immersive scenes.'
      ]},
      { type: 'text', content: 'In a real AR scene, there may be walls, furniture, or virtual objects occupying the same space. Scene logic decides what the user should see based on depth and position.' },
      { type: 'heading', content: 'Persistence' },
      { type: 'text', content: 'Persistence means keeping a spatial understanding of the environment over time. If a virtual object is anchored in a room, the system should remember that relationship as the user moves around.' },
      { type: 'highlight', content: 'This exercise focuses on a wall and a box. If the box is behind the wall in depth, it should be occluded. If it moves to the front, it should become visible again.' },
    ]
  },
  handsOn: {
    task: 'Place the box behind the wall and make the wall occlude it correctly based on depth.',
    starterCode: `using UnityEngine;

public class OcclusionController : MonoBehaviour
{
    public GameObject box;
    public GameObject wall;

    void Start()
    {
        // Set the box behind the wall to test occlusion.
        // Objects farther away in Z space are hidden behind the wall.
        box.transform.position = new Vector3(0f, 1f, -2f);
        wall.transform.position = new Vector3(0f, 1.5f, 0f);
    }
}`,
    scene: {
      objects: [
        { id: 'wall', type: 'box', position: [0, 1.5, 0], color: '#5d6d9c', size: [4, 3, 0.3], isTarget: true },
        { id: 'box', type: 'box', position: [0, 1, -2], color: '#ffb366', size: [0.8, 0.8, 0.8] },
      ],
      lights: [
        { type: 'ambient', intensity: 0.4, color: '#5a7cff' },
        { type: 'directional', intensity: 0.9, position: [5, 8, 3] },
      ]
    },
    allowedAPI: ['wall.position.z', 'box.position.z'],
    targetState: { boxBehindWall: true, wallOccludesBox: true },
    completionMessage: 'The box is now correctly hidden behind the wall. Depth and occlusion are what let XR scenes feel spatially coherent instead of flat.'
  }
}
