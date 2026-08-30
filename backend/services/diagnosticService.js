const { getSupabaseClient } = require('../config/supabase');

const checkDiagnostic = async (req) => {
  const client = getSupabaseClient(req);
  if (!client) {
    return { hasDiagnostic: true, weakModuleIds: [], weakConceptTopics: [] };
  }

  const { data, error } = await client
    .from('diagnostic_results')
    .select('id, weak_module_ids, weak_concept_topics')
    .eq('student_id', req.user.id)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    return {
      hasDiagnostic: true,
      weakModuleIds: data.weak_module_ids || [],
      weakConceptTopics: data.weak_concept_topics || []
    };
  } else {
    return {
      hasDiagnostic: false,
      weakModuleIds: [],
      weakConceptTopics: []
    };
  }
};

const saveDiagnostic = async (req, { rows, weakTopics, weakModuleIds }) => {
  const client = getSupabaseClient(req);
  if (!client) {
    return { success: true };
  }

  let insertData;
  if (weakTopics !== undefined && weakModuleIds !== undefined) {
    insertData = {
      student_id: req.user.id,
      weak_concept_topics: weakTopics,
      weak_module_ids: weakModuleIds,
    };
  } else {
    if (!rows || !Array.isArray(rows)) {
      throw new Error('Rows array or weakTopics/weakModuleIds is required.');
    }
    insertData = rows.map(row => ({
      ...row,
      student_id: req.user.id
    }));
  }

  const { data, error } = await client
    .from('diagnostic_results')
    .insert(insertData);

  if (error) throw error;
  return { success: true };
};

module.exports = {
  checkDiagnostic,
  saveDiagnostic
};
