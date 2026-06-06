'use client';

import { useState, useEffect } from 'react';

const SECTIONS = [
  { num: '01', label: 'AI is not the product.' },
  { num: '02', label: 'Small team, full stack.' },
  { num: '03', label: 'Revenue first.' },
  { num: '04', label: 'Ownership over delegation.' },
  { num: '05', label: 'Build in public. Own the record.' },
];

export default function ManifestoNav() {
  const [active, setActive] = useState<string>('');
  const [readPct, setReadPct] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    SECTIONS.forEach(({ num }) => {
      const el = document.getElementById(num);
      if (el) observer.observe(el);
    });

    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setReadPct(total > 0 ? Math.min(100, Math.round((scrolled / total) * 100)) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      className="fixed right-6 top-1/2 -translate-y-1/2 z-10 hidden xl:flex flex-col overflow-hidden"
      style={{
        background: 'rgba(3,3,14,0.92)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '3px',
        width: '200px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-3 px-3 py-2 border-b border-border select-none"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ background: '#FF5F57' }} />
          <span className="w-2 h-2 rounded-full" style={{ background: '#FFBD2E' }} />
          <span className="w-2 h-2 rounded-full" style={{ background: '#28C840' }} />
        </div>
        <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-text-dim flex-1 text-center">
          manifesto.nav
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${readPct}%`, background: 'rgba(249,115,22,0.5)' }}
        />
      </div>

      {/* Section list */}
      <nav className="p-2 flex flex-col gap-0.5">
        {SECTIONS.map(({ num, label }) => {
          const isActive = active === num;
          return (
            <a
              key={num}
              href={`#${num}`}
              className="flex items-start gap-2.5 px-2 py-1.5 transition-colors group"
              style={{
                borderRadius: '2px',
                background: isActive ? 'rgba(249,115,22,0.1)' : 'transparent',
              }}
            >
              <span
                className="font-mono text-[9px] font-bold tabular-nums flex-shrink-0 pt-px transition-colors"
                style={{ color: isActive ? '#f97316' : 'rgba(255,255,255,0.2)' }}
              >
                {num}
              </span>
              <span
                className="font-mono text-[9px] leading-tight transition-colors"
                style={{
                  color: isActive ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.3)',
                }}
              >
                {label}
              </span>
            </a>
          );
        })}
      </nav>

      {/* Footer: read % */}
      <div
        className="px-3 py-2 border-t border-border flex items-center justify-between"
        style={{ background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="font-mono text-[8px] text-text-dim uppercase tracking-widest">read</span>
        <span
          className="font-mono text-[9px] tabular-nums"
          style={{ color: readPct === 100 ? '#28C840' : 'rgba(249,115,22,0.6)' }}
        >
          {readPct}%
        </span>
      </div>
    </div>
  );
}
