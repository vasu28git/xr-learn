const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy-key" });
const ALLOWED_SECTION_TYPES = ["heading", "text", "highlight", "list"];

async function generateLearningModule({ moduleId, moduleTitle, retrievedContent }) {
  const prompt = `You are generating personalized theory content for an XR training app module.

Module: ${moduleTitle} (id ${moduleId})
Grounding material from the existing curriculum (do not deviate from these facts):
${retrievedContent}

Generate a theory explanation broken into sections, matching this exact shape:
{"sections": [{"type": "heading"|"text"|"highlight"|"list", "content": "..." , "items": ["..."] (only for type "list")}]}

Rules:
- Only use type values: heading, text, highlight, list.
- "list" sections must use "items" (array of strings), not "content".
- Do not include any hands-on task, starter code, scene config, or targetState — theory only.
- Return ONLY valid JSON, no markdown fences, no preamble.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  
  const raw = response.text.trim();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null; // caller falls back to the module's existing static theory
  }

  const sections = Array.isArray(parsed.sections) ? parsed.sections : [];
  const validSections = sections.filter((s) => ALLOWED_SECTION_TYPES.includes(s.type));

  if (validSections.length === 0) return null;

  return { sections: validSections };
}

module.exports = { generateLearningModule };
