import { useEffect, useState, lazy, Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
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
  const [isCompleted, setIsCompleted] = useState(false)
  const [theorySections, setTheorySections] = useState(null)
  const [theoryLoading, setTheoryLoading] = useState(false)
  const [theoryIsGenerated, setTheoryIsGenerated] = useState(false)

  useEffect(() => {
    if (!user || !moduleConfig) return
    
    async function checkProgressAndPersonalize() {
      setTheoryLoading(true)
      try {
        // Fetch progress
        const progressData = await api.progress.get(moduleId)
        if (progressData?.completed) {
          setIsCompleted(true)
        }

        // Fetch diagnostic results to check if module is weak
        const diagRes = await api.diagnostic.check()
        const weakIds = diagRes.weakModuleIds || []
        const isWeak = weakIds.includes(moduleId)

        // Only generate personalized theory for weak modules (except Capstone module 11)
        if (isWeak && moduleId !== 11) {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
          const res = await fetch(`${apiUrl}/generate-theory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              moduleId,
              moduleTitle: moduleConfig.title,
              topic: moduleConfig.title,
            }),
          })
          
          if (res.ok) {
            const { theory } = await res.json()
            if (theory?.sections?.length > 0) {
              setTheorySections(theory.sections)
              setTheoryIsGenerated(true)
            }
          }
        }
      } catch (err) {
        console.error('Error in progress or theory generation:', err)
      } finally {
        setTheoryLoading(false)
      }
    }
    
    checkProgressAndPersonalize()
  }, [user, moduleId, moduleConfig])

  if (!moduleConfig) {
    return (
      <div className="bg-surface-container-lowest text-on-surface h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-headline-sm text-sm text-on-surface-variant">Module not found</p>
        <button 
          className="bg-primary hover:bg-primary-fixed text-on-primary font-bold text-xs py-2 px-4 rounded transition-colors cursor-pointer" 
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  if (theoryLoading) {
    return (
      <div className="bg-surface-container-lowest text-on-surface h-screen flex flex-col items-center justify-center gap-4 animate-pulse">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        <p className="font-code-sm text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Personalizing learning experience...</p>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="bg-surface-container-lowest text-on-surface h-screen flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          <p className="font-code-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Loading interactive workspace...</p>
        </div>
      }
    >
      <Workspace
        moduleId={moduleId}
        moduleConfig={moduleConfig}
        user={user}
        theorySections={theorySections}
        theoryIsGenerated={theoryIsGenerated}
        onComplete={() => setIsCompleted(true)}
        onBack={() => navigate('/dashboard')}
      />
    </Suspense>
  )
}
