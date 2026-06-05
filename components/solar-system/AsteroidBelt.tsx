'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const INNER_RADIUS = 10.5;
const OUTER_RADIUS = 13.5;
const COUNT = 280;

export default function AsteroidBelt() {
  const groupRef = useRef<THREE.Points>(null);

  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const angle = (i / COUNT) * Math.PI * 2 + Math.random() * 0.08;
      const r = INNER_RADIUS + Math.random() * (OUTER_RADIUS - INNER_RADIUS);
      const ySpread = (Math.random() - 0.5) * 0.6;

      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = ySpread;
      positions[i * 3 + 2] = Math.sin(angle) * r;

      sizes[i] = 0.06 + Math.random() * 0.12;
    }

    return { positions, sizes };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.04;
    }
  });

  return (
    <points ref={groupRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        color="#8888BB"
        size={0.08}
        sizeAttenuation
        transparent
        opacity={0.45}
        vertexColors={false}
      />
    </points>
  );
}
