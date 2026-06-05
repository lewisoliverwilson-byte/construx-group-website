'use client';

import * as THREE from 'three';

interface Props {
  radius: number;
  highlighted?: boolean;
}

export default function OrbitRing({ radius, highlighted = false }: Props) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.015, radius + 0.015, 256]} />
      <meshBasicMaterial
        color={highlighted ? '#F97316' : '#FFFFFF'}
        transparent
        opacity={highlighted ? 0.15 : 0.04}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
