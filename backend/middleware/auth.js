const { supabase } = require('../config/supabase');

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  
  // Guest Demo Bypass
  if (token === 'guest-token') {
    req.user = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'guest@multiverse3d.com',
      user_metadata: { full_name: 'Demo Guest' }
    };
    return next();
  }

  if (!supabase) {
    return res.status(500).json({ message: 'Supabase not configured on the backend.' });
  }
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

module.exports = {
  requireAuth
};
