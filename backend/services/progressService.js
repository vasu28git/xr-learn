const { getSupabaseClient } = require('../config/supabase');

const getAllProgress = async (req) => {
  const client = getSupabaseClient(req);
  if (!client) return [];

  const { data, error } = await client
    .from('module_progress')
    .select('*')
    .eq('student_id', req.user.id)
    .order('module_id', { ascending: true });

  if (error) throw error;
  return data || [];
};

const getModuleProgress = async (req, moduleId) => {
  const client = getSupabaseClient(req);
  if (!client) return null;

  const { data, error } = await client
    .from('module_progress')
    .select('*')
    .eq('student_id', req.user.id)
    .eq('module_id', Number(moduleId))
    .maybeSingle();

  if (error) throw error;
  return data || null;
};

const updateProgress = async (req, moduleId, completed, attempts) => {
  const client = getSupabaseClient(req);
  if (!client) {
    return { success: true, message: 'Stub success (Supabase not configured)' };
  }

  const { data, error } = await client
    .from('module_progress')
    .upsert({
      student_id: req.user.id,
      module_id: Number(moduleId),
      completed: completed ?? true,
      completed_at: new Date().toISOString(),
      attempts: attempts,
    }, { onConflict: 'student_id,module_id' });

  if (error) throw error;
  return { success: true, data };
};

module.exports = {
  getAllProgress,
  getModuleProgress,
  updateProgress
};
