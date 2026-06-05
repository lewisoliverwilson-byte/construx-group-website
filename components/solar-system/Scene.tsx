'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import Sun from './Sun';
import Planet from './Planet';
import AsteroidBelt from './AsteroidBelt';
import { ventures } from '@/lib/ventures';

interface Props {
  selectedId: string | null;
  onPlanetSelect: (id: string, worldPos: THREE.Vector3) => void;
  onPlanetHover: (id: string | null) => void;
  onSunClick: () => void;
  reducedMotion: boolean;
}

const DEFAULT_CAM_POS = new THREE.Vector3(0, 9, 22);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

interface CameraAnim {
  active: boolean;
  camPos: THREE.Vector3;
  lookAt: THREE.Vector3;
}

export default function Scene({
  selectedId,
  onPlanetSelect,
  onPlanetHover,
  onSunClick,
  reducedMotion,
}: Props) {
  const { camera } = useThree();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const anim = useRef<CameraAnim>({
    active: false,
    camPos: DEFAULT_CAM_POS.clone(),
    lookAt: DEFAULT_TARGET.clone(),
  });
  const prevSelectedId = useRef<string | null>(null);

  // Ambient fill
  useEffect(() => {
    camera.position.copy(DEFAULT_CAM_POS);
    camera.lookAt(DEFAULT_TARGET);
  }, [camera]);

  const flyTo = useCallback(
    (pos: THREE.Vector3, lookAt: THREE.Vector3) => {
      if (reducedMotion) {
        camera.position.copy(pos);
        if (controlsRef.current) {
          controlsRef.current.target.copy(lookAt);
          controlsRef.current.update();
        }
        return;
      }
      anim.current = { active: true, camPos: pos.clone(), lookAt: lookAt.clone() };
    },
    [camera, reducedMotion],
  );

  // React to planet selection
  useEffect(() => {
    if (selectedId && selectedId !== prevSelectedId.current) {
      const venture = ventures.find((v) => v.id === selectedId);
      if (venture) {
        // Approximate world position at zero orbit angle
        const approxPos = new THREE.Vector3(venture.orbitRadius, 0, 0);
        const offset = approxPos.clone().normalize().multiplyScalar(venture.planetSize + 4);
        const camTarget = approxPos.clone().add(new THREE.Vector3(offset.x, 2.5, offset.z + 2));
        flyTo(camTarget, approxPos);
        if (controlsRef.current) controlsRef.current.autoRotate = false;
      }
    } else if (!selectedId && prevSelectedId.current) {
      flyTo(DEFAULT_CAM_POS, DEFAULT_TARGET);
      if (controlsRef.current) controlsRef.current.autoRotate = !reducedMotion;
    }
    prevSelectedId.current = selectedId;
  }, [selectedId, flyTo, reducedMotion]);

  useFrame(() => {
    if (!anim.current.active) return;
    const speed = 0.048;
    camera.position.lerp(anim.current.camPos, speed);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(anim.current.lookAt, speed);
      controlsRef.current.update();
    }
    if (camera.position.distanceTo(anim.current.camPos) < 0.15) {
      anim.current.active = false;
    }
  });

  return (
    <>
      {/* Ambient + directional light */}
      <ambientLight intensity={0.12} color="#1a0a2e" />
      <directionalLight position={[10, 10, 5]} intensity={0.3} color="#FDE68A" />

      {/* Stars */}
      <Stars
        radius={120}
        depth={60}
        count={6000}
        factor={4}
        saturation={0.2}
        fade
        speed={reducedMotion ? 0 : 0.4}
      />

      {/* Sun */}
      <Sun onClick={onSunClick} />

      {/* Planets */}
      {ventures.map((venture) => (
        <Planet
          key={venture.id}
          venture={venture}
          isSelected={selectedId === venture.id}
          onSelect={(id, pos) => {
            onPlanetSelect(id, pos);
          }}
          onHover={onPlanetHover}
          isPanelOpen={selectedId !== null}
        />
      ))}

      {/* Incubation asteroid belt */}
      <AsteroidBelt />

      {/* Post-processing */}
      {!reducedMotion && (
        <EffectComposer>
          <Bloom
            intensity={1.4}
            luminanceThreshold={0.55}
            luminanceSmoothing={0.85}
            mipmapBlur
          />
        </EffectComposer>
      )}

      {/* Camera controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom
        zoomSpeed={0.7}
        minDistance={6}
        maxDistance={40}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.72}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.28}
        dampingFactor={0.08}
        enableDamping
        makeDefault
      />
    </>
  );
}
