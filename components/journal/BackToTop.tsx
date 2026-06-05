'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? Math.round((scrolled / total) * 100) : 0;
      setPct(progress);
      setVisible(scrolled > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-[9980] flex items-center gap-2 px-3 py-2 font-mono text-[9px] text-text-dim hover:text-construx transition-all uppercase tracking-widest group"
      style={{
        background: 'rgba(5,5,18,0.92)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '2px',
        backdropFilter: 'blur(4px)',
      }}
      aria-label="Back to top"
    >
      <ArrowUp size={11} className="group-hover:-translate-y-0.5 transition-transform" />
      <span className="tabular-nums">{String(pct).padStart(3, '0')}%</span>
    </button>
  );
}
