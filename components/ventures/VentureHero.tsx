'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import * as THREE from 'three';
import { ventures, type Venture } from '@/lib/ventures';

// ─── Per-venture 3D geometry configs ─────────────────────────────────────

function VentureGeometry({ index }: { index: number }) {
  switch (index) {
    case 0: return <octahedronGeometry args={[1.15, 0]} />;
    case 1: return <icosahedronGeometry args={[1.1, 0]} />;
    case 2: return <torusKnotGeometry args={[0.82, 0.26, 80, 16]} />;
    case 3: return <tetrahedronGeometry args={[1.32, 0]} />;
    default: return <dodecahedronGeometry args={[1.06, 0]} />;
  }
}

// ─── X positions for 5 objects ────────────────────────────────────────────
const X_POSITIONS = [-8.6, -4.3, 0, 4.3, 8.6];

// ─── Individual 3D venture object ─────────────────────────────────────────

interface VentureObjectProps {
  venture: Venture;
  isHovered: boolean;
  onHover: (idx: number) => void;
  idx: number;
}

function VentureObject({ venture, isHovered, onHover, idx }: VentureObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireMeshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshPhongMaterial>(null);
  const wireMat = useRef<THREE.MeshBasicMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  // Use refs to avoid stale closures in useFrame
  const isHoveredRef = useRef(isHovered);
  useEffect(() => { isHoveredRef.current = isHovered; }, [isHovered]);

  const accentColor = new THREE.Color(venture.accent);

  useFrame((state, delta) => {
    if (!meshRef.current || !matRef.current || !lightRef.current) return;

    const t = state.clock.elapsedTime;
    const hov = isHoveredRef.current;

    // Self-rotation
    meshRef.current.rotation.x += delta * (hov ? 0.28 : 0.62);
    meshRef.current.rotation.y += delta * (hov ? 0.36 : 0.78);

    // Float
    const floatY = -0.3 + Math.sin(t * 0.55 + idx * 1.35) * 0.22;
    meshRef.current.position.y += (floatY - meshRef.current.position.y) * 0.04;

    // Z depth on hover
    const targetZ = hov ? 3.8 : 0;
    meshRef.current.position.z += (targetZ - meshRef.current.position.z) * 0.09;
    if (lightRef.current) lightRef.current.position.z = meshRef.current.position.z + 1.5;

    // Scale
    const targetScale = hov ? 1.16 : 1.0;
    const cs = meshRef.current.scale.x;
    const ns = cs + (targetScale - cs) * 0.09;
    meshRef.current.scale.set(ns, ns, ns);
    if (wireMeshRef.current) wireMeshRef.current.scale.copy(meshRef.current.scale);

    // Emissive
    const targetEmit = hov ? 0.78 : 0.32;
    matRef.current.emissiveIntensity += (targetEmit - matRef.current.emissiveIntensity) * 0.09;

    // Wireframe opacity
    if (wireMat.current) {
      const targetWO = hov ? 0.3 : 0.07;
      wireMat.current.opacity += (targetWO - wireMat.current.opacity) * 0.08;
    }

    // Light intensity
    const targetLI = hov ? 4.2 : 1.1;
    lightRef.current.intensity += (targetLI - lightRef.current.intensity) * 0.08;
  });

  return (
    <group position={[X_POSITIONS[idx], 0, 0]}>
      <pointLight
        ref={lightRef}
        color={venture.accent}
        intensity={1.1}
        distance={14}
        position={[0, 0, 1.5]}
      />
      {/* Main mesh */}
      <mesh
        ref={meshRef}
        onPointerEnter={(e) => { e.stopPropagation(); onHover(idx); }}
        onPointerLeave={() => onHover(-1)}
      >
        <VentureGeometry index={venture.geometryIndex} />
        <meshPhongMaterial
          ref={matRef}
          color={accentColor.clone().multiplyScalar(0.14)}
          emissive={accentColor}
          emissiveIntensity={0.32}
          shininess={55}
          transparent
          opacity={0.84}
        />
      </mesh>
      {/* Wireframe overlay */}
      <mesh ref={wireMeshRef} position={[0, 0, 0]}>
        <VentureGeometry index={venture.geometryIndex} />
        <meshBasicMaterial
          ref={wireMat}
          color={venture.accent}
          wireframe
          transparent
          opacity={0.07}
        />
      </mesh>
    </group>
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────

function Scene({ hoveredIdx, onHover }: { hoveredIdx: number; onHover: (i: number) => void }) {
  const { camera } = useThree();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    camera.position.x = Math.sin(t * 0.04) * 0.55;
    camera.position.y = Math.sin(t * 0.03) * 0.22;
    camera.lookAt(0, -0.3, 0);
  });

  return (
    <>
      <ambientLight intensity={0.06} color="#0a0a20" />
      <fog attach="fog" args={['#000008', 18, 38]} />
      {ventures.map((v, i) => (
        <VentureObject
          key={v.id}
          venture={v}
          idx={i}
          isHovered={hoveredIdx === i}
          onHover={onHover}
        />
      ))}
    </>
  );
}

// ─── Info panel overlay ──────────────────────────────────────────────────

