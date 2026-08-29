import { useState, useCallback, lazy, Suspense, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

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
    <Canvas camera={{ position: [0, 0, 4], fov: 50 }} style={{ background: '#0a0a0f', width: '100%', height: '100%' }}>
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
    <Canvas camera={{ position: [3, 2, 4], fov: 50 }} style={{ background: '#0a0a0f', width: '100%', height: '100%' }}>
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
    <Canvas camera={{ position: [0, 2, 5], fov: 50 }} style={{ background: '#0a0a0f', width: '100%', height: '100%' }}>
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

// --- TICKETS LIST ---
const tickets = [
  {
    id: 842,
    title: 'Fix: The Non-Rotating Fan',
    difficulty: 'beginner',
    difficultyLabel: '🟢 Beginner',
    xp: 150,
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
      // User must replace rotationSpeed * 0 with rotationSpeed * Time.deltaTime
      return /rotationSpeed\s*\*\s*Time\.deltaTime/i.test(code) || /rotationSpeed\s*\*\s*deltaTime/i.test(code)
    }
  },
  {
    id: 901,
    title: 'Fix: Dim Server Room Lighting',
    difficulty: 'intermediate',
    difficultyLabel: '🟡 Intermediate',
    xp: 250,
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
  const navigate = useNavigate()

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket)
    setCode(ticket.starterCode)
    setIsResolved(false)
    setShowFeedback(false)
  }

  const handleSubmit = () => {
    if (!selectedTicket) return
    const passed = selectedTicket.validate(code)
    setIsResolved(passed)
    setShowFeedback(true)
  }

  return (
    <div className="h-screen flex flex-col bg-surface-container-lowest text-on-surface font-body-md overflow-hidden w-full">
      {/* Header */}
      <header className="bg-surface border-b border-outline-variant flex justify-between items-center w-full px-8 h-16 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface px-2.5 py-1.5 rounded border border-outline-variant hover:bg-surface-container-highest transition-colors font-semibold text-xs tracking-wider cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Dashboard
          </button>
          <span className="font-headline-md text-sm font-bold text-primary tracking-tight">Multiverse 3D</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-code-sm text-xs text-on-surface-variant bg-surface-container-highest px-3 py-1 rounded border border-outline-variant/30 uppercase tracking-wider font-bold">
            🐞 Debugging Hub
          </span>
        </div>
      </header>

      {/* Main Workspace split */}
      <main className="flex-1 flex overflow-hidden w-full relative">
        
        {/* Left Side: Ticket selector */}
        <aside className="w-80 border-r border-outline-variant bg-surface-container-lowest flex flex-col shrink-0">
          <div className="p-3 border-b border-outline-variant bg-surface-container-low flex items-center justify-between shrink-0">
            <span className="font-headline-sm text-xs font-semibold text-on-surface">Ticket Backlog</span>
            <span className="font-code-sm text-[10px] text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded font-bold">
              {tickets.length} Active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTicket(t)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer ${
                  selectedTicket?.id === t.id
                    ? 'bg-primary/10 border-primary text-on-surface shadow-md'
                    : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-outline'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-code-sm text-[9px] text-on-surface-variant font-bold">#TICKET-{t.id}</span>
                  <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${difficultyColors[t.difficulty]}`}>
                    {t.difficulty}
                  </span>
                </div>
                <h4 className="font-headline-sm text-xs font-semibold leading-tight text-on-surface">{t.title}</h4>
                <div className="mt-3 flex justify-between items-center text-[9px] font-code-sm text-on-surface-variant">
                  <span>Reward:</span>
                  <span className="text-secondary font-bold">{t.xp} XP</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Center: Ticket Symptoms & Expected Behaviors */}
        <section className="flex-1 flex flex-col overflow-hidden min-w-[320px] border-r border-outline-variant bg-surface-container-lowest">
          {!selectedTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant animate-pulse">bug_report</span>
              <h2 className="font-headline-md text-base font-bold text-on-surface">Select a Debug Ticket</h2>
              <p className="font-body-sm text-xs text-on-surface-variant max-w-xs leading-relaxed">
                Choose a ticket from the backlog sidebar to initialize code and viewport simulations.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Ticket header */}
              <div className="p-5 border-b border-outline-variant bg-surface-container-low shrink-0">
                <div className="flex items-center gap-2 text-[10px] text-error font-bold uppercase tracking-wider mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                  <span>Ticket #{selectedTicket.id}</span>
                </div>
                <h2 className="font-headline-md text-base font-bold text-primary">{selectedTicket.title}</h2>
              </div>

              {/* Symptoms */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 font-body-sm text-xs text-on-surface-variant">
                <div>
                  <h3 className="font-semibold text-on-surface mb-1">Symptoms</h3>
                  <p className="leading-relaxed">{selectedTicket.symptoms}</p>
                </div>
                <div className="pl-3 border-l-2 border-secondary/50">
                  <h3 className="font-semibold text-on-surface mb-1">Expected Behavior</h3>
                  <p className="leading-relaxed">{selectedTicket.expected}</p>
                </div>
                <div className="pl-3 border-l-2 border-error/50">
                  <h3 className="font-semibold text-on-surface mb-1">Actual Behavior</h3>
                  <p className="leading-relaxed">{selectedTicket.actual}</p>
                </div>

                <div className="bg-surface-container border border-outline-variant rounded p-3 mt-6">
                  <h4 className="font-code-sm text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">HINT DIALECT</h4>
                  <p className="font-body-sm text-[11px] text-on-surface">{selectedTicket.hint}</p>
                </div>
              </div>

              {/* Viewport Render area */}
              <div className="h-[280px] bg-[#0a0a0f] border-t border-outline-variant relative">
                <div className="absolute top-3 left-3 z-10 bg-surface/85 border border-outline-variant rounded px-2.5 py-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-primary">view_in_ar</span>
                  <span className="font-label-caps text-[9px] text-on-surface font-bold uppercase tracking-wider">XR Output</span>
                </div>

                <Suspense fallback={
                  <div className="h-full flex items-center justify-center">
                    <span className="font-code-sm text-[10px] text-on-surface-variant animate-pulse">BOOTING XR RENDERER...</span>
                  </div>
                }>
                  {selectedTicket.id === 842 && <FanScene isSpinning={isResolved} />}
                  {selectedTicket.id === 901 && <ServerRoom intensity={isResolved ? 2.5 : 0.1} />}
                  {selectedTicket.id === 104 && <TeleporterPad beamDirection={isResolved ? 'forward' : 'down'} />}
                </Suspense>

                {/* Bug warning banner */}
                {!isResolved && (
                  <div className="absolute bottom-3 left-3 bg-error-container/80 backdrop-blur-md border border-error/30 text-error rounded px-2.5 py-1 text-[10px] font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    <span>Mesh Error / Fault Detected</span>
                  </div>
                )}
                {isResolved && (
                  <div className="absolute bottom-3 left-3 bg-secondary/15 backdrop-blur-md border border-secondary/35 text-secondary rounded px-2.5 py-1 text-[10px] font-semibold flex items-center gap-1.5 shadow-[0_0_10px_rgba(77,224,130,0.15)]">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    <span>System Functional</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Right Side: Monaco Code Editor & Submissions */}
        {selectedTicket && (
          <aside className="w-96 flex flex-col p-4 bg-surface gap-4 shrink-0 overflow-y-auto">
            <div className="h-[360px] shrink-0">
              <Suspense fallback={
                <div className="h-full flex items-center justify-center border border-outline-variant rounded-lg">
                  <span className="font-code-sm text-[10px] text-on-surface-variant">Loading editor...</span>
                </div>
              }>
                <CodeEditor
                  code={code}
                  onChange={setCode}
                  onRun={handleSubmit} // Simply run validator
                />
              </Suspense>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-primary hover:bg-primary-fixed text-on-primary font-headline-sm text-xs py-2.5 rounded font-bold transition-colors cursor-pointer flex justify-center items-center gap-2 shrink-0 shadow-lg shadow-primary/10"
            >
              <span className="material-symbols-outlined text-sm">science</span>
              Submit Code Fix
            </button>

            {/* Test Feedbacks */}
            {showFeedback && (
              <div className={`glass-panel p-4 rounded-xl flex-1 flex flex-col min-h-[160px] ${isResolved ? 'border-secondary/40 bg-secondary/5' : 'border-outline-variant/30'}`}>
                <h3 className="font-headline-sm text-xs font-bold text-on-surface border-b border-outline-variant/50 pb-2 mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">terminal</span>
                  {isResolved ? '🎉 Simulation Successful!' : 'Compile Status'}
                </h3>
                <div className="font-code-sm text-[11px] space-y-2 flex-1">
                  {isResolved ? (
                    <div className="space-y-2 text-secondary font-bold">
                      <p>✓ Code transpilation passed.</p>
                      <p>✓ Objective parameters matched.</p>
                      <p>✓ Fan/Component behavior resolved in XR scene.</p>
                      <p className="text-on-surface text-[10px] font-normal leading-relaxed mt-2 bg-secondary/10 border border-secondary/20 p-2.5 rounded">
                        Nice work! The logical error has been fixed. The variables represent physical vectors correctly.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-error font-semibold">
                      <p>✗ Compilation Warning: Logic test failed.</p>
                      <p>✗ Parameter mismatch: Component remains static.</p>
                      <p className="text-on-surface-variant text-[10px] font-normal leading-relaxed mt-2 bg-error-container/10 border border-error/20 p-2.5 rounded">
                        Verification failed. Double check if you modified the correct values. Check the hints inside the center pane curriculum description.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </aside>
        )}
      </main>
    </div>
  )
}
