export const diagnosticQuestions = [
  // Module 1 — What Is XR?
  {
    id: 1,
    moduleId: 1,
    question: "A user sees a virtual arrow overlaid on their real street through their phone camera. This is an example of:",
    options: ["VR", "AR", "MR", "None of these"],
    correctIndex: 1
  },
  {
    id: 2,
    moduleId: 1,
    question: "Which of these requires a fully digital environment with no view of the real world?",
    options: ["AR", "MR", "VR", "All of these equally"],
    correctIndex: 2
  },

  // Module 2 — Motion Tracking & Coordinates
  {
    id: 3,
    moduleId: 2,
    question: "If an object's local position is (2,0,0) and its parent is at world position (5,0,0), what is the object's world position?",
    options: ["(2,0,0)", "(5,0,0)", "(7,0,0)", "(3,0,0)"],
    correctIndex: 2
  },
  {
    id: 4,
    moduleId: 2,
    question: "Which axis typically represents depth (forward/backward) in a 3D scene?",
    options: ["X", "Y", "Z", "W"],
    correctIndex: 2
  },

  // Module 3 — Anchors & Scene Hierarchy
  {
    id: 5,
    moduleId: 3,
    question: "A virtual object slowly drifts from its intended real-world position over time. What's the most likely fix?",
    options: ["Increase its scale", "Anchor it", "Change its color", "Remove its collider"],
    correctIndex: 1
  },
  {
    id: 6,
    moduleId: 3,
    question: "Parenting one object to another means:",
    options: ["They share the same color", "The child's position becomes relative to the parent", "Both objects become invisible", "The parent is deleted"],
    correctIndex: 1
  },

  // Module 4 — 3D Model Import & Asset Pipeline
  {
    id: 7,
    moduleId: 4,
    question: "A model rotates wildly around a point far outside itself. What is the likely cause?",
    options: ["Wrong color", "Off-center pivot point", "Missing light", "Too many polygons"],
    correctIndex: 1
  },
  {
    id: 8,
    moduleId: 4,
    question: "An object visually appears in the scene but falls straight through the floor. What's missing?",
    options: ["A collider", "A material", "A light source", "A parent object"],
    correctIndex: 0
  },

  // Module 5 — Plane Classification
  {
    id: 9,
    moduleId: 5,
    question: "An AR app should only let a user place a picture frame on a wall, not a floor. This requires:",
    options: ["Increasing frame rate", "Surface/plane classification", "Adding more lights", "Reducing polygon count"],
    correctIndex: 1
  },
  {
    id: 10,
    moduleId: 5,
    question: "What's the main benefit of classifying a surface as 'floor' vs 'wall' rather than just detecting 'a flat surface exists'?",
    options: ["Faster rendering", "Enables smarter placement decisions", "Reduces file size", "No real benefit"],
    correctIndex: 1
  },

  // Module 6 — Light Estimation & Materials
  {
    id: 11,
    moduleId: 6,
    question: "Why do AR systems estimate real-world lighting intensity and color?",
    options: ["To reduce battery use", "So virtual objects visually blend into the real scene", "To detect surfaces", "To track motion"],
    correctIndex: 1
  },
  {
    id: 12,
    moduleId: 6,
    question: "Which material property affects how shiny/reflective a surface looks?",
    options: ["Roughness/metalness", "Position", "Scale", "Anchor state"],
    correctIndex: 0
  },

  // Module 7 — Depth, Occlusion & Persistence
  {
    id: 13,
    moduleId: 7,
    question: "A virtual object should be hidden when it's positioned behind a real wall from the camera's view. This requires:",
    options: ["Higher resolution", "Depth-based occlusion", "More ambient light", "A larger collider"],
    correctIndex: 1
  },
  {
    id: 14,
    moduleId: 7,
    question: "What does a 'persistent' or 'cloud' anchor allow, that a regular session anchor doesn't?",
    options: ["Brighter lighting", "The object to remain in place across sessions/devices", "Faster load times", "Smaller file sizes"],
    correctIndex: 1
  },

  // Module 8 — Interaction Design
  {
    id: 15,
    moduleId: 8,
    question: "Why is a controller-based raycast interaction different from a flat-screen tap?",
    options: ["It isn't different at all", "It accounts for spatial reachability and 3D targeting", "It only works in VR", "It requires no feedback"],
    correctIndex: 1
  },
  {
    id: 16,
    moduleId: 8,
    question: "What should typically happen before a 3D object registers a 'click' in a good XR interaction design?",
    options: ["Nothing, click first", "A hover/highlight state indicating targeting", "The object should disappear", "The scene should reset"],
    correctIndex: 1
  },

  // Module 9 — Hand & Controller Interaction
  {
    id: 17,
    moduleId: 9,
    question: "In a grab-and-release interaction, what determines when an object becomes 'grabbed'?",
    options: ["Random timing", "The hand/controller's interaction zone overlapping the object", "The object's color", "The scene's background"],
    correctIndex: 1
  },
  {
    id: 18,
    moduleId: 9,
    question: "Why might a platform simulate hand/controller interaction with mouse drag instead of requiring real XR hardware?",
    options: ["It's more accurate", "To keep the experience browser-only/accessible without a headset", "It's required by WebXR", "It disables physics"],
    correctIndex: 1
  },

  // Module 10 — Physics & Collisions
  {
    id: 19,
    moduleId: 10,
    question: "What's the difference between a static collider and a dynamic rigidbody?",
    options: ["No difference", "A static collider never moves; a rigidbody responds to forces like gravity", "Rigidbodies are invisible", "Static colliders float"],
    correctIndex: 1
  },
  {
    id: 20,
    moduleId: 10,
    question: "If a ball's bounciness (restitution) is increased, what should visibly change?",
    options: ["Its color", "How high/far it bounces after impact", "Its position stays exactly the same", "It stops responding to gravity"],
    correctIndex: 1
  }
]