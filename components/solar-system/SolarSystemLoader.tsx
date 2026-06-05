'use client';

import dynamic from 'next/dynamic';

function Skeleton() {
  return (
    <div
      className="w-full h-screen flex items-center justify-center"
      style={{ background: '#000008' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-20 w-20 rounded-full animate-glow-pulse"
          style={{
            background: 'radial-gradient(circle,#F97316,#C2410C)',
            boxShadow: '0 0 40px rgba(249,115,22,0.5)',
          }}
        />
        <p className="text-xs text-text-dim tracking-widest uppercase animate-pulse">
          Initialising
        </p>
      </div>
    </div>
  );
}

const SolarSystem = dynamic(() => import('./SolarSystem'), {
  ssr: false,
  loading: () => <Skeleton />,
});

export default function SolarSystemLoader() {
  return <SolarSystem />;
}
