'use client';

import { useEffect, useState } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? Math.round((scrolled / total) * 100) : 0;
      setPct(progress);
      setVisible(scrolled > 600);
      setDone(progress >= 99);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const pctStr = String(pct).padStart(3, '0');
  const filledBars = Math.round(pct / 20); // 5 bars total
  const spineSegments = 5;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-[9980] group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 400ms ease, transform 400ms ease',
        pointerEvents: visible ? 'auto' : 'none',
        background: 'rgba(0,0,6,0.92)',
        border: done
          ? '1px solid rgba(74,222,128,0.25)'
          : 'rgba(249,115,22,0.18) solid 1px',
        borderRadius: '3px',
        backdropFilter: 'blur(6px)',
        boxShadow: done
          ? '0 0 16px rgba(74,222,128,0.08)'
          : '0 0 16px rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'stretch',
        overflow: 'hidden',
      }}
      aria-label="Back to top"
    >
      {/* Left spine — vertical progress */}
      <div
        style={{
          width: '4px',
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: '1px',
          padding: '4px 0',
          background: 'rgba(255,255,255,0.03)',
          borderRight: done
            ? '1px solid rgba(74,222,128,0.15)'
            : '1px solid rgba(249,115,22,0.1)',
        }}
      >
        {Array.from({ length: spineSegments }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              margin: '0 1px',
              borderRadius: '1px',
              background: i < filledBars
                ? done ? 'rgba(74,222,128,0.7)' : 'rgba(249,115,22,0.7)'
                : 'rgba(255,255,255,0.08)',
              transition: 'background 300ms',
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div
        className="font-mono"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '6px 8px 6px 7px',
          gap: '3px',
        }}
      >
        {/* Top row: label */}
        <div
          style={{
            fontSize: '7px',
            letterSpacing: '0.18em',
            color: done ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.2)',
            textTransform: 'uppercase',
            transition: 'color 400ms',
          }}
        >
          {done ? '✓ complete' : '↑ top'}
        </div>

        {/* Bottom row: pct */}
        <div
          style={{
            fontSize: '11px',
            letterSpacing: '0.06em',
            fontWeight: 600,
            color: done ? 'rgba(74,222,128,0.9)' : 'rgba(249,115,22,0.85)',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
            transition: 'color 400ms',
          }}
        >
          {pctStr}
          <span style={{ fontSize: '8px', opacity: 0.6 }}>%</span>
        </div>
      </div>

      {/* Hover overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: done
            ? 'rgba(74,222,128,0.03)'
            : 'rgba(249,115,22,0.04)',
          opacity: 0,
          transition: 'opacity 200ms',
        }}
      />
    </button>
  );
}
