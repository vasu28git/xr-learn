const { GoogleGenAI } = require("@google/genai");

// CORRECTED (2026-08-30): text-embedding-004 was shut down by Google on
// 2026-01-14. Replacement model is gemini-embedding-001. Also migrated off
// @google/generative-ai (deprecated — see github.com/google-gemini/deprecated-generative-ai-js)
// to @google/genai, the current unified SDK.
//
// gemini-embedding-001 defaults to 3072 output dimensions. The Actian
// collection (vectorClient.js) was created with EMBED_DIM = 768, so we
// constrain outputDimensionality to 768 here to match. If you ever change
// one, change the other — a dimension mismatch will fail at upsert/search
// time, not at embed time.

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const EMBED_MODEL = "gemini-embedding-001";
const OUTPUT_DIMENSIONALITY = 768;

async function embedText(text) {
  const response = await ai.models.embedContent({
    model: EMBED_MODEL,
    contents: text,
    config: { outputDimensionality: OUTPUT_DIMENSIONALITY },
  });
  return response.embeddings[0].values;
}

module.exports = { embedText };