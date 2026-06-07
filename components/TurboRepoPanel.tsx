'use client';

import { useState, useEffect, useRef } from 'react';

interface TurboTask {
  pkg:        string;
  task:       string;
  cache:      'HIT' | 'MISS';
  durationMs: number;
  hash:       string;
}

const TASKS: TurboTask[] = [
  { pkg: 'packages/tsconfig',   task: 'build', cache: 'HIT',  durationMs: 0,    hash: 'a3f8c2e' },
  { pkg: 'packages/eslint-cfg', task: 'build', cache: 'HIT',  durationMs: 0,    hash: 'b7d4f1a' },
  { pkg: 'packages/ui',         task: 'build', cache: 'HIT',  durationMs: 0,    hash: '9e2a7d3' },
  { pkg: 'packages/db',         task: 'build', cache: 'MISS', durationMs: 1241, hash: '4e9c8b2' },
  { pkg: 'packages/auth',       task: 'build', cache: 'MISS', durationMs: 887,  hash: '7f2d5a1' },
  { pkg: 'packages/email',      task: 'build', cache: 'HIT',  durationMs: 0,    hash: 'c5b1e4f' },
  { pkg: 'apps/api',            task: 'build', cache: 'MISS', durationMs: 3421, hash: 'c1e6f9b' },
  { pkg: 'apps/web',            task: 'build', cache: 'MISS', durationMs: 8714, hash: '2a8d4c7' },
  { pkg: 'packages/tsconfig',   task: 'lint',  cache: 'HIT',  durationMs: 0,    hash: '9b3e7f4' },
  { pkg: 'packages/ui',         task: 'lint',  cache: 'MISS', durationMs: 2103, hash: 'd5a2c8e' },
  { pkg: 'packages/db',         task: 'lint',  cache: 'HIT',  durationMs: 0,    hash: 'f1c4b9a' },
  { pkg: 'packages/auth',       task: 'lint',  cache: 'HIT',  durationMs: 0,    hash: '3e7d2b6' },
  { pkg: 'apps/api',            task: 'lint',  cache: 'MISS', durationMs: 1578, hash: '8a1f5c3' },
  { pkg: 'apps/web',            task: 'lint',  cache: 'MISS', durationMs: 4228, hash: '6c9e2d7' },
];

const TOTAL      = TASKS.length;
const HIT_COUNT  = TASKS.filter((t) => t.cache === 'HIT').length;
const MISS_COUNT = TASKS.filter((t) => t.cache === 'MISS').length;
const TOTAL_MS   = TASKS.filter((t) => t.cache === 'MISS').reduce((s, t) => s + t.durationMs, 0);

function fmtMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms}ms`;
}

function hashColor(hash: string): string {
  const n = parseInt(hash[0], 16);
  if (n < 5)  return 'rgba(96,165,250,0.55)';
  if (n < 10) return 'rgba(167,139,250,0.55)';
  return 'rgba(74,222,128,0.45)';
}

export default function TurboRepoPanel() {
  const [revealed, setRevealed] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const ref      = useRef<HTMLDivElement>(null);
  const started  = useRef(false);
  const startTs  = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          startTs.current = Date.now();
          setRevealed(1);
          timerRef.current = setInterval(() => {
            setElapsedMs(Date.now() - startTs.current);
          }, 80);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) {
      if (revealed > TOTAL && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setElapsedMs(TOTAL_MS);
      }
      return;
    }
    const id = setTimeout(() => setRevealed((r) => r + 1), 88);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const allDone   = revealed > TOTAL;
  const shownRows = TASKS.slice(0, Math.min(TASKS.length, revealed));

  const cacheHitPct = Math.round((HIT_COUNT / TOTAL) * 100);

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
          construx@dev-macbook — turbo run
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? fmtMs(TOTAL_MS) : `${fmtMs(elapsedMs)}…`}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@dev-macbook:~/construx-workspace$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          turbo run build lint --filter=&apos;apps/*&apos; --parallel
        </span>
      </div>

      {/* Scope header */}
      {shownRows.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(167,139,250,0.6)' }}>
            • Packages in scope: packages/tsconfig · packages/eslint-cfg · packages/ui · packages/db · packages/auth · packages/email · apps/api · apps/web
          </span>
        </div>
      )}

      {/* Column headers */}
      {shownRows.length > 0 && (
        <div
          className="flex items-center px-4 py-0.5 text-[6.5px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ minWidth: '56px',  flexShrink: 0 }}>Cache</span>
          <span style={{ minWidth: '200px', flexShrink: 0 }}>Package</span>
          <span style={{ minWidth: '60px',  flexShrink: 0 }}>Task</span>
          <span style={{ minWidth: '72px',  flexShrink: 0 }}>Duration</span>
          <span>Hash</span>
        </div>
      )}

      {/* Rows */}
      <div className="px-4 py-1.5 space-y-0.5">
        {shownRows.map((t, i) => (
          <div
            key={i}
            className="flex items-center text-[7.5px] leading-[1.7]"
            style={{
              borderLeft: `2px solid ${t.cache === 'HIT' ? 'rgba(74,222,128,0.25)' : 'rgba(251,191,36,0.3)'}`,
              paddingLeft: '4px',
            }}
          >
            <span
              style={{
                minWidth: '56px',
                flexShrink: 0,
                color: t.cache === 'HIT' ? '#4ade80' : '#fbbf24',
                fontSize: '7px',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}
            >
              {t.cache === 'HIT' ? '>>> CACHED' : '    RUN   '}
            </span>
            <span style={{ color: t.cache === 'HIT' ? 'rgba(240,239,255,0.3)' : 'rgba(240,239,255,0.55)', minWidth: '200px', flexShrink: 0 }}>
              {t.pkg}
            </span>
            <span style={{ color: 'rgba(96,165,250,0.7)', minWidth: '60px', flexShrink: 0, fontSize: '7px' }}>
              #{t.task}
            </span>
            <span style={{ color: t.cache === 'HIT' ? 'rgba(240,239,255,0.2)' : 'rgba(240,239,255,0.4)', minWidth: '72px', flexShrink: 0 }}>
              {t.cache === 'HIT' ? '—' : fmtMs(t.durationMs)}
            </span>
            <span style={{ color: hashColor(t.hash), fontSize: '7px' }}>{t.hash}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>{HIT_COUNT} cached</span>
          <span style={{ color: '#fbbf24' }}>{MISS_COUNT} ran</span>
          <span>{TOTAL} tasks total</span>
          <span style={{ color: '#4ade80' }}>{cacheHitPct}% cache hit rate</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          turbo 2.3.4 · remote cache disabled
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? `● ${TOTAL} tasks` : 'running'}
        </span>
      </div>
    </div>
  );
}
