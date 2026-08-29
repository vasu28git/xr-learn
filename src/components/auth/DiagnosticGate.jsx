import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function DiagnosticGate({ children }) {
  const { user, loading } = useAuth()
  const [hasDiagnostic, setHasDiagnostic] = useState(null)
  const [checkLoading, setCheckLoading] = useState(true)
  const [checkError, setCheckError] = useState(null)

  useEffect(() => {
    setCheckLoading(true)
    setCheckError(null)
    setHasDiagnostic(null)

    const checkDiagnosticResults = async () => {
      if (!user) {
        setCheckLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('diagnostic_results')
          .select('id')
          .eq('student_id', user.id)
          .limit(1)

        if (error) {
          console.error('Error checking diagnostic results:', error)
          setCheckError(error.message)
        } else {
          setHasDiagnostic(data && data.length > 0)
        }
      } catch (err) {
        console.error('Exception checking diagnostic results:', err)
        setCheckError(err.message)
      } finally {
        setCheckLoading(false)
      }
    }

    checkDiagnosticResults()
  }, [user])

  // Still loading auth session
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p className="loading-text">Loading...</p>
      </div>
    )
  }

  // Not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Still checking diagnostic status
  if (checkLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p className="loading-text">Checking your progress...</p>
      </div>
    )
  }

  if (checkError) {
    return (
      <div className="loading-screen">
        <p className="loading-text">Unable to verify your diagnostic results.</p>
        <p className="diagnostic-error">{checkError}</p>
      </div>
    )
  }

  // User hasn't completed diagnostic yet, redirect to diagnostic quiz
  if (hasDiagnostic === false) {
    return <Navigate to="/diagnostic" replace />
  }

  // User has completed diagnostic, render dashboard
  return children
}
