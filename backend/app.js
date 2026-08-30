const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRouter = require('./routes/auth.routes');
const progressRouter = require('./routes/progress.routes');
const diagnosticRouter = require('./routes/diagnostic.routes');
const executeRouter = require('./routes/execute.routes');
const tutorRouter = require('./routes/tutor.routes');
const ragRouter = require('./routes/rag.routes');
const voiceTutorRouter = require('./routes/voiceTutor.routes');

app.use('/api/auth', authRouter);
app.use('/api/progress', progressRouter);
app.use('/api/diagnostic', diagnosticRouter);
app.use('/api/execute', executeRouter);
app.use('/api/ai-tutor', tutorRouter);
app.use('/api', ragRouter); // mounts /generate-theory and /match-topics under /api/
app.use('/api/voice-tutor', voiceTutorRouter);

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

module.exports = app;
