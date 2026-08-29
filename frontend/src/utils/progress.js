export function getModuleStatus(progressRows, moduleId) {
  const thisModule = progressRows?.find(r => r.module_id === moduleId)
  if (thisModule?.completed) return 'completed'
  return 'available'
}

export function getCompletedCount(progressRows) {
  return progressRows.filter(r => r.completed).length
}
