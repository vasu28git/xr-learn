const express = require('express');
const router = express.Router();
const tutorService = require('../services/tutorService');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, async (req, res) => {
  try {
    const data = await tutorService.getTutorResponse(req.body);
    res.json(data);
  } catch (err) {
    console.error('AI Tutor error:', err);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
