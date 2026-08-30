export const challenge4 = {
  id: 4,
  title: 'Interactive Color Switcher',
  difficulty: 'advanced',
  category: 'interaction',
  xp: 250,
  description: 'Build a scene with 3 boxes. Each box should change to a unique color when clicked: box1 turns red, box2 turns green, box3 turns blue.',
  hint: 'Use box.OnClick(() => { ... }) for each box. Inside the handler, set box.GetComponent<Renderer>().material.color = Color.red (or the hex code).',
  starterCode: `using UnityEngine;

public class InteractionController : MonoBehaviour
{
    public GameObject box1;
    public GameObject box2;
    public GameObject box3;

    void Start()
    {
        // Register click handlers for each box
        // box1 should turn red when clicked
        // box2 should turn green when clicked
        // box3 should turn blue when clicked
        
        box1.transform.position = new Vector3(-2f, 1f, 0f);
        box2.transform.position = new Vector3(0f, 1f, 0f);
        box3.transform.position = new Vector3(2f, 1f, 0f);
        
        // Add your click handlers below:
        
    }
}`,
  scene: {
    objects: [
      { id: 'box1', type: 'box', position: [-2, 1, 0], color: '#888888', size: [1, 1, 1] },
      { id: 'box2', type: 'box', position: [0, 1, 0], color: '#888888', size: [1, 1, 1] },
      { id: 'box3', type: 'box', position: [2, 1, 0], color: '#888888', size: [1, 1, 1] },
    ],
    lights: [
      { type: 'ambient', intensity: 0.3, color: '#4060ff' },
      { type: 'directional', intensity: 0.8, position: [5, 8, 3] },
    ]
  },
  initialState: {
    box1: { position: { x: -2, y: 1, z: 0 }, color: '#888888', hasClickHandler: false },
    box2: { position: { x: 0, y: 1, z: 0 }, color: '#888888', hasClickHandler: false },
    box3: { position: { x: 2, y: 1, z: 0 }, color: '#888888', hasClickHandler: false },
  },
  tests: [
    {
      name: 'Box1 has a click handler registered',
      check: (state) => state.box1?.hasClickHandler === true,
    },
    {
      name: 'Box2 has a click handler registered',
      check: (state) => state.box2?.hasClickHandler === true,
    },
    {
      name: 'Box3 has a click handler registered',
      check: (state) => state.box3?.hasClickHandler === true,
    },
    {
      name: 'All 3 boxes are positioned correctly',
      check: (state) => {
        const b1x = state.box1?.position?.x ?? 0
        const b2x = state.box2?.position?.x ?? 0
        const b3x = state.box3?.position?.x ?? 0
        return Math.abs(b1x - (-2)) < 0.2 && Math.abs(b2x - 0) < 0.2 && Math.abs(b3x - 2) < 0.2
      },
    },
  ],
}
