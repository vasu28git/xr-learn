import { useState, useCallback, lazy, Suspense, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { api } from '../lib/api'

const CodeEditor = lazy(() => import('../components/workspace/CodeEditor'))

// --- MOCK 3D COMPONENTS FOR DEBUGGING CHALLENGES ---

// 1. Fan Challenge Components
function FanBladeGroup({ isSpinning }) {
  const groupRef = useRef()

  useFrame((state, delta) => {
    if (isSpinning && groupRef.current) {
      groupRef.current.rotation.z += delta * 6 // Spin fan blades
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Fan Hub */}
      <mesh>
        <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
        <meshStandardMaterial color="#87929a" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Blades */}
      <group ref={groupRef}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <group key={i} rotation={[0, 0, (angle * Math.PI) / 180]}>
            <mesh position={[0, 0.9, 0.1]}>
              <boxGeometry args={[0.15, 1.2, 0.02]} />
              <meshStandardMaterial color="#3e484f" roughness={0.5} metalness={0.8} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

function FanScene({ isSpinning }) {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 50 }} style={{ background: '#0b0e14', width: '100%', height: '100%' }}>
      <ambientLight intensity={0.2} color="#4060ff" />
      <directionalLight intensity={0.8} position={[2, 2, 4]} />
      <gridHelper args={[10, 10, '#1a2040', '#1a2040']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -1]} />
      <FanBladeGroup isSpinning={isSpinning} />
      <OrbitControls enableZoom={true} />
    </Canvas>
  )
}

// 2. Server Room Light Components
function ServerRoom({ intensity }) {
  return (
    <Canvas camera={{ position: [3, 2, 4], fov: 50 }} style={{ background: '#0b0e14', width: '100%', height: '100%' }}>
      <ambientLight intensity={0.1} />
      <pointLight intensity={intensity} position={[0, 2, 0]} color="#8ed5ff" castShadow />
      
      {/* Server Rack Box */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.5, 2, 1]} />
        <meshStandardMaterial color="#1d2026" roughness={0.3} metalness={0.8} />
      </mesh>
      
      {/* Servers Glowing LEDs */}
      {[-0.8, -0.4, 0.0, 0.4, 0.8].map((y, idx) => (
        <mesh key={idx} position={[0.76, y + 0.5, 0.2]}>
          <boxGeometry args={[0.02, 0.1, 0.1]} />
          <meshStandardMaterial 
            color={intensity > 1.0 ? '#4de082' : '#ff4444'} 
            emissive={intensity > 1.0 ? '#4de082' : '#ff4444'} 
            emissiveIntensity={1.5} 
          />
        </mesh>
      ))}

      <gridHelper args={[10, 10, '#1a2040', '#1a2040']} position={[0, -0.5, 0]} />
      <OrbitControls />
    </Canvas>
  )
}

// 3. Teleporter Pad Components
function TeleporterPad({ beamDirection }) {
  const isForward = beamDirection === 'forward'

  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 50 }} style={{ background: '#0b0e14', width: '100%', height: '100%' }}>
      <ambientLight intensity={0.3} />
      <directionalLight intensity={0.7} position={[5, 5, 5]} />
      
      {/* Base Pad */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[1, 1, 0.2, 32]} />
        <meshStandardMaterial color="#1d2026" roughness={0.5} metalness={0.5} />
      </mesh>
      
      {/* Beam Indicator */}
      <group position={[0, -0.3, 0]}>
        {isForward ? (
          // Correct direction - Points Forward along Z axis
          <mesh position={[0, 0, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 2.4, 16]} />
            <meshStandardMaterial color="#baa3ff" emissive="#baa3ff" emissiveIntensity={2} transparent opacity={0.7} />
          </mesh>
        ) : (
          // Faulty direction - Points Down into Pad
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 1.2, 16]} />
            <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={2} transparent opacity={0.7} />
          </mesh>
        )}
      </group>

      <gridHelper args={[10, 10, '#1a2040', '#1a2040']} position={[0, -0.5, 0]} />
      <OrbitControls />
    </Canvas>
  )
}

// --- STYLES ---
const difficultyColors = {
  beginner: 'bg-green-500/10 text-green-500 border-green-500/30',
  intermediate: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
  advanced: 'bg-red-500/10 text-red-500 border-red-500/30'
}

