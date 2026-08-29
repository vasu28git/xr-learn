import { VectorAIClient } from "@actian/vectorai-client"; // CORRECTED: real npm package is @actian/vectorai-client (verified against docs.vectoraidb.actian.com), not actian-vectorai-js

const client = new VectorAIClient(process.env.ACTIAN_HOST || "localhost:6574");
const COLLECTION = "xr_modules";
const EMBED_DIM = 768; // text-embedding-004 output size — CONFIRMED via Google docs. Note: text-embedding-004 is being deprecated in favor of gemini-embedding-001/002 (default 3072-dim); fine for now, revisit before long-term use.

export async function ensureCollection() {
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

export async function upsertChunk({ id, vector, moduleId, topic, text }) {
  await client.points.upsert(COLLECTION, [
    { id, vector, payload: { moduleId, topic, text } },
  ]);
}

export async function searchByVector(vector, limit = 3) {
  return client.points.search(COLLECTION, vector, { limit });
}