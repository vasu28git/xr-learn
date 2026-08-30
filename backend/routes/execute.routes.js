const express = require('express');
const router = express.Router();
const executeService = require('../services/executeService');

router.post('/', async (req, res) => {
  const { source } = req.body;
  try {
    const data = await executeService.executeCSharp(source);
    res.json(data);
  } catch (err) {
    console.error('Failed to proxy C# execution:', err);
    res.json({
      commands: [],
      errors: [{ kind: 'runtime', message: `Failed to reach C# execution server: ${err.message}`, line: 1, column: 1 }],
      astNodes: [],
      syntaxNodeCount: 0,
    });
  }
});

module.exports = router;
