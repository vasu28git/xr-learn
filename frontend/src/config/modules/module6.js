export const module6 = {
  id: 6,
  title: 'Build Your First XR Scene',
  description: 'Put it all together. Build a complete XR scene from scratch using everything you\'ve learned — positions, hierarchy, lighting, materials, and interaction.',
  theory: {
    sections: [
      { type: 'heading', content: 'Putting It All Together' },
      { type: 'text', content: 'Congratulations — you\'ve learned the five fundamental concepts of XR development. Now it\'s time to combine them into your own creation.' },
      { type: 'heading', content: 'Quick Recap' },
      {
        type: 'list', items: [
          'Module 1: XR is the umbrella term for AR, VR, and MR.',
          'Module 2: Every 3D object exists at an (X, Y, Z) position.',
          'Module 3: Parent-child relationships let objects move as groups.',
          'Module 4: Lights and materials define how objects look.',
          'Module 5: Click handlers make objects interactive.'
        ]
      },
      { type: 'highlight', content: 'In this final exercise, you\'ll build a scene that uses ALL of these concepts. Your scene must include: at least 2 positioned objects, a parent-child relationship, custom lighting, and one interactive element.' },
      { type: 'heading', content: 'Tips for Your Scene' },
      {
        type: 'list', items: [
          'Start simple — position your objects first.',
          'Create at least one parent-child relationship.',
          'Adjust the lighting to set the mood.',
          'Add a click handler to make something interactive.',
          'Be creative! There\'s no single correct answer.'
        ]
      },
      { type: 'text', content: 'All APIs from previous modules are available. This is your sandbox — experiment freely and build something you\'re proud of.' },
    ]
  },
  handsOn: {
    task: 'Build your own XR scene. It must include: at least 2 objects with correct positions, a parent-child relationship, custom lighting, and one interactive element.',
    starterCode: `using UnityEngine;

public class XRSceneController : MonoBehaviour
{
    public GameObject box1;
    public GameObject box2;
    public GameObject sphere1;
    public Light sceneLight;

    void Start()
    {
        // Position box1, box2 and sphere1 in world space
        box1.transform.position = new Vector3(0f, 1f, 0f);
        box2.transform.position = new Vector3(2f, 1f, 0f);
        sphere1.transform.position = new Vector3(-2f, 1f, 2f);
        
        // Create hierarchy — make box2 a child of box1
        box2.transform.parent = box1.transform;
        
        // Adjust custom point light intensity
        sceneLight.intensity = 1.2f;
        
        // Register a click handler using C# events (mock)
        /*
        box1.OnClick(() => {
          box1.GetComponent<Renderer>().material.color = Color.green;
        });
        */
    }
}`,
    scene: {
      objects: [
        { id: 'box1', type: 'box', position: [0, 0.5, 0], color: '#4488ff', size: [1, 1, 1] },
        { id: 'box2', type: 'box', position: [2, 0.5, 0], color: '#ff8844', size: [0.7, 0.7, 0.7] },
        { id: 'sphere1', type: 'sphere', position: [-2, 1, 2], color: '#44ff88', size: [0.6, 32, 32] },
      ],
      lights: [
        { type: 'ambient', intensity: 0.3, color: '#4060ff' },
        { type: 'directional', intensity: 0.8, position: [5, 8, 3] },
      ]
    },
    allowedAPI: [
      'box1.position.x', 'box1.position.y', 'box1.position.z',
      'box2.position.x', 'box2.position.y', 'box2.position.z',
      'sphere1.position.x', 'sphere1.position.y', 'sphere1.position.z',
      'scene.setParent',
      'light.intensity', 'material.color', 'material.roughness', 'material.metalness',
      'box1.onClick', 'box2.onClick', 'sphere1.onClick',
      'box1.color', 'box2.color', 'sphere1.color'
    ],
    targetState: { objectsPositioned: 2, parentChildSet: true, hasClickHandler: true },
    completionMessage: 'Amazing work! You\'ve built your first XR scene from scratch — using positioning, hierarchy, lighting, and interaction. You now have the foundation to build real XR experiences.'
  }
}