const difficultyGlows = {
  beginner: 'hover:border-green-500/40',
  intermediate: 'hover:border-yellow-500/40',
  advanced: 'hover:border-red-500/40',
}

// --- TICKETS LIST ---
const tickets = [
  {
    id: 842,
    title: 'Fix: The Non-Rotating Fan',
    difficulty: 'beginner',
    difficultyLabel: '🟢 Beginner',
    xp: 150,
    fileName: 'FanController.cs',
    symptoms: 'The cooling fan model in the server room is static. It has received the run command via the global event system, but no rotation is occurring in the update loop.',
    expected: 'Upon initialization, the fan should smoothly rotate continuously around its Z-axis at the defined rotationSpeed.',
    actual: 'The mesh remains static. No errors are thrown, indicating a logical calculation error.',
    hint: 'Look closely at the rotation transform equation. Multiplying by 0 results in no movement. Did you mean Time.deltaTime?',
    starterCode: `using System;
using MultiverseEngine.Core;

public class FanController : MonoBehaviour
{
    public float rotationSpeed = 150.0f;
    private bool isRunning = true;

    void Update()
    {
        if (isRunning)
        {
            // Bug: Applying rotation multiplied by 0!
            transform.Rotate(new Vector3(0, 0, rotationSpeed * 0));
        }
    }
}`,
    validate: (code) => {
      return /rotationSpeed\s*\*\s*Time\.deltaTime/i.test(code) || /rotationSpeed\s*\*\s*deltaTime/i.test(code)
    }
  },
  {
    id: 901,
    title: 'Fix: Dim Server Room Lighting',
    difficulty: 'intermediate',
    difficultyLabel: '🟡 Intermediate',
    xp: 250,
    fileName: 'LightController.cs',
    symptoms: 'The system monitor shows lighting systems active, but the room remains dark and hard to navigate.',
    expected: 'Lighting should set its intensity parameter to targetIntensity (2.5f) on boot.',
    actual: 'The light intensity is locked at 0.1f (extremely dim).',
    hint: 'Check the start sequence of the LightController. The code overrides the config with a static 0.1f float. Replace it with targetIntensity.',
    starterCode: `using System;
using MultiverseEngine.Core;

public class LightController : MonoBehaviour
{
    public float targetIntensity = 2.5f;

    void Start()
    {
        // Bug: lighting intensity hardcoded to dim override!
        Light.intensity = 0.1f;
    }
}`,
    validate: (code) => {
      return /Light\.intensity\s*=\s*targetIntensity/i.test(code)
    }
  },
  {
    id: 104,
    title: 'Fix: Teleport Target Misaligned',
    difficulty: 'advanced',
    difficultyLabel: '🔴 Advanced',
    xp: 350,
    fileName: 'TeleportController.cs',
    symptoms: 'When firing the teleportation pointer pads, the projection beam shoots straight down into the floor pad instead of projecting forward.',
    expected: 'The projection vector direction should point forward along the Z-axis.',
    actual: 'The pointer pad vector direction is currently set to Vector3.down.',
    hint: 'Locate the direction variable initialization inside Update(). Replace Vector3.down with Vector3.forward.',
    starterCode: `using System;
using MultiverseEngine.Core;

public class TeleportController : MonoBehaviour
{
    void Update()
    {
        // Bug: vector direction is pointing straight down!
        Vector3 direction = Vector3.down;
        Teleporter.SetDirection(direction);
    }
}`,
    validate: (code) => {
      return /Vector3\.forward/i.test(code)
    }
  }
]

