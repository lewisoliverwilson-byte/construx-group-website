'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Sun({ onClick }: { onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const corona1Ref = useRef<THREE.Mesh>(null);
  const corona2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.08;
      const pulse = 1 + Math.sin(t * 0.9) * 0.02;
      meshRef.current.scale.setScalar(pulse);
    }

    if (haloRef.current) {
      const hPulse = 1 + Math.sin(t * 0.7 + 1) * 0.06;
      haloRef.current.scale.setScalar(hPulse);
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.08 + Math.sin(t * 0.9) * 0.04;
    }

    if (corona1Ref.current) {
      corona1Ref.current.rotation.z = t * 0.12;
      const cPulse = 1 + Math.sin(t * 0.6 + 2) * 0.08;
      corona1Ref.current.scale.setScalar(cPulse);
    }

    if (corona2Ref.current) {
      corona2Ref.current.rotation.z = -t * 0.09;
      const c2Pulse = 1 + Math.sin(t * 0.5 + 3) * 0.1;
      corona2Ref.current.scale.setScalar(c2Pulse);
    }
  });

  return (
    <group onClick={onClick}>
      {/* Main light source */}
      <pointLight color="#F97316" intensity={180} distance={60} decay={2} />
      <pointLight color="#FDE68A" intensity={40} distance={20} decay={2} />

      {/* Sun sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial
          color="#F97316"
          emissive="#F97316"
          emissiveIntensity={2.2}
          roughness={0.15}
          metalness={0.0}
        />
      </mesh>

      {/* Inner atmosphere glow */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[1.85, 32, 32]} />
        <meshBasicMaterial
          color="#F97316"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer corona 1 */}
      <mesh ref={corona1Ref}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial
          color="#FB923C"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer corona 2 */}
      <mesh ref={corona2Ref}>
        <sphereGeometry args={[3.2, 32, 32]} />
        <meshBasicMaterial
          color="#F97316"
          transparent
          opacity={0.025}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
