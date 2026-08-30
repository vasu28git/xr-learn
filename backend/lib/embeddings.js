const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy-key" });
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
