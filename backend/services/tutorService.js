const { GoogleGenAI } = require("@google/genai");

const getTutorResponse = async ({
  moduleId, task, currentCode, sceneState,
  targetState, lastError, history, message,
  isHintRequest, hintsAlreadyGiven
}) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const provider = process.env.AI_PROVIDER || 'gemini';

  // Fallback / Stub response if key is missing or not configured
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not configured. Serving mock response.');
    return {
      message: `🤖 [Mock Tutor Mode] It looks like you're learning Module ${moduleId} ("${task}"). Since the tutor API key is not set, I'll give you a standard tip: Check that you are modifying the correct file or component, and pay close attention to your three-dimensional scene state: ${JSON.stringify(sceneState || {})}. Keep experimenting!`
    };
  }

  const systemPrompt = `You are an XR tutor for complete beginners learning augmented and virtual reality.

Your role:
- Guide students through hands-on XR exercises
- Give hints progressively — NEVER give the complete solution
- Explain concepts in simple, encouraging language
- Reference what the student has actually done in their code and scene

Hint levels (follow this order strictly):
1. Conceptual nudge — remind them of the underlying concept
2. Directional hint — point toward the right approach
3. Near-explicit — almost show them, but not quite
4. Only after 3+ hints: explain what the correct answer would be and why

Current context:
- Module: ${moduleId}
- Task: ${task}
- Student's current code: ${currentCode}
- Current scene state: ${sceneState}
- Target state: ${targetState}
- Last error (if any): ${lastError || 'none'}
- Hints already given: ${hintsAlreadyGiven}
- This is a hint request: ${isHintRequest}

Rules:
- Never write the complete working code for them
- Always end with an encouraging question or nudge
- Keep responses short (2-4 sentences max for hints)
- If there's an error in their code, explain what it means in plain English first`;

  const messages = [
    ...history.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', content: m.content })),
    { role: 'user', content: message }
  ];

  if (provider === 'gemini') {
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: messages.map((m) => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: systemPrompt,
          maxOutputTokens: 300,
          temperature: 0.7,
        }
      });

      return { message: response.text || 'I could not generate a response.' };
    } catch (e) {
      console.error('Gemini call failed inside tutorService:', e);
      throw e;
    }
  } else if (provider === 'claude') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': GEMINI_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.content }))
      })
    });
    const data = await response.json();
    return { message: data.content?.[0]?.text || 'I could not generate a response.' };
  } else {
    return { message: 'Unsupported AI provider configured.' };
  }
};

module.exports = {
  getTutorResponse
};
