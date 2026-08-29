import { useState, useEffect, lazy, Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { fetchDiagnosticResults } from '../utils/progress'
import TheorySection from '../components/theory/TheorySection'
import { module1 } from '../config/modules/module1'
import { module2 } from '../config/modules/module2'
import { module3 } from '../config/modules/module3'
import { module4 } from '../config/modules/module4'
import { module5 } from '../config/modules/module5'
import { module6 } from '../config/modules/module6'
import { module7 } from '../config/modules/module7'
import { module8 } from '../config/modules/module8'
import { module9 } from '../config/modules/module9'
import { module10 } from '../config/modules/module10'
import { module11 } from '../config/modules/module11'

const Workspace = lazy(() => import('../components/workspace/Workspace'))

const modules = {
  1: module1,
  2: module2,
  3: module3,
  4: module4,
  5: module5,
  6: module6,
  7: module7,
  8: module8,
  9: module9,
  10: module10,
  11: module11,
}

export default function ModulePage() {
  const { id } = useParams()
  const moduleId = Number(id)
  const moduleConfig = modules[moduleId]
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showWorkspace, setShowWorkspace] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isMastered, setIsMastered] = useState(false)

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

      const diagnostic = await fetchDiagnosticResults(user.id)
      if (diagnostic[moduleId] === true) {
        setIsMastered(true)
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
          {isMastered ? '🏆 Mastered' : isCompleted ? '✅ Completed' : '📖 In Progress'}
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
