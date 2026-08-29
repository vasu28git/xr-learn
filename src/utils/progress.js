export function getModuleStatus(progressRows, moduleId) {
  const thisModule = progressRows.find(r => r.module_id === moduleId)
  if (!thisModule) return 'locked'
  if (thisModule.completed) return 'completed'
  if (moduleId === 1) return 'available'
  const prevModule = progressRows.find(r => r.module_id === moduleId - 1)
  if (prevModule?.completed) return 'available'
  return 'locked'
}

export function getCompletedCount(progressRows) {
  return progressRows.filter(r => r.completed).length
}
