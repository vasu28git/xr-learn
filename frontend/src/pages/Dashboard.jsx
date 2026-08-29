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
  const [loadingProgress, setLoadingProgress] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sessionTime, setSessionTime] = useState('00:00:00')
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return

    async function fetchProgress() {
      try {
        const data = await api.progress.getAll()
        setProgress(data)
      } catch (error) {
        console.error('Error fetching progress:', error)
      } finally {
        setLoadingProgress(false)
      }
    }

    fetchProgress()
  }, [user])

  // Simple session timer
  useEffect(() => {
    let seconds = 0
    const interval = setInterval(() => {
      seconds++
      const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0')
      const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
      const secs = String(seconds % 60).padStart(2, '0')
      setSessionTime(`${hrs}:${mins}:${secs}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const completedCount = getCompletedCount(progress)
  const percentComplete = Math.round((completedCount / allModules.length) * 100)
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Developer'

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="font-body-md h-screen overflow-hidden flex flex-col bg-surface-container-lowest text-on-surface">
      {/* TopNavBar */}
      <nav className="bg-surface border-b border-outline-variant flex justify-between items-center w-full px-8 h-16 z-50 shrink-0">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer p-1 rounded hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="font-headline-md text-xl font-bold text-primary tracking-tight">Multiverse 3D</span>
          
          <div className="hidden md:flex gap-6 items-center h-full">
            <span className="text-primary border-b-2 border-primary pb-1 flex flex-col h-full justify-center text-xs font-semibold uppercase tracking-wider cursor-pointer" onClick={() => navigate('/dashboard')}>Dashboard</span>
            <span className="text-on-surface-variant hover:text-on-surface transition-colors duration-200 cursor-pointer flex flex-col h-full justify-center text-xs font-semibold uppercase tracking-wider" onClick={() => navigate('/module/1')}>Learning</span>
            <span className="text-on-surface-variant hover:text-on-surface transition-colors duration-200 cursor-pointer flex flex-col h-full justify-center text-xs font-semibold uppercase tracking-wider" onClick={() => navigate('/training')}>Training</span>
            <span className="text-on-surface-variant hover:text-on-surface transition-colors duration-200 cursor-pointer flex flex-col h-full justify-center text-xs font-semibold uppercase tracking-wider" onClick={() => navigate('/debugging')}>Debugging</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input className="bg-surface-container-lowest border border-outline-variant rounded-md py-1 pl-8 pr-3 text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none w-48 transition-all" placeholder="Search..." type="text"/>
          </div>
          <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer relative p-1 rounded hover:bg-surface-container-highest">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-primary rounded-full"></span>
          </button>
          <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer p-1 rounded hover:bg-surface-container-highest" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant overflow-hidden">
            <img alt="User profile avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3VS3anHb5C94iA6JnbNXJITqEogFESS3Klr0ouQjGv-VspRFGfmabm9AlsL_8ilNnl8nd8Imxq0PmMtYu_e3VtWbj2ZxpLdCWIxYgGm4P7jN0FVDHDsLLFDYvn3orderFPWLzTdO40koOYY12Q1Jo-53qKxMoT7-JcWbRN0ZASgD7QFMnuLXeHAapmb3ym_EHc4J-qHWewjOZIZ8Ons809mTl55vj_BUT4u37_v9zS_qSyNKxJjqRKQ"/>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* SideNavBar */}
        <aside className={`${sidebarOpen ? 'flex' : 'hidden'} xl:flex bg-surface-container-lowest border-r border-outline-variant flex-col h-full w-64 z-40 shrink-0 transition-all duration-300`}>
          <div className="p-4 border-b border-outline-variant flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center border border-outline-variant">
              <span className="material-symbols-outlined text-primary">rocket_launch</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-sm text-primary font-semibold">Multiverse Engine</h2>
              <p className="font-code-sm text-[10px] text-on-surface-variant">v4.2.0-stable</p>
            </div>
          </div>
          
          <div className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
            <div className="px-3">
              <button className="w-full bg-primary/10 text-primary border-l-2 border-primary px-4 py-2 flex items-center gap-3 text-left font-code-sm text-xs hover:bg-surface-container-highest transition-all duration-150 cursor-pointer">
                <span className="material-symbols-outlined text-sm">account_tree</span>
                Hierarchy
              </button>
            </div>
            <div className="px-3">
              <button className="w-full text-on-surface-variant hover:bg-surface-container-high border-l-2 border-transparent px-4 py-2 flex items-center gap-3 text-left font-code-sm text-xs hover:bg-surface-container-highest transition-all duration-150 cursor-pointer">
                <span className="material-symbols-outlined text-sm">folder_open</span>
                Assets
              </button>
            </div>
            <div className="px-3">
              <button className="w-full text-on-surface-variant hover:bg-surface-container-high border-l-2 border-transparent px-4 py-2 flex items-center gap-3 text-left font-code-sm text-xs hover:bg-surface-container-highest transition-all duration-150 cursor-pointer">
                <span className="material-symbols-outlined text-sm">tune</span>
                Inspector
              </button>
            </div>
            <div className="px-3">
              <button className="w-full text-on-surface-variant hover:bg-surface-container-high border-l-2 border-transparent px-4 py-2 flex items-center gap-3 text-left font-code-sm text-xs hover:bg-surface-container-highest transition-all duration-150 cursor-pointer">
                <span className="material-symbols-outlined text-sm">terminal</span>
                Console
              </button>
            </div>
          </div>
          
          <div className="p-4 border-t border-outline-variant flex flex-col gap-2">
            <button className="w-full bg-primary text-on-primary font-headline-sm text-xs py-2 rounded font-bold hover:bg-primary-fixed transition-colors">
              Launch Simulator
            </button>
          </div>
          
          <div className="pb-4 flex flex-col gap-1">
            <div className="px-3">
              <button className="w-full text-on-surface-variant hover:bg-surface-container-high border-l-2 border-transparent px-4 py-2 flex items-center gap-3 text-left font-code-sm text-xs hover:bg-surface-container-highest transition-all duration-150 cursor-pointer">
                <span className="material-symbols-outlined text-sm">description</span>
                Docs
              </button>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto bg-surface-container-lowest p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 content-start">
          {/* Welcome Header */}
          <header className="lg:col-span-12 flex justify-between items-end pb-4 border-b border-outline-variant">
            <div>
              <h1 className="font-display-lg text-2xl font-bold text-primary tracking-tight">System Overview</h1>
              <p className="font-body-md text-xs text-on-surface-variant mt-2">
                Developer profile: <span className="text-primary font-semibold">{userName}</span> | System status:{' '}
                <span className="text-secondary inline-flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span>Optimal
                </span>
              </p>
            </div>
            <div className="hidden sm:flex gap-2">
              <div className="text-right px-4 py-2 glass-panel rounded-lg">
                <p className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-wider">SESSION TIME</p>
                <p className="font-code-md text-xs text-primary">{sessionTime}</p>
              </div>
            </div>
          </header>

          {/* Core Modules List (Left Panel in Dashboard) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Learning Status Overview */}
            <article className="glass-panel rounded-xl p-6 flex flex-col justify-between group hover:border-primary/30 transition-colors relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4 z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="material-symbols-outlined text-primary text-xl">school</span>
                    <h2 className="font-headline-sm text-sm text-primary tracking-wide uppercase font-semibold">Course Progress</h2>
                  </div>
                  <p className="font-body-sm text-xs text-on-surface-variant max-w-md">Learn XR concepts through structured modules and interactive 3D simulations.</p>
                </div>
                <div className="font-code-md text-xs text-primary bg-primary/10 px-3 py-1 rounded border border-primary/20">
                  {completedCount} / {allModules.length} Modules
                </div>
              </div>
              <div className="z-10">
                <div className="w-full bg-surface-container-highest rounded-full h-1.5 mb-2">
                  <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${percentComplete}%` }}></div>
                </div>
                <span className="font-code-sm text-[10px] text-on-surface-variant">{percentComplete}% complete</span>
              </div>
            </article>

            {/* Training and Debugging Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Training Card */}
              <article className="glass-panel rounded-xl p-5 flex flex-col justify-between group hover:border-secondary/40 transition-colors bg-surface-container-low/30">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="material-symbols-outlined text-secondary text-lg">model_training</span>
                      <h2 className="font-headline-sm text-xs font-semibold text-secondary tracking-wide uppercase">Training Arena</h2>
                    </div>
                    <p className="font-body-sm text-[11px] text-on-surface-variant leading-relaxed">Practice C# XR logic and solve interactive problems.</p>
                  </div>
                </div>
                <div>
                  <button 
                    onClick={() => navigate('/training')}
                    className="w-full border border-outline-variant text-on-surface font-headline-sm text-xs py-2 rounded hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-bold bg-surface-container-lowest"
                  >
                    Start Training
                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                  </button>
                </div>
              </article>

              {/* Debugging Card */}
              <article className="glass-panel rounded-xl p-5 flex flex-col justify-between group hover:border-error/40 transition-colors bg-surface-container-low/30">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="material-symbols-outlined text-error text-lg">bug_report</span>
                      <h2 className="font-headline-sm text-xs font-semibold text-error tracking-wide uppercase">Debugging Hub</h2>
                    </div>
                    <p className="font-body-sm text-[11px] text-on-surface-variant leading-relaxed">Fix compilation errors and malfunctioning scene components.</p>
                  </div>
                </div>
                <div>
                  <button 
                    onClick={() => navigate('/debugging')}
                    className="w-full border border-outline-variant text-on-surface font-headline-sm text-xs py-2 rounded hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-bold bg-surface-container-lowest"
                  >
                    Start Debugging
                    <span className="material-symbols-outlined text-sm">terminal</span>
                  </button>
                </div>
              </article>

            </div>

            {/* Modules Grid Header */}
            <div className="border-t border-outline-variant/30 pt-4 mt-2">
              <h3 className="font-headline-sm text-xs font-bold text-primary uppercase tracking-wider mb-2">Learning Curriculum</h3>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allModules.map((mod) => {
                const status = getModuleStatus(progress, mod.id)
                const isLocked = status === 'locked'
                const isCompleted = status === 'completed'

                return (
                  <div 
                    key={mod.id} 
                    className={`glass-panel rounded-xl p-5 flex flex-col justify-between hover:border-primary/40 transition-colors relative overflow-hidden ${isLocked ? 'opacity-50' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-code-sm text-[10px] text-primary uppercase font-bold tracking-wider">Module {mod.id}</span>
                          {isCompleted && (
                            <span className="bg-secondary/15 text-secondary border border-secondary/25 rounded px-1.5 py-0.5 text-[9px] font-semibold flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[10px]">done</span>Completed
                            </span>
                          )}
                          {!isLocked && !isCompleted && (
                            <span className="bg-primary/15 text-primary border border-primary/25 rounded px-1.5 py-0.5 text-[9px] font-semibold">
                              Available
                            </span>
                          )}
                          {isLocked && (
                            <span className="bg-outline-variant/20 text-on-surface-variant border border-outline-variant/35 rounded px-1.5 py-0.5 text-[9px] font-semibold flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[10px]">lock</span>Locked
                            </span>
                          )}
                        </div>
                        <h3 className="font-headline-sm text-sm text-on-surface font-semibold">{mod.title}</h3>
                      </div>
                    </div>
                    <div>
                      <p className="font-body-sm text-xs text-on-surface-variant mb-4 line-clamp-2">{mod.theory.sections[0]?.content || mod.handsOn.starterCode}</p>
                      
                      <button 
                        disabled={isLocked}
                        onClick={() => {
                          if (!isLocked) navigate(`/module/${mod.id}`)
                        }}
                        className={`w-full font-headline-sm text-xs py-2 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          isCompleted
                            ? 'bg-surface-container-highest hover:bg-surface-bright text-on-surface border border-outline-variant'
                            : isLocked
                            ? 'bg-surface-container-low text-on-surface-variant border border-outline-variant/20'
                            : 'bg-primary hover:bg-primary-fixed text-on-primary font-bold'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <span>Review Module</span>
                            <span className="material-symbols-outlined text-sm">refresh</span>
                          </>
                        ) : isLocked ? (
                          <>
                            <span>Prerequisite Required</span>
                            <span className="material-symbols-outlined text-sm">lock</span>
                          </>
                        ) : (
                          <>
                            <span>Enter Workspace</span>
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar / Stats & Activity (Right Panel in Dashboard) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Learning Stats */}
            <section className="glass-panel rounded-xl p-5 shrink-0">
              <h3 className="font-headline-sm text-xs font-semibold text-on-surface border-b border-outline-variant pb-2 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">monitoring</span>
                Telemetry
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-wider mb-1">TOTAL RESOLVED</p>
                  <p className="font-code-md text-2xl font-bold text-secondary">{completedCount} <span className="text-xs text-on-surface-variant">/ {allModules.length} modules</span></p>
                </div>
                <div className="p-3 bg-surface-container-lowest border border-outline-variant rounded-lg">
                  <p className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-wider mb-1.5">CURRENT TASK</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                      <span className="font-code-sm text-primary font-bold text-[10px]">3D</span>
                    </div>
                    <div>
                      <h4 className="font-headline-sm text-xs text-on-surface font-semibold">
                        {allModules[completedCount]?.title || 'All Completed!'}
                      </h4>
                      <p className="font-body-sm text-[9px] text-on-surface-variant">
                        {allModules[completedCount] ? `Module ${allModules[completedCount].id}` : 'Nice job!'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Console Logs */}
            <section className="glass-panel rounded-xl p-5 flex-1 flex flex-col min-h-[200px]">
              <h3 className="font-headline-sm text-xs font-semibold text-on-surface border-b border-outline-variant pb-2 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">history</span>
                Simulation Feed
              </h3>
              <div className="font-code-sm text-[11px] space-y-3 text-on-surface-variant flex-1 overflow-y-auto">
                <div className="flex gap-2">
                  <span className="text-secondary">[SYS]</span>
                  <span>Multiverse Engine v4.2.0 initialized.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">[LOG]</span>
                  <span>Connection secured to local Express API server.</span>
                </div>
                {completedCount > 0 ? (
                  <div className="flex gap-2">
                    <span className="text-secondary">[SYS]</span>
                    <span>Verified {completedCount} completed module(s).</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <span className="text-tertiary-container">[AI]</span>
                    <span>Ready to initialize first learning sandbox!</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="text-primary">[LOG]</span>
                  <span>Welcome to the workspace. Happy coding!</span>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
