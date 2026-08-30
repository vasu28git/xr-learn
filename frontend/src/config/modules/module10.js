export const module10 = {
  id: 10,
  title: 'Physics & Collisions',
  description: 'Learn how force, gravity, and restitution affect objects in motion and how collisions are simulated in XR scenes.',
  theory: {
    sections: [
      { type: 'heading', content: 'Why Physics Matters in XR' },
      { type: 'text', content: 'XR scenes feel more natural when objects obey physical rules. A ball should fall when gravity acts on it, bounce when it hits a surface, and respond to forces from user interaction.' },
      { type: 'highlight', content: 'Physics is what turns a static scene into a believable simulation. Without it, objects feel detached from the real world and interaction becomes less convincing.' },
      { type: 'heading', content: 'Core Physics Concepts' },
      { type: 'list', items: [
        'Gravity — pulls objects downward over time.',
        'Restitution — controls how much a surface bounces an object back.',
        'Force application — adds impulse or movement to an object.',
        'Collision — defines when two objects meet and how they respond.'
      ]},
      { type: 'text', content: 'A simple platform and ball are enough to demonstrate the idea. When the ball hits the platform, the collision response decides how it moves after contact.' },
      { type: 'heading', content: 'Simulation and Realism' },
      { type: 'text', content: 'XR experiences often use a physics engine to manage these values efficiently. This keeps the simulation smooth and helps create believable motion without writing all the math by hand.' },
      { type: 'highlight', content: 'In this exercise, you will set gravity, restitution, and force values for a ball so it behaves like a bouncing object on a platform.' },
    ]
  },
  handsOn: {
    task: 'Apply force to the ball and tune gravity and restitution so it bounces correctly on the platform.',
    starterCode: `using UnityEngine;

public class PhysicsController : MonoBehaviour
{
    public Rigidbody ballRigidbody;
    public PhysicsMaterial ballMaterial;

    void Start()
    {
        // Physics module. Requires a physics engine component.
        // Set gravity and bounce settings, then apply a force to the ball.
        Physics.gravity = new Vector3(0, -9.8f, 0);
        ballMaterial.bounciness = 0.8f;
        ballRigidbody.AddForce(new Vector3(0, 2f, 0), ForceMode.Impulse);
    }
}`,
    scene: {
      objects: [
        { id: 'ball', type: 'sphere', position: [0, 3, 0], color: '#ff8a65', size: [0.5, 32, 32] },
        { id: 'platform', type: 'box', position: [0, 0, 0], color: '#8ecae6', size: [4, 0.5, 4], isTarget: true },
      ],
      lights: [
        { type: 'ambient', intensity: 0.5, color: '#67a7ff' },
        { type: 'directional', intensity: 0.9, position: [5, 8, 3] },
      ]
    },
    allowedAPI: ['ball.applyForce', 'ball.setGravity', 'ball.setRestitution', 'ball.position.y', 'platform.position.y'],
    targetState: { gravitySet: true, restitutionSet: true, forceApplied: true },
    completionMessage: 'The ball now behaves like it is under physical forces. This is how flow, bounce, and impact feel believable in immersive applications.'
  }
}
