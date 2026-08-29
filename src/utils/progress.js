import { supabase } from '../lib/supabase'

export function getAllModuleIds(totalModules = 11) {
  return Array.from({ length: totalModules }, (_, index) => index + 1)
}

/**
 * Fetch diagnostic results for a student.
 * Returns an object: { moduleId: knows_concept, ... }
 * Example: { 1: true, 2: false, 3: true, ... 10: false }
 * 
 * If a module has no diagnostic row, it will not appear in the object (undefined = not diagnosed).
 */
export async function fetchDiagnosticResults(studentId) {
  if (!studentId) {
    return {}
  }

  try {
    const { data, error } = await supabase
      .from('diagnostic_results')
      .select('module_id, knows_concept')
      .eq('student_id', studentId)

    if (error) {
      console.error('Error fetching diagnostic results:', error)
      return {}
    }

    // Convert to object: { moduleId: knows_concept, ... }
    return data.reduce((acc, row) => {
      acc[row.module_id] = row.knows_concept
      return acc
    }, {})
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
    // If no diagnostic result or knows_concept is false, it's a weak module
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
 *
 * Logic:
 *   1. If module 11 (capstone):
 *      - Unlock only after ALL weak modules (1–10) are completed.
 *      - Return 'completed' if already marked complete.
 *
 *   2. If module 1–10 and mastered by diagnostic:
 *      - Return 'mastered' (no need to complete, counts as done for percentage).
 *
 *   3. If module 1–10 and marked complete in progress:
 *      - Return 'completed'.
 *
 *   4. If module 1–10 and weak (not mastered):
 *      - Apply sequential unlock ONLY within the weak-modules subset.
 *      - First weak module is always available.
 *      - Subsequent weak modules unlock when the previous weak module is completed.
 *      - Mastered modules do NOT block the weak sequence.
 *
 *   5. If no diagnostic results at all (defensive fallback):
 *      - Treat all modules as weak; apply full sequential unlock 1 through 11.
 */
export function getModuleStatus(progressRows, moduleId, diagnosticResults = {}, totalModules = 11) {
  const validModuleIds = new Set(getAllModuleIds(totalModules))
  if (!validModuleIds.has(moduleId)) return 'locked'

  // Special handling for module 11 (capstone)
  if (moduleId === 11) {
    const thisModule = progressRows.find(r => r.module_id === moduleId)
    if (thisModule?.completed) return 'completed'

    const weakModules = getWeakModules(diagnosticResults)

    // If all modules 1–10 are mastered (no weak modules), capstone is immediately available
    if (weakModules.length === 0) {
      return 'available'
    }

    // Capstone unlocks only after ALL weak modules are completed
    const allWeakCompleted = weakModules.every(weakModuleId => {
      const weakProgress = progressRows.find(r => r.module_id === weakModuleId)
      return weakProgress?.completed
    })

    return allWeakCompleted ? 'available' : 'locked'
  }

  // Modules 1–10

  // Check if mastered by diagnostic
  if (diagnosticResults[moduleId] === true) {
    return 'mastered'
  }

  // Check completion
  const thisModule = progressRows.find(r => r.module_id === moduleId)
  if (thisModule?.completed) return 'completed'

  // Determine weak modules and this module's position within the weak sequence
  const weakModules = getWeakModules(diagnosticResults)

  // Defensive fallback: if no weak modules identified (shouldn't happen, but be safe)
  // treat all 1–10 as weak and apply original sequential logic
  if (weakModules.length === 0) {
    // All modules mastered; shouldn't reach here, but module would be locked
    return 'locked'
  }

  // If this module is not in weak sequence, it's mastered (covered above)
  const indexInWeakSequence = weakModules.indexOf(moduleId)
  if (indexInWeakSequence === -1) {
    return 'locked'
  }

  // First weak module is always available
  if (indexInWeakSequence === 0) {
    return 'available'
  }

  // For other weak modules, check if the previous weak module is completed
  const prevWeakModuleId = weakModules[indexInWeakSequence - 1]
  const prevWeakProgress = progressRows.find(r => r.module_id === prevWeakModuleId)

  if (prevWeakProgress?.completed) {
    return 'available'
  }

  return 'locked'
}

/**
 * Get the count of completed modules.
 * Includes both:
 *   - Modules marked complete in progress table.
 *   - Modules mastered by diagnostic (knows_concept === true).
 *
 * Uses a Set to avoid double-counting if a student both gets mastered by
 * diagnostic AND later completes the module in progress.
 */
export function getCompletedCount(progressRows, diagnosticResults = {}) {
  const completedModuleIds = new Set()

  // Add modules with progress completion
  progressRows.forEach(r => {
    if (r.completed) {
      completedModuleIds.add(r.module_id)
    }
  })

  // Add mastered modules from diagnostic (without double-counting)
  Object.entries(diagnosticResults).forEach(([moduleId, knows_concept]) => {
    if (knows_concept === true) {
      completedModuleIds.add(Number(moduleId))
    }
  })

  return completedModuleIds.size
}
