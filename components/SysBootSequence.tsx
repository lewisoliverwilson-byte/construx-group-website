'use client';

import { useEffect, useState, useRef } from 'react';

interface Line {
  text: string;
  color?: string;
  delay: number;
  indent?: boolean;
}

const LINES: Line[] = [
  { text: '> construx/runtime v2.6.0 — boot init', color: 'rgba(255,255,255,0.3)', delay: 0 },
  { text: '> loading venture registry...', color: 'rgba(255,255,255,0.2)', delay: 320 },
  { text: '  ✓ scoutr         [resell-intelligence]   OK  — port 3001', color: '#C8F50C', delay: 640, indent: true },
  { text: '  ✓ the-marqet     [ai-marketplace]        OK  — port 3002', color: '#3B82F6', delay: 820, indent: true },
  { text: '  ✓ the-hyve       [ai-workspace]          OK  — port 3003', color: '#8B5CF6', delay: 1000, indent: true },
  { text: '> mounting ai subsystems...', color: 'rgba(255,255,255,0.2)', delay: 1280 },
  { text: '  ✓ claude-api     p50:312ms   quota:  OK', color: '#a78bfa', delay: 1540, indent: true },
  { text: '  ✓ embeddings     vector(1536) pgvector:OK', color: '#a78bfa', delay: 1700, indent: true },
  { text: '  ✓ stripe         webhooks:OK  sig:verified', color: '#a78bfa', delay: 1860, indent: true },
  { text: '> running pre-flight checks...', color: 'rgba(255,255,255,0.2)', delay: 2080 },
  { text: '  ✓ db:connections 8/20 healthy', color: '#4ade80', delay: 2240, indent: true },
  { text: '  ✓ redis:PONG    cache warm 94%', color: '#4ade80', delay: 2360, indent: true },
  { text: '  ✓ cdn:edge      17 locations synced', color: '#4ade80', delay: 2480, indent: true },
  { text: '> system nominal — all services online', color: '#4ade80', delay: 2680 },
];

export default function SysBootSequence() {
  const [visible, setVisible] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  const done = revealed >= LINES.length;
  const progress = done ? 100 : Math.round((revealed / LINES.length) * 100);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          setVisible(true);
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    LINES.forEach((line, idx) => {
      const t = setTimeout(() => setRevealed(idx + 1), line.delay);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  return (
    <div
      ref={ref}
      className="px-5 mx-auto max-w-5xl overflow-hidden"
      aria-hidden="true"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}
    >
      <div
        className="overflow-hidden"
        style={{
          background: 'rgba(0,0,6,0.82)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '3px',
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-2 px-4 py-2.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
        >
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: 'rgba(255,95,87,0.8)' }} />
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: 'rgba(255,189,46,0.8)' }} />
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: 'rgba(40,200,64,0.8)' }} />
          <span className="flex-1 text-center font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            construx — runtime boot — bash
          </span>
          <span className="font-mono text-[9px] tabular-nums" style={{ color: done ? 'rgba(74,222,128,0.6)' : 'rgba(255,255,255,0.2)' }}>
            {String(progress).padStart(3, '0')}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div
            className="h-full"
            style={{
              width: `${progress}%`,
              background: done ? 'rgba(74,222,128,0.5)' : 'rgba(249,115,22,0.45)',
              transition: 'width 0.35s ease, background 0.6s ease',
            }}
          />
        </div>

        {/* Lines */}
        <div className="px-6 py-5 space-y-1 min-h-[160px]">
          {LINES.slice(0, revealed).map((line, i) => (
            <p
              key={i}
              className="font-mono text-[9px] leading-relaxed whitespace-pre"
              style={{
                color: line.color ?? 'rgba(255,255,255,0.22)',
                animation: 'bootLine 0.18s ease-out both',
              }}
            >
              {line.text}
            </p>
          ))}
          {revealed > 0 && !done && (
            <span
              className="inline-block w-1.5 h-3 align-middle"
              style={{ background: 'rgba(249,115,22,0.55)', animation: 'bootCursor 0.7s step-end infinite' }}
            />
          )}
          {done && (
            <div className="flex items-center gap-2 pt-1">
              <span className="w-1.5 h-1.5 rounded-full status-blink flex-shrink-0" style={{ background: '#4ade80' }} />
              <span className="font-mono text-[9px]" style={{ color: 'rgba(74,222,128,0.5)' }}>
                construx@sys:~$
              </span>
              <span
                className="inline-block w-1.5 h-3 align-middle"
                style={{ background: 'rgba(74,222,128,0.4)', animation: 'bootCursor 1.1s step-end infinite' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
