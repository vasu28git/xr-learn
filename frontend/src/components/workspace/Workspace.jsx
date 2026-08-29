import { useState, useEffect, useCallback } from 'react'
import { useSandbox } from '../../hooks/useSandbox'
import { useAI } from '../../hooks/useAI'
import { checkCompletion } from '../../utils/checkCompletion'
import { api } from '../../lib/api'
import Scene from './Scene'
import CodeEditor from './CodeEditor'
import AIPanel from './AIPanel'

export default function Workspace({ moduleId, moduleConfig, user, onComplete, onBack }) {
  const { sceneState, runCode, lastError, handleSceneClick, resetState } = useSandbox(moduleId)
  const [currentCode, setCurrentCode] = useState(moduleConfig.handsOn.starterCode)
  const [completed, setCompleted] = useState(false)
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const { messages, sendMessage, isLoading, showHintPrompt, setShowHintPrompt, setFailedAttempts } =
    useAI(moduleId, sceneState, moduleConfig.handsOn.targetState, currentCode, lastError)

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

    // Check completion after a small delay for state to update
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

  return (
    <div className="h-screen flex flex-col bg-surface-container-lowest text-on-surface font-body-md overflow-hidden w-full">
      {/* Workspace Header */}
      <header className="bg-surface border-b border-outline-variant flex justify-between items-center w-full px-8 h-16 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface px-2.5 py-1.5 rounded border border-outline-variant hover:bg-surface-container-highest transition-colors font-semibold text-xs tracking-wider cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Dashboard
          </button>
          <span className="font-headline-md text-sm font-bold text-primary tracking-tight">Multiverse 3D</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-code-sm text-xs text-on-surface-variant bg-surface-container-highest px-3 py-1 rounded border border-outline-variant/30">
            Module {moduleId}: {moduleConfig.title}
          </span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-secondary/10 border border-secondary/20">
            <span className={`w-1.5 h-1.5 rounded-full bg-secondary ${!completed ? 'ai-orb' : ''}`} />
            <span className="font-code-sm text-[10px] text-secondary font-bold uppercase tracking-wider">
              {completed ? 'Completed' : 'Simulating'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Column Pane Layout */}
      <main className="flex-1 flex overflow-hidden w-full relative">
        
        {/* Panel 1: Learning instructions - Left side */}
        <section className="w-80 border-r border-outline-variant bg-surface-container-lowest flex flex-col shrink-0">
          {/* Header */}
          <div className="p-3 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">school</span>
              <span className="font-headline-sm text-xs font-semibold text-on-surface">Curriculum Guide</span>
            </div>
            <span className="font-code-sm text-[10px] text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded font-bold">
              Step {moduleId} of 6
            </span>
          </div>
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <h2 className="font-headline-md text-base font-bold text-on-surface leading-tight">{moduleConfig.title}</h2>
            
            {/* Theory Sections */}
            <div className="space-y-3 text-xs text-on-surface-variant leading-relaxed font-body-sm">
              {moduleConfig.theory.sections.map((section, idx) => (
                <div key={idx} className="space-y-2">
                  {section.title && <h3 className="font-semibold text-on-surface mt-4">{section.title}</h3>}
                  <p>{section.content}</p>
                </div>
              ))}
            </div>

            {/* Task Prompt Box */}
            <div className="bg-primary-container/10 border-l-2 border-primary p-3.5 mt-6 rounded-r">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">lightbulb</span>
                <div>
                  <h4 className="font-code-sm text-[10px] text-primary uppercase font-bold tracking-wider mb-1">TASK OBJECTIVE</h4>
                  <p className="font-body-sm text-[11px] text-on-surface leading-relaxed">
                    {moduleConfig.handsOn.task}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Navigation Footer */}
          <div className="p-3 border-t border-outline-variant flex justify-between items-center bg-surface-container-low shrink-0">
            <button 
              onClick={onBack}
              className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface text-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              Prev
            </button>
            <span className="text-[10px] font-semibold text-on-surface-variant">Attempts: {attempts}</span>
            <button 
              disabled={!completed}
              onClick={onBack}
              className="flex items-center gap-1 bg-primary text-on-primary px-3 py-1.5 rounded text-xs font-semibold hover:bg-primary-fixed-dim transition-colors cursor-pointer disabled:opacity-30"
            >
              Next
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Panel 2: Code Editor - Center pane */}
        <section className="flex-1 min-w-[320px] flex flex-col p-4 bg-surface border-r border-outline-variant">
          <CodeEditor
            code={currentCode}
            onChange={setCurrentCode}
            onRun={handleRunCode}
            onReset={handleResetCode}
            error={lastError}
            readOnly={false}
          />
        </section>

        {/* Panel 3: XR Viewport & AI Chat - Right pane */}
        <section className="flex-1 min-w-[320px] flex flex-col relative bg-[#0a0a0f] overflow-hidden">
          {/* Header controls inside viewport */}
          <div className="absolute top-4 left-4 z-10 flex justify-between items-start pointer-events-none w-[calc(100%-32px)]">
            <div className="glass-panel px-3 py-1.5 rounded flex items-center gap-2 pointer-events-auto bg-surface/85">
              <span className="material-symbols-outlined text-[16px] text-primary">view_in_ar</span>
              <span className="font-label-caps text-[9px] text-on-surface tracking-wider uppercase font-bold">Simulator Output</span>
            </div>
            <div className="flex flex-col gap-2 pointer-events-auto">
              <button className="glass-panel w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer bg-surface/85">
                <span className="material-symbols-outlined text-[18px]">360</span>
              </button>
              <button className="glass-panel w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer bg-surface/85">
                <span className="material-symbols-outlined text-[18px]">zoom_in</span>
              </button>
            </div>
          </div>

          {/* Interactive 3D Canvas */}
          <div className="flex-1 w-full h-full relative">
            <Scene
              moduleId={moduleId}
              sceneState={sceneState}
              moduleConfig={moduleConfig}
              onObjectClick={handleSceneClick}
            />
          </div>

          {/* Floating AI Panel (Collapsible) */}
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
        </section>
      </main>

      {/* Completion Modal Overlay */}
      {showCompletionOverlay && (
        <div className="fixed inset-0 bg-surface-container-lowest/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowCompletionOverlay(false)}>
          <div className="glass-panel max-w-md w-full p-8 rounded-xl flex flex-col items-center text-center gap-6 bg-surface/90" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20 shadow-[0_0_15px_rgba(77,224,130,0.2)]">
              <span className="material-symbols-outlined text-secondary text-3xl">celebration</span>
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
                className="flex-1 border border-outline-variant hover:bg-surface-container-highest text-on-surface font-headline-sm text-xs py-2.5 rounded transition-colors cursor-pointer"
                onClick={() => {
                  setShowCompletionOverlay(false)
                  onBack()
                }}
              >
                Dashboard
              </button>
              {moduleId < 6 && (
                <button
                  className="flex-1 bg-primary hover:bg-primary-fixed text-on-primary font-headline-sm text-xs py-2.5 rounded font-bold transition-colors cursor-pointer"
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