function InfoPanel({ idx }: { idx: number }) {
  const v = idx >= 0 ? ventures[idx] : null;

  return (
    <AnimatePresence>
      {v && (
        <motion.div
          key={v.id}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-1/2 right-10 -translate-y-1/2 z-20 pointer-events-none"
          style={{ width: 264 }}
        >
          <div
            className="glass rounded-lg px-7 py-6"
            style={{ borderTop: `2px solid ${v.accent}` }}
          >
            <p
              className="font-mono text-[9px] uppercase tracking-[0.22em] mb-3"
              style={{ color: v.accent }}
            >
              {v.category}
            </p>
            <h3
              className="text-[26px] leading-[0.94] mb-3 text-white/92"
              style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}
            >
              {v.name}
            </h3>
            <p className="text-[13px] text-white/42 leading-relaxed mb-5 font-light">
              {v.tagline}
            </p>
            <div className="flex items-center justify-between">
              <span
                className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] px-2.5 py-1.5 rounded-sm"
                style={
                  v.status === 'live'
                    ? { color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }
                    : { color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
                }
              >
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ background: v.status === 'live' ? '#4ade80' : 'rgba(255,255,255,0.35)' }}
                />
                {v.status === 'live' ? 'Live' : 'In Development'}
              </span>
              {v.url && (
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto font-mono text-[9px] uppercase tracking-wider flex items-center gap-1 transition-colors"
                  style={{ color: v.accent }}
                >
                  Visit <ArrowUpRight size={11} />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Venture labels below objects ────────────────────────────────────────

function VentureLabels({ hoveredIdx, canvasWidth }: { hoveredIdx: number; canvasWidth: number }) {
  // Approximate 2D X positions from 3D X positions
  // Camera is at z=20, fov=60 → at z=0, half-width ≈ tan(30°) * 20 = 11.55 units
  // Screen ratio: each unit = canvasWidth / (2 * 11.55)
  const unitPx = canvasWidth / (2 * 11.55);
  const centerX = canvasWidth / 2;

  return (
    <div className="absolute bottom-32 left-0 right-0 pointer-events-none select-none">
      {ventures.map((v, i) => {
        const screenX = centerX + X_POSITIONS[i] * unitPx;
        const isHov = hoveredIdx === i;
        return (
          <div
            key={v.id}
            className="absolute flex flex-col items-center gap-1 transition-all duration-300"
            style={{
              left: screenX,
              transform: 'translateX(-50%)',
              opacity: isHov ? 0 : 0.65,
            }}
          >
            <span
              className="text-[13px] text-white/65"
              style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 600, letterSpacing: '0.02em' }}
            >
              {v.name}
            </span>
            <span className="font-mono text-[8px] uppercase tracking-[0.18em]" style={{ color: v.accent }}>
              {v.category}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Mobile venture list (no 3D) ─────────────────────────────────────────

function MobileVentureList() {
  return (
    <div className="flex flex-col gap-3 px-5 w-full max-w-sm mx-auto">
      {ventures.map((v) => (
        <div
          key={v.id}
          className="glass rounded-md px-4 py-4"
          style={{ borderTop: `2px solid ${v.accent}` }}
        >
          <p className="font-mono text-[8px] uppercase tracking-[0.2em] mb-1.5" style={{ color: v.accent }}>
            {v.category}
          </p>
          <div className="flex items-center justify-between">
            <span
              className="text-[15px] text-white/85"
              style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 600 }}
            >
              {v.name}
            </span>
            {v.status === 'live' ? (
              <span className="font-mono text-[8px] text-emerald-400 uppercase tracking-wider">Live</span>
            ) : (
              <span className="font-mono text-[8px] text-white/25 uppercase tracking-wider">Dev</span>
            )}
          </div>
          <p className="text-[12px] text-white/35 mt-1 font-light">{v.tagline}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────

export default function VentureHero() {
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) setCanvasWidth(containerRef.current.offsetWidth);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-screen overflow-hidden" aria-label="Venture portfolio explorer">
      {/* 3D canvas — hidden on small screens */}
      <div className="absolute inset-0 hidden md:block">
        <Canvas
          camera={{ position: [0, 0, 20], fov: 60 }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
          style={{ background: '#000008' }}
          onPointerMissed={() => setHoveredIdx(-1)}
        >
          <Suspense fallback={null}>
            <Scene hoveredIdx={hoveredIdx} onHover={setHoveredIdx} />
          </Suspense>
        </Canvas>
      </div>

      {/* Mobile: plain dark bg */}
      <div className="absolute inset-0 md:hidden bg-void" />

      {/* Hero text overlay */}
      <div className="absolute inset-0 flex flex-col items-center pointer-events-none z-10">
        {/* Top spacer (nav height) */}
        <div className="h-16 flex-shrink-0" />

        {/* Centered title */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-5 select-none">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/28 mb-5"
          >
            A group of AI-native ventures
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
            className="text-display text-white/92 mb-5"
            style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700 }}
          >
            CONSTRUX<br />GROUP
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="text-[14px] text-white/32 font-light tracking-wide max-w-xs"
          >
            We build what only AI makes possible.
          </motion.p>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="pb-8 flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-white/18">
            Hover to explore
          </span>
          <div className="w-px h-6 bg-gradient-to-b from-white/15 to-transparent" />
        </motion.div>
      </div>

      {/* Desktop: 3D labels + info panel */}
      <div className="absolute inset-0 hidden md:block pointer-events-none z-20">
        {canvasWidth > 0 && (
          <VentureLabels hoveredIdx={hoveredIdx} canvasWidth={canvasWidth} />
        )}
        <InfoPanel idx={hoveredIdx} />
      </div>

      {/* Mobile: venture cards */}
      <div className="absolute bottom-0 left-0 right-0 md:hidden z-20 pb-8">
        <MobileVentureList />
      </div>
    </section>
  );
}
