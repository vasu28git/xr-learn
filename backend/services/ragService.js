const { retrieveModuleContent, matchModulesForTopics } = require("../lib/retrieve");
const { generateLearningModule } = require("../lib/planner");
const { gradeAnswers } = require("../lib/grader");

const generateTheory = async (moduleId, moduleTitle, topic) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not configured. Serving static theory fallback.");
    return { theory: null };
  }

  const retrievedContent = await retrieveModuleContent(moduleId, topic);
  const theory = await generateLearningModule({ moduleId, moduleTitle, retrievedContent });
  return { theory };
};

const matchTopics = async (topics) => {
  if (!Array.isArray(topics) || topics.length === 0) {
    const err = new Error('Request body must include a non-empty "topics" array of strings');
    err.status = 400;
    throw err;
  }
  if (!topics.every(t => typeof t === "string" && t.trim().length > 0)) {
    const err = new Error('All entries in "topics" must be non-empty strings');
    err.status = 400;
    throw err;
  }

  const matches = await matchModulesForTopics(topics);
  return { matches };
};

const gradeQuiz = async (questions, answers) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not configured. Defaulting all quiz answers to incorrect.");
    const correctness = {};
    (questions || []).forEach((q) => { correctness[q.id] = false; });
    return { correctness };
  }

  const correctness = await gradeAnswers(questions, answers);
  return { correctness };
};

module.exports = {
  generateTheory,
  matchTopics,
  gradeQuiz,
};
