import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { diagnosticQuestions } from '../config/diagnostic'

export default function Diagnostic() {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [validationError, setValidationError] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        navigate('/login')
      } else {
        setUser(currentUser)
      }
    }
    fetchUser()
  }, [navigate])

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

    // Validate all questions answered
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
        student_id: user.id,
        module_id: Number(moduleId),
        correct_count: result.correct_count,
        total_count: result.total_count,
        knows_concept: result.correct_count === result.total_count
      }))

      // Insert into diagnostic_results table
      const { error: insertError } = await supabase
        .from('diagnostic_results')
        .insert(rows)

      if (insertError) {
        setError(`Failed to save results: ${insertError.message}. Please try again.`)
        setLoading(false)
        return
      }

      // Navigate to dashboard on success
      navigate('/dashboard')
    } catch (err) {
      setError(`An error occurred: ${err.message}. Please try again.`)
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="diagnostic-page">
      <div className="diagnostic-container">
        <div className="diagnostic-header">
          <h1>XR Fundamentals Diagnostic Quiz</h1>
          <p>Let's assess your current XR knowledge to personalize your learning path.</p>
          <p className="diagnostic-subtitle">Answer all 20 questions to get started.</p>
        </div>

        <form className="diagnostic-form" onSubmit={handleSubmit}>
          {error && <div className="diagnostic-error">{error}</div>}
          {validationError && <div className="diagnostic-validation-error">{validationError}</div>}

          <div className="diagnostic-progress">
            <div className="progress-text">
              {answeredCount} of {diagnosticQuestions.length} answered
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(answeredCount / diagnosticQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="diagnostic-questions">
            {diagnosticQuestions.map((question, index) => (
              <div key={question.id} className="question-card">
                <div className="question-header">
                  <span className="question-number">Question {index + 1} of {diagnosticQuestions.length}</span>
                  <span className="question-module">Module {question.moduleId}</span>
                </div>
                
                <h3 className="question-text">{question.question}</h3>
                
                <div className="question-options">
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="option-label">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={optionIndex}
                        checked={answers[question.id] === optionIndex}
                        onChange={() => handleOptionChange(question.id, optionIndex)}
                      />
                      <span className="option-text">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading || answeredCount !== diagnosticQuestions.length}
          >
            {loading ? 'Submitting...' : 'Submit Quiz & Continue to Dashboard'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .diagnostic-page {
          min-height: 100vh;
          background: var(--bg-primary);
          padding: 40px 20px;
        }

        .diagnostic-container {
          max-width: 700px;
          margin: 0 auto;
        }

        .diagnostic-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .diagnostic-header h1 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 12px;
          color: var(--text-primary);
        }

        .diagnostic-header p {
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin-bottom: 8px;
        }

        .diagnostic-subtitle {
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .diagnostic-form {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .diagnostic-error {
          padding: 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          color: var(--error);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .diagnostic-validation-error {
          padding: 16px;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: var(--radius-md);
          color: var(--warning);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .diagnostic-progress {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .progress-text {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .progress-bar {
          height: 6px;
          background: var(--bg-secondary);
          border-radius: 3px;
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-blue), var(--accent-green));
          transition: width 0.3s ease;
        }

        .diagnostic-questions {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .question-card {
          background: var(--bg-panel);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          transition: all var(--transition);
        }

        .question-card:hover {
          border-color: var(--border-bright);
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          font-size: 0.8rem;
        }

        .question-number {
          color: var(--text-muted);
          font-weight: 600;
        }

        .question-module {
          background: rgba(68, 136, 255, 0.15);
          color: var(--accent-blue);
          padding: 4px 12px;
          border-radius: 100px;
          font-weight: 600;
        }

        .question-text {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .question-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .option-label {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition);
        }

        .option-label:hover {
          background: rgba(68, 136, 255, 0.05);
          border-color: var(--border-bright);
        }

        .option-label input[type="radio"] {
          margin-top: 4px;
          cursor: pointer;
          width: 18px;
          height: 18px;
          min-width: 18px;
          accent-color: var(--accent-blue);
        }

        .option-label input[type="radio"]:checked + .option-text {
          color: var(--accent-blue);
          font-weight: 600;
        }

        .option-label input[type="radio"]:checked {
          color: var(--accent-blue);
        }

        .option-text {
          color: var(--text-primary);
          font-size: 0.95rem;
          line-height: 1.5;
          flex: 1;
          transition: color var(--transition);
        }

        .btn-lg {
          margin-top: 16px;
        }

        @media (max-width: 600px) {
          .diagnostic-page {
            padding: 20px 16px;
          }

          .diagnostic-header h1 {
            font-size: 1.5rem;
          }

          .question-card {
            padding: 16px;
          }

          .question-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  )
}
