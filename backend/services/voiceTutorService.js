const { GoogleGenAI } = require("@google/genai");

/**
 * Generate a voice tutor response using Gemini.
 * Receives the full lesson content + current C# code + conversation history.
 */
const getVoiceTutorResponse = async ({ lessonContent, code, history, question }) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return {
      message: "Hi! I'm your AI tutor. The Gemini API key isn't configured yet, but once it's set up I'll be able to answer your questions about this lesson and your code. Check backend/.env to add your GEMINI_API_KEY."
    };
  }

  const systemPrompt = `You are an expert XR (Extended Reality) tutor helping a student learn Unity and C# for XR development.

You have full access to:
1. The current lesson content the student is studying
2. The student's actual C# code in the editor
3. The full conversation history

Your behavior:
- Explain concepts clearly in simple, encouraging language
- Answer questions about the C# code directly — reference specific lines when helpful
- Explain errors in plain English before suggesting fixes
- Give progressive hints — nudge toward understanding rather than just giving answers
- Maintain a conversational, friendly tone (this is a voice conversation)
- Keep responses concise — 2-4 sentences ideally (will be spoken aloud)
- Always encourage the student to think and experiment

Current lesson content:
---
${lessonContent}
---

Student's current C# code:
\`\`\`csharp
${code || '// No code written yet'}
\`\`\``;

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
      model: 'gemini-2.0-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 250,
        temperature: 0.75,
      }
    });

    return { message: response.text || "I couldn't generate a response. Please try again." };
  } catch (err) {
    console.error('Voice tutor Gemini error:', err);
    throw err;
  }
};

/**
 * Proxy text to ElevenLabs TTS API and return raw audio buffer.
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
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ElevenLabs TTS error: ${response.status} — ${errText}`);
  }

  return response; // raw fetch Response for streaming
};

module.exports = { getVoiceTutorResponse, synthesizeVoice };
