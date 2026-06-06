'use client';

import { useState, useEffect, useRef } from 'react';

interface Syscall {
  name:    string;
  calls:   number;
  errors:  number;
  usecs:   number;
  timePct: number;
  accent:  string;
}

const BASE_SYSCALLS: Syscall[] = [
  { name: 'epoll_wait',    calls: 24812, errors:  0, usecs: 18244182, timePct: 38.2, accent: '#F97316' },
  { name: 'read',          calls: 18441, errors: 12, usecs:  9812044, timePct: 20.5, accent: '#67e8f9' },
  { name: 'write',         calls: 14882, errors:  0, usecs:  6241088, timePct: 13.1, accent: '#67e8f9' },
  { name: 'futex',         calls:  8214, errors:  4, usecs:  4812014, timePct:  9.8, accent: '#a78bfa' },
  { name: 'recvfrom',      calls:  4122, errors:  0, usecs:  2814100, timePct:  5.9, accent: '#fbbf24' },
  { name: 'sendto',        calls:  4018, errors:  0, usecs:  2012044, timePct:  4.2, accent: '#fbbf24' },
  { name: 'openat',        calls:  1842, errors: 88, usecs:   812401, timePct:  1.7, accent: '#4ade80' },
  { name: 'close',         calls:  1841, errors:  0, usecs:   411200, timePct:  0.9, accent: '#4ade80' },
  { name: 'mmap',          calls:   924, errors:  0, usecs:   284100, timePct:  0.6, accent: 'rgba(240,239,255,0.35)' },
  { name: 'getdents64',    calls:   412, errors:  0, usecs:   124800, timePct:  0.3, accent: 'rgba(240,239,255,0.35)' },
  { name: 'stat',          calls:   284, errors: 14, usecs:    84100, timePct:  0.2, accent: 'rgba(240,239,255,0.35)' },
  { name: 'clock_gettime', calls:  8841, errors:  0, usecs:    74200, timePct:  0.2, accent: 'rgba(240,239,255,0.25)' },
];

function jitter(v: number, pct = 0.12): number {
  return Math.max(0, v * (1 + (Math.random() - 0.5) * 2 * pct));
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

function fmtUsecs(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 's';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'ms';
  return n.toFixed(0) + 'μs';
}

function pctColor(pct: number): string {
  if (pct >= 20) return '#F97316';
  if (pct >= 10) return '#fbbf24';
  if (pct >=  5) return '#4ade80';
  return 'rgba(240,239,255,0.35)';
}

export default function StraceSummaryPanel() {
  const [revealed, setRevealed]     = useState(0);
  const [syscalls,  setSyscalls]    = useState<Syscall[]>(BASE_SYSCALLS);
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
    if (revealed === 0 || revealed > BASE_SYSCALLS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 80);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => {
      setSyscalls((prev) =>
        prev.map((s) => ({
          ...s,
          calls: Math.round(jitter(s.calls, 0.08)),
          usecs: Math.round(jitter(s.usecs, 0.1)),
        })),
      );
    }, 2400);
    return () => clearInterval(id);
  }, []);

  const totalCalls  = syscalls.reduce((s, sc) => s + sc.calls, 0);
  const totalErrors = syscalls.reduce((s, sc) => s + sc.errors, 0);
  const pid = 14822;

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
          construx@sys — syscall summary
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: 'rgba(240,239,255,0.2)' }}>
          pid {pid} · {fmtNum(totalCalls)} calls
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          strace -c -p {pid}  <span style={{ color: 'rgba(240,239,255,0.15)' }}># ^C to get summary</span>
        </span>
      </div>

      {/* Column headers */}
      <div
        className="px-4 py-1 flex items-center select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.025)' }}
      >
        {[
          { label: '% TIME', width: '72px'  },
          { label: 'SECONDS', width: '88px'  },
          { label: 'USECS/CALL', width: '88px' },
          { label: 'CALLS',   width: '72px'  },
          { label: 'ERRORS',  width: '64px'  },
          { label: 'SYSCALL', width: 'auto'  },
        ].map((col) => (
          <span
            key={col.label}
            className="text-[8px] uppercase tracking-wider"
            style={{ color: 'rgba(255,255,255,0.2)', minWidth: col.width, flexShrink: 0 }}
          >
            {col.label}
          </span>
        ))}
      </div>

      {/* Syscall rows */}
      <div className="px-4 py-2 space-y-1">
        {syscalls.slice(0, revealed).map((sc, i) => {
          const pc = pctColor(sc.timePct);
          return (
            <div key={i} className="flex items-center text-[8px] tabular-nums">
              <span style={{ color: pc, minWidth: '72px', flexShrink: 0, fontWeight: sc.timePct >= 10 ? 700 : 400 }}>
                {sc.timePct.toFixed(2)}%
              </span>
              <span style={{ color: 'rgba(240,239,255,0.4)', minWidth: '88px', flexShrink: 0 }}>
                {fmtUsecs(sc.usecs)}
              </span>
              <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '88px', flexShrink: 0 }}>
                {Math.round(sc.usecs / Math.max(1, sc.calls))}
              </span>
              <span style={{ color: 'rgba(240,239,255,0.45)', minWidth: '72px', flexShrink: 0 }}>
                {fmtNum(sc.calls)}
              </span>
              <span
                style={{
                  color:    sc.errors > 0 ? '#f87171' : 'rgba(240,239,255,0.15)',
                  minWidth: '64px',
                  flexShrink: 0,
                }}
              >
                {sc.errors > 0 ? sc.errors : '—'}
              </span>
              <span style={{ color: sc.accent, fontWeight: 600 }}>{sc.name}</span>
              {/* % bar */}
              <div className="ml-3 flex-1 flex items-center gap-1.5">
                <div className="h-1 rounded-full overflow-hidden flex-1" style={{ background: 'rgba(255,255,255,0.06)', maxWidth: '60px' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(100, sc.timePct * 2.6)}%`, background: pc, opacity: 0.7, transition: 'width 0.4s ease' }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          {BASE_SYSCALLS.length} syscalls · {totalErrors} errors · live
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          strace 6.7 · linux 6.6
        </span>
      </div>
    </div>
  );
}
