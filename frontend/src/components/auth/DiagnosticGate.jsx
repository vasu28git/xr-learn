import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../lib/api'

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
        const res = await api.diagnostic.check()
        setHasDiagnostic(res?.hasDiagnostic || false)
      } catch (err) {
        console.error('Exception checking diagnostic status:', err)
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
      <div className="bg-surface-container-lowest text-on-surface h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        <p className="font-code-sm text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Initializing session...</p>
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
      <div className="bg-surface-container-lowest text-on-surface h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        <p className="font-code-sm text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Verifying telemetry data...</p>
      </div>
    )
  }

  const shouldShowDiagnostic = localStorage.getItem('show-diagnostic') === 'true'

  // User hasn't completed diagnostic yet AND this is a new signup
  if (!hasDiagnostic && shouldShowDiagnostic) {
    return <Navigate to="/diagnostic" replace />
  }

  // User has completed diagnostic (or bypassed it), render children (Dashboard)
  return children
}
