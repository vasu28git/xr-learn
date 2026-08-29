import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import SceneObjects from './SceneObjects'

function AxisIndicator() {
  return (
    <group position={[-4, 0.1, -4]}>
      {/* X axis - Red */}
      <mesh position={[0.5, 0, 0]}>
        <boxGeometry args={[1, 0.05, 0.05]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.3} />
      </mesh>
      {/* Y axis - Green */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.05, 1, 0.05]} />
        <meshStandardMaterial color="#44ff44" emissive="#44ff44" emissiveIntensity={0.3} />
      </mesh>
      {/* Z axis - Blue */}
      <mesh position={[0, 0, 0.5]}>
        <boxGeometry args={[0.05, 0.05, 1]} />
        <meshStandardMaterial color="#4488ff" emissive="#4488ff" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

export default function Scene({ moduleId, sceneState, moduleConfig, onObjectClick }) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ position: [6, 4, 6], fov: 60 }}
      style={{ background: '#0a0e1a', width: '100%', height: '100%', minHeight: 500 }}
    >
      <fog attach="fog" args={['#0a0e1a', 10, 40]} />
      <ambientLight intensity={0.3} color="#4060ff" />
      <directionalLight intensity={0.8} position={[5, 8, 3]} castShadow />
      <directionalLight intensity={0.3} position={[-5, 3, -5]} color="#6080ff" />
      <gridHelper args={[20, 20, '#1a2040', '#1a2040']} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      <AxisIndicator />
      <SceneObjects
        moduleId={moduleId}
        sceneState={sceneState}
        moduleConfig={moduleConfig}
        onObjectClick={onObjectClick}
      />
    </Canvas>
  )
}
