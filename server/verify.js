import 'dotenv/config'
import { searchByVector } from "./vectorClient.js";
import { embedText } from "./embeddings.js";

const v = await embedText("physics collisions rigidbody gravity");
const results = await searchByVector(v, 3);
console.log(JSON.stringify(results, null, 2));