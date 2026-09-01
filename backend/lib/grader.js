// backend/lib/grader.js
// Grades short-answer diagnostic quiz responses against reference answers
// using Gemini. Uses the exact same client pattern as planner.js.

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy-key" });

/**
 * Grade student answers against reference answers using Gemini.
 *
 * @param {Array<{id: string, question: string, referenceAnswer: string}>} questions
 * @param {Object} answers - { [questionId]: studentAnswerText }
 * @returns {Object} correctness map: { [questionId]: boolean }
 */
async function gradeAnswers(questions, answers) {
  // Build the grading items for the prompt
  const items = questions.map((q) => ({
    id: q.id,
    question: q.question,
    referenceAnswer: q.referenceAnswer,
    studentAnswer: (answers[q.id] || '').trim(),
  }));

  const prompt = `You are grading short-answer quiz responses for an XR (Extended Reality) course.

For each item below, decide if the student's answer is correct.

Grading rules:
- A paraphrased answer that captures the key concept is CORRECT.
- A blank answer, off-topic answer, or answer that contradicts the key concept is INCORRECT.
- Do not require exact wording — judge conceptual understanding.

Items to grade:
${JSON.stringify(items, null, 2)}

Return ONLY valid JSON with no markdown fences, no preamble, and no explanation:
{"results": [{"id": "<question id string>", "correct": <true or false>}, ...]}`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  const raw = response.text.trim();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // JSON parse failed — default every question to incorrect (safe failure)
    console.error('[grader] Failed to parse Gemini JSON response:', raw.slice(0, 200));
    const correctness = {};
    questions.forEach((q) => { correctness[q.id] = false; });
    return correctness;
  }

  const resultsList = Array.isArray(parsed.results) ? parsed.results : [];

  // Build correctness map, defaulting any missing question to false
  const correctness = {};
  questions.forEach((q) => { correctness[q.id] = false; }); // safe default
  resultsList.forEach((item) => {
    if (item && typeof item.id === 'string' && typeof item.correct === 'boolean') {
      correctness[item.id] = item.correct;
    }
  });

  return correctness;
}

module.exports = { gradeAnswers };
