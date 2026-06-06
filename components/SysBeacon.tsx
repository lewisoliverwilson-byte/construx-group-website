'use client';

import { useEffect, useState } from 'react';

export default function SysBeacon() {
  const [visible, setVisible] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [time, setTime] = useState('');

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

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      setTime(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="fixed bottom-5 left-5 z-40 flex items-center gap-2.5 font-mono text-[8px] uppercase tracking-widest transition-all duration-700 select-none pointer-events-none"
      style={{
        opacity: visible ? 0.45 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-10px)',
      }}
      aria-hidden
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0 status-blink"
        style={{ background: '#4ade80', boxShadow: '0 0 4px rgba(74,222,128,0.5)' }}
      />
      <span style={{ color: 'rgba(240,239,255,0.5)' }}>CONSTRUX·SYS</span>
      <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
      <span style={{ color: 'rgba(240,239,255,0.28)' }} className="tabular-nums">
        {String(scrollPct).padStart(3, '0')}%
      </span>
      {time && (
        <>
          <span style={{ color: 'rgba(255,255,255,0.14)' }}>·</span>
          <span style={{ color: 'rgba(249,115,22,0.3)' }} className="tabular-nums tracking-tight">
            {time}
          </span>
        </>
      )}
    </div>
  );
}
