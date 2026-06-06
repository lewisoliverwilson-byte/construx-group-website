'use client';

import { useEffect, useState } from 'react';

export default function SysBeacon() {
  const [visible, setVisible] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(h > 0 ? Math.round((window.scrollY / h) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="fixed bottom-5 left-5 z-40 flex items-center gap-2 font-mono text-[8px] uppercase tracking-widest transition-all duration-700 select-none pointer-events-none"
      style={{
        opacity: visible ? 0.4 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-8px)',
      }}
      aria-hidden
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0 status-blink"
        style={{ background: '#4ade80' }}
      />
      <span style={{ color: 'rgba(240,239,255,0.6)' }}>
        CONSTRUX·SYS
      </span>
      <span style={{ color: 'rgba(240,239,255,0.3)' }} className="tabular-nums">
        {String(scrollPct).padStart(3, '0')}%
      </span>
    </div>
  );
}
