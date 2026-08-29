import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkUser = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const data = await api.auth.getCurrentUser()
      setUser(data.user)
    } catch (err) {
      console.error('Error fetching current user:', err)
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkUser()

    const handleAuthChange = () => {
      checkUser()
    }

    window.addEventListener('auth-state-change', handleAuthChange)
    return () => window.removeEventListener('auth-state-change', handleAuthChange)
  }, [])

  const signOut = async () => {
    await api.auth.logout()
    setUser(null)
  }

  return { user, loading, signOut }
}
