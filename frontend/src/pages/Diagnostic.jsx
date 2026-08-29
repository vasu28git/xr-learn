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

  const handleOptionChange = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }))
    setValidationError(null)
  }

  const answeredCount = Object.keys(answers).length

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
      // Group answers by moduleId and count correct
      const moduleResults = {}
      
      diagnosticQuestions.forEach(question => {
        if (!moduleResults[question.moduleId]) {
          moduleResults[question.moduleId] = {
            correct_count: 0,
            total_count: 0
          }
        }
        
        moduleResults[question.moduleId].total_count += 1
        
        if (answers[question.id] === question.correctIndex) {
          moduleResults[question.moduleId].correct_count += 1
        }
      })

      // Prepare rows for insertion
      const rows = Object.entries(moduleResults).map(([moduleId, result]) => ({
        module_id: Number(moduleId),
        correct_count: result.correct_count,
        total_count: result.total_count,
        knows_concept: result.correct_count === result.total_count
      }))

      // Submit through API client
      await api.diagnostic.submit(rows)

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
            {diagnosticQuestions.map((question, index) => (
              <div 
                key={question.id} 
                className={`glass-panel p-6 rounded-xl transition-all duration-200 border ${
                  answers[question.id] !== undefined 
                    ? 'border-primary/20 bg-surface-container-low/10' 
                    : 'border-outline-variant/30 bg-surface-container-low/30'
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="font-code-sm text-[10px] text-on-surface-variant uppercase font-bold">
                    Question {index + 1} of {diagnosticQuestions.length}
                  </span>
                  <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                    Module {question.moduleId}
                  </span>
                </div>

                <h3 className="font-headline-sm text-sm font-bold text-on-surface mb-4 leading-relaxed">
                  {question.question}
                </h3>

                <div className="space-y-2.5">
                  {question.options.map((option, optionIndex) => {
                    const isChecked = answers[question.id] === optionIndex
                    return (
                      <label 
                        key={optionIndex}
                        className={`flex items-start gap-3 p-3.5 rounded-lg border transition-all duration-150 cursor-pointer ${
                          isChecked 
                            ? 'bg-primary/10 border-primary text-on-surface' 
                            : 'bg-surface-container-lowest border-outline-variant/20 text-on-surface-variant hover:border-outline-variant/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={optionIndex}
                          checked={isChecked}
                          onChange={() => handleOptionChange(question.id, optionIndex)}
                          className="mt-0.5 w-4 h-4 accent-primary cursor-pointer"
                        />
                        <span className="text-xs leading-relaxed font-body-sm">{option}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
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
