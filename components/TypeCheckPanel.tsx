'use client';

import { useState, useEffect, useRef } from 'react';

interface TscResult {
  project:  string;
  path:     string;
  files:    number;
  errors:   number;
  timeMs:   number;
  status:   'ok' | 'error' | 'checking';
  accent:   string;
}

const BASE_RESULTS: TscResult[] = [
  { project: 'construx-web',    path: 'apps/web',                files: 284, errors: 0, timeMs: 4812, status: 'ok',    accent: '#F97316' },
  { project: 'construx-api',    path: 'apps/api',                files: 141, errors: 0, timeMs: 2244, status: 'ok',    accent: '#67e8f9' },
  { project: '@construx/ui',    path: 'packages/ui',             files:  88, errors: 0, timeMs: 1122, status: 'ok',    accent: '#a78bfa' },
  { project: '@construx/db',    path: 'packages/database',       files:  44, errors: 0, timeMs:  884, status: 'ok',    accent: '#4ade80' },
  { project: '@construx/types', path: 'packages/types',          files:  22, errors: 0, timeMs:  411, status: 'ok',    accent: '#fbbf24' },
  { project: 'scoutr-worker',   path: 'apps/scoutr-worker',      files:  98, errors: 0, timeMs: 1842, status: 'ok',    accent: '#67e8f9' },
  { project: 'hyve-ctx',        path: 'services/hyve-context',   files:  72, errors: 0, timeMs: 1481, status: 'ok',    accent: '#a78bfa' },
];

export default function TypeCheckPanel() {
  const [revealed, setRevealed] = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > BASE_RESULTS.length) return;
    const delay = BASE_RESULTS[revealed - 1]?.timeMs
      ? Math.min(BASE_RESULTS[revealed - 1].timeMs / 8, 600)
      : 150;
    const id = setTimeout(() => setRevealed((r) => r + 1), delay);
    return () => clearTimeout(id);
  }, [revealed]);

  const totalFiles  = BASE_RESULTS.reduce((s, r) => s + r.files, 0);
  const totalErrors = BASE_RESULTS.reduce((s, r) => s + r.errors, 0);
  const totalTimeMs = BASE_RESULTS.reduce((s, r) => s + r.timeMs, 0);
  const allDone     = revealed > BASE_RESULTS.length;

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
          construx@sys — type check
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone && totalErrors === 0 ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? (totalErrors === 0 ? '✓ 0 errors' : `${totalErrors} errors`) : 'running…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          turbo typecheck --filter=&apos;...&apos;
        </span>
      </div>

      {/* Result rows */}
      <div className="px-4 py-2 space-y-1.5">
        {BASE_RESULTS.slice(0, revealed).map((r, i) => (
          <div key={i} className="flex items-center gap-3 text-[8px] tabular-nums">
            {/* Status indicator */}
            <span style={{ color: r.errors > 0 ? '#f87171' : '#4ade80', flexShrink: 0, fontWeight: 700 }}>
              {r.errors > 0 ? '✗' : '✓'}
            </span>
            {/* Project name */}
            <span style={{ color: r.accent, minWidth: '152px', flexShrink: 0, fontWeight: 600 }}>
              {r.project}
            </span>
            {/* Path */}
            <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '180px', flexShrink: 0 }}>
              {r.path}
            </span>
            {/* Files */}
            <span style={{ color: 'rgba(240,239,255,0.35)', minWidth: '64px', flexShrink: 0 }}>
              {r.files} files
            </span>
            {/* Time */}
            <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '64px', flexShrink: 0 }}>
              {(r.timeMs / 1000).toFixed(2)}s
            </span>
            {/* Errors */}
            <span style={{ color: r.errors > 0 ? '#f87171' : 'rgba(240,239,255,0.2)' }}>
              {r.errors > 0 ? `${r.errors} error${r.errors === 1 ? '' : 's'}` : 'no errors'}
            </span>
          </div>
        ))}

        {/* Summary row */}
        {allDone && (
          <div
            className="flex items-center gap-3 text-[8px] tabular-nums mt-2 pt-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span style={{ color: totalErrors === 0 ? '#4ade80' : '#f87171', flexShrink: 0, fontWeight: 700 }}>
              {totalErrors === 0 ? '✓' : '✗'}
            </span>
            <span style={{ color: totalErrors === 0 ? '#4ade80' : '#f87171', fontWeight: 700, minWidth: '152px', flexShrink: 0 }}>
              {totalErrors === 0 ? 'ALL PASSED' : `${totalErrors} ERRORS`}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '180px', flexShrink: 0 }}>
              {BASE_RESULTS.length} projects
            </span>
            <span style={{ color: 'rgba(240,239,255,0.35)', minWidth: '64px', flexShrink: 0 }}>
              {totalFiles} files
            </span>
            <span style={{ color: 'rgba(240,239,255,0.25)' }}>
              {(totalTimeMs / 1000).toFixed(2)}s total
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          tsc 5.6 · strict: true · {BASE_RESULTS.length} projects
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          turborepo 2.3
        </span>
      </div>
    </div>
  );
}
