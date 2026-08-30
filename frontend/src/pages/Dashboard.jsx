import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import { getModuleStatus, getCompletedCount } from '../utils/progress'
import { module1 } from '../config/modules/module1'
import { module2 } from '../config/modules/module2'
import { module3 } from '../config/modules/module3'
import { module4 } from '../config/modules/module4'
import { module5 } from '../config/modules/module5'
import { module6 } from '../config/modules/module6'
import { module7 } from '../config/modules/module7'
import { module8 } from '../config/modules/module8'
import { module9 } from '../config/modules/module9'
import { module10 } from '../config/modules/module10'
import { module11 } from '../config/modules/module11'

const allModules = [module1, module2, module3, module4, module5, module6, module7, module8, module9, module10, module11]

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [progress, setProgress] = useState([])
  const [diagnosticResults, setDiagnosticResults] = useState({})
  const [loadingProgress, setLoadingProgress] = useState(true)
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [showAllModules, setShowAllModules] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
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

  useEffect(() => {
    if (!user) return

    async function fetchProgress() {
      try {
        const data = await api.progress.getAll()
        setProgress(data)

        const diagRes = await api.diagnostic.check()
        const diagnostic = {}
        const weakIds = diagRes.weakModuleIds || []
        for (let i = 1; i <= 10; i++) {
          diagnostic[i] = !weakIds.includes(i)
        }
        setDiagnosticResults(diagnostic)
      } catch (error) {
        console.error('Error fetching progress or diagnostic:', error)
      } finally {
        setLoadingProgress(false)
      }
    }

    fetchProgress()
  }, [user])

  const visibleModules = allModules.filter(
    (mod) => mod.id === 11 || diagnosticResults[mod.id] !== true
  )

  const completedCount = getCompletedCount(progress, diagnosticResults)
  const percentComplete = Math.round((completedCount / allModules.length) * 100)
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Developer'

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const getModuleImage = (id) => {
    switch(id) {
      case 1: return "/3dblock.png";
      case 2: return "/vrheadset.png";
      case 3: return "/3dobj.png";
      case 4: return "/3dmountain.png";
      default: return "/vrheadset.png";
    }
  }

  const modulesToRender = showAllModules ? allModules : visibleModules.slice(0, 4)

  return (
    <div className="font-body-md min-h-screen flex flex-col bg-surface-container-lowest text-on-surface transition-colors duration-300">
      
      {/* Redesigned Navigation Bar */}
      <nav className="bg-surface border-b border-outline-variant/45 flex justify-between items-center w-full px-6 lg:px-8 h-16 z-50 shrink-0 sticky top-0 transition-colors duration-300 shadow-sm">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
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
          
          {/* Center Tabs Removed */}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer p-2 rounded-full hover:bg-surface-container-high flex items-center justify-center"
            title="Toggle theme"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          
          <button 
            onClick={handleLogout}
            className="text-on-surface-variant hover:text-[#6366f1] transition-colors cursor-pointer p-2 rounded-full hover:bg-surface-container-high flex items-center justify-center"
            title="Sign Out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>

          <div className="w-8 h-8 rounded-full border border-outline-variant/60 overflow-hidden select-none">
            <img 
              alt="User profile avatar" 
              className="w-full h-full object-cover" 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
            />
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col gap-10">
        
        {/* Welcome Section */}
        <section className="flex flex-col gap-2">
          <h1 className="font-display-lg text-3xl font-bold text-on-surface tracking-tight flex items-center gap-2">
            Welcome back, {userName}! <span className="animate-bounce">👋</span>
          </h1>
          <p className="font-body-sm text-sm text-on-surface-variant">Choose a mode to continue your XR learning journey.</p>
        </section>

        {/* Choose Your Learning Mode Section */}
        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-bold tracking-tight text-on-surface">Choose Your Learning Mode</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            
            {/* Training Card */}
            <article className="bg-surface border border-outline-variant/40 rounded-3xl p-6 lg:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5zM6 12.5V16a6 6 0 0 0 12 0v-3.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2">Training Module</h3>
                <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
                  Learn step-by-step with interactive lessons and hands-on XR examples.
                </p>
                <div className="relative rounded-2xl overflow-hidden mb-6 aspect-[4/3] bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-center">
                  <img 
                    src="/training.png" 
                    alt="Training Illustration" 
                    className="w-full h-full object-contain p-6 select-none pointer-events-none"
                  />
                </div>
              </div>
              <button 
                onClick={() => navigate('/training')} 
                className="w-fit border border-[#6366f1]/30 hover:border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1]/5 font-semibold text-xs py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Start Learning</span>
                <span className="text-sm">→</span>
              </button>
            </article>

            {/* Debugging Card */}
            <article className="bg-surface border border-outline-variant/40 rounded-3xl p-6 lg:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
              <div>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="6" />
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2">Debugging Module</h3>
                <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
                  Find and fix errors in XR scenes. Improve your problem-solving skills.
                </p>
                <div className="relative rounded-2xl overflow-hidden mb-6 aspect-[4/3] bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-center">
                  <img 
                    src="/debug.png" 
                    alt="Debugging Illustration" 
                    className="w-full h-full object-contain p-6 select-none pointer-events-none"
                  />
                </div>
              </div>
              <button 
                onClick={() => navigate('/debugging')} 
                className="w-fit border border-red-500/30 hover:border-red-500/80 text-red-500 hover:bg-red-500/5 font-semibold text-xs py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Start Debugging</span>
                <span className="text-sm">→</span>
              </button>
            </article>



          </div>
        </section>

        {/* Learning Modules Section */}
        <section id="learning-modules-section" className="flex flex-col gap-6 border-t border-outline-variant/30 pt-10">
          <div className="flex justify-between items-center w-full">
            <h2 className="text-lg font-bold tracking-tight text-on-surface">Learning Modules</h2>
            <button 
              onClick={() => setShowAllModules(!showAllModules)} 
              className="text-[#6366f1] hover:underline font-bold text-xs cursor-pointer transition-colors"
            >
              {showAllModules ? 'Show Less' : 'View all'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {modulesToRender.map((mod) => {
              const status = getModuleStatus(progress, mod.id, diagnosticResults)
              const isLocked = status === 'locked'
              const isCompleted = status === 'completed'
              const percent = isCompleted ? 100 : status === 'locked' ? 0 : 35 // Visual progress values representing stage

              return (
                <div 
                  key={mod.id} 
                  className={`bg-surface border border-outline-variant/40 rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 ${isLocked ? 'opacity-60' : ''}`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <span className="w-8 h-8 rounded-full bg-purple-500/10 text-[#6366f1] font-bold text-xs flex items-center justify-center">
                        {String(mod.id).padStart(2, '0')}
                      </span>
                      {isCompleted ? (
                        <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full px-2.5 py-0.5 text-[9px] font-semibold flex items-center gap-0.5 select-none">
                          Done
                        </span>
                      ) : isLocked ? (
                        <span className="bg-outline-variant/20 text-on-surface-variant border border-outline-variant/30 rounded-full px-2.5 py-0.5 text-[9px] font-semibold flex items-center gap-0.5 select-none">
                          Locked
                        </span>
                      ) : (
                        <span className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-full px-2.5 py-0.5 text-[9px] font-semibold select-none">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Image */}
                    <div className="relative rounded-2xl overflow-hidden mb-4 aspect-[16/10] bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-center">
                      <img 
                        src={getModuleImage(mod.id)} 
                        alt={mod.title} 
                        className={`w-full h-full object-contain p-4 select-none pointer-events-none ${isLocked ? 'grayscale opacity-75' : ''}`}
                      />
                    </div>

                    {/* Meta info */}
                    <h3 className="font-bold text-sm text-on-surface mb-1 leading-snug line-clamp-1">{mod.title}</h3>
                    <p className="text-[11px] text-on-surface-variant mb-6 line-clamp-2 leading-relaxed">
                      {mod.theory.sections[0]?.content || 'Get started learning building 3D environments on the web.'}
                    </p>
                  </div>

                  {/* Progress & Action */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="w-full bg-surface-container-highest rounded-full h-1">
                        <div className="bg-[#6366f1] h-1 rounded-full transition-all duration-300" style={{ width: `${percent}%` }}></div>
                      </div>
                      <span className="text-[9px] font-bold text-on-surface-variant">{percent}% complete</span>
                    </div>

                    <button 
                      disabled={isLocked}
                      onClick={() => {
                        if (!isLocked) navigate(`/module/${mod.id}`)
                      }}
                      className={`w-full font-bold text-xs py-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                        isCompleted
                          ? 'bg-surface-container-highest hover:bg-surface-bright text-on-surface border border-outline-variant'
                          : isLocked
                          ? 'bg-surface-container-low text-on-surface-variant border border-outline-variant/20 cursor-not-allowed'
                          : 'bg-[#6366f1] hover:bg-[#5053e1] text-white shadow-md shadow-[#6366f1]/20'
                      }`}
                    >
                      {isCompleted ? (
                        <span>Review Workspace</span>
                      ) : isLocked ? (
                        <span>Locked</span>
                      ) : (
                        <span>Resume Course</span>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-center mt-4">
            <button 
              onClick={() => setShowAllModules(!showAllModules)}
              className="border border-outline-variant hover:border-[#6366f1] text-on-surface hover:text-[#6366f1] font-semibold text-xs py-3 px-6 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer bg-surface"
            >
              <span>{showAllModules ? 'Show Less Modules' : 'Explore All Modules'}</span>
              <span className="text-sm">→</span>
            </button>
          </div>
        </section>

      </main>
    </div>
  )
}
