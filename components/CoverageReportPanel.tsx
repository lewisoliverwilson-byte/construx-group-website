'use client';

import { useState, useEffect, useRef } from 'react';

interface CovEntry {
  file:       string;
  stmts:      number;
  branch:     number;
  funcs:      number;
  lines:      number;
  uncovered?: string;
}

const FILES: CovEntry[] = [
  { file: 'lib/auth.ts',           stmts: 100, branch:  96, funcs: 100, lines: 100 },
  { file: 'lib/db.ts',             stmts:  98, branch:  92, funcs:  97, lines:  98 },
  { file: 'lib/redis.ts',          stmts: 100, branch: 100, funcs: 100, lines: 100 },
  { file: 'lib/email.ts',          stmts:  94, branch:  88, funcs:  94, lines:  94, uncovered: '44-48' },
  { file: 'lib/stripe.ts',         stmts:  91, branch:  83, funcs:  90, lines:  91, uncovered: '82-89,112' },
  { file: 'lib/ratelimit.ts',      stmts: 100, branch:  95, funcs: 100, lines: 100 },
  { file: 'lib/format.ts',         stmts: 100, branch: 100, funcs: 100, lines: 100 },
  { file: 'lib/utils.ts',          stmts:  97, branch:  91, funcs:  96, lines:  97 },
  { file: 'components/Button.tsx', stmts: 100, branch:  98, funcs: 100, lines: 100 },
  { file: 'components/Modal.tsx',  stmts:  88, branch:  80, funcs:  88, lines:  88, uncovered: '34-38,55' },
  { file: 'hooks/useSession.ts',   stmts:  96, branch:  90, funcs:  95, lines:  96 },
  { file: 'hooks/useToast.ts',     stmts: 100, branch: 100, funcs: 100, lines: 100 },
];

function pct(n: number): string {
  return `${n.toFixed(0)}%`;
}

function pctColor(n: number): string {
  if (n >= 95) return '#4ade80';
  if (n >= 80) return '#fbbf24';
  if (n >= 60) return '#f97316';
  return '#f87171';
}

function bar(n: number, width = 12): string {
  const filled = Math.round((n / 100) * width);
  return '█'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, width - filled));
}

const SUMMARY = {
  stmts:  FILES.reduce((s, f) => s + f.stmts,  0) / FILES.length,
  branch: FILES.reduce((s, f) => s + f.branch, 0) / FILES.length,
  funcs:  FILES.reduce((s, f) => s + f.funcs,  0) / FILES.length,
  lines:  FILES.reduce((s, f) => s + f.lines,  0) / FILES.length,
};

export default function CoverageReportPanel() {
  const [revealed, setRevealed] = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > FILES.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 90);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone  = revealed > FILES.length;
  const displayed = FILES.slice(0, allDone ? FILES.length : revealed);
  const passCount = displayed.filter((f) => f.lines >= 90).length;

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
          construx@sys — vitest run --coverage
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${passCount}/${FILES.length} ≥90%` : 'running…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          vitest run --coverage --reporter=verbose 2&gt;&amp;1
        </span>
      </div>

      {/* Test run header */}
      {revealed > 0 && (
        <div className="px-4 pt-2 pb-1 text-[8px]" style={{ color: 'rgba(74,222,128,0.4)' }}>
          ✓ {displayed.length * 3} tests passed in {(displayed.length * 14).toFixed(0)}ms
        </div>
      )}

      {/* Column headers */}
      {revealed > 0 && (
        <div className="px-4 pb-0.5 text-[8px] flex gap-0 select-none" style={{ color: 'rgba(240,239,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ minWidth: '220px' }}>FILE</span>
          <span style={{ minWidth: '64px' }}>STMTS</span>
          <span style={{ minWidth: '64px' }}>BRANCH</span>
          <span style={{ minWidth: '64px' }}>FUNCS</span>
          <span style={{ minWidth: '64px' }}>LINES</span>
          <span style={{ minWidth: '100px' }}>GRAPH</span>
          <span>UNCOVERED</span>
        </div>
      )}

      {/* Coverage rows */}
      <div className="px-4 py-1 space-y-0.5">
        {displayed.map((entry, i) => (
          <div key={i} className="flex items-center gap-0 text-[8px] leading-[1.6]">
            <span style={{ color: 'rgba(240,239,255,0.5)', minWidth: '220px', flexShrink: 0 }}>
              {entry.file}
            </span>
            <span style={{ color: pctColor(entry.stmts), minWidth: '64px', flexShrink: 0 }}>
              {pct(entry.stmts)}
            </span>
            <span style={{ color: pctColor(entry.branch), minWidth: '64px', flexShrink: 0 }}>
              {pct(entry.branch)}
            </span>
            <span style={{ color: pctColor(entry.funcs), minWidth: '64px', flexShrink: 0 }}>
              {pct(entry.funcs)}
            </span>
            <span style={{ color: pctColor(entry.lines), minWidth: '64px', flexShrink: 0, fontWeight: 700 }}>
              {pct(entry.lines)}
            </span>
            <span style={{ color: pctColor(entry.lines), minWidth: '100px', flexShrink: 0, letterSpacing: '-1.5px' }}>
              {bar(entry.lines)}
            </span>
            <span style={{ color: 'rgba(248,113,113,0.5)', flexShrink: 0 }}>
              {entry.uncovered ?? ''}
            </span>
          </div>
        ))}
      </div>

      {/* Summary row */}
      {allDone && (
        <div
          className="px-4 py-1.5 flex gap-0 text-[8px] select-none"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
        >
          <span style={{ color: 'rgba(240,239,255,0.45)', minWidth: '220px', fontWeight: 700 }}>All files</span>
          {[SUMMARY.stmts, SUMMARY.branch, SUMMARY.funcs, SUMMARY.lines].map((v, i) => (
            <span key={i} style={{ color: pctColor(v), minWidth: '64px', fontWeight: 700 }}>
              {pct(v)}
            </span>
          ))}
          <span style={{ color: pctColor(SUMMARY.lines), minWidth: '100px', letterSpacing: '-1.5px' }}>
            {bar(SUMMARY.lines)}
          </span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          vitest 2.1 · v8 coverage · {FILES.length} files · threshold lines 80%
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● pass' : 'running'}
        </span>
      </div>
    </div>
  );
}
