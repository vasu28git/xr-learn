require('dotenv').config();
const { searchByVector } = require("../lib/vectorClient");
const { embedText } = require("../lib/embeddings");

async function main() {
  const v = await embedText("physics collisions rigidbody gravity");
  const results = await searchByVector(v, 3);
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
