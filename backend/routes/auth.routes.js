const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { requireAuth } = require('../middleware/auth');

router.post('/signup', async (req, res) => {
  const { email, password, fullName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const data = await authService.signup(email, password, fullName);
    res.json({ user: data.user, session: data.session });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(err.status || 500).json({ message: err.message || 'An internal error occurred during signup.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const data = await authService.login(email, password);
    res.json({ user: data.user, session: data.session });
  } catch (err) {
    console.error('Login error:', err);
    res.status(err.status || 400).json({ message: err.message });
  }
});

router.post('/guest', (req, res) => {
  res.json({
    user: {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'guest@multiverse3d.com',
      user_metadata: { full_name: 'Demo Guest' }
    },
    session: {
      access_token: 'guest-token'
    }
  });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
