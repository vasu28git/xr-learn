import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await api.auth.login(email, password)
      navigate('/dashboard')
    } catch (signInError) {
      setError(signInError.message)
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface-container-lowest text-on-surface font-body-md min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(142, 213, 255, 0.15) 0%, transparent 50%)' }}></div>
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(142, 213, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(142, 213, 255, 0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <main className="relative z-10 w-full max-w-md px-6">
        <div className="glass-panel rounded-xl p-8 flex flex-col items-center">
          {/* Logo & Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <Link to="/" className="flex flex-col items-center">
              <img alt="Multiverse 3D Logo" className="w-16 h-16 object-contain mb-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtOTbpz51u71Hvf_uHPZmHrtxLcjmxuydOvmkN_azvNvrgQc-maFuicqOeFpwzdLEYC5y_F_X8VdvHcy-nCNp-84HQIwNNEiJpNx5kh7KegDZ5WbN-6E-MarnNrqFE8TW2AusuXHCcA63FLz6_PseZ1blbyVKhK_jLrRFL7wx09SFn7sUmngOkdJ3wzZruMtO3OjnZmeS6PB5UgxQibLwUWlFl4WwHjlfd4mRwIJ5rMqEPOKDSUyZjrw"/>
              <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight mb-2">Multiverse 3D</h1>
            </Link>
            <p className="font-code-sm text-[10px] text-on-surface-variant tracking-wider uppercase">Learn XR. Build XR. Debug XR.</p>
          </div>

          {/* Login Form */}
          <form className="w-full space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error-container/20 border border-error/30 text-error rounded p-3 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="font-code-sm text-[11px] text-on-surface-variant block" htmlFor="email">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">mail</span>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded py-2 pl-10 pr-3 font-body-md text-sm text-on-surface placeholder-on-surface-variant/40 input-glow transition-all duration-200" 
                  id="email" 
                  name="email" 
                  placeholder="developer@multiverse.io" 
                  required 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-code-sm text-[11px] text-on-surface-variant block" htmlFor="password">Password</label>
                <a className="font-code-sm text-[11px] text-primary hover:text-primary-fixed transition-colors" href="#">Forgot?</a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">lock</span>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded py-2 pl-10 pr-10 font-body-md text-sm text-on-surface placeholder-on-surface-variant/40 input-glow transition-all duration-200" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center pt-1">
              <input 
                className="h-4 w-4 rounded bg-surface-container-lowest border-outline-variant text-primary focus:ring-primary focus:ring-offset-surface-container-lowest focus:ring-offset-2" 
                id="remember-me" 
                name="remember-me" 
                type="checkbox"
              />
              <label className="ml-2 block font-body-sm text-[12px] text-on-surface-variant" htmlFor="remember-me">
                Remember session
              </label>
            </div>

            {/* Submit Button */}
            <button 
              className="w-full mt-6 bg-primary hover:bg-primary-fixed text-on-primary font-headline-sm text-sm py-2.5 px-4 rounded transition-colors duration-200 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50" 
              type="submit"
              disabled={loading}
            >
              <span>{loading ? 'Initializing...' : 'Initialize Environment'}</span>
              <span className="material-symbols-outlined text-[18px]">login</span>
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="font-body-sm text-xs text-on-surface-variant">
              No access token yet?{' '}
              <Link className="text-primary hover:text-primary-fixed font-semibold transition-colors" to="/signup">
                Request Alpha Access
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
