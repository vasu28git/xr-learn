const { VectorAIClient } = require("@actian/vectorai-client");

const client = new VectorAIClient(process.env.ACTIAN_HOST || "localhost:6574");
const COLLECTION = "xr_modules";
const EMBED_DIM = 768; // gemini-embedding-001 output size (dimension configured in embeddings.js)

async function ensureCollection() {
  const existing = await client.collections.list?.() ?? [];
  const exists = Array.isArray(existing)
    ? existing.includes(COLLECTION)
    : existing?.includes?.(COLLECTION);
  if (!exists) {
    await client.collections.create(COLLECTION, {
      dimension: EMBED_DIM,
      distanceMetric: "COSINE",
    });
  }
}

async function upsertChunk({ id, vector, moduleId, topic, text }) {
  await client.points.upsert(COLLECTION, [
    { id, vector, payload: { moduleId, topic, text } },
  ]);
}

async function searchByVector(vector, limit = 3) {
  return client.points.search(COLLECTION, vector, { limit });
}

module.exports = {
  ensureCollection,
  upsertChunk,
  searchByVector
};
