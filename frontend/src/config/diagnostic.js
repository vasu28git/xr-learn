// src/config/diagnostic.js
// 5-question diagnostic quiz — one question per module pair.
// Each question carries a curated `ragTopic` phrase used to semantically
// match a learner's weak areas back to relevant course modules via RAG.

export const diagnosticQuestions = [
  {
    id: 'q1',
    modulePair: [1, 2],
    question: 'Which best describes the relationship between a scene graph and a 3D renderer?',
    options: [
      { id: 'a', text: 'The scene graph stores hierarchical transforms; the renderer traverses it to draw frames' },
      { id: 'b', text: 'The renderer generates the scene graph after each draw call' },
      { id: 'c', text: 'They are unrelated systems in a typical 3D engine' },
      { id: 'd', text: 'The scene graph only stores textures, not transforms' },
    ],
    correctOptionId: 'a',
    ragTopic: 'scene graph hierarchy and renderer traversal fundamentals',
  },
  {
    id: 'q2',
    modulePair: [3, 4],
    question: 'In an XR context, what is the primary purpose of a coordinate space transform (e.g. local vs. world vs. XR reference space)?',
    options: [
      { id: 'a', text: 'To convert object positions between different frames of reference so tracking and rendering stay consistent' },
      { id: 'b', text: 'To compress texture data for faster GPU upload' },
      { id: 'c', text: 'To manage audio spatialization only' },
      { id: 'd', text: 'To handle network latency between client and server' },
    ],
    correctOptionId: 'a',
    ragTopic: 'coordinate space transforms and XR reference spaces',
  },
  {
    id: 'q3',
    modulePair: [5, 6],
    question: 'When writing shaders for real-time XR rendering, why does performance budget matter more than in typical desktop 3D?',
    options: [
      { id: 'a', text: 'XR headsets render two views at high frame rates (often 90Hz+), so per-frame cost is effectively doubled and tightly bounded' },
      { id: 'b', text: 'Shaders are irrelevant to XR performance' },
      { id: 'c', text: 'XR devices always have more GPU headroom than desktops' },
      { id: 'd', text: 'Frame rate requirements are lower in XR than desktop' },
    ],
    correctOptionId: 'a',
    ragTopic: 'shader performance budgets for stereo XR rendering',
  },
  {
    id: 'q4',
    modulePair: [7, 8],
    question: 'What is the main challenge that physics engines solve for interactive 3D/XR applications?',
    options: [
      { id: 'a', text: 'Simulating plausible motion, collisions, and constraints between objects in real time' },
      { id: 'b', text: 'Compiling shader code ahead of time' },
      { id: 'c', text: 'Managing user authentication state' },
      { id: 'd', text: 'Parsing 3D model file formats' },
    ],
    correctOptionId: 'a',
    ragTopic: 'physics simulation, collisions, and constraints in interactive 3D',
  },
  {
    id: 'q5',
    modulePair: [9, 10],
    question: 'Why is state synchronization especially tricky in multi-user XR environments?',
    options: [
      { id: 'a', text: 'Each client renders locally at high frequency, so shared state must be reconciled despite network latency and drift' },
      { id: 'b', text: 'XR clients never need to communicate with a server' },
      { id: 'c', text: 'State sync is identical to a standard 2D web app' },
      { id: 'd', text: 'Only the server renders; clients just display a video stream' },
    ],
    correctOptionId: 'a',
    ragTopic: 'multi-user state synchronization and network latency in XR',
  },
];

export default diagnosticQuestions;