const express = require('express');
const router = express.Router();
const diagnosticService = require('../services/diagnosticService');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const data = await diagnosticService.checkDiagnostic(req);
    res.json(data);
  } catch (err) {
    console.error('Check diagnostic error:', err);
    res.status(500).json({ message: 'Failed to check diagnostic status.' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const result = await diagnosticService.saveDiagnostic(req, req.body);
    res.json(result);
  } catch (err) {
    console.error('Save diagnostic error:', err);
    res.status(500).json({ message: err.message || 'Failed to save diagnostic results.' });
  }
});

module.exports = router;
