import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import { diagnosticQuestions } from '../config/diagnostic'

export default function Diagnostic() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [validationError, setValidationError] = useState(null)

  const handleAnswerChange = (questionId, text) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: text
    }))
    setValidationError(null)
  }

  const answeredCount = Object.values(answers).filter(a => typeof a === 'string' && a.trim().length > 0).length

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setValidationError(null)

    if (answeredCount !== diagnosticQuestions.length) {
      setValidationError(`Please answer all ${diagnosticQuestions.length} questions before submitting. You've answered ${answeredCount} so far.`)
      return
    }

    setLoading(true)

    try {
      // Grade answers via Gemini through the backend /grade-quiz endpoint.
      // On any failure, default every question to incorrect (safe fallback).
      let correctness = {}
      diagnosticQuestions.forEach(q => { correctness[q.id] = false }) // safe default
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        const gradeRes = await fetch(`${apiUrl}/grade-quiz`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questions: diagnosticQuestions.map(q => ({
              id: q.id,
              question: q.question,
              referenceAnswer: q.referenceAnswer,
            })),
            answers,
          }),
        })
        if (gradeRes.ok) {
          const gradeData = await gradeRes.json()
          if (gradeData.correctness && typeof gradeData.correctness === 'object') {
            correctness = gradeData.correctness
          }
        } else {
          console.error('grade-quiz request failed:', gradeRes.status)
        }
      } catch (gradeErr) {
        console.error('grade-quiz request threw:', gradeErr)
      }

      // Collect ragTopics for every wrong answer
      const weakTopics = diagnosticQuestions
        .filter(q => !correctness[q.id])
        .map(q => q.ragTopic)

      // Match weak topics to module ids via RAG. Non-fatal if it fails —
      // we still save weak_concept_topics even if matching didn't work.
      let weakModuleIds = []
      if (weakTopics.length > 0) {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
          const res = await fetch(`${apiUrl}/match-topics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topics: weakTopics }),
          })
          if (res.ok) {
            const { matches } = await res.json()
            weakModuleIds = [...new Set(
              matches.filter(m => m.moduleId).map(m => Number(m.moduleId))
            )]
          } else {
            console.error('match-topics request failed:', res.status)
          }
        } catch (matchErr) {
          console.error('match-topics request threw:', matchErr)
        }
      }

      // Submit through API client
      await api.diagnostic.submit({
        weakTopics,
        weakModuleIds
      })

      // Clear the diagnostic gate flag
      localStorage.removeItem('show-diagnostic')

      // Notify auth state updated and route to dashboard
      window.dispatchEvent(new Event('auth-state-change'))
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.')
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface font-body-md py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <header className="text-center space-y-3">
          <span className="font-code-sm text-[10px] text-primary uppercase font-bold tracking-widest bg-primary/10 px-3 py-1 rounded border border-primary/20">
            📊 Assessments
          </span>
          <h1 className="font-display-lg text-3xl font-bold tracking-tight text-on-surface">XR Fundamentals Diagnostic</h1>
          <p className="font-body-sm text-xs text-on-surface-variant max-w-lg mx-auto leading-relaxed">
            Let's assess your current XR knowledge to personalize your learning path. Complete all questions to initialize your workspace dashboard.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-error-container/20 border border-error/30 text-error p-4 rounded-xl text-xs flex items-start gap-2 animate-pulse">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <span>{error}</span>
            </div>
          )}

          {validationError && (
            <div className="bg-tertiary-container/20 border border-tertiary/30 text-tertiary p-4 rounded-xl text-xs flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{validationError}</span>
            </div>
          )}

          {/* Sticky Progress Bar */}
          <div className="glass-panel p-4 rounded-xl sticky top-4 z-40 bg-surface/90 shadow-lg flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-code-sm font-semibold">
              <span className="text-on-surface-variant">Diagnostic Progress</span>
              <span className="text-primary font-bold">{answeredCount} of {diagnosticQuestions.length} answered</span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden border border-outline-variant/30">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(142,213,255,0.4)]"
                style={{ width: `${(answeredCount / diagnosticQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Questions Container */}
          <div className="space-y-4">
            {diagnosticQuestions.map((question, index) => {
              const hasAnswer = typeof answers[question.id] === 'string' && answers[question.id].trim().length > 0
              return (
                <div 
                  key={question.id} 
                  className={`glass-panel p-6 rounded-xl transition-all duration-200 border ${
                    hasAnswer 
                      ? 'border-primary/20 bg-surface-container-low/10' 
                      : 'border-outline-variant/30 bg-surface-container-low/30'
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-code-sm text-[10px] text-on-surface-variant uppercase font-bold">
                      Question {index + 1} of {diagnosticQuestions.length}
                    </span>
                    <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                      Modules {question.modulePair.join(' & ')}
                    </span>
                  </div>

                  <h3 className="font-headline-sm text-sm font-bold text-on-surface mb-4 leading-relaxed">
                    {question.question}
                  </h3>

                  <textarea
                    rows={4}
                    placeholder="Type your answer here…"
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-3.5 text-xs font-body-sm text-on-surface placeholder:text-on-surface-variant/50 leading-relaxed resize-y focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                </div>
              )
            })}
          </div>

           <button
            type="submit"
            disabled={loading || answeredCount !== diagnosticQuestions.length}
            className="w-full bg-primary hover:bg-primary-fixed text-on-primary font-headline-sm text-xs py-3 rounded-xl font-bold transition-colors cursor-pointer flex justify-center items-center gap-2 shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">done_all</span>
            {loading ? 'Analyzing Quiz Results...' : 'Submit Assessment & Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
