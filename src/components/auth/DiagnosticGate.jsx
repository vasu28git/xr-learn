import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function DiagnosticGate({ children }) {
  const { user, loading } = useAuth()
  const [hasDiagnostic, setHasDiagnostic] = useState(null)
  const [checkLoading, setCheckLoading] = useState(true)

  useEffect(() => {
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
          // If there's an error, assume user hasn't done diagnostic (safer default)
          setHasDiagnostic(false)
        } else {
          // If any rows exist, user has completed diagnostic
          setHasDiagnostic(data && data.length > 0)
        }
      } catch (err) {
        console.error('Exception checking diagnostic results:', err)
        setHasDiagnostic(false)
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

  // User hasn't completed diagnostic yet, redirect to diagnostic quiz
  if (!hasDiagnostic) {
    return <Navigate to="/diagnostic" replace />
  }

  // User has completed diagnostic, render dashboard
  return children
}
