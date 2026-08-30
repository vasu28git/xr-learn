const mammoth = require("mammoth");
const { embedText } = require("../lib/embeddings");
const { ensureCollection, upsertChunk } = require("../lib/vectorClient");

const MARKER_REGEX = /<!--\s*MODULE_ID:\s*(\d+)\s*\|\s*TOPIC:\s*([a-z0-9-]+)\s*-->/g;

async function extractRawText(docxPath) {
  const result = await mammoth.extractRawText({ path: docxPath });
  if (result.messages?.length) {
    for (const m of result.messages) {
      console.warn(`[mammoth] ${m.type}: ${m.message}`);
    }
  }
  return result.value;
}

function splitIntoModules(fullText) {
  const markers = [...fullText.matchAll(MARKER_REGEX)];

  if (markers.length === 0) {
    throw new Error(
      "No MODULE_ID/TOPIC markers found in document. Expected lines like " +
      "'<!-- MODULE_ID: 1 | TOPIC: xr-fundamentals -->' directly above each " +
      "module heading. Check the doc was tagged correctly before ingesting."
    );
  }

  const modules = markers.map((match, i) => {
    const moduleId = Number(match[1]);
    const topic = match[2];
    const contentStart = match.index + match[0].length;
    const contentEnd = i + 1 < markers.length ? markers[i + 1].index : fullText.length;
    const text = fullText.slice(contentStart, contentEnd).trim();
    return { moduleId, topic, text };
  });

  const seenIds = new Set();
  for (const m of modules) {
    if (seenIds.has(m.moduleId)) {
      throw new Error(`Duplicate MODULE_ID ${m.moduleId} found — check the doc for a repeated marker.`);
    }
    seenIds.add(m.moduleId);
    if (!m.text || m.text.length < 100) {
      throw new Error(`Module ${m.moduleId} (topic: ${m.topic}) has suspiciously little content (${m.text.length} chars) — check the marker placement.`);
    }
  }

  return modules;
}

async function ingest(docxPath) {
  if (!docxPath) {
    console.error("Usage: node backend/scripts/ingest.js <path-to-tagged-docx>");
    process.exit(1);
  }

  console.log(`Reading ${docxPath}...`);
  const fullText = await extractRawText(docxPath);

  console.log("Splitting into per-module chunks...");
  const modules = splitIntoModules(fullText);
  console.log(`Found ${modules.length} modules:`);
  for (const m of modules) {
    console.log(`  Module ${m.moduleId} — topic: ${m.topic} — ${m.text.length} chars`);
  }

  console.log("Ensuring Actian collection exists...");
  await ensureCollection();

  console.log("Embedding + upserting each module...");
  for (const m of modules) {
    const vector = await embedText(m.text);
    await upsertChunk({
      id: m.moduleId,
      vector,
      moduleId: m.moduleId,
      topic: m.topic,
      text: m.text,
    });
    console.log(`  ✓ Module ${m.moduleId} (${m.topic}) ingested`);
  }

  console.log(`Done. Ingested ${modules.length} modules into Actian.`);
}

const docxPath = process.argv[2];
ingest(docxPath).catch((err) => {
  console.error("Ingestion failed:", err.message);
  process.exit(1);
});
