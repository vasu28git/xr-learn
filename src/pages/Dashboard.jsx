import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { getModuleStatus, getCompletedCount } from '../utils/progress'
import ModuleCard from '../components/dashboard/ModuleCard'
import { module1 } from '../config/modules/module1'
import { module2 } from '../config/modules/module2'
import { module3 } from '../config/modules/module3'
import { module4 } from '../config/modules/module4'
import { module5 } from '../config/modules/module5'
import { module6 } from '../config/modules/module6'

const allModules = [module1, module2, module3, module4, module5, module6]

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [progress, setProgress] = useState([])
  const [loadingProgress, setLoadingProgress] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return

    async function fetchProgress() {
      const { data, error } = await supabase
        .from('module_progress')
        .select('*')
        .eq('student_id', user.id)
        .order('module_id', { ascending: true })

      if (!error && data) {
        setProgress(data)
      }
      setLoadingProgress(false)
    }

    fetchProgress()
  }, [user])

  const completedCount = getCompletedCount(progress)
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <div className="landing-logo">
            <div className="landing-logo-icon">🌐</div>
            XR Learning Lab
          </div>
        </div>
        <div className="dashboard-header-right">
          <span className="dashboard-user">👋 {userName}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-progress">
          <h2>Your Progress</h2>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${(completedCount / 6) * 100}%` }}
            />
          </div>
          <p className="progress-text">
            {completedCount} of 6 modules completed
            {completedCount === 6 && ' 🎉 — You\'ve completed the course!'}
          </p>
        </div>

        <div className="dashboard-grid">
          {allModules.map((mod) => {
            const status = getModuleStatus(progress, mod.id)
            return (
              <ModuleCard
                key={mod.id}
                module={mod}
                status={status}
                onClick={() => {
                  if (status !== 'locked') {
                    navigate(`/module/${mod.id}`)
                  }
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
