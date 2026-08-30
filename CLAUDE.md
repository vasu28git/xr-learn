Task: Convert the diagnostic quiz from multiple-choice to short-answer questions,
graded by Gemini against a reference answer, in the xr-learn project.

Repo structure:
- Frontend: xr-learn/frontend/src/
- Backend: xr-learn/backend/ (Express, CommonJS)

Before making any changes, read these files first and match their existing
conventions exactly — do not assume function names, import styles, or route
patterns:
- src/config/diagnostic.js
- src/pages/Diagnostic.jsx
- backend/services/ragService.js
- backend/lib/planner.js (for the existing Gemini client pattern to reuse)
- backend/routes/rag.routes.js

Changes needed:

1. src/config/diagnostic.js
   - Remove `options` (array of {id, text}) and `correctOptionId` from each question.
   - Add a `referenceAnswer` field to each question: a 1-3 sentence model answer
     capturing the key concept the question is testing.
   - Keep all other existing fields (id, modulePair/moduleIds, question, topic/ragTopic
     — use whatever field names are already in the real file) unchanged.

2. backend/lib/grader.js (NEW FILE)
   - Export an async function `gradeAnswers(questions, answers)`.
   - questions: array of {id, question, referenceAnswer}
   - answers: object { [questionId]: studentAnswerText }
   - Build a single prompt asking Gemini to grade each answer against its
     referenceAnswer, treating paraphrased-but-correct answers as correct,
     and blank/off-topic/incorrect-concept answers as incorrect.
   - Prompt must instruct Gemini to return ONLY valid JSON:
     {"results": [{"id": "<string>", "correct": <boolean>}, ...]}
   - Use the exact same Gemini client import/init pattern already used in
     backend/lib/planner.js — same package, same model, same auth style.
   - Parse the response defensively: if JSON.parse fails, or the response is
     missing an expected question id, default that question to `correct: false`.
     Never default to `true` on failure — a grading failure should make a
     module look weak, not silently mastered.

3. backend/services/ragService.js
   - Import `gradeAnswers` from '../lib/grader'.
   - Add a new exported async function `gradeQuiz(questions, answers)`:
     - If process.env.GEMINI_API_KEY is not set, log a warning and return
       `{ correctness: <all questions mapped to false> }` (safe fallback,
       matching the existing pattern already used in this file for a missing
       API key, e.g. in generateTheory).
     - Otherwise call `gradeAnswers(questions, answers)` and return
       `{ correctness: <result> }`.
   - Keep all existing exported functions exactly as they are; just add
     `gradeQuiz` alongside them.

4. backend/routes/rag.routes.js
   - Add a new route: POST /grade-quiz
   - Match the exact existing pattern used by whatever routes already exist
     in this file (router style, try/catch, error handling, response shape).
   - Handler reads { questions, answers } from req.body, calls
     ragService.gradeQuiz(questions, answers), returns the result as JSON.

5. src/pages/Diagnostic.jsx
   - Replace the per-question radio-button options UI with a single
     <textarea> per question, styled consistently with the existing
     classes/design system already used in this file.
   - Replace the option-selection handler with one that stores free text per
     question id in the answers state.
   - Update the "answered count" logic to count non-empty trimmed text
     answers, not selected option ids.
   - In the submit handler, BEFORE computing weak topics:
     - Call the new backend /grade-quiz endpoint using the same base-URL
       pattern already used elsewhere in this file for other API calls.
     - Send { questions: diagnosticQuestions mapped to {id, question,
       referenceAnswer}, answers }.
     - On success, use the returned correctness map to determine which
       questions were wrong. On any failure (non-ok response or thrown
       error), default every question to incorrect as a safe fallback and
       log the error — do not block submission.
   - Change whatever logic currently filters wrong answers by comparing
     against correctOptionId to instead check `!correctness[q.id]`.
   - Leave every other part of this file untouched: any topic/module
     matching call, the final API submit call, skip button, progress bar,
     validation, error handling, and all existing styling/layout.

Constraints:
- Do not change any Supabase schema or the diagnostic-results save logic —
  whatever payload shape is currently sent to save results stays identical.
- Do not modify backend/lib/retrieve.js, backend/lib/planner.js, or any
  existing /generate-theory or /match-topics logic — only add new code
  alongside them, never alter their behavior.
- Preserve all existing error-handling and fallback conventions already used
  in this codebase rather than inventing new patterns.
- Read every file listed above in full before editing it.