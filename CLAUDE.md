Update the existing AI Tutor implementation with the following improvements.

IMPORTANT:
Do not rebuild the feature. Modify the existing implementation.

1. SUPPORT BOTH VOICE AND TEXT

The AI Tutor must support two ways of asking questions:

- 🎙️ Voice input
- ⌨️ Text input

The user should be able to:
- Click the microphone and speak.
- Type a question in a text input.
- Press Enter or click Send.
- Continue switching between voice and text during the same conversation.

Both inputs must go through the same Gemini AI Tutor backend.

Example:

User 🎙️ → Speech-to-Text → Gemini
User ⌨️ → Text → Gemini

The conversation history must be shared between both modes.

2. DRAGGABLE AI TUTOR

The AI Tutor panel must be draggable.

The user should be able to drag the panel anywhere within the application.

Use a drag handle/header so normal text, buttons, microphone, and input fields remain usable.

The panel should remember its position while navigating within the current session.

Do not allow it to become permanently stuck behind the editor or outside the visible application area.

3. EDUCATIONAL SPEAKING SPEED

Make the ElevenLabs voice noticeably slower and easier to understand for students.

Use an appropriate slower speech configuration.

The voice should sound:
- Clear
- Calm
- Natural
- Educational
- Slightly slower than normal conversational speech

Do not make it unnaturally slow.

4. CLEAN AI TEXT OUTPUT

Gemini responses must contain ONLY clean readable text.

Do NOT generate or display Markdown formatting such as:

**
*
#
##
---

or other formatting characters that would look bad when spoken aloud.

For example, instead of:

**Vector3** represents three values.

Generate:

Vector3 represents three values.

Instead of:

### How it works

Generate:

How it works

The AI response should be plain text suitable for BOTH:
- Displaying in the chat panel
- Sending directly to ElevenLabs for speech

5. CLEAN TEXT SANITIZATION

Even if Gemini accidentally returns Markdown, sanitize the response before displaying and speaking it.

Remove:
- Bold markers **
- Italic markers *
- Heading markers #
- Markdown code fences
- Unnecessary bullet symbols
- Markdown links
- Other formatting characters that would be spoken aloud

Do NOT remove meaningful programming syntax from code explanations.

For example, do not corrupt:

xr.CreateCube("box", new Vector3(0, 1, 0));

Only sanitize the AI's conversational response.

6. AI RESPONSE STYLE

Configure the Gemini system prompt so the tutor naturally responds in plain text.

Tell Gemini:

"You are an educational AI tutor. Respond using plain text only. Do not use Markdown, bold text, headings, bullet symbols, code fences, or decorative formatting. Explain concepts clearly and conversationally. Keep explanations easy to understand for students. When discussing code, preserve code syntax accurately."

7. EXISTING CONTEXT

Keep the existing context system:

- Current lesson content
- Current C# code
- Conversation history
- User's latest question

The AI should continue answering questions about the current lesson and student's code.

8. FINAL UX

The tutor should work like this:

🎙️ AI Tutor button
        ↓
Draggable conversation panel

"Hi! How can I help you?"

        ↓

┌──────────────────────────────┐
│ AI Tutor              ↕ Drag │
│                              │
│ AI: How can I help you?      │
│                              │
│ You: What is Vector3?        │
│                              │
│ AI: Vector3 represents three │
│ values used to describe a    │
│ position in 3D space...      │
│                              │
│ [Type your question...] 🎙️  │
│                    Send      │
└──────────────────────────────┘

The panel must support:
- Voice questions
- Typed questions
- Follow-up conversation
- AI voice responses
- Text responses
- Stop speaking
- End conversation
- Dragging anywhere in the application

Keep the existing Learning 3-pane layout unchanged.

Voice Tutor remains available ONLY in Learning, not Training or Debugging.

After implementation, test:
1. Voice question
2. Typed question
3. Voice → text follow-up
4. Text → voice follow-up
5. Dragging the panel
6. Slow voice playback
7. Gemini response containing no Markdown
8. Markdown sanitization fallback
9. Current lesson context
10. Current C# code context