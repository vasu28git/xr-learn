import 'dotenv/config'
import express from "express";
import cors from "cors";
import { retrieveModuleContent, matchModulesForTopics } from "./retrieve.js";
import { generateLearningModule } from "./planner.js";

const app = express();
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? "https://REPLACE_WITH_DEPLOYED_FRONTEND_URL"
    : "http://localhost:5173",
}));
app.use(express.json());

app.post("/api/generate-theory", async (req, res) => {
  const { moduleId, moduleTitle, topic } = req.body;
  try {
    const retrievedContent = await retrieveModuleContent(moduleId, topic);
    const theory = await generateLearningModule({ moduleId, moduleTitle, retrievedContent });
    res.json({ theory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "theory generation failed" });
  }
});

app.post("/api/match-topics", async (req, res) => {
  try {
    const { topics } = req.body;

    if (!Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({ error: 'Request body must include a non-empty "topics" array of strings' });
    }
    if (!topics.every(t => typeof t === "string" && t.trim().length > 0)) {
      return res.status(400).json({ error: 'All entries in "topics" must be non-empty strings' });
    }

    const matches = await matchModulesForTopics(topics);
    return res.status(200).json({ matches });
  } catch (err) {
    console.error("POST /api/match-topics failed:", err);
    return res.status(500).json({ error: "Failed to match topics to modules" });
  }
});

app.listen(3001, () => console.log("Recommendation service on :3001"));