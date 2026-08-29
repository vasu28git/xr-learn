import { useState, useCallback, lazy, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { challenge1 } from '../config/challenges/challenge1'
import { challenge2 } from '../config/challenges/challenge2'
import { challenge3 } from '../config/challenges/challenge3'
import { challenge4 } from '../config/challenges/challenge4'
import { runTests } from '../utils/testRunner'
import { useSandbox } from '../hooks/useSandbox'

const Scene = lazy(() => import('../components/workspace/Scene'))
const CodeEditor = lazy(() => import('../components/workspace/CodeEditor'))

const challenges = [challenge1, challenge2, challenge3, challenge4]

const difficultyColors = {
  beginner: 'text-secondary bg-secondary/10 border-secondary/20',
  intermediate: 'text-tertiary bg-tertiary/10 border-tertiary/20',
  advanced: 'text-error bg-error/10 border-error/20',
}

const difficultyGlows = {
  beginner: 'hover:border-secondary/40',
  intermediate: 'hover:border-tertiary/40',
  advanced: 'hover:border-error/40',
}

const categoryLabels = {
  vectors: '📐 Vectors',
  hierarchy: '🔗 Hierarchy',
  lighting: '💡 Lighting',
  interaction: '👆 Interaction',
}

export default function Training() {
  const [selectedChallenge, setSelectedChallenge] = useState(null)
  const [code, setCode] = useState('')
  const [testResults, setTestResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const navigate = useNavigate()

  // We reuse useSandbox with moduleId=6 as a generic sandbox
  const { sceneState, runCode, lastError, resetState, setSceneState } = useSandbox(6)

  const handleSelectChallenge = (challenge) => {
    setSelectedChallenge(challenge)
    setCode(challenge.starterCode)
    setTestResults([])
    setShowResults(false)
    resetState()
    if (challenge.initialState) {
      setSceneState(challenge.initialState)
    }
  }

  const handleRunCode = useCallback(() => {
    if (!selectedChallenge) return
    if (selectedChallenge.initialState) {
      setSceneState(selectedChallenge.initialState)
    }
    setTimeout(() => {
      runCode(code)
    }, 50)
  }, [code, runCode, selectedChallenge, setSceneState])

  const handleSubmit = useCallback(() => {
    if (!selectedChallenge) return
    const results = runTests(selectedChallenge, sceneState)
    setTestResults(results)
    setShowResults(true)
  }, [selectedChallenge, sceneState])

  const allPassed = testResults.length > 0 && testResults.every((r) => r.passed)

  return (
    <div className="h-screen flex flex-col bg-surface-container-lowest text-on-surface font-body-md overflow-hidden w-full">
      {/* Header */}
      <header className="bg-surface border-b border-outline-variant flex justify-between items-center w-full px-8 h-16 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface px-2.5 py-1.5 rounded border border-outline-variant hover:bg-surface-container-highest transition-colors font-semibold text-xs tracking-wider cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Dashboard
          </button>
          <span className="font-headline-md text-sm font-bold text-primary tracking-tight">Multiverse 3D</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-code-sm text-xs text-on-surface-variant bg-surface-container-highest px-3 py-1 rounded border border-outline-variant/30 uppercase tracking-wider font-bold">
            🏋️ Training Arena
          </span>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden w-full relative">
        
        {/* Left Side: Challenge Selector */}
        <aside className="w-80 border-r border-outline-variant bg-surface-container-lowest flex flex-col shrink-0">
          <div className="p-3 border-b border-outline-variant bg-surface-container-low flex items-center justify-between shrink-0">
            <span className="font-headline-sm text-xs font-semibold text-on-surface">Practice Modules</span>
            <span className="font-code-sm text-[10px] text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded font-bold">
              {challenges.length} Available
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {['beginner', 'intermediate', 'advanced'].map((difficulty) => {
              const filtered = challenges.filter((c) => c.difficulty === difficulty)
              if (filtered.length === 0) return null
              return (
                <div key={difficulty} className="space-y-2">
                  <div className="font-code-sm text-[10px] font-bold uppercase tracking-wider opacity-60 mb-2 px-1">
                    {difficulty === 'beginner' && '🟢'}
                    {difficulty === 'intermediate' && '🟡'}
                    {difficulty === 'advanced' && '🔴'}
                    {' '}{difficulty}
                  </div>
                  <div className="space-y-2">
                    {filtered.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => handleSelectChallenge(ch)}
                        className={`w-full text-left p-3 rounded-lg border transition-all duration-150 cursor-pointer ${
                          selectedChallenge?.id === ch.id
                            ? 'bg-primary/10 border-primary text-on-surface'
                            : `bg-surface-container-low border-outline-variant/30 text-on-surface-variant ${difficultyGlows[difficulty]}`
                        }`}
                      >
                        <h4 className="font-headline-sm text-xs font-semibold mb-1">{ch.title}</h4>
                        <div className="flex justify-between items-center text-[9px] font-code-sm text-on-surface-variant">
                          <span>{categoryLabels[ch.category]}</span>
                          <span className="font-bold text-primary">{ch.xp} XP</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        {/* Center/Main section: Task description + 3D Viewport */}
        <section className="flex-1 flex flex-col overflow-hidden min-w-[320px] border-r border-outline-variant">
          {!selectedChallenge ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant animate-bounce">model_training</span>
              <h2 className="font-headline-md text-base font-bold text-on-surface">Select a Challenge</h2>
              <p className="font-body-sm text-xs text-on-surface-variant max-w-xs leading-relaxed">
                Choose a practice problem from the sidebar to initialize your sandbox.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Challenge description header */}
              <div className="p-5 border-b border-outline-variant bg-surface-container-low shrink-0">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-headline-md text-base font-bold text-on-surface">{selectedChallenge.title}</h2>
                  <div className="flex gap-2">
                    <span className={`px-2.5 py-0.5 rounded border text-[9px] uppercase font-bold tracking-wider ${difficultyColors[selectedChallenge.difficulty]}`}>
                      {selectedChallenge.difficulty}
                    </span>
                    <span className="bg-primary/15 text-primary border border-primary/25 rounded px-2.5 py-0.5 text-[9px] uppercase font-bold tracking-wider">
                      {selectedChallenge.xp} XP
                    </span>
                  </div>
                </div>
                <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                  {selectedChallenge.description}
                </p>
              </div>

              {/* Viewport container */}
              <div className="flex-1 bg-[#0a0a0f] relative min-h-[300px]">
                {/* Header controls inside viewport */}
                <div className="absolute top-4 left-4 z-10 flex justify-between items-start pointer-events-none w-[calc(100%-32px)]">
                  <div className="glass-panel px-3 py-1.5 rounded flex items-center gap-2 pointer-events-auto bg-surface/85">
                    <span className="material-symbols-outlined text-[16px] text-primary">view_in_ar</span>
                    <span className="font-label-caps text-[9px] text-on-surface tracking-wider uppercase font-bold">Training Simulator</span>
                  </div>
                </div>
                
                {/* 3D Canvas */}
                <Suspense fallback={
                  <div className="flex-1 flex items-center justify-center h-full gap-2">
                    <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                    <p className="font-code-sm text-[10px] text-on-surface-variant uppercase">Initializing 3D renderer...</p>
                  </div>
                }>
                  <Scene
                    moduleId={6}
                    sceneState={sceneState}
                    moduleConfig={null}
                    onObjectClick={() => {}}
                  />
                </Suspense>
              </div>
            </div>
          )}
        </section>

        {/* Right side: Editor + Submissions & Test results */}
        {selectedChallenge && (
          <aside className="w-96 flex flex-col p-4 bg-surface gap-4 shrink-0 overflow-y-auto">
            {/* Monaco Editor container */}
            <div className="h-[360px] shrink-0">
              <Suspense fallback={
                <div className="h-full flex items-center justify-center border border-outline-variant rounded-lg">
                  <span className="font-code-sm text-[10px] text-on-surface-variant uppercase">Loading editor...</span>
                </div>
              }>
                <CodeEditor
                  code={code}
                  onChange={setCode}
                  onRun={handleRunCode}
                  error={lastError}
                />
              </Suspense>
            </div>

            {/* Test Submit Buttons */}
            <button 
              onClick={handleSubmit}
              className="w-full bg-primary hover:bg-primary-fixed text-on-primary font-headline-sm text-xs py-2.5 rounded font-bold transition-colors cursor-pointer flex justify-center items-center gap-2 shrink-0 shadow-lg shadow-primary/10"
            >
              <span className="material-symbols-outlined text-sm">science</span>
              Submit & Run Tests
            </button>

            {/* Test Results list */}
            {showResults && (
              <div className={`glass-panel p-4 rounded-xl flex-1 flex flex-col min-h-[160px] ${allPassed ? 'border-secondary/40 bg-secondary/5' : 'border-outline-variant/30'}`}>
                <h3 className="font-headline-sm text-xs font-bold text-on-surface border-b border-outline-variant/50 pb-2 mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">terminal</span>
                  {allPassed ? '🎉 All Tests Passed!' : 'Test Results'}
                </h3>
                <div className="flex-1 overflow-y-auto font-code-sm text-[11px] space-y-2.5 text-on-surface-variant">
                  {testResults.map((result, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-outline-variant/10 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">
                          {result.passed ? 'check_circle' : 'cancel'}
                        </span>
                        <span>{result.name}</span>
                      </div>
                      <span className={`font-bold ${result.passed ? 'text-secondary' : 'text-error'}`}>
                        {result.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                  ))}
                </div>
                {!allPassed && selectedChallenge.hint && (
                  <div className="bg-primary-container/10 border-l-2 border-primary p-2.5 mt-3 rounded-r text-[10px] leading-relaxed text-on-surface flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[14px] mt-0.5">lightbulb</span>
                    <span><strong>Hint:</strong> {selectedChallenge.hint}</span>
                  </div>
                )}
              </div>
            )}
          </aside>
        )}
      </main>
    </div>
  )
}
