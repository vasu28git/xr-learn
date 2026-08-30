export function getAllModuleIds(totalModules = 11) {
  return Array.from({ length: totalModules }, (_, index) => index + 1)
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
 * Get the count of completed/mastered modules.
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
