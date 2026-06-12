'use client';

import { useEffect, useState, useRef } from 'react';

interface Section {
  id: string;
  label: string;
  top: number;
}

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Collect H2 headings for section markers
    const headings = Array.from(document.querySelectorAll('article h2'));
    const built: Section[] = headings.map((el) => ({
      id: el.id || '',
      label: el.textContent?.slice(0, 22) ?? '',
      top: (el as HTMLElement).offsetTop,
    }));
    setSections(built);

    let ticking = false;
    const update = () => {
      if (ticking) return;
      ticking = true;
      rafRef.current = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
        setProgress(pct);

        // Active section: last heading whose top is above scroll + 120px
        const threshold = scrollTop + 120;
        let active: string | null = null;
        for (const s of built) {
          if (s.top <= threshold) active = s.id;
        }
        setActiveSection(active);

        if (pct > 1) setVisible(true);
        ticking = false;
      });
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', update);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const pctInt = Math.round(progress);
  const pctStr = String(pctInt).padStart(3, '0');

  return (
    <>
      {/* Top progress bar — 2px with glow */}
      <div
        className="fixed top-0 left-0 right-0 z-[9998] pointer-events-none"
        style={{ height: '2px', background: 'rgba(255,255,255,0.04)' }}
        aria-hidden="true"
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #F97316 0%, #FB923C 60%, #FDE68A 100%)',
            boxShadow: '0 0 8px rgba(249,115,22,0.7), 0 0 2px rgba(249,115,22,0.9)',
            transition: 'width 80ms linear',
          }}
        />
        {/* Leading edge pulse */}
        {progress > 0 && progress < 100 && (
          <div
            style={{
              position: 'absolute',
              top: '-1px',
              left: `${progress}%`,
              transform: 'translateX(-50%)',
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: '#FDE68A',
              boxShadow: '0 0 6px 2px rgba(253,230,138,0.8)',
            }}
          />
        )}
      </div>

      {/* Section tick marks */}
      {sections.length > 0 && (
        <div
          className="fixed top-0 left-0 right-0 z-[9997] pointer-events-none"
          style={{ height: '2px' }}
          aria-hidden="true"
        >
          {sections.map((s) => {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const tickPct = docHeight > 0 ? (s.top / docHeight) * 100 : 0;
            const isActive = s.id === activeSection;
            return (
              <div
                key={s.id}
                style={{
                  position: 'absolute',
                  left: `${Math.min(tickPct, 99)}%`,
                  top: 0,
                  width: '1px',
                  height: '4px',
                  background: isActive
                    ? 'rgba(253,230,138,0.9)'
                    : 'rgba(255,255,255,0.2)',
                  boxShadow: isActive ? '0 0 4px rgba(253,230,138,0.6)' : 'none',
                  transition: 'background 300ms, box-shadow 300ms',
                }}
              />
            );
          })}
        </div>
      )}

      {/* Floating read % chip — appears after scrolling starts */}
      <div
        className="fixed z-[9997] pointer-events-none"
        style={{
          top: '14px',
          right: '16px',
          opacity: visible ? 0.7 : 0,
          transition: 'opacity 600ms ease',
        }}
        aria-hidden="true"
      >
        <div
          className="font-mono"
          style={{
            fontSize: '9px',
            letterSpacing: '0.12em',
            color: progress >= 99 ? '#4ade80' : 'rgba(249,115,22,0.85)',
            background: 'rgba(0,0,6,0.75)',
            border: `1px solid ${progress >= 99 ? 'rgba(74,222,128,0.25)' : 'rgba(249,115,22,0.2)'}`,
            borderRadius: '2px',
            padding: '3px 6px',
            backdropFilter: 'blur(4px)',
            transition: 'color 400ms, border-color 400ms',
          }}
        >
          {progress >= 99 ? '✓ READ' : `${pctStr}%`}
        </div>
      </div>
    </>
  );
}
