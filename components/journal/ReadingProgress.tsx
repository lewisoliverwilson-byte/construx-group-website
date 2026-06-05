'use client';

import { useEffect, useState } from 'react';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9998] h-px pointer-events-none"
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      <div
        className="h-full transition-none"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #F97316, #FB923C)',
          boxShadow: '0 0 6px rgba(249,115,22,0.6)',
        }}
      />
    </div>
  );
}
