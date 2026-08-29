import { useState, useEffect, lazy, Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import TheorySection from '../components/theory/TheorySection'
import { module1 } from '../config/modules/module1'
import { module2 } from '../config/modules/module2'
import { module3 } from '../config/modules/module3'
import { module4 } from '../config/modules/module4'
import { module5 } from '../config/modules/module5'
import { module6 } from '../config/modules/module6'

const Workspace = lazy(() => import('../components/workspace/Workspace'))

const modules = { 1: module1, 2: module2, 3: module3, 4: module4, 5: module5, 6: module6 }

export default function ModulePage() {
  const { id } = useParams()
  const moduleId = Number(id)
  const moduleConfig = modules[moduleId]
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showWorkspace, setShowWorkspace] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    if (!user) return
    async function checkProgress() {
      const { data } = await supabase
        .from('module_progress')
        .select('completed')
        .eq('student_id', user.id)
        .eq('module_id', moduleId)
        .single()

      if (data?.completed) {
        setIsCompleted(true)
      }
    }
    checkProgress()
  }, [user, moduleId])

  if (!moduleConfig) {
    return (
      <div className="loading-screen">
        <p className="loading-text">Module not found</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="module-page">
      <header className="module-page-header">
        <div className="module-page-header-left">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            ← Back
          </button>
          <span className="module-page-title">
            Module {moduleId}: {moduleConfig.title}
          </span>
        </div>
        <span className="module-page-progress">
          {isCompleted ? '✅ Completed' : '📖 In Progress'}
        </span>
      </header>

      {!showWorkspace && (
        <>
          <TheorySection sections={moduleConfig.theory.sections} />

          <div className="start-handson-container">
            <p>Ready to apply what you've learned?</p>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setShowWorkspace(true)}
            >
              🚀 Start Hands-On Exercise
            </button>
          </div>
        </>
      )}

      {showWorkspace && (
        <Suspense
          fallback={
            <div className="loading-screen" style={{ minHeight: 400 }}>
              <div className="loading-spinner" />
              <p className="loading-text">Loading workspace...</p>
            </div>
          }
        >
          <Workspace
            moduleId={moduleId}
            moduleConfig={moduleConfig}
            user={user}
            onComplete={() => setIsCompleted(true)}
            onBack={() => setShowWorkspace(false)}
          />
        </Suspense>
      )}
    </div>
  )
}
