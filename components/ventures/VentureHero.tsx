'use client';

import { useRef, useState, useEffect, useMemo, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import * as THREE from 'three';
import { ventures, type Venture } from '@/lib/ventures';

// Camera constants — vertical fov, so half-height in world units = tan(fov/2) * camZ
const CAM_Z = 16;
const FOV_V = 60;
const HALF_H = Math.tan((FOV_V / 2) * (Math.PI / 180)) * CAM_Z; // ~9.24 world units

// 5 ventures spread across the horizontal axis
const X_POS = [-7.2, -3.6, 0, 3.6, 7.2];

// ─── GLSL: holographic fresnel shader ────────────────────────────────────

const VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(-mvPos.xyz);
  gl_Position = projectionMatrix * mvPos;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uHover;
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
  float fresnel = pow(1.0 - clamp(dot(vNormal, vViewDir), 0.0, 1.0), 2.4);
  float intensity = fresnel * (2.0 + uHover * 1.2) + 0.02;
  vec3 color = uColor * intensity;
  float alpha = clamp(fresnel * 0.9 + 0.02, 0.0, 1.0);
  gl_FragColor = vec4(color, alpha);
}
`;

// ─── Particle starfield ───────────────────────────────────────────────────

function StarField() {
  const ptsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 340;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 48;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 18 - 5;
    }
    return arr;
  }, []);

  useFrame((s) => {
    if (ptsRef.current) {
      ptsRef.current.rotation.y = s.clock.elapsedTime * 0.005;
      ptsRef.current.rotation.x = s.clock.elapsedTime * 0.003;
    }
  });

  return (
    <points ref={ptsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#ffffff" transparent opacity={0.28} sizeAttenuation />
    </points>
  );
}

// ─── Per-venture geometry ─────────────────────────────────────────────────

function VentureGeometry({ index }: { index: number }) {
  switch (index) {
    case 0:  return <octahedronGeometry args={[1.55, 0]} />;
    case 1:  return <icosahedronGeometry args={[1.5, 0]} />;
    case 2:  return <torusKnotGeometry args={[1.0, 0.32, 96, 16]} />;
    case 3:  return <tetrahedronGeometry args={[1.7, 0]} />;
    default: return <dodecahedronGeometry args={[1.42, 0]} />;
  }
}

// ─── Venture 3D object ────────────────────────────────────────────────────

interface VentureObjProps {
  venture: Venture;
  isHovered: boolean;
  onHover: (idx: number) => void;
  idx: number;
  cursorNX: number;
}

function VentureObj({ venture, isHovered, onHover, idx, cursorNX }: VentureObjProps) {
  const meshRef   = useRef<THREE.Mesh>(null);
  const wireRef   = useRef<THREE.Mesh>(null);
  const wireMat   = useRef<THREE.MeshBasicMaterial>(null);
  const lightRef  = useRef<THREE.PointLight>(null);
  const groupRef  = useRef<THREE.Group>(null);

  const isHovRef  = useRef(isHovered);
  useEffect(() => { isHovRef.current = isHovered; }, [isHovered]);
  const cursorRef = useRef(cursorNX);
  useEffect(() => { cursorRef.current = cursorNX; }, [cursorNX]);

  // Stable uniforms object — mutated directly in useFrame for performance
  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(venture.accent) },
    uHover: { value: 0 },
  }), [venture.accent]);

  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader:   VERT,
    fragmentShader: FRAG,
    uniforms,
    transparent:    true,
    side:           THREE.DoubleSide,
    depthWrite:     false,
    blending:       THREE.AdditiveBlending,
  }), [uniforms]);

  useFrame((state, delta) => {
    if (!meshRef.current || !lightRef.current || !groupRef.current) return;
    const t   = state.clock.elapsedTime;
    const hov = isHovRef.current;

    // Shader hover uniform
    uniforms.uHover.value += ((hov ? 1.0 : 0.0) - uniforms.uHover.value) * 0.07;

    // Rotation (slower when hovered — draws attention)
    meshRef.current.rotation.x += delta * (hov ? 0.18 : 0.42);
    meshRef.current.rotation.y += delta * (hov ? 0.25 : 0.56);

    // Float
    meshRef.current.position.y += (Math.sin(t * 0.5 + idx * 1.3) * 0.28 - meshRef.current.position.y) * 0.035;

    // Z push toward camera on hover
    const targetZ = hov ? 5.0 : 0;
    meshRef.current.position.z += (targetZ - meshRef.current.position.z) * 0.09;

    // Scale
    const cs = meshRef.current.scale.x;
    const ns = cs + ((hov ? 1.22 : 1.0) - cs) * 0.09;
    meshRef.current.scale.set(ns, ns, ns);

    // Sync wireframe to main mesh
    if (wireRef.current) {
      wireRef.current.rotation.copy(meshRef.current.rotation);
      wireRef.current.position.copy(meshRef.current.position);
      wireRef.current.scale.copy(meshRef.current.scale);
    }

    // Point light
    lightRef.current.position.z = meshRef.current.position.z + 2.5;
    lightRef.current.intensity += ((hov ? 7 : 1.5) - lightRef.current.intensity) * 0.08;

    // Wireframe opacity
    if (wireMat.current) {
      wireMat.current.opacity += ((hov ? 0.42 : 0.08) - wireMat.current.opacity) * 0.08;
    }

    // Cursor lean — group rotates slightly toward cursor
    const objNX = X_POS[idx] / (HALF_H * 1.8);
    const lean  = (cursorRef.current - objNX) * 0.1;
    groupRef.current.rotation.y += (lean - groupRef.current.rotation.y) * 0.04;
  });

  return (
    <group ref={groupRef} position={[X_POS[idx], 0, 0]}>
      <pointLight ref={lightRef} color={venture.accent} intensity={1.5} distance={20} position={[0, 0, 2.5]} />
      {/* Holographic mesh */}
      <mesh
        ref={meshRef}
        material={material}
        onPointerEnter={(e) => { e.stopPropagation(); onHover(idx); }}
        onPointerLeave={() => onHover(-1)}
      >
        <VentureGeometry index={venture.geometryIndex} />
      </mesh>
      {/* Wireframe structural lines */}
      <mesh ref={wireRef}>
        <VentureGeometry index={venture.geometryIndex} />
        <meshBasicMaterial ref={wireMat} color={venture.accent} wireframe transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────

function Scene({ hoveredIdx, onHover, cursorNX }: { hoveredIdx: number; onHover: (i: number) => void; cursorNX: number }) {
  const { camera } = useThree();
  const cursorRef  = useRef(cursorNX);
  useEffect(() => { cursorRef.current = cursorNX; }, [cursorNX]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Camera drifts gently, following cursor subtly
    camera.position.x = cursorRef.current * 0.5 + Math.sin(t * 0.028) * 0.28;
    camera.position.y = Math.sin(t * 0.022) * 0.14;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.04} color="#060618" />
      <StarField />
      {ventures.map((v, i) => (
        <VentureObj
          key={v.id}
          venture={v}
          idx={i}
          isHovered={hoveredIdx === i}
          onHover={onHover}
          cursorNX={cursorNX}
        />
      ))}
    </>
  );
}

// ─── Bottom info panel (hover detail) ────────────────────────────────────

function InfoPanel({ idx }: { idx: number }) {
  const v = idx >= 0 ? ventures[idx] : null;

  return (
    <AnimatePresence>
      {v && (
        <motion.div
          key={v.id}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          style={{ width: 360 }}
        >
          <div
            className="glass rounded-lg px-8 py-5 text-center"
            style={{ borderTop: `2px solid ${v.accent}` }}
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] mb-2" style={{ color: v.accent }}>
              {v.category}
            </p>
            <h3
              className="text-[26px] leading-none mb-2.5 text-white/92"
              style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}
            >
              {v.name}
            </h3>
            <p className="text-[13px] text-white/40 leading-relaxed mb-4 font-light">
              {v.tagline}
            </p>
            <div className="flex items-center justify-center gap-4">
              <span
                className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] px-2.5 py-1.5 rounded-sm"
                style={
                  v.status === 'live'
                    ? { color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }
                    : { color: 'rgba(255,255,255,0.32)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
                }
              >
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ background: v.status === 'live' ? '#4ade80' : 'rgba(255,255,255,0.32)' }}
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

// ─── Venture labels (below objects) ──────────────────────────────────────

interface LabelsProps { hoveredIdx: number; canvasW: number; canvasH: number; }

function VentureLabels({ hoveredIdx, canvasW, canvasH }: LabelsProps) {
  // Three.js fov is vertical.
  // half-height in world units = HALF_H
  // 1 world unit = canvasH / (2 * HALF_H) pixels — same for both X and Y
  const unitPx = canvasH / (2 * HALF_H);
  const cx = canvasW / 2;
  // Place labels 2.4 world units below object centre (Y=0)
  const labelTop = canvasH / 2 + 2.4 * unitPx;

  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      {ventures.map((v, i) => {
        const sx    = cx + X_POS[i] * unitPx;
        const isHov = hoveredIdx === i;
        return (
          <div
            key={v.id}
            className="absolute flex flex-col items-center gap-1 transition-all duration-300"
            style={{
              left:      sx,
              top:       labelTop,
              transform: 'translateX(-50%)',
              opacity:   hoveredIdx >= 0 ? (isHov ? 0 : 0.28) : 0.65,
            }}
          >
            <span
              className="text-[13px] text-white/68"
              style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 600 }}
            >
              {v.name}
            </span>
            <span
              className="font-mono text-[8px] uppercase tracking-[0.2em]"
              style={{ color: v.accent }}
            >
              {v.category}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Mobile list ──────────────────────────────────────────────────────────

function MobileVentureList() {
  return (
    <div className="flex flex-col gap-3 px-5 w-full max-w-sm mx-auto">
      {ventures.map((v) => (
        <div key={v.id} className="glass rounded-md px-4 py-4" style={{ borderTop: `2px solid ${v.accent}` }}>
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
            {v.status === 'live'
              ? <span className="font-mono text-[8px] text-emerald-400 uppercase tracking-wider">Live</span>
              : <span className="font-mono text-[8px] text-white/25 uppercase tracking-wider">Dev</span>
            }
          </div>
          <p className="text-[12px] text-white/35 mt-1 font-light">{v.tagline}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────

export default function VentureHero() {
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const [dims, setDims]             = useState({ w: 0, h: 0 });
  const [cursorNX, setCursorNX]     = useState(0);
  const containerRef                = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDims({ w: containerRef.current.offsetWidth, h: containerRef.current.offsetHeight });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Normalized cursor X for cursor-reactive effects
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCursorNX((e.clientX - rect.left) / rect.width * 2 - 1);
  }, []);

  // Keyboard 1-5 selects ventures; Escape clears
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '5') {
        const i = parseInt(e.key) - 1;
        setHoveredIdx(prev => prev === i ? -1 : i);
      }
      if (e.key === 'Escape') setHoveredIdx(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const liveCount = ventures.length;

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
      aria-label="Venture portfolio"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setCursorNX(0)}
    >
      {/* Full-screen 3D canvas — desktop */}
      <div className="absolute inset-0 hidden md:block">
        <Canvas
          camera={{ position: [0, 0, CAM_Z], fov: FOV_V }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
          style={{ background: '#000008' }}
          onPointerMissed={() => setHoveredIdx(-1)}
        >
          <Suspense fallback={null}>
            <Scene hoveredIdx={hoveredIdx} onHover={setHoveredIdx} cursorNX={cursorNX} />
          </Suspense>
        </Canvas>
      </div>

      {/* Mobile bg */}
      <div className="absolute inset-0 md:hidden" style={{ background: '#000008' }} />

      {/* ── Top-left identity — never overlaps the 3D objects ── */}
      <div className="absolute top-0 left-0 right-0 z-10 pt-20 px-8 pointer-events-none hidden md:flex items-start justify-between">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/22 mb-1.5">
            Portfolio
          </p>
          <h1
            className="text-[20px] text-white/86"
            style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700, letterSpacing: '-0.01em' }}
          >
            Construx Group
          </h1>
          <p className="mt-1 font-mono text-[9px] text-white/22 leading-relaxed">
            We build what only AI makes possible.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="text-right mt-1 space-y-0.5"
        >
          <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/18">
            {liveCount} ventures live
          </p>
        </motion.div>
      </div>

      {/* ── Desktop overlays: labels + info ── */}
      <div className="absolute inset-0 hidden md:block pointer-events-none z-20">
        {dims.w > 0 && dims.h > 0 && (
          <VentureLabels hoveredIdx={hoveredIdx} canvasW={dims.w} canvasH={dims.h} />
        )}
        <InfoPanel idx={hoveredIdx} />
      </div>

      {/* Keyboard hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.7 }}
        className="absolute bottom-5 right-7 hidden md:block pointer-events-none z-10"
      >
        <p className="font-mono text-[7px] uppercase tracking-[0.22em] text-white/12">
          Press 1–5 or hover
        </p>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5 pointer-events-none z-10"
      >
        <div className="w-px h-7 bg-gradient-to-b from-white/10 to-transparent" />
        <span className="font-mono text-[7px] uppercase tracking-[0.22em] text-white/14">Scroll</span>
      </motion.div>

      {/* ── Mobile layout ── */}
      <div className="md:hidden absolute inset-0 flex flex-col items-center justify-between py-28 z-10">
        <div className="text-center px-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/25 mb-3">Portfolio</p>
          <h1
            className="text-[30px] text-white/90 leading-none"
            style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}
          >
            Construx Group
          </h1>
          <p className="mt-3 text-[13px] text-white/35 font-light">
            We build what only AI makes possible.
          </p>
        </div>
        <MobileVentureList />
      </div>
    </section>
  );
}
