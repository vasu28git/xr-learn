const express = require('express');
const router = express.Router();
const { getVoiceTutorResponse, synthesizeVoice } = require('../services/voiceTutorService');
const { requireAuth } = require('../middleware/auth');

/**
 * POST /api/voice-tutor/chat
 * Receives lesson content + code + history + question, returns AI response text.
 */
router.post('/chat', requireAuth, async (req, res) => {
  const { lessonContent, code, history, question } = req.body;

  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ message: 'A non-empty question is required.' });
  }

  try {
    const result = await getVoiceTutorResponse({
      lessonContent: lessonContent || '',
      code: code || '',
      history: Array.isArray(history) ? history : [],
      question: question.trim()
    });
    res.json(result);
  } catch (err) {
    console.error('Voice tutor chat error:', err);
    res.status(500).json({ message: 'The tutor encountered an error. Please try again.' });
  }
});

/**
 * POST /api/voice-tutor/tts
 * Receives text, returns ElevenLabs audio stream (audio/mpeg).
 * API key stays server-side — never exposed to the frontend.
 */
router.post('/tts', requireAuth, async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ message: 'Text is required for voice synthesis.' });
  }

  try {
    const elevenLabsResponse = await synthesizeVoice(text.trim());

    if (!elevenLabsResponse) {
      // ElevenLabs key not configured — return 204 so frontend skips audio gracefully
      return res.status(204).send();
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Stream audio bytes directly to client
    const reader = elevenLabsResponse.body.getReader();
    const pump = async () => {
      const { done, value } = await reader.read();
      if (done) {
        res.end();
        return;
      }
      res.write(Buffer.from(value));
      await pump();
    };
    await pump();
  } catch (err) {
    console.error('Voice TTS error:', err);
    res.status(500).json({ message: 'Voice synthesis failed. Text response is still available.' });
  }
});

module.exports = router;
