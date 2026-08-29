import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const ALLOWED_SECTION_TYPES = ["heading", "text", "highlight", "list"];

export async function generateLearningModule({ moduleId, moduleTitle, retrievedContent }) {
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

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();

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