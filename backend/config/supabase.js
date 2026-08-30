const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('Supabase client successfully initialized.');
} else {
  console.warn(
    '⚠️ WARNING: Supabase credentials missing. Auth and progress services will return stubs/errors.'
  );
}

const getSupabaseClient = (req) => {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  const authHeader = req?.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    if (token === 'guest-token') return null;

    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }
  return supabase;
};

module.exports = {
  supabase,
  getSupabaseClient
};
