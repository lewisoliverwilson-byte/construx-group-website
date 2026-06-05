'use client';

import { useRef, useState, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import OrbitRing from './OrbitRing';
import type { Venture } from '@/lib/ventures';

interface Props {
  venture: Venture;
  isSelected: boolean;
  onSelect: (id: string, worldPos: THREE.Vector3) => void;
  onHover: (id: string | null) => void;
  isPanelOpen: boolean;
}

export default function Planet({ venture, isSelected, onSelect, onHover, isPanelOpen }: Props) {
  const orbitGroupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const atmoRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const accentColor = useMemo(() => new THREE.Color(venture.accent), [venture.accent]);

  useFrame((_, delta) => {
    if (orbitGroupRef.current) {
      orbitGroupRef.current.rotation.y += delta * venture.orbitSpeed * 0.15;
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      const targetScale = hovered || isSelected ? 1.22 : 1.0;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1,
      );
    }

    if (atmoRef.current) {
      const targetOpacity = hovered || isSelected ? 0.18 : 0.06;
      const mat = atmoRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.08);
      const ts = hovered || isSelected ? 1.28 : 1.18;
      atmoRef.current.scale.lerp(new THREE.Vector3(ts, ts, ts), 0.08);
    }
  });

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (meshRef.current) {
        const pos = new THREE.Vector3();
        meshRef.current.getWorldPosition(pos);
        onSelect(venture.id, pos);
      }
    },
    [venture.id, onSelect],
  );

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHovered(true);
      onHover(venture.id);
      document.body.style.cursor = 'pointer';
    },
    [venture.id, onHover],
  );

  const handlePointerOut = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHovered(false);
      onHover(null);
      document.body.style.cursor = 'auto';
    },
    [onHover],
  );

  return (
    <>
      <OrbitRing radius={venture.orbitRadius} highlighted={isSelected} />
      <group ref={orbitGroupRef}>
        <group position={[venture.orbitRadius, 0, 0]}>
          <pointLight
            color={venture.accent}
            intensity={hovered || isSelected ? 8 : 3}
            distance={4}
            decay={2}
          />

          {/* Atmosphere */}
          <mesh ref={atmoRef}>
            <sphereGeometry args={[venture.planetSize * 1.18, 16, 16]} />
            <meshBasicMaterial
              color={venture.accent}
              transparent
              opacity={0.06}
              side={THREE.BackSide}
            />
          </mesh>

          {/* Planet */}
          <mesh
            ref={meshRef}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <sphereGeometry args={[venture.planetSize, 48, 48]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={hovered || isSelected ? 0.9 : 0.28}
              roughness={0.55}
              metalness={0.35}
            />
          </mesh>

          {/* Hover label */}
          {hovered && !isPanelOpen && (
            <Html
              center
              position={[0, venture.planetSize + 0.55, 0]}
              distanceFactor={12}
              style={{ pointerEvents: 'none' }}
            >
              <div
                style={{
                  background: 'rgba(5,5,18,0.92)',
                  backdropFilter: 'blur(14px)',
                  border: `1px solid ${venture.accent}44`,
                  borderRadius: '10px',
                  padding: '7px 13px',
                  whiteSpace: 'nowrap',
                  boxShadow: `0 4px 20px rgba(0,0,0,0.5),0 0 14px ${venture.accent}22`,
                }}
              >
                <p
                  style={{
                    color: venture.accent,
                    fontFamily: 'Space Grotesk,sans-serif',
                    fontSize: '13px',
                    fontWeight: 700,
                    lineHeight: 1.2,
                    margin: 0,
                  }}
                >
                  {venture.name}
                </p>
                <p
                  style={{
                    color: 'rgba(240,239,255,0.55)',
                    fontFamily: 'Space Grotesk,sans-serif',
                    fontSize: '11px',
                    margin: '2px 0 0',
                  }}
                >
                  {venture.tagline}
                </p>
              </div>
            </Html>
          )}
        </group>
      </group>
    </>
  );
}
