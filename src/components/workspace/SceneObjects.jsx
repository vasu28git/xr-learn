import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

/* ========== HELPER COMPONENTS ========== */

function PulsingEmissive({ children, emissiveColor = '#44ff88', intensity = 0.4 }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = Math.sin(clock.getElapsedTime() * 2) * 0.5 + 0.5
      ref.current.emissiveIntensity = intensity * (0.5 + t * 0.5)
    }
  })
  return (
    <meshStandardMaterial
      ref={ref}
      color={emissiveColor}
      emissive={emissiveColor}
      emissiveIntensity={intensity}
      roughness={0.3}
      metalness={0.1}
    />
  )
}

function FloatingAnimation({ children, amplitude = 0.3, speed = 1.5 }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y += Math.sin(clock.getElapsedTime() * speed) * 0.003
      ref.current.rotation.y = clock.getElapsedTime() * 0.3
    }
  })
  return <group ref={ref}>{children}</group>
}

function ConnectionLine({ from, to }) {
  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)]
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color="#8866aa" opacity={0.4} transparent />
    </line>
  )
}

/* ========== MODULE 1 OBJECTS ========== */

function Module1Objects({ sceneState, onObjectClick }) {
  const [showVirtualLabel, setShowVirtualLabel] = useState(false)
  const [showAnchoredLabel, setShowAnchoredLabel] = useState(false)
  const virtualRef = useRef()

  useFrame(({ clock }) => {
    if (virtualRef.current) {
      virtualRef.current.position.y = 3 + Math.sin(clock.getElapsedTime() * 1.5) * 0.4
      virtualRef.current.rotation.x = clock.getElapsedTime() * 0.5
      virtualRef.current.rotation.z = clock.getElapsedTime() * 0.3
    }
  })

  return (
    <>
      {/* VR Object — floating dodecahedron */}
      <mesh
        ref={virtualRef}
        position={[2, 3, -1]}
        onClick={() => {
          setShowVirtualLabel(true)
          onObjectClick('virtual')
        }}
        onPointerOver={(e) => { document.body.style.cursor = 'pointer' }}
        onPointerOut={(e) => { document.body.style.cursor = 'default' }}
      >
        <dodecahedronGeometry args={[0.8]} />
        <meshStandardMaterial
          color="#4488ff"
          emissive="#4488ff"
          emissiveIntensity={0.2}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
      {showVirtualLabel && (
        <Html position={[2, 4.5, -1]} center>
          <div style={{
            background: 'rgba(68, 136, 255, 0.9)',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}>
            🥽 Virtual (VR) — Floating freely
          </div>
        </Html>
      )}

      {/* AR Object — anchored box on surface */}
      <mesh
        position={[-2, 0.5, 1]}
        onClick={() => {
          setShowAnchoredLabel(true)
          onObjectClick('anchored')
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'default' }}
      >
        <boxGeometry args={[1.2, 1, 1.2]} />
        <meshStandardMaterial
          color="#44ff88"
          emissive="#44ff88"
          emissiveIntensity={0.15}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
      {showAnchoredLabel && (
        <Html position={[-2, 1.8, 1]} center>
          <div style={{
            background: 'rgba(68, 255, 136, 0.9)',
            color: '#0a0e1a',
            padding: '6px 14px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}>
            📱 Anchored (AR) — On a surface
          </div>
        </Html>
      )}

      {/* Surface plane for AR object */}
      <mesh position={[-2, -0.01, 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 3]} />
        <meshStandardMaterial color="#1a2040" roughness={0.8} transparent opacity={0.6} />
      </mesh>
    </>
  )
}

/* ========== MODULE 2 OBJECTS ========== */

function Module2Objects({ sceneState }) {
  const targetRef = useRef()

  useFrame(({ clock }) => {
    if (targetRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.05
      targetRef.current.scale.setScalar(scale)
    }
  })

  const boxPos = sceneState.box?.position || { x: 0, y: 0.5, z: 0 }

  return (
    <>
      {/* Moveable box */}
      <mesh position={[boxPos.x, boxPos.y, boxPos.z]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4488ff" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Target sphere */}
      <mesh ref={targetRef} position={[3, 2, -1]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <PulsingEmissive emissiveColor="#44ff88" intensity={0.4} />
      </mesh>

      {/* Target label */}
      <Html position={[3, 3, -1]} center>
        <div style={{
          color: '#44ff88',
          fontSize: 11,
          fontFamily: 'JetBrains Mono, monospace',
          textAlign: 'center',
          opacity: 0.8,
        }}>
          Target: (3, 2, -1)
        </div>
      </Html>
    </>
  )
}

/* ========== MODULE 3 OBJECTS ========== */

function Module3Objects({ sceneState }) {
  const tablePos = sceneState.table?.position || { x: 0, y: 0.25, z: 0 }
  const isParented1 = sceneState.box1Parent === 'table'
  const isParented2 = sceneState.box2Parent === 'table'

  const box1Pos = isParented1
    ? [tablePos.x - 1, tablePos.y + 0.75, tablePos.z]
    : [-1, 1, 0]

  const box2Pos = isParented2
    ? [tablePos.x + 1, tablePos.y + 0.75, tablePos.z]
    : [1, 1, 0]

  return (
    <>
      {/* Table */}
      <mesh position={[tablePos.x, tablePos.y, tablePos.z]}>
        <boxGeometry args={[4, 0.5, 2]} />
        <meshStandardMaterial color="#8866aa" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Box 1 */}
      <mesh position={box1Pos}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#ffaa44" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Box 2 */}
      <mesh position={box2Pos}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#ffaa44" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Connection lines when parented */}
      {isParented1 && (
        <ConnectionLine
          from={[tablePos.x, tablePos.y + 0.25, tablePos.z]}
          to={box1Pos}
        />
      )}
      {isParented2 && (
        <ConnectionLine
          from={[tablePos.x, tablePos.y + 0.25, tablePos.z]}
          to={box2Pos}
        />
      )}

      {/* Labels */}
      <Html position={[tablePos.x, tablePos.y + 0.6, tablePos.z]} center>
        <div style={{ color: '#8899bb', fontSize: 10, fontFamily: 'Inter, sans-serif', opacity: 0.7 }}>
          table
        </div>
      </Html>
    </>
  )
}

/* ========== MODULE 4 OBJECTS ========== */

function Module4Objects({ sceneState }) {
  const lightIntensity = sceneState.light?.intensity ?? 0.5
  const matColor = sceneState.material?.color || '#ffffff'
  const matRoughness = sceneState.material?.roughness ?? 0.5
  const matMetalness = sceneState.material?.metalness ?? 0.0

  return (
    <>
      {/* Student's sphere */}
      <mesh position={[-2, 1.5, 0]}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshStandardMaterial
          color={matColor}
          roughness={matRoughness}
          metalness={matMetalness}
        />
      </mesh>
      <Html position={[-2, 3.2, 0]} center>
        <div style={{ color: '#8899bb', fontSize: 11, fontFamily: 'Inter, sans-serif' }}>
          Your Sphere
        </div>
      </Html>

      {/* Target sphere */}
      <mesh position={[2, 1.5, 0]}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshStandardMaterial
          color="#ff6644"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      <Html position={[2, 3.2, 0]} center>
        <div style={{ color: '#44ff88', fontSize: 11, fontFamily: 'Inter, sans-serif' }}>
          Target ✓
        </div>
      </Html>

      {/* Extra point light controlled by student */}
      <pointLight intensity={lightIntensity} position={[0, 4, 2]} color="#ffffff" />

      {/* VS label */}
      <Html position={[0, 1.5, 0]} center>
        <div style={{
          color: '#445577',
          fontSize: 14,
          fontWeight: 700,
          fontFamily: 'Inter, sans-serif',
        }}>
          vs
        </div>
      </Html>
    </>
  )
}

/* ========== MODULE 5 OBJECTS ========== */

function Module5Objects({ sceneState }) {
  const [hovered, setHovered] = useState(false)
  const boxColor = sceneState.box?.color || '#4488ff'
  const clickHandler = sceneState.box?.clickHandler

  return (
    <mesh
      position={[0, 1, 0]}
      onClick={() => {
        if (typeof clickHandler === 'function') {
          clickHandler()
        }
      }}
      onPointerOver={() => {
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'default'
      }}
    >
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial
        color={hovered ? '#88aaff' : boxColor}
        roughness={0.4}
        metalness={0.3}
        emissive={hovered ? '#4488ff' : '#000000'}
        emissiveIntensity={hovered ? 0.1 : 0}
      />
    </mesh>
  )
}

/* ========== MODULE 6 OBJECTS ========== */

function Module6Objects({ sceneState }) {
  const box1 = sceneState.box1 || { position: { x: 0, y: 0.5, z: 0 }, color: '#4488ff' }
  const box2 = sceneState.box2 || { position: { x: 2, y: 0.5, z: 0 }, color: '#ff8844' }
  const sphere1 = sceneState.sphere1 || { position: { x: -2, y: 1, z: 2 }, color: '#44ff88' }
  const lightIntensity = sceneState.light?.intensity ?? 0.8
  const isParented = sceneState.parentChildSet
  const clickHandlers = sceneState.clickHandlers || {}

  // If parented, adjust box2 position relative to box1
  const box2Pos = isParented && sceneState.parents?.box2 === 'box1'
    ? [box1.position.x + box2.position.x, box1.position.y + box2.position.y, box1.position.z + box2.position.z]
    : [box2.position.x, box2.position.y, box2.position.z]

  return (
    <>
      {/* Ground plane */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a2030" roughness={0.9} />
      </mesh>

      {/* Box 1 */}
      <mesh
        position={[box1.position.x, box1.position.y, box1.position.z]}
        onClick={() => clickHandlers.box1?.()}
        onPointerOver={() => { document.body.style.cursor = clickHandlers.box1 ? 'pointer' : 'default' }}
        onPointerOut={() => { document.body.style.cursor = 'default' }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={box1.color} roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Box 2 */}
      <mesh
        position={box2Pos}
        onClick={() => clickHandlers.box2?.()}
        onPointerOver={() => { document.body.style.cursor = clickHandlers.box2 ? 'pointer' : 'default' }}
        onPointerOut={() => { document.body.style.cursor = 'default' }}
      >
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color={box2.color} roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Sphere 1 */}
      <mesh
        position={[sphere1.position.x, sphere1.position.y, sphere1.position.z]}
        onClick={() => clickHandlers.sphere1?.()}
        onPointerOver={() => { document.body.style.cursor = clickHandlers.sphere1 ? 'pointer' : 'default' }}
        onPointerOut={() => { document.body.style.cursor = 'default' }}
      >
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color={sphere1.color} roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Extra lighting controlled by student */}
      <pointLight intensity={lightIntensity} position={[0, 5, 0]} />

      {/* Connection line if parented */}
      {isParented && (
        <ConnectionLine
          from={[box1.position.x, box1.position.y, box1.position.z]}
          to={box2Pos}
        />
      )}
    </>
  )
}

/* ========== MAIN EXPORT ========== */

export default function SceneObjects({ moduleId, sceneState, moduleConfig, onObjectClick }) {
  switch (Number(moduleId)) {
    case 1:
      return <Module1Objects sceneState={sceneState} onObjectClick={onObjectClick} />
    case 2:
      return <Module2Objects sceneState={sceneState} />
    case 3:
      return <Module3Objects sceneState={sceneState} />
    case 4:
      return <Module4Objects sceneState={sceneState} />
    case 5:
      return <Module5Objects sceneState={sceneState} />
    case 6:
      return <Module6Objects sceneState={sceneState} />
    default:
      return null
  }
}
