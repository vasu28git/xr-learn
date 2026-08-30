// src/config/diagnostic.js
// 5-question diagnostic quiz — one question per module pair.
// Each question carries a curated `ragTopic` phrase used to semantically
// match a learner's weak areas back to relevant course modules via RAG.

export const diagnosticQuestions = [
  {
    id: 'q1',
    modulePair: [1, 2],
    question: 'Which best describes the relationship between a scene graph and a 3D renderer?',
    referenceAnswer: 'A scene graph stores objects and their hierarchical transform relationships. The renderer traverses the scene graph each frame to determine what to draw and where, using the accumulated transforms to position objects correctly on screen.',
    ragTopic: 'scene graph hierarchy and renderer traversal fundamentals',
  },
  {
    id: 'q2',
    modulePair: [3, 4],
    question: 'In an XR context, what is the primary purpose of a coordinate space transform (e.g. local vs. world vs. XR reference space)?',
    referenceAnswer: 'Coordinate space transforms convert object positions between different frames of reference — such as local object space, world space, and the XR reference space tied to the headset — so that tracking data and rendered visuals stay consistent as the user moves.',
    ragTopic: 'coordinate space transforms and XR reference spaces',
  },
  {
    id: 'q3',
    modulePair: [5, 6],
    question: 'When writing shaders for real-time XR rendering, why does performance budget matter more than in typical desktop 3D?',
    referenceAnswer: 'XR headsets render two separate views (one per eye) at high frame rates — often 90 Hz or more — so the per-frame GPU cost is effectively doubled and there is very little budget to spare. Exceeding the frame budget causes dropped frames, which leads to discomfort and motion sickness.',
    ragTopic: 'shader performance budgets for stereo XR rendering',
  },
  {
    id: 'q4',
    modulePair: [7, 8],
    question: 'What is the main challenge that physics engines solve for interactive 3D/XR applications?',
    referenceAnswer: 'Physics engines simulate plausible motion, collisions, and constraints between objects in real time. They handle rigid-body dynamics, contact resolution, and constraint solving so developers do not have to implement these complex simulations manually.',
    ragTopic: 'physics simulation, collisions, and constraints in interactive 3D',
  },
  {
    id: 'q5',
    modulePair: [9, 10],
    question: 'Why is state synchronization especially tricky in multi-user XR environments?',
    referenceAnswer: 'Each XR client renders its local scene at high frequency (90+ Hz), but network messages arrive with latency and out of order. Shared state — such as object positions and user interactions — must be continuously reconciled across all clients despite this latency and potential drift.',
    ragTopic: 'multi-user state synchronization and network latency in XR',
  },
];

export default diagnosticQuestions;