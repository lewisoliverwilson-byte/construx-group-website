'use client';

import { useState, useEffect, useRef } from 'react';

interface LhCategory {
  name:  string;
  score: number;
}

interface LhMetric {
  name:  string;
  value: string;
  ms?:   number;
  unit:  string;
  score: 'good' | 'warn' | 'fail';
}

const CATEGORIES: LhCategory[] = [
  { name: 'Performance',    score: 97 },
  { name: 'Accessibility',  score: 100 },
  { name: 'Best Practices', score: 100 },
  { name: 'SEO',            score: 100 },
];

const BASE_METRICS: LhMetric[] = [
  { name: 'First Contentful Paint',    value: '0.4 s',   ms: 400,   unit: 's',  score: 'good' },
  { name: 'Largest Contentful Paint',  value: '1.1 s',   ms: 1100,  unit: 's',  score: 'good' },
  { name: 'Total Blocking Time',       value: '0 ms',    ms: 0,     unit: 'ms', score: 'good' },
  { name: 'Cumulative Layout Shift',   value: '0.001',   ms: 0,     unit: '',   score: 'good' },
  { name: 'Speed Index',               value: '0.5 s',   ms: 500,   unit: 's',  score: 'good' },
  { name: 'Time to Interactive',       value: '1.2 s',   ms: 1200,  unit: 's',  score: 'good' },
];

function scoreColor(s: 'good' | 'warn' | 'fail'): string {
  if (s === 'good') return '#4ade80';
  if (s === 'warn') return '#fbbf24';
  return '#f87171';
}

function catColor(score: number): string {
  if (score >= 90) return '#4ade80';
  if (score >= 50) return '#fbbf24';
  return '#f87171';
}

function catBg(score: number): string {
  if (score >= 90) return 'rgba(74,222,128,0.12)';
  if (score >= 50) return 'rgba(251,191,36,0.12)';
  return 'rgba(248,113,113,0.12)';
}

export default function LighthousePanel() {
  const [metrics, setMetrics] = useState<LhMetric[]>([]);
  const [cats, setCats]       = useState<LhCategory[]>([]);
  const [revealed, setRevealed] = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const TOTAL = CATEGORIES.length + BASE_METRICS.length + 2; // +2 for header lines

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setMetrics(BASE_METRICS);
          setCats(CATEGORIES);
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 85);
    return () => clearTimeout(id);
  }, [revealed, TOTAL]);

  useEffect(() => {
    if (revealed <= TOTAL) return;
    const id = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m) => {
          if (!m.ms) return m;
          const jitter = Math.round((Math.random() - 0.5) * 40);
          const newMs  = Math.max(0, m.ms + jitter);
          const val    = m.unit === 'ms' ? `${newMs} ms` : `${(newMs / 1000).toFixed(1)} s`;
          return { ...m, ms: newMs, value: val };
        }),
      );
      setCats((prev) =>
        prev.map((c) => {
          if (c.name !== 'Performance') return c;
          return { ...c, score: 95 + Math.floor(Math.random() * 5) };
        }),
      );
    }, 3500);
    return () => clearInterval(id);
  }, [revealed, TOTAL]);

  const allDone     = revealed > TOTAL;
  const showCats    = revealed >= 2;
  const catCount    = Math.max(0, Math.min(CATEGORIES.length, revealed - 1));
  const metricCount = Math.max(0, Math.min(BASE_METRICS.length, revealed - CATEGORIES.length - 2));

  const displayedCats    = allDone ? cats    : cats.slice(0, catCount);
  const displayedMetrics = allDone ? metrics : metrics.slice(0, metricCount);

  return (
    <div
      ref={ref}
      className="overflow-x-auto font-mono"
      style={{
        background:   'rgba(1,1,10,0.97)',
        border:       '1px solid rgba(255,255,255,0.07)',
        borderRadius: '3px',
        boxShadow:    '0 0 0 1px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.6)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57', boxShadow: '0 0 4px rgba(255,95,87,0.4)' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E', boxShadow: '0 0 4px rgba(255,189,46,0.3)' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840', boxShadow: '0 0 4px rgba(40,200,64,0.3)' }} />
        </div>
        <span
          className="flex-1 text-center text-[9px] uppercase tracking-[0.2em]"
          style={{ color: 'rgba(255,255,255,0.22)' }}
        >
          construx@sys — lighthouse audit
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? '● audited' : 'running…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          lighthouse https://construxgroup.io --output=json --form-factor=mobile
        </span>
      </div>

      {/* Category scores */}
      {showCats && (
        <div className="px-4 pt-3 pb-2 flex gap-3 flex-wrap">
          {displayedCats.map((c, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-0.5 px-3 py-2"
              style={{
                background:   catBg(c.score),
                border:       `1px solid ${catColor(c.score)}22`,
                borderRadius: '3px',
                minWidth:     '80px',
              }}
            >
              <span className="text-[10px] font-bold tabular-nums" style={{ color: catColor(c.score) }}>
                {c.score}
              </span>
              <span className="text-[7px] uppercase tracking-widest text-center" style={{ color: 'rgba(240,239,255,0.35)' }}>
                {c.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Metrics */}
      {displayedMetrics.length > 0 && (
        <>
          <div className="px-4 pt-1 pb-0.5">
            <span className="text-[7px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.2)' }}>
              ─── performance metrics ───
            </span>
          </div>
          <div className="px-4 pb-3 space-y-0.5">
            {displayedMetrics.map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-[8px]">
                <span style={{ color: scoreColor(m.score), flexShrink: 0, fontWeight: 700 }}>●</span>
                <span style={{ color: 'rgba(240,239,255,0.5)', minWidth: '200px', flexShrink: 0 }}>
                  {m.name}
                </span>
                <span className="tabular-nums font-bold" style={{ color: scoreColor(m.score) }}>
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          lighthouse 12.4 · mobile · 4G throttle · chrome headless
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● live' : 'auditing'}
        </span>
      </div>
    </div>
  );
}
