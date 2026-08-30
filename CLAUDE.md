Implement an AI Voice Tutor in the EXISTING Learning module using Gemini as the AI brain and ElevenLabs as the voice layer.

IMPORTANT:
Do not rebuild, redesign, or replace my existing application.
Inspect the existing frontend and backend first and integrate into the current architecture.

FEATURE:

Add a single 🎙️ AI Tutor button to the Learning module only.

When the user clicks it:

1. Open a small conversational voice panel.
2. AI initially says:
   "Hi! How can I help you?"
3. User speaks a question.
4. Convert the user's speech to text.
5. Send the question to the backend.
6. Backend sends Gemini:
   - Current lesson/module content
   - Current C# code from the editor
   - Previous conversation history
   - User's latest question
7. Gemini generates a helpful educational response.
8. Display the response as text.
9. Send the response to ElevenLabs for natural voice playback.
10. Allow the user to continue asking follow-up questions.
11. Provide a Stop/End Conversation button.

ARCHITECTURE:

User 🎙️
   ↓
Speech → Text
   ↓
Backend
   ↓
Gemini AI Tutor
   ↑
Lesson Content
Current C# Code
Conversation History
   ↓
AI Response
   ↓
ElevenLabs Text → Speech
   ↓
🔊 User

AI BEHAVIOR:

Gemini should act as a tutor, not just an answer generator.

It should:
- Explain the current lesson.
- Answer questions about the student's C# code.
- Explain errors clearly.
- Give hints and guidance.
- Use the current lesson as context.
- Maintain conversation context.
- Encourage the student to understand the concept.
- Avoid unnecessarily giving the complete solution when guidance is sufficient.

CONTEXT EXAMPLE:

{
  "lesson": "Current lesson content",
  "code": "Current C# code",
  "conversation": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ],
  "question": "Latest user question"
}

SECURITY:

- Gemini and ElevenLabs API keys must remain on the backend.
- Never expose API keys in frontend code.
- Never use eval() or execute arbitrary C# through the voice feature.
- Reuse the existing backend/API architecture.

UI:

Keep the existing Learning 3-pane layout:

Left   → Module Content
Center → C# Code Editor
Right  → Three.js 3D Output

The AI Tutor should appear as a compact floating button/panel without disrupting these panes.

The panel should show:
- User transcription
- AI response
- Listening state
- Processing state
- Speaking state
- Stop/end button

IMPORTANT MODULE RULE:

Voice AI is ONLY for Learning.

Do NOT add the voice assistant to:
- Training
- Debugging

INTEGRATION:

Inspect the existing project and find:
- Learning module
- Module content state
- Existing C# editor
- Existing backend/API services
- Existing authentication if applicable
- Existing environment variable configuration

Reuse existing components and services wherever possible.

Do not create duplicate editors, duplicate backend servers, or duplicate state management.

Also make sure the AI can access the student's CURRENT editor code when answering code-related questions.

ENVIRONMENT VARIABLES:

Add the required backend environment variables for:
- Gemini API key
- ElevenLabs API key
- ElevenLabs voice/configuration

Do not hardcode secrets.

TEST:

Verify this complete flow:

Click AI Tutor
→ AI greeting
→ User speaks
→ Speech converted to text
→ Backend receives question
→ Gemini receives lesson + code + conversation
→ Gemini generates response
→ Response displayed
→ ElevenLabs generates voice
→ User hears response
→ User asks follow-up
→ Conversation continues.

After implementation, build/run the frontend and backend, fix errors, and report:

1. Files modified
2. Files created
3. API endpoints added
4. Gemini integration
5. ElevenLabs integration
6. Environment variables required
7. How the Learning module passes lesson/code context
8. Exact commands to run the application.