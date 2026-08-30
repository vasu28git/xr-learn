const { GoogleGenAI } = require("@google/genai");

/**
 * Strips Markdown formatting from AI response text so it reads cleanly
 * as plain text and sounds natural when spoken aloud by ElevenLabs.
 */
function sanitizeMarkdown(text) {
  return text
    // Remove bold/italic markers
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove heading markers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove horizontal rules
    .replace(/^---+$/gm, '')
    .replace(/^===+$/gm, '')
    // Remove markdown code fences (``` blocks) but keep content
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    // Remove markdown link syntax [text](url) → text
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // Remove markdown bullet list markers (but keep the content)
    .replace(/^\s*[-*+]\s+/gm, '')
    // Remove numbered list markers like "1. " "2. "
    .replace(/^\s*\d+\.\s+/gm, '')
    // Collapse multiple blank lines into one
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Generate a voice tutor response using Gemini.
 * Receives the full lesson content + current C# code + conversation history.
 */
const getVoiceTutorResponse = async ({ lessonContent, code, history, question }) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return {
      message: "Hi! I'm Loki, your AI tutor. The Gemini API key isn't configured yet, but once it's set up I'll be able to answer your questions about this lesson and your code. Check backend/.env to add your GEMINI_API_KEY."
    };
  }

  const systemPrompt = `You are Loki, an educational AI tutor helping a student learn Unity C# and XR (Extended Reality) development.

Respond using plain text only. Do not use Markdown, bold text, headings, bullet symbols, code fences, or decorative formatting. Explain concepts clearly and conversationally. Keep explanations easy to understand for students. When discussing code, preserve code syntax accurately but do not wrap it in Markdown code blocks.

Your behavior:
- Explain concepts in simple, encouraging, conversational language
- Answer questions about the C# code directly, referencing specific parts when helpful
- Explain errors in plain English before suggesting fixes
- Give progressive hints — guide students toward understanding rather than just giving answers
- Keep responses concise — 2 to 4 sentences ideally, since responses will be spoken aloud
- Always encourage the student to think and experiment
- Never use asterisks, pound signs, backticks, or other Markdown symbols

Current lesson content:
---
${lessonContent || 'No lesson content available.'}
---

Student's current C# code:
${code || '// No code written yet'}`;

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const contents = [
      ...history.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      {
        role: 'user',
        parts: [{ text: question }]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 250,
        temperature: 0.7,
      }
    });

    const raw = response.text || "I couldn't generate a response. Please try again.";
    const clean = sanitizeMarkdown(raw);
    return { message: clean };
  } catch (err) {
    console.error('Voice tutor Gemini error:', err);
    throw err;
  }
};

/**
 * Proxy text to ElevenLabs TTS API and return raw audio buffer.
 * Uses slower stability/speed settings for an educational tone.
 */
const synthesizeVoice = async (text) => {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Rachel

  if (!ELEVENLABS_API_KEY) {
    return null; // Caller will skip audio if null
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2',
      voice_settings: {
        stability: 0.75,        // Higher = more consistent, calmer
        similarity_boost: 0.80,
        style: 0.0,
        use_speaker_boost: true,
        speed: 0.85             // Slightly slower than normal for educational clarity
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ElevenLabs TTS error: ${response.status} — ${errText}`);
  }

  return response;
};

module.exports = { getVoiceTutorResponse, synthesizeVoice, sanitizeMarkdown };
