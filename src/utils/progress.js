import { supabase } from '../lib/supabase'

export function getAllModuleIds(totalModules = 11) {
  return Array.from({ length: totalModules }, (_, index) => index + 1)
}

/**
 * Fetch diagnostic results for a student.
 * Returns an object: { moduleId: knows_concept, ... }
 * Example: { 1: true, 2: false, 3: true, ... 10: false }
 *
 * Derived from the single diagnostic_results row per student: any module
 * NOT in weak_module_ids is treated as mastered (true); any module IN
 * weak_module_ids is treated as not-mastered (false). If no row exists
 * yet, returns {} (defensive fallback in getModuleStatus treats that as
 * all-weak).
 */
export async function fetchDiagnosticResults(studentId) {
  if (!studentId) {
    return {}
  }

  try {
    const { data, error } = await supabase
      .from('diagnostic_results')
      .select('weak_module_ids')
      .eq('student_id', studentId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching diagnostic results:', error)
      return {}
    }

    if (!data) {
      return {}
    }

    const weakModuleIds = new Set(data.weak_module_ids ?? [])
    const result = {}
    for (let i = 1; i <= 10; i++) {
      result[i] = !weakModuleIds.has(i)
    }
    return result
  } catch (err) {
    console.error('Exception fetching diagnostic results:', err)
    return {}
  }
}

/**
 * Determine which modules (1–10) are "weak" (i.e., the student needs to learn them).
 * A module is weak if:
 *   - diagnosticResults[moduleId] === false (knows_concept false), OR
 *   - diagnosticResults[moduleId] is undefined (no diagnostic row, treat as weak)
 *
 * A module is mastered if:
 *   - diagnosticResults[moduleId] === true
 *
 * Module 11 is excluded from this logic (always sequential, not assessed).
 */
function getWeakModules(diagnosticResults = {}) {
  const weakModules = []
  for (let i = 1; i <= 10; i++) {
    if (diagnosticResults[i] !== true) {
      weakModules.push(i)
    }
  }
  return weakModules
}

/**
 * Get the status of a single module given progress rows and diagnostic results.
 *
 * Status values:
 *   - "mastered": Student's diagnostic showed knows_concept === true; no need to complete module.
 *   - "available": Student can start/continue this module now.
 *   - "locked": Student cannot access this module yet; prerequisites not met.
 *   - "completed": Student has finished this module (actual progress marked complete).
 */
export function getModuleStatus(progressRows, moduleId, diagnosticResults = {}, totalModules = 11) {
  const validModuleIds = new Set(getAllModuleIds(totalModules))
  if (!validModuleIds.has(moduleId)) return 'locked'

  if (moduleId === 11) {
    const thisModule = progressRows.find(r => r.module_id === moduleId)
    if (thisModule?.completed) return 'completed'

    const weakModules = getWeakModules(diagnosticResults)

    if (weakModules.length === 0) {
      return 'available'
    }

    const allWeakCompleted = weakModules.every(weakModuleId => {
      const weakProgress = progressRows.find(r => r.module_id === weakModuleId)
      return weakProgress?.completed
    })

    return allWeakCompleted ? 'available' : 'locked'
  }

  if (diagnosticResults[moduleId] === true) {
    return 'mastered'
  }

  const thisModule = progressRows.find(r => r.module_id === moduleId)
  if (thisModule?.completed) return 'completed'

  const weakModules = getWeakModules(diagnosticResults)

  if (weakModules.length === 0) {
    return 'locked'
  }

  const indexInWeakSequence = weakModules.indexOf(moduleId)
  if (indexInWeakSequence === -1) {
    return 'locked'
  }

  if (indexInWeakSequence === 0) {
    return 'available'
  }

  const prevWeakModuleId = weakModules[indexInWeakSequence - 1]
  const prevWeakProgress = progressRows.find(r => r.module_id === prevWeakModuleId)

  if (prevWeakProgress?.completed) {
    return 'available'
  }

  return 'locked'
}

/**
 * Get the count of completed modules.
 */
export function getCompletedCount(progressRows, diagnosticResults = {}) {
  const completedModuleIds = new Set()

  progressRows.forEach(r => {
    if (r.completed) {
      completedModuleIds.add(r.module_id)
    }
  })

  Object.entries(diagnosticResults).forEach(([moduleId, knows_concept]) => {
    if (knows_concept === true) {
      completedModuleIds.add(Number(moduleId))
    }
  })

  return completedModuleIds.size
}