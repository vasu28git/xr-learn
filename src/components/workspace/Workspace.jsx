import { useState, useEffect, useCallback } from 'react'
import { useSandbox } from '../../hooks/useSandbox'
import { useAI } from '../../hooks/useAI'
import { checkCompletion } from '../../utils/checkCompletion'
import { supabase } from '../../lib/supabase'
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
      await supabase
        .from('module_progress')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          attempts: attempts,
        })
        .eq('student_id', user.id)
        .eq('module_id', moduleId)

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

  return (
    <div className="workspace">
      {/* Task Bar */}
      <div className="workspace-task-bar">
        <div className="workspace-task">
          <span className="workspace-task-icon">🎯</span>
          <span className="workspace-task-text">{moduleConfig.handsOn.task}</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          ← Theory
        </button>
      </div>

      {/* Three Panels */}
      <div className="workspace-panels">
        {/* AI Panel — 20% */}
        <div className="workspace-panel" style={{ width: '20%', minWidth: 220 }}>
          <div className="workspace-panel-header">🤖 AI Tutor</div>
          <div className="workspace-panel-content">
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

        {/* 3D Scene — 50% */}
        <div className="workspace-panel" style={{ width: '50%' }}>
          <div className="workspace-panel-header">🌐 3D Scene</div>
          <div className="workspace-panel-content" style={{ position: 'relative' }}>
            <Scene
              moduleId={moduleId}
              sceneState={sceneState}
              moduleConfig={moduleConfig}
              onObjectClick={handleSceneClick}
            />
          </div>
        </div>

        {/* Code Editor — 30% */}
        <div className="workspace-panel" style={{ width: '30%', minWidth: 280 }}>
          <div className="workspace-panel-header">💻 Code Editor</div>
          <div className="workspace-panel-content">
            <CodeEditor
              code={currentCode}
              onChange={setCurrentCode}
              onRun={handleRunCode}
              error={lastError}
              readOnly={moduleId === 1}
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="workspace-status-bar">
        <div className="status-indicator">
          <div className={`status-dot ${completed ? 'active' : ''}`} />
          <span>{completed ? 'Completed ✓' : 'In Progress'}</span>
        </div>
        <span>Attempts: {attempts}</span>
      </div>

      {/* Completion Overlay */}
      {showCompletionOverlay && (
        <div className="completion-overlay" onClick={() => setShowCompletionOverlay(false)}>
          <div className="completion-card" onClick={(e) => e.stopPropagation()}>
            <div className="completion-icon">🎉</div>
            <h2>Module {moduleId} Complete!</h2>
            <p>{moduleConfig.handsOn.completionMessage}</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowCompletionOverlay(false)
                  onBack()
                }}
              >
                Back to Dashboard
              </button>
              {moduleId < 6 && (
                <button
                  className="btn btn-success"
                  onClick={() => {
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
