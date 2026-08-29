require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

let supabase;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('Supabase client successfully initialized.');
} else {
  console.warn(
    '⚠️ WARNING: Supabase credentials missing. Auth and progress services will return stubs/errors.'
  );
}

// Authentication Middleware
const requireAuth = async (req, res, next) => {
  if (!supabase) {
    return res.status(500).json({ message: 'Supabase not configured on the backend.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ message: error?.message || 'Authentication failed. Invalid token.' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ message: 'Authentication failed.' });
  }
};

// --- AUTHENTICATION ROUTES ---

// Sign Up
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, fullName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  if (!supabase) {
    return res.status(500).json({ message: 'Supabase is not configured on the backend.' });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ user: data.user, session: data.session });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'An internal error occurred during signup.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  if (!supabase) {
    return res.status(500).json({ message: 'Supabase is not configured on the backend.' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ user: data.user, session: data.session });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'An internal error occurred during login.' });
  }
});

// Get Current User Profile
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// --- PROGRESS TRACKING ROUTES ---

// Fetch All Progress for current student
app.get('/api/progress', requireAuth, async (req, res) => {
  if (!supabase) {
    return res.json([]);
  }

  try {
    const { data, error } = await supabase
      .from('module_progress')
      .select('*')
      .eq('student_id', req.user.id)
      .order('module_id', { ascending: true });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json(data || []);
  } catch (err) {
    console.error('Fetch progress error:', err);
    res.status(500).json({ message: 'Failed to fetch progress.' });
  }
});

// Fetch Progress for a single module
app.get('/api/progress/:moduleId', requireAuth, async (req, res) => {
  if (!supabase) {
    return res.json(null);
  }

  const { moduleId } = req.params;
  try {
    const { data, error } = await supabase
      .from('module_progress')
      .select('*')
      .eq('student_id', req.user.id)
      .eq('module_id', Number(moduleId))
      .maybeSingle();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json(data || null);
  } catch (err) {
    console.error('Fetch module progress error:', err);
    res.status(500).json({ message: 'Failed to fetch module progress.' });
  }
});

// Update Progress (Mark module complete)
app.put('/api/progress/:moduleId', requireAuth, async (req, res) => {
  if (!supabase) {
    return res.json({ success: true, message: 'Stub success (Supabase not configured)' });
  }

  const { moduleId } = req.params;
  const { completed, attempts } = req.body;

  try {
    const { data, error } = await supabase
      .from('module_progress')
      .update({
        completed: completed ?? true,
        completed_at: new Date().toISOString(),
        attempts: attempts,
      })
      .eq('student_id', req.user.id)
      .eq('module_id', Number(moduleId));

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('Update progress error:', err);
    res.status(500).json({ message: 'Failed to update progress.' });
  }
});

// --- AI TUTOR SERVICE ROUTE (Ported from Deno Edge Function) ---
app.post('/api/ai-tutor', requireAuth, async (req, res) => {
  const {
    moduleId, task, currentCode, sceneState,
    targetState, lastError, history, message,
    isHintRequest, hintsAlreadyGiven
  } = req.body;

  const AI_API_KEY = process.env.AI_API_KEY;
  const provider = process.env.AI_PROVIDER || 'gemini';

  // Fallback / Stub response if key is missing or not configured
  if (!AI_API_KEY) {
    console.warn('AI_API_KEY is not configured. Serving mock response.');
    return res.json({
      message: `🤖 [Mock Tutor Mode] It looks like you're learning Module ${moduleId} ("${task}"). Since the tutor API key is not set, I'll give you a standard tip: Check that you are modifying the correct file or component, and pay close attention to your three-dimensional scene state: ${JSON.stringify(sceneState || {})}. Keep experimenting!`
    });
  }

  try {
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

    let responseText = '';

    if (provider === 'gemini') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${AI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: messages.map((m) => ({
              role: m.role === 'model' ? 'model' : 'user',
              parts: [{ text: m.content }]
            })),
            generationConfig: {
              maxOutputTokens: 300,
              temperature: 0.7,
            }
          })
        }
      );
      const data = await response.json();
      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response.';
    } else if (provider === 'claude') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': AI_API_KEY,
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
      responseText = data.content?.[0]?.text || 'I could not generate a response.';
    } else {
      responseText = 'Unsupported AI provider configured.';
    }

    res.json({ message: responseText });
  } catch (error) {
    console.error('AI Tutor edge logic error:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
