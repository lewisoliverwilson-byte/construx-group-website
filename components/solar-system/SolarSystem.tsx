'use client';

import { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import dynamic from 'next/dynamic';
import { ventures } from '@/lib/ventures';
import VenturePanel from './VenturePanel';
import DragHint from './DragHint';
import ListViewToggle from './ListViewToggle';
import MobilePlanets from './MobilePlanets';

const Scene = dynamic(() => import('./Scene'), { ssr: false });

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

export default function SolarSystem() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [, setHoveredId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedVenture = selectedId ? ventures.find((v) => v.id === selectedId) ?? null : null;

  const handlePlanetSelect = useCallback((_id: string, _pos: THREE.Vector3) => {
    setSelectedId((prev) => (prev === _id ? null : _id));
  }, []);

  const handleClose = useCallback(() => {
    setSelectedId(null);
    document.body.style.cursor = 'auto';
  }, []);

  const handleSunClick = useCallback(() => {
    setSelectedId(null);
  }, []);

  // Escape key to close panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleClose]);

  if (isMobile || reducedMotion) {
    return (
      <div className="relative min-h-screen">
        <MobilePlanets />
        <ListViewToggle />
      </div>
    );
  }

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-screen"
      style={{ touchAction: 'none' }}
    >
      <Canvas
        dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5)]}
        camera={{ position: [0, 9, 22], fov: 55, near: 0.1, far: 300 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          powerPreference: 'high-performance',
        }}
        style={{ background: '#000008' }}
        aria-label="Interactive solar system showing Construx Group ventures"
        role="img"
      >
        <Suspense fallback={null}>
          <Scene
            selectedId={selectedId}
            onPlanetSelect={handlePlanetSelect}
            onPlanetHover={setHoveredId}
            onSunClick={handleSunClick}
            reducedMotion={reducedMotion}
          />
        </Suspense>
      </Canvas>

      {/* DOM overlays */}
      <VenturePanel venture={selectedVenture} onClose={handleClose} />
      <DragHint />
      <ListViewToggle />

      {/* Accessible venture list (screen readers) */}
      <nav
        className="sr-only"
        aria-label="Ventures in the solar system"
      >
        <ul>
          {ventures.map((v) => (
            <li key={v.id}>
              <a href={`/ventures/${v.slug}`}>{v.name} — {v.tagline}</a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
