import { useState, useCallback, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { challenge1 } from '../config/challenges/challenge1'
import { challenge2 } from '../config/challenges/challenge2'
import { challenge3 } from '../config/challenges/challenge3'
import { challenge4 } from '../config/challenges/challenge4'
import { runTests, allTestsPassed } from '../utils/testRunner'
import { useSandbox } from '../hooks/useSandbox'

const Scene = lazy(() => import('../components/workspace/Scene'))
const CodeEditor = lazy(() => import('../components/workspace/CodeEditor'))

const challenges = [challenge1, challenge2, challenge3, challenge4]

const difficultyColors = {
  beginner: '#44ff88',
  intermediate: '#ffaa44',
  advanced: '#ff4466',
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

  // We reuse useSandbox with moduleId=6 as a generic sandbox (has all APIs)
  const { sceneState, runCode, lastError, resetState, setSceneState } = useSandbox(6)

  const handleSelectChallenge = (challenge) => {
    setSelectedChallenge(challenge)
    setCode(challenge.starterCode)
    setTestResults([])
    setShowResults(false)
    resetState()
    // Set initial state from challenge
    if (challenge.initialState) {
      setSceneState(challenge.initialState)
    }
  }

  const handleRunCode = useCallback(() => {
    if (!selectedChallenge) return
    // Reset to challenge initial state before running
    if (selectedChallenge.initialState) {
      setSceneState(selectedChallenge.initialState)
    }
    // Small delay to let state settle, then run
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
    <div className="training-page">
      {/* Header */}
      <header className="training-header">
        <Link to="/dashboard" className="btn btn-ghost btn-sm">← Back to Dashboard</Link>
        <h1>🏋️ Training Arena</h1>
        <p className="training-subtitle">Practice C# XR challenges & test your skills</p>
      </header>

      <div className="training-layout">
        {/* Left Sidebar — Challenge Selector */}
        <aside className="training-sidebar">
          <h3 className="training-sidebar-title">Challenges</h3>
          {['beginner', 'intermediate', 'advanced'].map((difficulty) => {
            const filtered = challenges.filter((c) => c.difficulty === difficulty)
            if (filtered.length === 0) return null
            return (
              <div key={difficulty} className="training-difficulty-group">
                <div
                  className="training-difficulty-label"
                  style={{ color: difficultyColors[difficulty] }}
                >
                  {difficulty === 'beginner' && '🟢'}
                  {difficulty === 'intermediate' && '🟡'}
                  {difficulty === 'advanced' && '🔴'}
                  {' '}{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </div>
                {filtered.map((ch) => (
                  <button
                    key={ch.id}
                    className={`training-challenge-btn ${selectedChallenge?.id === ch.id ? 'active' : ''}`}
                    onClick={() => handleSelectChallenge(ch)}
                  >
                    <span className="challenge-title">{ch.title}</span>
                    <span className="challenge-meta">
                      {categoryLabels[ch.category]} · {ch.xp} XP
                    </span>
                  </button>
                ))}
              </div>
            )
          })}
        </aside>

        {/* Main Content */}
        <main className="training-main">
          {!selectedChallenge ? (
            <div className="training-empty">
              <h2>Select a Challenge</h2>
              <p>Choose a practice problem from the sidebar to get started.</p>
            </div>
          ) : (
            <>
              {/* Challenge Info */}
              <div className="training-challenge-info">
                <div className="training-challenge-header">
                  <h2>{selectedChallenge.title}</h2>
                  <div className="training-challenge-badges">
                    <span
                      className="badge"
                      style={{ background: difficultyColors[selectedChallenge.difficulty] + '22', color: difficultyColors[selectedChallenge.difficulty], border: `1px solid ${difficultyColors[selectedChallenge.difficulty]}44` }}
                    >
                      {selectedChallenge.difficulty}
                    </span>
                    <span className="badge badge-xp">{selectedChallenge.xp} XP</span>
                  </div>
                </div>
                <p className="training-challenge-desc">{selectedChallenge.description}</p>
              </div>

              {/* Workspace: Scene + Code Editor */}
              <div className="training-workspace">
                <div className="training-scene">
                  <Suspense fallback={<div className="loading-scene">Loading 3D scene...</div>}>
                    <Scene
                      moduleId={6}
                      sceneState={sceneState}
                      moduleConfig={null}
                      onObjectClick={() => {}}
                    />
                  </Suspense>
                </div>
                <div className="training-editor">
                  <Suspense fallback={<div className="loading-scene">Loading editor...</div>}>
                    <CodeEditor
                      code={code}
                      onChange={setCode}
                      onRun={handleRunCode}
                      error={lastError}
                    />
                  </Suspense>
                  <button className="btn btn-accent btn-submit" onClick={handleSubmit}>
                    🧪 Submit & Run Tests
                  </button>
                </div>
              </div>

              {/* Test Results */}
              {showResults && (
                <div className={`training-results ${allPassed ? 'all-passed' : ''}`}>
                  <h3>{allPassed ? '🎉 All Tests Passed!' : '🧪 Test Results'}</h3>
                  <div className="training-test-list">
                    {testResults.map((result, i) => (
                      <div key={i} className={`training-test-item ${result.passed ? 'passed' : 'failed'}`}>
                        <span className="test-icon">{result.passed ? '✅' : '❌'}</span>
                        <span className="test-name">{result.name}</span>
                      </div>
                    ))}
                  </div>
                  {!allPassed && selectedChallenge.hint && (
                    <div className="training-hint">
                      💡 <strong>Hint:</strong> {selectedChallenge.hint}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
