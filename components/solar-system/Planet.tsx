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
      const targetScale = hovered || isSelected ? 1.25 : 1.0;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1,
      );
    }

    if (atmoRef.current) {
      const targetOpacity = hovered || isSelected ? 0.22 : 0.07;
      const mat = atmoRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.08);
      const ts = hovered || isSelected ? 1.35 : 1.22;
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

  const active = hovered || isSelected;
  const labelOpacity = active ? 1 : 0.62;

  return (
    <>
      <OrbitRing radius={venture.orbitRadius} highlighted={isSelected} />
      <group ref={orbitGroupRef}>
        <group position={[venture.orbitRadius, 0, 0]}>
          <pointLight
            color={venture.accent}
            intensity={active ? 10 : 4}
            distance={5}
            decay={2}
          />

          {/* Atmosphere */}
          <mesh ref={atmoRef}>
            <sphereGeometry args={[venture.planetSize * 1.22, 16, 16]} />
            <meshBasicMaterial
              color={venture.accent}
              transparent
              opacity={0.07}
              side={THREE.BackSide}
            />
          </mesh>

          {/* Planet sphere */}
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
              emissiveIntensity={active ? 1.1 : 0.32}
              roughness={0.5}
              metalness={0.4}
            />
          </mesh>

          {/* Invisible larger hit sphere — makes hover/click much easier to trigger */}
          <mesh
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            visible={false}
          >
            <sphereGeometry args={[venture.planetSize * 2.4, 16, 16]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>

          {/* Always-visible HUD label above the planet */}
          <Html
            center
            position={[0, venture.planetSize + 0.82, 0]}
            distanceFactor={9}
            zIndexRange={[200, 0]}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div
              style={{
                position: 'relative',
                background: active ? 'rgba(3,3,14,0.97)' : 'rgba(3,3,14,0.8)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: `1px solid ${venture.accent}${active ? '40' : '1a'}`,
                borderRadius: '2px',
                padding: '5px 22px 5px 8px',
                whiteSpace: 'nowrap',
                minWidth: '88px',
                boxShadow: active
                  ? `0 0 20px ${venture.accent}22, 0 2px 16px rgba(0,0,0,0.7)`
                  : '0 1px 8px rgba(0,0,0,0.6)',
                transform: `scale(${active ? 1.08 : 1})`,
                transition: 'all 0.2s ease',
                opacity: labelOpacity,
              }}
            >
              {/* Corner: top-left */}
              <span style={{
                position: 'absolute', top: -1, left: -1, width: 5, height: 5,
                borderTop: `1.5px solid ${venture.accent}`,
                borderLeft: `1.5px solid ${venture.accent}`,
              }} />
              {/* Corner: bottom-right */}
              <span style={{
                position: 'absolute', bottom: -1, right: -1, width: 5, height: 5,
                borderBottom: `1.5px solid ${venture.accent}`,
                borderRight: `1.5px solid ${venture.accent}`,
              }} />
              {/* Status dot */}
              <span style={{
                position: 'absolute', top: 5, right: 7,
                width: 4, height: 4, borderRadius: '50%',
                backgroundColor: venture.accent,
                opacity: active ? 1 : 0.55,
                boxShadow: active ? `0 0 6px ${venture.accent}` : 'none',
              }} />
              {/* Name */}
              <p style={{
                color: venture.accent,
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                lineHeight: 1.2,
                margin: 0,
              }}>
                {venture.name}
              </p>
              {/* Category in monospace */}
              <p style={{
                color: 'rgba(240,239,255,0.38)',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: '7.5px',
                fontWeight: 500,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                margin: '2px 0 0',
              }}>
                {venture.category}
              </p>
            </div>
          </Html>
        </group>
      </group>
    </>
  );
}
