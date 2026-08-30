const express = require('express');
const router = express.Router();
const progressService = require('../services/progressService');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const data = await progressService.getAllProgress(req);
    res.json(data);
  } catch (err) {
    console.error('Fetch progress error:', err);
    res.status(500).json({ message: 'Failed to fetch progress.' });
  }
});

router.get('/:moduleId', requireAuth, async (req, res) => {
  const { moduleId } = req.params;
  try {
    const data = await progressService.getModuleProgress(req, moduleId);
    res.json(data);
  } catch (err) {
    console.error('Fetch module progress error:', err);
    res.status(500).json({ message: 'Failed to fetch module progress.' });
  }
});

router.put('/:moduleId', requireAuth, async (req, res) => {
  const { moduleId } = req.params;
  const { completed, attempts } = req.body;
  try {
    const result = await progressService.updateProgress(req, moduleId, completed, attempts);
    res.json(result);
  } catch (err) {
    console.error('Update progress error:', err);
    res.status(500).json({ message: 'Failed to update progress.' });
  }
});

module.exports = router;
