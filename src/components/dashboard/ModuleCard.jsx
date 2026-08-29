export default function ModuleCard({ module, status, onClick }) {
  const statusLabels = {
    completed: 'Completed',
    available: 'Available',
    locked: 'Locked',
  }

  const statusIcons = {
    completed: '✅',
    available: '▶️',
    locked: '🔒',
  }

  return (
    <div
      className={`module-card module-card--${status}`}
      onClick={onClick}
      role="button"
      tabIndex={status !== 'locked' ? 0 : -1}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && status !== 'locked') onClick()
      }}
    >
      <div className="module-card-header">
        <span className="module-card-number">Module {module.id}</span>
        <span className={`module-card-status status-${status}`}>
          {statusIcons[status]} {statusLabels[status]}
        </span>
      </div>
      <h3>{module.title}</h3>
      <p>{module.description}</p>
    </div>
  )
}
