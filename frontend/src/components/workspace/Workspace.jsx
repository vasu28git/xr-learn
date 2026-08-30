import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSandbox } from '../../hooks/useSandbox'
import { useAI } from '../../hooks/useAI'
import { checkCompletion } from '../../utils/checkCompletion'
import { api } from '../../lib/api'
import Scene from './Scene'
import CodeEditor from './CodeEditor'
import AIPanel from './AIPanel'
import TheorySection from '../theory/TheorySection'
import VoiceTutor from './VoiceTutor'

export default function Workspace({ moduleId, moduleConfig, user, onComplete, onBack, theorySections, theoryIsGenerated }) {
  const navigate = useNavigate()
  const { sceneState, runCode, lastError, handleSceneClick, resetState } = useSandbox(moduleId)
  const [currentCode, setCurrentCode] = useState(moduleConfig.handsOn.starterCode)
  const [completed, setCompleted] = useState(false)
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [activeSubTab, setActiveSubTab] = useState('theory')
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  // Resizable Panels Width State
  const [leftWidth, setLeftWidth] = useState(340)
  const [editorWidth, setEditorWidth] = useState(500)
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingEditor, setIsResizingEditor] = useState(false)

  // Collapsible Guide Sidebar
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false)

  // Fullscreen Visualizer State
  const [isVisualizerFullscreen, setIsVisualizerFullscreen] = useState(false)

  const { messages, sendMessage, isLoading, showHintPrompt, setShowHintPrompt, setFailedAttempts } =
    useAI(moduleId, sceneState, moduleConfig.handsOn.targetState, currentCode, lastError)

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

  // Check completion whenever sceneState changes
  useEffect(() => {
    if (completed) return
    const isComplete = checkCompletion(
      moduleId,
      sceneState,
      moduleConfig.handsOn.targetState
    )
    if (isComplete) {
      setCompleted(true)
      setShowCompletionOverlay(true)
      markComplete()
    }
  }, [sceneState, completed, moduleId])

  const markComplete = async () => {
    if (!user) return
    try {
      await api.progress.update(moduleId, true, attempts)
      onComplete?.()
    } catch (err) {
      console.error('Error marking complete:', err)
    }
  }

  const handleRunCode = useCallback(() => {
    setAttempts(prev => prev + 1)
    runCode(currentCode)

    setTimeout(() => {
      const isComplete = checkCompletion(
        moduleId,
        sceneState,
        moduleConfig.handsOn.targetState
      )
      if (!isComplete) {
        setFailedAttempts(prev => prev + 1)
      }
    }, 100)
  }, [currentCode, runCode, moduleId, sceneState, moduleConfig.handsOn.targetState, setFailedAttempts])

  const handleResetCode = () => {
    if (window.confirm('Reset code to starter template?')) {
      setCurrentCode(moduleConfig.handsOn.starterCode)
      resetState()
    }
  }

  const handlePrevModule = () => {
    if (moduleId > 1) {
      window.location.href = `/module/${moduleId - 1}`
    } else {
      onBack()
    }
  }

  const handleNextModule = () => {
    if (moduleId < 11) {
      window.location.href = `/module/${moduleId + 1}`
    } else {
      onBack()
    }
  }

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
      if (newWidth > 260 && newWidth < 800) {
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
      
      {/* Common Navigation Bar */}
      {!isVisualizerFullscreen && (
        <nav className="bg-surface border-b border-outline-variant/45 flex justify-between items-center w-full px-6 lg:px-8 h-16 z-50 shrink-0 sticky top-0 transition-colors duration-300 shadow-sm">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={onBack}>
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
              onClick={onBack}
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

      {/* Main Workspace Resizable Grid with Reduced Spacing */}
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

        {/* Panel 1: Learning guide panel */}
        {!isLeftCollapsed && !isVisualizerFullscreen && (
          <section 
            style={{ width: leftWidth }}
            className="bg-surface border border-outline-variant/45 rounded-3xl flex flex-col shrink-0 shadow-sm overflow-hidden transition-colors duration-300"
          >
            {/* Header */}
            <div className="p-4 border-b border-outline-variant/45 flex items-center justify-between shrink-0 transition-colors duration-300">
              <button 
                onClick={onBack}
                className="flex items-center gap-1.5 text-on-surface font-bold text-xs hover:text-[#6366f1] transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Module Content</span>
              </button>
              
              {/* Collapse Icon */}
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

            {/* Module details & progress */}
            <div className="px-6 py-4 flex flex-col gap-2 shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-on-surface leading-tight tracking-tight">{moduleConfig.title}</h2>
                <span className="font-code-sm text-[11px] font-bold text-on-surface-variant">{moduleId}/11</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-1">
                <div 
                  className="bg-[#6366f1] h-1 rounded-full transition-all duration-300" 
                  style={{ width: `${(moduleId / 11) * 100}%` }}
                />
              </div>
            </div>

            {/* Sub-navigation tabs inside card */}
            <div className="flex border-b border-outline-variant/45 px-6 shrink-0 transition-colors duration-300">
              <button
                onClick={() => setActiveSubTab('theory')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                  activeSubTab === 'theory'
                    ? 'border-b-[#6366f1] text-[#6366f1]'
                    : 'border-b-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Theory
              </button>
              <button
                onClick={() => setActiveSubTab('instructions')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                  activeSubTab === 'instructions'
                    ? 'border-b-[#6366f1] text-[#6366f1]'
                    : 'border-b-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Instructions
              </button>
              <button
                onClick={() => setActiveSubTab('resources')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                  activeSubTab === 'resources'
                    ? 'border-b-[#6366f1] text-[#6366f1]'
                    : 'border-b-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Resources
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeSubTab === 'theory' && (
                <div className="space-y-4">
                  {theoryIsGenerated && (
                    <div className="bg-purple-500/10 text-[#6366f1] border border-purple-500/20 rounded-2xl px-4 py-3 text-[11px] font-bold flex items-center gap-2 mb-4">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M9.813 15.904L9 21l3.5-2 3.5 2-.813-5.096A1.5 1.5 0 0116 14.5V11a4 4 0 10-8 0v3.5a1.5 1.5 0 01-.187 1.404z" />
                      </svg>
                      <span>Personalized explanation based on diagnostic quiz</span>
                    </div>
                  )}
                  <TheorySection sections={theorySections || moduleConfig.theory.sections} />
                </div>
              )}

              {activeSubTab === 'instructions' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-on-surface tracking-tight mb-2">Task Objective</h3>
                  <div className="bg-purple-500/5 border-l-4 border-[#6366f1] p-4 rounded-r-2xl">
                    <p className="text-xs text-on-surface leading-relaxed font-semibold">
                      {moduleConfig.handsOn.task}
                    </p>
                  </div>
                </div>
              )}

              {activeSubTab === 'resources' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-on-surface tracking-tight mb-4">Useful References</h3>
                  <ul className="space-y-3">
                    <li>
                      <a href="https://threejs.org/docs/" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-xs text-[#6366f1] hover:underline font-bold">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>Three.js official documentation</span>
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Navigation Footer */}
            <div className="p-4 border-t border-outline-variant/45 flex justify-between items-center bg-surface-container-lowest shrink-0 transition-colors duration-300">
              <button 
                onClick={handlePrevModule}
                className="flex items-center gap-1.5 border border-outline-variant hover:border-on-surface text-on-surface hover:bg-surface-container-high/40 font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer bg-surface"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Attempts: {attempts}</span>
              <button 
                disabled={!completed}
                onClick={handleNextModule}
                className="flex items-center gap-1.5 bg-[#6366f1] hover:bg-[#5053e1] text-white font-bold text-xs py-2 px-4 rounded-xl transition-colors cursor-pointer disabled:opacity-40"
              >
                <span>Next</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </section>
        )}

        {/* Divider 1 */}
        {!isLeftCollapsed && !isVisualizerFullscreen && (
          <div 
            onMouseDown={startResizeLeft}
            className="w-1 cursor-col-resize hover:bg-[#6366f1]/40 active:bg-[#6366f1] transition-colors h-full self-stretch shrink-0 rounded"
            title="Drag to resize guide panel"
          />
        )}

        {/* Panel 2: Code Editor - Center pane floating card */}
        {!isVisualizerFullscreen && (
          <section style={{ width: editorWidth }} className="flex flex-col shrink-0">
            <CodeEditor
              code={currentCode}
              onChange={setCurrentCode}
              onRun={handleRunCode}
              onReset={handleResetCode}
              error={lastError}
              readOnly={false}
              isDark={isDark}
              fileName="TransformController.cs"
              language="csharp"
            />
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

        {/* Panel 3: XR Viewport & AI Chat - Right pane floating card */}
        <section 
          className={`flex flex-col bg-surface border border-outline-variant/45 rounded-3xl shadow-sm overflow-hidden transition-all duration-300 ${
            isVisualizerFullscreen 
              ? 'fixed inset-0 z-[100] w-screen h-screen rounded-none border-none shadow-none' 
              : 'flex-1 min-w-[320px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest h-12 shrink-0 px-4 transition-colors duration-300">
            <div className="flex items-center gap-2 h-full">
              <div className="h-full border-b-2 border-b-[#6366f1] px-4 flex items-center gap-2 cursor-pointer">
                <svg className="w-4 h-4 text-[#6366f1]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-code-md text-xs font-semibold text-on-surface">Output Visualizer</span>
              </div>
            </div>
            
            {/* Fullscreen toggle button */}
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

          {/* Interactive 3D Canvas wrapper */}
          <div className="flex-1 w-full h-full relative bg-[#0b0e14] overflow-hidden">
            
            {/* FPS Badge Overlay */}
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 text-white shadow-lg pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2.5 left-3.5"></span>
                <span className="text-[10px] font-bold tracking-wider uppercase">60 FPS</span>
              </div>
            </div>

            {/* Canvas Scene */}
            <Scene
              moduleId={moduleId}
              sceneState={sceneState}
              moduleConfig={moduleConfig}
              onObjectClick={handleSceneClick}
            />

            {/* Floating AI Panel (Collapsible) in bottom-right of canvas area */}
            <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2">
              <AIPanel
                messages={messages}
                onSendMessage={sendMessage}
                isLoading={isLoading}
                showHintPrompt={showHintPrompt}
                onDismissHint={() => setShowHintPrompt(false)}
                moduleId={moduleId}
              />
            </div>

          </div>

        </section>
      </main>

      {/* AI Voice Tutor — Learning module only (floats above workspace) */}
      <VoiceTutor moduleConfig={moduleConfig} currentCode={currentCode} />

      {/* Completion Modal Overlay */}
      {showCompletionOverlay && (
        <div className="fixed inset-0 bg-surface-container-lowest/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowCompletionOverlay(false)}>
          <div className="glass-panel max-w-md w-full p-8 rounded-3xl flex flex-col items-center text-center gap-6 bg-surface/95 shadow-xl transition-all duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20 shadow-[0_0_15px_rgba(77,224,130,0.2)]">
              <svg className="w-8 h-8 text-[#22c55e]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
              </svg>
            </div>
            <div>
              <h2 className="font-headline-md text-xl font-bold text-primary tracking-tight">Simulation Verified!</h2>
              <p className="font-code-sm text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">Module {moduleId} complete</p>
              <p className="font-body-md text-xs text-on-surface-variant mt-4 leading-relaxed">
                {moduleConfig.handsOn.completionMessage}
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                className="flex-1 border border-outline-variant hover:bg-surface-container-highest text-on-surface font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
                onClick={() => {
                  setShowCompletionOverlay(false)
                  onBack()
                }}
              >
                Dashboard
              </button>
              {moduleId < 11 && (
                <button
                  className="flex-1 bg-primary hover:bg-[#5053e1] text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
                  onClick={() => {
                    setShowCompletionOverlay(false)
                    window.location.href = `/module/${moduleId + 1}`
                  }}
                >
                  Next Module →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
