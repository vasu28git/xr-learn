import { useState, useCallback, lazy, Suspense, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  intermediate: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  advanced: 'text-error bg-error/10 border-error/20',
}

const difficultyGlows = {
  beginner: 'hover:border-secondary/40',
  intermediate: 'hover:border-amber-500/40',
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
  const [activeSubTab, setActiveSubTab] = useState('challenges')
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const navigate = useNavigate()

  // Resizable Panels State
  const [leftWidth, setLeftWidth] = useState(340)
  const [editorWidth, setEditorWidth] = useState(500)
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingEditor, setIsResizingEditor] = useState(false)

  // Collapsible Sidebar
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false)

  // Fullscreen Visualizer State
  const [isVisualizerFullscreen, setIsVisualizerFullscreen] = useState(false)

  // We reuse useSandbox with moduleId=6 as a generic sandbox
  const { sceneState, runCode, lastError, resetState, setSceneState } = useSandbox(6)

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const toggleTheme = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    if (nextDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleSelectChallenge = (challenge) => {
    setSelectedChallenge(challenge)
    setCode(challenge.starterCode)
    setTestResults([])
    setShowResults(false)
    setActiveSubTab('task')
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

  // Drag resizing handlers
  const startResizeLeft = useCallback((e) => {
    setIsResizingLeft(true)
    e.preventDefault()
  }, [])

  const startResizeEditor = useCallback((e) => {
    setIsResizingEditor(true)
    e.preventDefault()
  }, [])

  const stopResize = useCallback(() => {
    setIsResizingLeft(false)
    setIsResizingEditor(false)
  }, [])

  const resize = useCallback((e) => {
    if (isResizingLeft) {
      const newWidth = e.clientX - 8
      if (newWidth > 220 && newWidth < 460) {
        setLeftWidth(newWidth)
      }
    }
    if (isResizingEditor) {
      const newWidth = e.clientX - (isLeftCollapsed ? 0 : leftWidth) - 16
      if (newWidth > 300 && newWidth < 800) {
        setEditorWidth(newWidth)
      }
    }
  }, [isResizingLeft, isResizingEditor, leftWidth, isLeftCollapsed])

  useEffect(() => {
    if (isResizingLeft || isResizingEditor) {
      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResize)
    }
    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResize)
    }
  }, [isResizingLeft, isResizingEditor, resize, stopResize])

  return (
    <div className="h-screen flex flex-col bg-surface-container-lowest text-on-surface font-body-md overflow-hidden w-full transition-colors duration-300">
      
      {/* Common Header */}
      {!isVisualizerFullscreen && (
        <nav className="bg-surface border-b border-outline-variant/45 flex justify-between items-center w-full px-6 lg:px-8 h-16 z-50 shrink-0 sticky top-0 transition-colors duration-300 shadow-sm">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="text-[#6366f1] flex items-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 22V12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 12L2 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 12L22 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 12L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 2L12 12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-headline-md font-bold text-sm tracking-tight text-on-surface">
                <span className="text-[#6366f1]">Multiverse</span> 3D
              </span>
            </div>
            
            {/* Center Tabs Removed */}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer p-2 rounded-full hover:bg-surface-container-high flex items-center justify-center"
              title="Toggle theme"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-on-surface-variant hover:text-[#6366f1] transition-colors cursor-pointer p-2 rounded-full hover:bg-surface-container-high flex items-center justify-center"
              title="Back to Dashboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>

            <div className="w-8 h-8 rounded-full border border-outline-variant/60 overflow-hidden select-none">
              <img 
                alt="User profile avatar" 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
              />
            </div>
          </div>
        </nav>
      )}

      {/* Main Workspace Resizable Layout with Reduced Spacing */}
      <main className="flex-1 flex overflow-hidden w-full p-2.5 gap-1.5 bg-surface-container-lowest transition-colors duration-300 relative">
        
        {/* Floating Expanded Guide Handle */}
        {isLeftCollapsed && !isVisualizerFullscreen && (
          <button 
            onClick={() => setIsLeftCollapsed(false)}
            className="fixed left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#6366f1] hover:bg-[#5053e1] text-white flex items-center justify-center shadow-lg z-40 transition-all cursor-pointer"
            title="Expand Guide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Panel 1: Practice Modules / Challenge selector */}
        {!isLeftCollapsed && !isVisualizerFullscreen && (
          <section 
            style={{ width: leftWidth }}
            className="bg-surface border border-outline-variant/40 rounded-3xl flex flex-col shrink-0 shadow-sm overflow-hidden transition-colors duration-300"
          >
            <div className="p-4 border-b border-outline-variant/45 flex items-center justify-between shrink-0">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 text-on-surface font-bold text-xs hover:text-[#6366f1] transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Training Arena</span>
              </button>
              
              {/* Collapse Button */}
              <button 
                onClick={() => setIsLeftCollapsed(true)}
                className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
                title="Collapse Panel"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            {/* Sub Tabs */}
            <div className="flex border-b border-outline-variant/45 px-6 shrink-0">
              <button
                onClick={() => setActiveSubTab('challenges')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                  activeSubTab === 'challenges'
                    ? 'border-b-[#6366f1] text-[#6366f1]'
                    : 'border-b-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Challenges
              </button>
              <button
                disabled={!selectedChallenge}
                onClick={() => setActiveSubTab('task')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer disabled:opacity-40 ${
                  activeSubTab === 'task'
                    ? 'border-b-[#6366f1] text-[#6366f1]'
                    : 'border-b-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Active Task
              </button>
            </div>

            {/* Panel 1 Content */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {activeSubTab === 'challenges' && (
                <div className="space-y-6">
                  {['beginner', 'intermediate', 'advanced'].map((difficulty) => {
                    const filtered = challenges.filter((c) => c.difficulty === difficulty)
                    if (filtered.length === 0) return null
                    return (
                      <div key={difficulty} className="space-y-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant opacity-75">
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
                              className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                                selectedChallenge?.id === ch.id
                                  ? 'bg-[#6366f1]/10 border-[#6366f1] text-on-surface shadow-sm'
                                  : `bg-surface border-outline-variant/35 text-on-surface-variant hover:bg-surface-container-high/40 ${difficultyGlows[difficulty]}`
                              }`}
                            >
                              <h4 className="text-xs font-bold mb-1.5 text-on-surface">{ch.title}</h4>
                              <div className="flex justify-between items-center text-[10px] font-bold">
                                <span>{categoryLabels[ch.category]}</span>
                                <span className="text-[#6366f1]">{ch.xp} XP</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {activeSubTab === 'task' && selectedChallenge && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-base font-bold text-on-surface leading-tight">{selectedChallenge.title}</h3>
                    <div className="flex gap-1.5">
                      <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${difficultyColors[selectedChallenge.difficulty]}`}>
                        {selectedChallenge.difficulty}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {selectedChallenge.description}
                  </p>

                  <div className="bg-purple-500/5 border-l-4 border-[#6366f1] p-4 rounded-r-2xl mt-4">
                    <h4 className="text-[9px] font-bold text-[#6366f1] tracking-wider uppercase mb-1">Target Position Description</h4>
                    <p className="text-xs text-on-surface font-semibold leading-relaxed">
                      {selectedChallenge.description}
                    </p>
                  </div>

                  {selectedChallenge.hint && (
                    <div className="bg-amber-500/5 border-l-4 border-amber-500 p-4 rounded-r-2xl mt-4 flex items-start gap-2 text-xs text-on-surface-variant">
                      <span className="text-amber-500 text-sm">💡</span>
                      <p><strong>Hint:</strong> {selectedChallenge.hint}</p>
                    </div>
                  )}

                  {/* Test Results list rendered here inside task tab */}
                  {showResults && (
                    <div className={`p-4 rounded-2xl border mt-6 flex flex-col ${allPassed ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-outline-variant/35 bg-surface-container-lowest'}`}>
                      <h4 className="text-xs font-bold text-on-surface border-b border-outline-variant/30 pb-2 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                        <span>{allPassed ? '🎉 All Tests Passed!' : 'Grading Status'}</span>
                      </h4>
                      <div className="space-y-2.5 font-mono text-[10px] text-on-surface-variant">
                        {testResults.map((result, i) => (
                          <div key={i} className="flex items-center justify-between border-b border-outline-variant/10 pb-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${result.passed ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                              <span className="text-[11px] font-bold">{result.name}</span>
                            </div>
                            <span className={`font-bold ${result.passed ? 'text-emerald-500' : 'text-red-500'}`}>
                              {result.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Submission sticky footer inside card */}
            {selectedChallenge && (
              <div className="p-4 border-t border-outline-variant/45 shrink-0 bg-surface">
                <button 
                  onClick={handleSubmit}
                  className="w-full bg-[#6366f1] hover:bg-[#5053e1] text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer flex justify-center items-center gap-2 shadow-md shadow-[#6366f1]/15"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                  </svg>
                  <span>Submit & Run Tests</span>
                </button>
              </div>
            )}

          </section>
        )}

        {/* Divider 1 */}
        {!isLeftCollapsed && !isVisualizerFullscreen && (
          <div 
            onMouseDown={startResizeLeft}
            className="w-1 cursor-col-resize hover:bg-[#6366f1]/40 active:bg-[#6366f1] transition-colors h-full self-stretch shrink-0 rounded"
            title="Drag to resize challenges list"
          />
        )}

        {/* Panel 2: Editor */}
        {!isVisualizerFullscreen && (
          <section style={{ width: editorWidth }} className="flex flex-col shrink-0">
            {selectedChallenge ? (
              <CodeEditor
                code={code}
                onChange={setCode}
                onRun={handleRunCode}
                onReset={() => {
                  if (window.confirm("Reset code to starter template?")) {
                    setCode(selectedChallenge.starterCode)
                    setTestResults([])
                    setShowResults(false)
                    resetState()
                  }
                }}
                error={lastError}
                isDark={isDark}
                fileName="TransformController.cs"
                language="csharp"
              />
            ) : (
              <div className="flex-1 bg-surface border border-outline-variant/45 rounded-3xl flex flex-col items-center justify-center p-6 text-center text-on-surface-variant/80">
                <svg className="w-10 h-10 text-on-surface-variant opacity-60 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
                <p className="text-xs">No active file open. Select a challenge to begin coding.</p>
              </div>
            )}
          </section>
        )}

        {/* Divider 2 */}
        {!isVisualizerFullscreen && (
          <div 
            onMouseDown={startResizeEditor}
            className="w-1 cursor-col-resize hover:bg-[#6366f1]/40 active:bg-[#6366f1] transition-colors h-full self-stretch shrink-0 rounded"
            title="Drag to resize code editor"
          />
        )}

        {/* Panel 3: Visualizer Output viewport */}
        <section 
          className={`flex flex-col bg-surface border border-outline-variant/45 rounded-3xl shadow-sm overflow-hidden transition-all duration-300 ${
            isVisualizerFullscreen 
              ? 'fixed inset-0 z-[100] w-screen h-screen rounded-none border-none shadow-none' 
              : 'flex-1 min-w-[320px]'
          }`}
        >
          {/* Visualizer header */}
          <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest h-12 shrink-0 px-4 transition-colors duration-300">
            <div className="flex items-center gap-2 h-full">
              <div className="h-full border-b-2 border-b-[#6366f1] px-4 flex items-center gap-2 cursor-pointer">
                <svg className="w-4 h-4 text-[#6366f1]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-code-md text-xs font-semibold text-on-surface">Output Visualizer</span>
              </div>
            </div>
            
            {/* Fullscreen Toggle */}
            <button 
              onClick={() => setIsVisualizerFullscreen(!isVisualizerFullscreen)}
              className="text-on-surface-variant hover:text-[#6366f1] p-1.5 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer" 
              title={isVisualizerFullscreen ? "Exit Full Screen" : "Expand to Full Screen"}
            >
              {isVisualizerFullscreen ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M4 14h6v6m10-6h-6v6M4 10h6V4m10 6h-6V4" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              )}
            </button>
          </div>

          {/* 3D Canvas */}
          <div className="flex-1 w-full h-full relative bg-[#0b0e14]">
            
            {/* FPS Badge Overlay */}
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 text-white shadow-lg pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2.5 left-3.5"></span>
                <span className="text-[10px] font-bold tracking-wider uppercase">60 FPS</span>
              </div>
            </div>

            {selectedChallenge ? (
              <Suspense fallback={
                <div className="flex items-center justify-center h-full gap-2">
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
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 h-full text-white/50">
                <svg className="w-10 h-10 text-white/30 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25" />
                </svg>
                <p className="text-xs">Visualizer offline. Select a challenge to begin simulation.</p>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  )
}
