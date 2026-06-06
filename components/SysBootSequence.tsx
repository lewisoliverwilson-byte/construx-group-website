'use client';

import { useEffect, useState, useRef } from 'react';

interface Line {
  text: string;
  color?: string;
  delay: number;
}

const LINES: Line[] = [
  { text: '> construx/runtime v2.6.0 — boot init', color: 'rgba(255,255,255,0.25)', delay: 0 },
  { text: '> loading venture registry...', color: 'rgba(255,255,255,0.2)', delay: 320 },
  { text: '  ✓ scoutr         [resell-intelligence]   OK', color: '#C8F50C', delay: 640 },
  { text: '  ✓ the-marqet     [ai-marketplace]        OK', color: '#3B82F6', delay: 820 },
  { text: '  ✓ the-hyve       [ai-workspace]          OK', color: '#8B5CF6', delay: 1000 },
  { text: '> mounting ai subsystems...', color: 'rgba(255,255,255,0.2)', delay: 1280 },
  { text: '  ✓ claude-api     p50:312ms   quota:OK', color: '#a78bfa', delay: 1540 },
  { text: '  ✓ embeddings     vector(1536) pgvector', color: '#a78bfa', delay: 1700 },
  { text: '> system nominal — uptime tracking active', color: '#4ade80', delay: 2000 },
];

export default function SysBootSequence() {
  const [visible, setVisible] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

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
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let i = 0;
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
    >
      <div
        className="px-6 py-5 overflow-hidden"
        style={{
          background: 'rgba(0,0,6,0.8)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '3px',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      >
        <div className="space-y-1">
          {LINES.slice(0, revealed).map((line, i) => (
            <p
              key={i}
              className="font-mono text-[9px] leading-relaxed whitespace-pre"
              style={{
                color: line.color ?? 'rgba(255,255,255,0.22)',
                animation: 'bootLine 0.2s ease-out both',
              }}
            >
              {line.text}
            </p>
          ))}
          {revealed > 0 && revealed < LINES.length && (
            <span
              className="inline-block w-1.5 h-3 align-middle"
              style={{
                background: 'rgba(249,115,22,0.5)',
                animation: 'bootCursor 0.8s step-end infinite',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
