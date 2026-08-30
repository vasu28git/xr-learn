export const challenge3 = {
  id: 3,
  title: 'Emergency Alarm Light',
  difficulty: 'intermediate',
  category: 'lighting',
  xp: 150,
  description: 'Create an emergency alarm effect: set the light color to red and increase its intensity to at least 2.0. Make the alarm box red and highly metallic.',
  hint: 'Set light.intensity to a high value (2.0+) and material.color to a red hex code. Increase metalness for a shiny effect.',
  starterCode: `using UnityEngine;

public class AlarmController : MonoBehaviour
{
    public Light alarmLight;
    public Material alarmMaterial;

    void Start()
    {
        // Configure the alarm light
        alarmLight.intensity = 0.5f;
        
        // Set the alarm box material
        alarmMaterial.color = Color.white;
        alarmMaterial.SetFloat("_Roughness", 0.5f);
        alarmMaterial.SetFloat("_Metallic", 0.0f);
    }
}`,
  scene: {
    objects: [
      { id: 'alarmBox', type: 'box', position: [0, 1, 0], color: '#ffffff', size: [1.5, 1.5, 1.5] },
    ],
    lights: [
      { type: 'ambient', intensity: 0.1 },
      { type: 'point', intensity: 0.5, position: [0, 3, 0], color: '#ff0000' },
    ]
  },
  initialState: {
    light: { intensity: 0.5 },
    material: { color: '#ffffff', roughness: 0.5, metalness: 0.0 },
  },
  tests: [
    {
      name: 'Light intensity is at least 2.0',
      check: (state) => (state.light?.intensity ?? 0) >= 2.0,
    },
    {
      name: 'Material color is red-ish (contains ff or ee in red channel)',
      check: (state) => {
        const color = (state.material?.color || '').toLowerCase()
        return color.includes('ff') && color.length >= 4 && !color.includes('ffffff')
      },
    },
    {
      name: 'Material metalness is above 0.6 (shiny alarm surface)',
      check: (state) => (state.material?.metalness ?? 0) >= 0.6,
    },
    {
      name: 'Material roughness is below 0.3 (smooth reflective surface)',
      check: (state) => (state.material?.roughness ?? 1) <= 0.3,
    },
  ],
}
