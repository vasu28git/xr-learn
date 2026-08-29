import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create client only if credentials exist; otherwise provide a stub
let supabase

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn(
    '⚠️ Supabase credentials not found. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Auth and progress features will not work.'
  )
  // Minimal stub so the app doesn't crash on pages that don't need auth
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ error: { message: 'Supabase not configured. Add credentials to .env file.' } }),
      signUp: async () => ({ error: { message: 'Supabase not configured. Add credentials to .env file.' } }),
      signOut: async () => {},
    },
    from: () => ({
      select: () => ({ eq: () => ({ eq: () => ({ single: async () => ({ data: null }), order: () => ({ data: [] }) }), order: async () => ({ data: [] }), single: async () => ({ data: null }) }) }),
      update: () => ({ eq: () => ({ eq: async () => ({ error: null }) }) }),
    }),
    functions: {
      invoke: async () => ({ data: { message: 'AI tutor not available — Supabase not configured.' }, error: null }),
    },
    rpc: async () => ({ error: null }),
  }
}

export { supabase }
