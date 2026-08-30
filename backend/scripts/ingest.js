require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
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
  let markers = [...fullText.matchAll(MARKER_REGEX)];
  let isTagFormat = true;

  if (markers.length === 0) {
    const HEADER_REGEX = /^Module\s+(\d+)\s+—\s+([^\r\n]+)/gm;
    markers = [...fullText.matchAll(HEADER_REGEX)];
    isTagFormat = false;
  }

  if (markers.length === 0) {
    throw new Error(
      "No MODULE_ID/TOPIC markers or standard 'Module X — Title' headings found in document. " +
      "Expected comment tags like '<!-- MODULE_ID: 1 | TOPIC: xr-fundamentals -->' or headings like " +
      "'Module 1 — What Is XR?' directly above each module section."
    );
  }

  const modules = markers.map((match, i) => {
    const moduleId = Number(match[1]);
    let topic;
    
    if (isTagFormat) {
      topic = match[2];
    } else {
      // Auto-generate topic slug from the title (e.g. "What Is XR?" -> "what-is-xr")
      topic = match[2]
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

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
