const { searchByVector } = require("./vectorClient");
const { embedText } = require("./embeddings");

/**
 * Retrieves relevant grounding content for a given module/topic pair via
 * semantic search, scoped to that specific module. Used by
 * POST /api/generate-theory.
 *
 * Real Actian payload shape (confirmed via verify.js):
 *   { id, score, payload: { topic, text, moduleId } }
 *
 * @param {number} moduleId
 * @param {string} topic
 * @param {number} topK
 * @returns {Promise<string>} concatenated grounding text for this module,
 *          or "" if nothing was found. Falls back to the top-K results
 *          across all modules if none match the requested moduleId exactly.
 */
async function retrieveModuleContent(moduleId, topic, topK = 5) {
  if (!moduleId || !topic) {
    throw new Error("retrieveModuleContent: moduleId and topic are required");
  }

  const queryVector = await embedText(topic);
  const results = await searchByVector(queryVector, topK);

  if (!results || results.length === 0) {
    return "";
  }

  const filtered = results.filter(r => r.payload?.moduleId === moduleId);
  const chosen = filtered.length > 0 ? filtered : results;

  // Return concatenated grounding text, not raw result objects —
  // planner.js interpolates this directly into the Gemini prompt.
  return chosen.map(r => r.payload?.text).filter(Boolean).join('\n\n---\n\n');
}

/**
 * Given a weak-topic phrase (from diagnostic.ragTopic), embeds it and
 * returns the best-matching module id from Actian VectorAI.
 *
 * @param {string} topic
 * @param {number} topK
 * @returns {Promise<{ moduleId: number, score: number } | null>}
 */
async function matchModuleForTopic(topic, topK = 1) {
  if (!topic || typeof topic !== "string") {
    throw new Error("matchModuleForTopic: topic must be a non-empty string");
  }

  const runKeywordFallback = (t) => {
    const topicLower = t.toLowerCase();
    if (topicLower.includes("scene graph") || topicLower.includes("renderer") || topicLower.includes("hierarchy")) {
      return { moduleId: 1, score: 1.0 };
    }
    if (topicLower.includes("coordinate") || topicLower.includes("reference space") || topicLower.includes("transform")) {
      return { moduleId: 3, score: 1.0 };
    }
    if (topicLower.includes("shader") || topicLower.includes("stereo") || topicLower.includes("performance")) {
      return { moduleId: 5, score: 1.0 };
    }
    if (topicLower.includes("physics") || topicLower.includes("collision") || topicLower.includes("constraint") || topicLower.includes("gravity")) {
      return { moduleId: 7, score: 1.0 };
    }
    if (topicLower.includes("multi-user") || topicLower.includes("sync") || topicLower.includes("network") || topicLower.includes("latency")) {
      return { moduleId: 9, score: 1.0 };
    }
    return null;
  };

  if (!process.env.GEMINI_API_KEY) {
    return runKeywordFallback(topic);
  }

  try {
    const queryVector = await embedText(topic);
    const results = await searchByVector(queryVector, topK);

    if (!results || results.length === 0) {
      return runKeywordFallback(topic);
    }

    const best = results[0];
    return {
      moduleId: best.payload?.moduleId,
      score: best.score,
    };
  } catch (err) {
    console.warn("RAG search failed, falling back to keyword matching:", err.message);
    return runKeywordFallback(topic);
  }
}

/**
 * Batch version — matches multiple weak topics to modules in one call.
 * @param {string[]} topics
 */
async function matchModulesForTopics(topics) {
  const results = [];
  for (const topic of topics) {
    const match = await matchModuleForTopic(topic);
    results.push({
      topic,
      moduleId: match?.moduleId ?? null,
      score: match?.score ?? null,
    });
  }
  return results;
}

module.exports = {
  retrieveModuleContent,
  matchModuleForTopic,
  matchModulesForTopics
};