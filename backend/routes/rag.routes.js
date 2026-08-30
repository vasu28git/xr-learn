const express = require('express');
const router = express.Router();
const ragService = require('../services/ragService');

router.post('/generate-theory', async (req, res) => {
  const { moduleId, moduleTitle, topic } = req.body;
  try {
    const data = await ragService.generateTheory(moduleId, moduleTitle, topic);
    res.json(data);
  } catch (err) {
    console.error('RAG generate theory error:', err);
    res.status(500).json({ error: "theory generation failed" });
  }
});

router.post('/match-topics', async (req, res) => {
  const { topics } = req.body;
  try {
    const data = await ragService.matchTopics(topics);
    res.json(data);
  } catch (err) {
    console.error('RAG match topics error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Failed to match topics' });
  }
});

module.exports = router;