export default function Debugging() {
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [code, setCode] = useState('')
  const [isResolved, setIsResolved] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [lastError, setLastError] = useState(null)
  const [activeSubTab, setActiveSubTab] = useState('backlog')
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const navigate = useNavigate()

  // Resizable Panels State
  const [leftWidth, setLeftWidth] = useState(340)
  const [editorWidth, setEditorWidth] = useState(500)
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingEditor, setIsResizingEditor] = useState(false)

  // Collapsible Sidebar State
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false)

  // Fullscreen Visualizer State
  const [isVisualizerFullscreen, setIsVisualizerFullscreen] = useState(false)

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

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket)
    setCode(ticket.starterCode)
    setIsResolved(false)
    setShowFeedback(false)
    setLastError(null)
    setActiveSubTab('ticket')
  }

  const handleSubmit = async () => {
    if (!selectedTicket) return
    setIsResolved(false)
    setShowFeedback(false)
    setLastError(null)

    try {
      const res = await api.execute.run(code)
      if (res.errors && res.errors.length > 0) {
        const firstErr = res.errors[0]
        setLastError(`${firstErr.kind.toUpperCase()} ERROR: ${firstErr.message} (Line ${firstErr.line}, Col ${firstErr.column})`)
        setShowFeedback(true)
        return
      }

      const passed = selectedTicket.validate(code)
      setIsResolved(passed)
      setShowFeedback(true)
    } catch (err) {
      setLastError(`Network Error: ${err.message}`)
      setShowFeedback(true)
    }
  }

  // Drag resizing handlers
  const startResizeLeft = useCallback((e) => {
    setIsResizingLeft(true)
    e.preventDefault()
  }, [])

  const startResizeEditor = useCallback((e) => {
    setIsResizingEditor(true)
    e.preventDefault()
  }, [])

  const stopResize = useCallback(() => {
    setIsResizingLeft(false)
    setIsResizingEditor(false)
  }, [])

  const resize = useCallback((e) => {
    if (isResizingLeft) {
      const newWidth = e.clientX - 8
      if (newWidth > 220 && newWidth < 460) {
        setLeftWidth(newWidth)
      }
    }
    if (isResizingEditor) {
      const newWidth = e.clientX - (isLeftCollapsed ? 0 : leftWidth) - 16
      if (newWidth > 300 && newWidth < 800) {
        setEditorWidth(newWidth)
      }
    }
  }, [isResizingLeft, isResizingEditor, leftWidth, isLeftCollapsed])

  useEffect(() => {
    if (isResizingLeft || isResizingEditor) {
      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResize)
    }
    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResize)
    }
  }, [isResizingLeft, isResizingEditor, resize, stopResize])

  return (
    <div className="h-screen flex flex-col bg-surface-container-lowest text-on-surface font-body-md overflow-hidden w-full transition-colors duration-300">
      
      {/* Redesigned Common Navigation Bar */}
      {!isVisualizerFullscreen && (
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
              onClick={() => navigate('/dashboard')}
              className="text-on-surface-variant hover:text-[#6366f1] transition-colors cursor-pointer p-2 rounded-full hover:bg-surface-container-high flex items-center justify-center"
              title="Back to Dashboard"
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
      )}

      {/* Main Workspace Resizable Layout with Reduced Spacing */}
      <main className="flex-1 flex overflow-hidden w-full p-2.5 gap-1.5 bg-surface-container-lowest transition-colors duration-300 relative">
        
        {/* Floating Expanded Guide Handle */}
        {isLeftCollapsed && !isVisualizerFullscreen && (
          <button 
            onClick={() => setIsLeftCollapsed(false)}
            className="fixed left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#6366f1] hover:bg-[#5053e1] text-white flex items-center justify-center shadow-lg z-40 transition-all cursor-pointer"
            title="Expand Guide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Panel 1: Backlog / Tickets guide card */}
        {!isLeftCollapsed && !isVisualizerFullscreen && (
          <section 
            style={{ width: leftWidth }}
            className="bg-surface border border-outline-variant/40 rounded-3xl flex flex-col shrink-0 shadow-sm overflow-hidden transition-colors duration-300"
          >
            {/* Header */}
            <div className="p-4 border-b border-outline-variant/45 flex items-center justify-between shrink-0">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 text-on-surface font-bold text-xs hover:text-[#6366f1] transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Debugging Hub</span>
              </button>

              {/* Collapse button */}
              <button 
                onClick={() => setIsLeftCollapsed(true)}
                className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
                title="Collapse Panel"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            {/* Sub Tabs */}
            <div className="flex border-b border-outline-variant/45 px-6 shrink-0">
              <button
                onClick={() => setActiveSubTab('backlog')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                  activeSubTab === 'backlog'
                    ? 'border-b-[#6366f1] text-[#6366f1]'
                    : 'border-b-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Backlog
              </button>
              <button
                disabled={!selectedTicket}
                onClick={() => setActiveSubTab('ticket')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer disabled:opacity-40 ${
                  activeSubTab === 'ticket'
                    ? 'border-b-[#6366f1] text-[#6366f1]'
                    : 'border-b-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Ticket Details
              </button>
            </div>

            {/* Panel Content Body */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {activeSubTab === 'backlog' && (
                <div className="space-y-3">
                  {tickets.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTicket(t)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        selectedTicket?.id === t.id
                          ? 'bg-[#6366f1]/10 border-[#6366f1] text-on-surface shadow-sm'
                          : `bg-surface border-outline-variant/35 text-on-surface-variant hover:bg-surface-container-high/40 ${difficultyGlows[t.difficulty]}`
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-code-sm text-[9px] text-on-surface-variant font-bold">#TICKET-{t.id}</span>
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-lg border ${difficultyColors[t.difficulty]}`}>
                          {t.difficulty}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold leading-tight text-on-surface mb-2">{t.title}</h4>
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-on-surface-variant">Reward:</span>
                        <span className="text-emerald-500">{t.xp} XP</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {activeSubTab === 'ticket' && selectedTicket && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] text-error font-bold uppercase tracking-wider mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                    <span>Active Ticket #{selectedTicket.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-on-surface leading-tight mb-4">{selectedTicket.title}</h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Symptoms</h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{selectedTicket.symptoms}</p>
                    </div>
                    <div className="pl-3 border-l-2 border-emerald-500/50">
                      <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Expected</h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{selectedTicket.expected}</p>
                    </div>
                    <div className="pl-3 border-l-2 border-red-500/50">
                      <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Actual</h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{selectedTicket.actual}</p>
                    </div>

                    <div className="bg-amber-500/5 border-l-4 border-amber-500 p-4 rounded-r-2xl mt-4 flex items-start gap-2 text-xs text-on-surface-variant">
                      <span className="text-amber-500 text-sm">💡</span>
                      <p><strong>Hint:</strong> {selectedTicket.hint}</p>
                    </div>
                  </div>

                  {/* Grading Feedback Results Panel */}
                  {showFeedback && (
                    <div className={`p-4 rounded-2xl border mt-6 flex flex-col ${isResolved ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-outline-variant/35 bg-surface-container-lowest'}`}>
                      <h4 className="text-xs font-bold text-on-surface border-b border-outline-variant/30 pb-2 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                        <span>{isResolved ? '🎉 Debug Successful!' : 'Compile status'}</span>
                      </h4>
                      
                      <div className="font-mono text-[10px] space-y-2.5 text-on-surface-variant">
                        {isResolved ? (
                          <div className="space-y-1.5 text-emerald-500 font-semibold">
                            <p>✓ Code validation checks completed.</p>
                            <p>✓ Scene parameters resolved.</p>
                            <p>✓ Telemetry data verified.</p>
                          </div>
                        ) : (
                          <div className="space-y-1.5 text-red-500 font-semibold">
                            {lastError ? (
                              <p className="leading-relaxed">{lastError}</p>
                            ) : (
                              <>
                                <p>✗ C# validator execution failed.</p>
                                <p>✗ Scene variables mismatch.</p>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Sticky Submission Button */}
            {selectedTicket && (
              <div className="p-4 border-t border-outline-variant/45 shrink-0 bg-surface">
                <button 
                  onClick={handleSubmit}
                  className="w-full bg-[#6366f1] hover:bg-[#5053e1] text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer flex justify-center items-center gap-2 shadow-md shadow-[#6366f1]/15"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                  </svg>
                  <span>Submit Code Fix</span>
                </button>
              </div>
            )}

          </section>
        )}

        {/* Divider 1 */}
        {!isLeftCollapsed && !isVisualizerFullscreen && (
          <div 
            onMouseDown={startResizeLeft}
            className="w-1 cursor-col-resize hover:bg-[#6366f1]/40 active:bg-[#6366f1] transition-colors h-full self-stretch shrink-0 rounded"
            title="Drag to resize ticket backlog"
          />
        )}

        {/* Panel 2: Editor */}
        {!isVisualizerFullscreen && (
          <section style={{ width: editorWidth }} className="flex flex-col shrink-0">
            {selectedTicket ? (
              <CodeEditor
                code={code}
                onChange={setCode}
                onRun={handleSubmit}
                onReset={() => {
                  if (window.confirm("Reset editor to bugged state?")) {
                    setCode(selectedTicket.starterCode)
                    setIsResolved(false)
                    setShowFeedback(false)
                    setLastError(null)
                  }
                }}
                error={lastError}
                isDark={isDark}
                fileName={selectedTicket.fileName || "TransformController.cs"}
                language="csharp"
              />
            ) : (
              <div className="flex-1 bg-surface border border-outline-variant/45 rounded-3xl flex flex-col items-center justify-center p-6 text-center text-on-surface-variant/80">
                <svg className="w-10 h-10 text-on-surface-variant opacity-60 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
                <p className="text-xs">Select a debug ticket from the backlog to open files.</p>
              </div>
            )}
          </section>
        )}

        {/* Divider 2 */}
        {!isVisualizerFullscreen && (
          <div 
            onMouseDown={startResizeEditor}
            className="w-1 cursor-col-resize hover:bg-[#6366f1]/40 active:bg-[#6366f1] transition-colors h-full self-stretch shrink-0 rounded"
            title="Drag to resize editor"
          />
        )}

        {/* Panel 3: Visualizer Output */}
        <section 
          className={`flex flex-col bg-surface border border-outline-variant/45 rounded-3xl shadow-sm overflow-hidden transition-all duration-300 ${
            isVisualizerFullscreen 
              ? 'fixed inset-0 z-[100] w-screen h-screen rounded-none border-none shadow-none' 
              : 'flex-1 min-w-[320px]'
          }`}
        >
          {/* visualizer header */}
          <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest h-12 shrink-0 px-4 transition-colors duration-300">
            <div className="flex items-center gap-2 h-full">
              <div className="h-full border-b-2 border-b-[#6366f1] px-4 flex items-center gap-2 cursor-pointer">
                <svg className="w-4 h-4 text-[#6366f1]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-code-md text-xs font-semibold text-on-surface">Output Visualizer</span>
              </div>
            </div>
            
            {/* Fullscreen toggle */}
            <button 
              onClick={() => setIsVisualizerFullscreen(!isVisualizerFullscreen)}
              className="text-on-surface-variant hover:text-[#6366f1] p-1.5 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer" 
              title={isVisualizerFullscreen ? "Exit Full Screen" : "Expand to Full Screen"}
            >
              {isVisualizerFullscreen ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M4 14h6v6m10-6h-6v6M4 10h6V4m10 6h-6V4" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              )}
            </button>
          </div>

          {/* Canvas area */}
          <div className="flex-1 w-full h-full relative bg-[#0b0e14]">
            {/* FPS overlay */}
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 text-white shadow-lg pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2.5 left-3.5"></span>
                <span className="text-[10px] font-bold tracking-wider uppercase">60 FPS</span>
              </div>
            </div>

            {selectedTicket ? (
              <Suspense fallback={
                <div className="h-full flex items-center justify-center">
                  <span className="font-code-sm text-[10px] text-on-surface-variant animate-pulse">BOOTING XR RENDERER...</span>
                </div>
              }>
                {selectedTicket.id === 842 && <FanScene isSpinning={isResolved} />}
                {selectedTicket.id === 901 && <ServerRoom intensity={isResolved ? 2.5 : 0.1} />}
                {selectedTicket.id === 104 && <TeleporterPad beamDirection={isResolved ? 'forward' : 'down'} />}
              </Suspense>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 h-full text-white/50">
                <svg className="w-10 h-10 text-white/30 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25" />
                </svg>
                <p className="text-xs">Visualizer offline. Select a debug ticket to boot simulator.</p>
              </div>
            )}

            {/* Warning indicator */}
            {selectedTicket && (
              <div className="absolute bottom-4 left-4 z-10">
                {!isResolved ? (
                  <div className="bg-red-500/10 backdrop-blur-md border border-red-500/30 text-red-500 rounded-xl px-3 py-1.5 text-[10px] font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.15)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span>Mesh Error / Fault Detected</span>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 text-emerald-500 rounded-xl px-3 py-1.5 text-[10px] font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(77,224,130,0.15)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>System Functional</span>
                  </div>
                )}
              </div>
            )}

          </div>
        </section>

      </main>
    </div>
  )
}
