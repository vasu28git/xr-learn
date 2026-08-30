/**
 * Local JSON-file-based vector store.
 * Replaces the Actian Vector AI client — no external service needed.
 * Uses cosine similarity for nearest-neighbour search.
 *
 * Data is persisted to: backend/data/vector_store.json
 */

const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '..', 'data', 'vector_store.json');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    }
  } catch (e) {
    console.warn('[vectorClient] Could not read store, starting fresh:', e.message);
  }
  return { points: [] };
}

function saveStore(store) {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ---------------------------------------------------------------------------
// Public API (matches the Actian client surface used by the rest of the app)
// ---------------------------------------------------------------------------

async function ensureCollection() {
  // No-op for file store — the file is created on first upsert.
  console.log('[vectorClient] Using local JSON vector store at', STORE_PATH);
}

async function upsertChunk({ id, vector, moduleId, topic, text }) {
  const store = loadStore();
  // Remove any existing point with the same id
  store.points = store.points.filter(p => p.id !== id);
  store.points.push({ id, vector, payload: { moduleId, topic, text } });
  saveStore(store);
}

async function searchByVector(queryVector, limit = 3) {
  const store = loadStore();
  if (!store.points.length) return [];

  const scored = store.points.map(p => ({
    ...p,
    score: cosineSimilarity(queryVector, p.vector),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

module.exports = {
  ensureCollection,
  upsertChunk,
  searchByVector,
};
