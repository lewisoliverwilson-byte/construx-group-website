'use client';

import { useState, useEffect, useRef } from 'react';

interface UlimitRow {
  description: string;
  flag:        string;
  type:        'soft' | 'hard' | 'both';
  value:       string;
  accent:      string;
}

const LIMITS: UlimitRow[] = [
  { description: 'core file size',          flag: '-c', type: 'both', value: 'unlimited',   accent: 'rgba(240,239,255,0.35)' },
  { description: 'data seg size',           flag: '-d', type: 'both', value: 'unlimited',   accent: 'rgba(240,239,255,0.35)' },
  { description: 'scheduling priority',     flag: '-e', type: 'both', value: '0',            accent: 'rgba(240,239,255,0.25)' },
  { description: 'file size',               flag: '-f', type: 'both', value: 'unlimited',   accent: 'rgba(240,239,255,0.35)' },
  { description: 'pending signals',         flag: '-i', type: 'both', value: '31280',        accent: '#a78bfa' },
  { description: 'max locked memory',       flag: '-l', type: 'both', value: '8388608',      accent: '#67e8f9' },
  { description: 'max memory size',         flag: '-m', type: 'both', value: 'unlimited',   accent: 'rgba(240,239,255,0.35)' },
  { description: 'open files',              flag: '-n', type: 'both', value: '1048576',      accent: '#F97316' },
  { description: 'pipe size',               flag: '-p', type: 'both', value: '8',            accent: 'rgba(240,239,255,0.25)' },
  { description: 'POSIX message queues',    flag: '-q', type: 'both', value: '819200',       accent: 'rgba(240,239,255,0.3)' },
  { description: 'real-time priority',      flag: '-r', type: 'both', value: '0',            accent: 'rgba(240,239,255,0.25)' },
  { description: 'stack size',              flag: '-s', type: 'both', value: '8388608',      accent: '#4ade80' },
  { description: 'cpu time',               flag: '-t', type: 'both', value: 'unlimited',   accent: 'rgba(240,239,255,0.35)' },
  { description: 'max user processes',      flag: '-u', type: 'both', value: '31280',        accent: '#fbbf24' },
  { description: 'virtual memory',          flag: '-v', type: 'both', value: 'unlimited',   accent: 'rgba(240,239,255,0.35)' },
  { description: 'file locks',              flag: '-x', type: 'both', value: 'unlimited',   accent: 'rgba(240,239,255,0.35)' },
];

function fmtValue(v: string): string {
  const n = parseInt(v, 10);
  if (isNaN(n) || v === 'unlimited') return v;
  if (n >= 1024 * 1024) return (n / 1024 / 1024).toFixed(0) + 'M';
  if (n >= 1024)        return (n / 1024).toFixed(0) + 'K';
  return v;
}

export default function UlimitPanel() {
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
    if (revealed === 0 || revealed > LIMITS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 68);
    return () => clearTimeout(id);
  }, [revealed]);

  const openFiles = LIMITS.find((l) => l.flag === '-n')?.value ?? '—';
  const maxProcs  = LIMITS.find((l) => l.flag === '-u')?.value ?? '—';

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
          construx@sys — resource limits
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: 'rgba(240,239,255,0.2)' }}>
          fd {fmtValue(openFiles)} · proc {fmtValue(maxProcs)}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          ulimit -a
        </span>
      </div>

      {/* Column headers */}
      <div
        className="px-4 py-1 flex items-center select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.025)' }}
      >
        {[
          { label: 'RESOURCE',  width: '220px' },
          { label: 'FLAG',      width: '48px'  },
          { label: 'SOFT',      width: '96px'  },
          { label: 'HARD',      width: 'auto'  },
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

      {/* Limit rows */}
      <div className="px-4 py-2 space-y-0.5">
        {LIMITS.slice(0, revealed).map((r, i) => (
          <div key={i} className="flex items-center text-[8px] tabular-nums">
            <span style={{ color: 'rgba(240,239,255,0.4)', minWidth: '220px', flexShrink: 0 }}>
              {r.description}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '48px', flexShrink: 0 }}>
              ({r.flag})
            </span>
            <span style={{ color: r.accent, minWidth: '96px', flexShrink: 0, fontWeight: r.value !== 'unlimited' ? 500 : 400 }}>
              {fmtValue(r.value)}
            </span>
            <span style={{ color: r.accent }}>
              {fmtValue(r.value)}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          {LIMITS.length} limits · user: deploy · shell: bash 5.2
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          /proc/self/limits
        </span>
      </div>
    </div>
  );
}
