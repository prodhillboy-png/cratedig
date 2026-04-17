'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

function VinylDisc() {
  const discRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (discRef.current) {
      discRef.current.rotation.y = state.clock.elapsedTime * 0.15
      discRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={discRef} position={[3, 0, -2]}>
        {/* Outer disc */}
        <mesh>
          <cylinderGeometry args={[2, 2, 0.05, 64]} />
          <meshStandardMaterial color="#111" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Grooves */}
        <mesh position={[0, 0.03, 0]}>
          <ringGeometry args={[0.5, 1.9, 64, 8]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Center label - now green */}
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.02, 32]} />
          <meshStandardMaterial color="#22C55E" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Center hole */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      </group>
    </Float>
  )
}

function MilkCrate({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) {
  const crateRef = useRef<THREE.Group>(null)
  const initialY = position[1]
  const offset = useMemo(() => Math.random() * Math.PI * 2, [])
  
  useFrame((state) => {
    if (crateRef.current) {
      crateRef.current.position.y = initialY + Math.sin(state.clock.elapsedTime * 0.5 + offset) * 0.3
      crateRef.current.rotation.y = state.clock.elapsedTime * 0.1 + offset
    }
  })

  const crateColor = "#22C55E"
  const crateSize = 0.6

  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={0.4}>
      <group ref={crateRef} position={position} rotation={rotation || [0, 0, 0]} scale={0.5}>
        {/* Bottom */}
        <mesh position={[0, -crateSize/2, 0]}>
          <boxGeometry args={[crateSize, 0.05, crateSize]} />
          <meshStandardMaterial color={crateColor} metalness={0.3} roughness={0.7} />
        </mesh>
        
        {/* Sides with slats */}
        {[0, 1, 2, 3].map((i) => {
          const angle = (i * Math.PI) / 2
          const x = Math.sin(angle) * crateSize / 2
          const z = Math.cos(angle) * crateSize / 2
          return (
            <group key={i} position={[x, 0, z]} rotation={[0, angle, 0]}>
              {/* Vertical posts */}
              <mesh position={[-crateSize/2 + 0.05, 0, 0]}>
                <boxGeometry args={[0.05, crateSize, 0.05]} />
                <meshStandardMaterial color={crateColor} metalness={0.3} roughness={0.7} />
              </mesh>
              <mesh position={[crateSize/2 - 0.05, 0, 0]}>
                <boxGeometry args={[0.05, crateSize, 0.05]} />
                <meshStandardMaterial color={crateColor} metalness={0.3} roughness={0.7} />
              </mesh>
              {/* Horizontal slats */}
              {[-0.15, 0.05, 0.25].map((y, j) => (
                <mesh key={j} position={[0, y, 0]}>
                  <boxGeometry args={[crateSize - 0.1, 0.08, 0.03]} />
                  <meshStandardMaterial color={crateColor} metalness={0.3} roughness={0.7} transparent opacity={0.9} />
                </mesh>
              ))}
            </group>
          )
        })}
      </group>
    </Float>
  )
}

function Particles({ count = 50 }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20
      const y = (Math.random() - 0.5) * 15
      const z = (Math.random() - 0.5) * 10 - 5
      const scale = Math.random() * 0.08 + 0.02
      const speed = Math.random() * 0.5 + 0.2
      temp.push({ x, y, z, scale, speed, offset: Math.random() * Math.PI * 2 })
    }
    return temp
  }, [count])

  useFrame((state) => {
    if (!mesh.current) return
    
    const dummy = new THREE.Object3D()
    particles.forEach((particle, i) => {
      const t = state.clock.elapsedTime * particle.speed + particle.offset
      dummy.position.set(
        particle.x + Math.sin(t) * 0.5,
        particle.y + Math.cos(t * 0.7) * 0.3,
        particle.z
      )
      dummy.scale.setScalar(particle.scale)
      dummy.updateMatrix()
      mesh.current!.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#22C55E" transparent opacity={0.6} />
    </instancedMesh>
  )
}

export function FloatingBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#22C55E" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#16A34A" />
        
        <VinylDisc />
        <Particles count={40} />
        
        {/* Floating milk crates */}
        <MilkCrate position={[-5, 2, -4]} />
        <MilkCrate position={[6, -2, -5]} />
        <MilkCrate position={[-4, -3, -3]} />
        <MilkCrate position={[4, 3, -6]} />
        <MilkCrate position={[-7, 0, -5]} />
      </Canvas>
    </div>
  )
}
