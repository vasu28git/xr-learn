import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const navigate = useNavigate()

  useEffect(() => {
    // Sync with HTML class attribute modifications
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const toggleTheme = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    if (nextDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      localStorage.setItem('show-diagnostic', 'true')
      await api.auth.signup(email, password, fullName)
      navigate('/dashboard')
    } catch (signUpError) {
      localStorage.removeItem('show-diagnostic')
      setError(signUpError.message)
      setLoading(false)
    }
  }

  const handleMockSignup = async () => {
    setError(null)
    setLoading(true)

    try {
      const timestamp = new Date().getTime()
      const mockEmail = `judge${timestamp}@demo.com`
      const mockPassword = "JudgePassword123!"
      const mockName = "Judge Reviewer"
      
      localStorage.setItem('show-diagnostic', 'true')
      await api.auth.signup(mockEmail, mockPassword, mockName)
      navigate('/dashboard')
    } catch (signUpError) {
      localStorage.removeItem('show-diagnostic')
      setError(signUpError.message)
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface-container-lowest text-on-surface font-body-md min-h-screen flex items-center justify-center relative overflow-hidden p-4 transition-colors duration-300">
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-surface border border-outline-variant/60 hover:bg-surface-container-highest text-on-surface shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center"
        title="Toggle light/dark mode"
      >
        {isDark ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 60%)' }}></div>
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.15) 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      
      <main className="relative z-10 w-full max-w-[460px] py-8">
        <div className="bg-surface border border-outline-variant/45 rounded-[32px] p-8 md:p-10 flex flex-col items-center shadow-xl transition-all duration-300">
          
          {/* Logo Header */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="text-[#6366f1] flex items-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22V12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12L2 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12L22 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 12L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2L12 12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-headline-md font-bold text-sm tracking-tight text-on-surface">
              <span className="text-[#6366f1]">Multiverse</span> 3D
            </span>
          </div>

          {/* VR Character Illustration */}
          <div className="flex justify-center mb-4 w-full select-none pointer-events-none">
            <img 
              src={isDark ? "/vr_character_dark.png" : "/vr_character_light.png"} 
              alt="VR Learning Character" 
              className={`h-32 w-auto object-contain transition-all duration-300 ${isDark ? 'mix-blend-screen' : 'mix-blend-multiply'}`}
            />
          </div>

          {/* Form Header */}
          <div className="text-center mb-6">
            <h1 className="font-display-lg text-2xl font-bold text-on-surface tracking-tight mb-2">Create Account</h1>
            <p className="font-body-sm text-xs text-on-surface-variant">Register to begin your immersive learning journey</p>
          </div>

          {/* Signup Form */}
          <form className="w-full" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error-container/10 border border-error/20 text-error rounded-xl p-3.5 text-xs flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Full Name Input */}
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-on-surface-variant/70">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input 
                className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-2xl py-3.5 pl-12 pr-4 font-body-md text-xs text-on-surface placeholder-on-surface-variant/50 focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 outline-none transition-all duration-200" 
                id="fullName" 
                name="fullName" 
                placeholder="Full name" 
                required 
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Email Input */}
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-on-surface-variant/70">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input 
                className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-2xl py-3.5 pl-12 pr-4 font-body-md text-xs text-on-surface placeholder-on-surface-variant/50 focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 outline-none transition-all duration-200" 
                id="email" 
                name="email" 
                placeholder="Email address" 
                required 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-on-surface-variant/70">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input 
                className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-2xl py-3.5 pl-12 pr-12 font-body-md text-xs text-on-surface placeholder-on-surface-variant/50 focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 outline-none transition-all duration-200" 
                id="password" 
                name="password" 
                placeholder="Password" 
                required 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70 hover:text-on-surface transition-colors focus:outline-none cursor-pointer flex items-center justify-center" 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {/* Submit Button */}
            <button 
              className="w-full bg-[#6366f1] hover:bg-[#5053e1] text-white font-headline-sm text-xs py-3.5 rounded-2xl font-bold transition-all duration-200 cursor-pointer flex justify-center items-center gap-2 shadow-lg shadow-[#6366f1]/25 hover:shadow-xl hover:shadow-[#6366f1]/35 disabled:opacity-50 disabled:cursor-not-allowed" 
              type="submit"
              disabled={loading}
            >
              <span>{loading ? 'Registering...' : 'Create Account'}</span>
            </button>
          </form>

          {/* Separator */}
          <div className="flex items-center gap-4 my-6 w-full">
            <div className="flex-1 h-px bg-outline-variant/30"></div>
            <span className="text-[10px] font-code-sm uppercase tracking-wider text-on-surface-variant/70">or</span>
            <div className="flex-1 h-px bg-outline-variant/30"></div>
          </div>

          {/* Mock Judge Demo Signup */}
          <button 
            type="button"
            onClick={handleMockSignup}
            disabled={loading}
            className="w-full bg-surface hover:bg-[#6366f1]/10 border border-[#6366f1]/50 text-[#6366f1] font-headline-sm text-xs py-3.5 rounded-2xl font-bold transition-all duration-200 cursor-pointer flex justify-center items-center gap-2.5 shadow-sm hover:shadow"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <span>Mock Signup (Judge Demo)</span>
          </button>

          {/* Footer Links */}
          <div className="mt-8 text-center text-xs font-body-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link className="text-[#6366f1] hover:underline font-bold transition-colors" to="/login">
              Sign in
            </Link>
          </div>
          
        </div>
      </main>
    </div>
  )
}
