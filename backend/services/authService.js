const { supabase } = require('../config/supabase');

const signup = async (email, password, fullName) => {
  if (!supabase) {
    throw new Error('Supabase is not configured on the backend.');
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  if (error) throw error;
  return data;
};

const login = async (email, password) => {
  if (!supabase) {
    throw new Error('Supabase is not configured on the backend.');
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

module.exports = {
  signup,
  login
};
