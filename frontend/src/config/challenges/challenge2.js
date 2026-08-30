export const challenge2 = {
  id: 2,
  title: 'Planetary Orbit System',
  difficulty: 'intermediate',
  category: 'hierarchy',
  xp: 200,
  description: 'Build a simple solar system: make the moon orbit the planet by parenting it, then position the planet away from the sun.',
  hint: 'Use transform.parent to make the moon a child of the planet. Then move the planet — the moon should follow.',
  starterCode: `using UnityEngine;

public class OrbitController : MonoBehaviour
{
    public GameObject planet;
    public GameObject moon;

    void Start()
    {
        // The sun is at the center (0, 0, 0)
        // Move the planet to orbit distance and parent the moon to it
        
        planet.transform.position = new Vector3(0f, 0f, 0f);
        moon.transform.position = new Vector3(0f, 0f, 0f);
        
        // Make the moon orbit the planet
        // moon.transform.parent = ???
    }
}`,
  scene: {
    objects: [
      { id: 'sun', type: 'sphere', position: [0, 1, 0], color: '#ffcc00', size: [1.2, 32, 32] },
      { id: 'planet', type: 'sphere', position: [0, 1, 0], color: '#4488ff', size: [0.6, 32, 32] },
      { id: 'moon', type: 'sphere', position: [0, 1, 0], color: '#aaaaaa', size: [0.25, 16, 16] },
    ],
    lights: [
      { type: 'ambient', intensity: 0.2 },
      { type: 'point', intensity: 1.5, position: [0, 1, 0], color: '#ffcc00' },
    ]
  },
  initialState: {
    sun: { position: { x: 0, y: 1, z: 0 } },
    planet: { position: { x: 0, y: 1, z: 0 } },
    moon: { position: { x: 0, y: 1, z: 0 } },
    moonParent: null,
  },
  tests: [
    {
      name: 'Planet is positioned away from the sun (distance > 2 units)',
      check: (state) => {
        const px = state.planet?.position?.x ?? 0
        const pz = state.planet?.position?.z ?? 0
        const dist = Math.sqrt(px * px + pz * pz)
        return dist > 2
      },
    },
    {
      name: 'Moon is parented to the planet',
      check: (state) => state.moonParent === 'planet',
    },
    {
      name: 'Moon has a position offset from planet center',
      check: (state) => {
        const mx = state.moon?.position?.x ?? 0
        const mz = state.moon?.position?.z ?? 0
        return Math.abs(mx) > 0.3 || Math.abs(mz) > 0.3
      },
    },
  ],
}
