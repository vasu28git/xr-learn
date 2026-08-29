const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      moduleId, task, currentCode, sceneState,
      targetState, lastError, history, message,
      isHintRequest, hintsAlreadyGiven
    } = await req.json()

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
- If there's an error in their code, explain what it means in plain English first`

    const messages = [
      ...history.map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ]

    const AI_API_KEY = Deno.env.get('AI_API_KEY')
    const provider = Deno.env.get('AI_PROVIDER') || 'gemini'

    let responseText = ''

    if (provider === 'gemini') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${AI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: messages.map((m: any) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
            })),
            generationConfig: {
              maxOutputTokens: 300,
              temperature: 0.7,
            }
          })
        }
      )
      const data = await response.json()
      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response.'
    }

    if (provider === 'claude') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': AI_API_KEY!,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          system: systemPrompt,
          messages
        })
      })
      const data = await response.json()
      responseText = data.content?.[0]?.text || 'I could not generate a response.'
    }

    return new Response(
      JSON.stringify({ message: responseText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ message: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
