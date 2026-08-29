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
  const [isWeak, setIsWeak] = useState(false)
  const [theorySections, setTheorySections] = useState(null) // null until resolved
  const [theoryLoading, setTheoryLoading] = useState(false)
  const [theoryIsGenerated, setTheoryIsGenerated] = useState(false)

  useEffect(() => {
    if (!user || !moduleConfig) return

    async function checkProgressAndTheory() {
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
      const mastered = diagnostic[moduleId] === true
      const weak = diagnostic[moduleId] === false

      setIsMastered(mastered)
      setIsWeak(weak)

      // Default to the module's own static theory.
      let sections = moduleConfig.theory.sections
      let generated = false

      // Only attempt LLM generation for modules confirmed weak by diagnostic.
      // Modules 11 (capstone) and mastered modules always use static theory.
      if (weak && moduleId !== 11) {
        setTheoryLoading(true)
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/generate-theory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              moduleId,
              moduleTitle: moduleConfig.title,
              // No dedicated `topic` field exists on moduleConfig yet — using
              // title as a stand-in for the retrieval query. Flag: a more
              // specific topic string here would likely improve retrieval.
              topic: moduleConfig.title,
            }),
          })

          if (res.ok) {
            const { theory } = await res.json()
            if (theory?.sections?.length > 0) {
              sections = theory.sections
              generated = true
            }
            // theory === null means generation/validation failed server-side;
            // falls back to static sections already set above.
          } else {
            console.error('generate-theory request failed:', res.status)
          }
        } catch (err) {
          console.error('generate-theory request threw:', err)
        } finally {
          setTheoryLoading(false)
        }
      }

      setTheorySections(sections)
      setTheoryIsGenerated(generated)
    }

    checkProgressAndTheory()
  }, [user, moduleId, moduleConfig])

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
          {theoryIsGenerated && (
            <div className="theory-generated-badge">
              ✨ Personalized explanation based on your diagnostic
            </div>
          )}

          {theoryLoading ? (
            <div className="loading-screen" style={{ minHeight: 200 }}>
              <div className="loading-spinner" />
              <p className="loading-text">Personalizing this module for you...</p>
            </div>
          ) : (
            <TheorySection sections={theorySections ?? moduleConfig.theory.sections} />
          )}

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
          {/* handsOn is always moduleConfig's own static object — untouched,
              never generated or altered, regardless of theory source. */}
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