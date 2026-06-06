'use client';

import { useState, useEffect, useRef } from 'react';

interface VmRow {
  r:    number;
  b:    number;
  swpd: number;
  free: number;
  buff: number;
  cache:number;
  si:   number;
  so:   number;
  bi:   number;
  bo:   number;
  intr: number;
  cs:   number;
  us:   number;
  sy:   number;
  id:   number;
  wa:   number;
  st:   number;
}

function genRow(): VmRow {
  const us = Math.round(4 + Math.random() * 10);
  const sy = Math.round(1 + Math.random() * 4);
  const wa = Math.round(Math.random() * 2);
  const st = 0;
  const id = 100 - us - sy - wa - st;
  return {
    r: Math.round(Math.random() < 0.2 ? 2 : 1),
    b: 0,
    swpd: 0,
    free: Math.round(47200 + (Math.random() - 0.5) * 600),
    buff: 1842,
    cache: Math.round(12400 + (Math.random() - 0.5) * 200),
    si: 0, so: 0,
    bi: Math.round(Math.random() * 4),
    bo: Math.round(10 + Math.random() * 40),
    intr: Math.round(1200 + Math.random() * 200),
    cs:   Math.round(2800 + Math.random() * 400),
    us, sy, id, wa, st,
  };
}

const INITIAL_ROWS: VmRow[] = Array.from({ length: 5 }, genRow);

function cpuCellColor(v: number, key: string): string {
  if (key === 'id') {
    if (v > 80) return '#4ade80';
    if (v > 60) return '#fbbf24';
    return '#F97316';
  }
  if (key === 'us' || key === 'sy') {
    if (v < 10) return '#4ade80';
    if (v < 20) return '#fbbf24';
    return '#F97316';
  }
  if (key === 'wa' && v > 2) return '#f87171';
  return 'rgba(240,239,255,0.5)';
}

const COLS = [
  { key: 'r',    label: 'r',    group: 'procs'  },
  { key: 'b',    label: 'b',    group: 'procs'  },
  { key: 'swpd', label: 'swpd', group: 'memory' },
  { key: 'free', label: 'free', group: 'memory' },
  { key: 'buff', label: 'buff', group: 'memory' },
  { key: 'cache',label: 'cache',group: 'memory' },
  { key: 'si',   label: 'si',   group: 'swap'   },
  { key: 'so',   label: 'so',   group: 'swap'   },
  { key: 'bi',   label: 'bi',   group: 'io'     },
  { key: 'bo',   label: 'bo',   group: 'io'     },
  { key: 'intr', label: 'in',   group: 'system' },
  { key: 'cs',   label: 'cs',   group: 'system' },
  { key: 'us',   label: 'us',   group: 'cpu'    },
  { key: 'sy',   label: 'sy',   group: 'cpu'    },
  { key: 'id',   label: 'id',   group: 'cpu'    },
  { key: 'wa',   label: 'wa',   group: 'cpu'    },
  { key: 'st',   label: 'st',   group: 'cpu'    },
] as const;

const GROUP_COLORS: Record<string, string> = {
  procs:  '#F97316',
  memory: '#67e8f9',
  swap:   '#fbbf24',
  io:     '#a78bfa',
  system: '#4ade80',
  cpu:    '#F97316',
};

export default function VmstatPanel() {
  const [rows,    setRows]    = useState<VmRow[]>(INITIAL_ROWS);
  const [visible, setVisible] = useState(false);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setVisible(true);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      setRows((prev) => [...prev.slice(-4), genRow()]);
    }, 1800);
    return () => clearInterval(id);
  }, [visible]);

  const latest = rows[rows.length - 1];

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
          construx@sys — virtual memory stats
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: 'rgba(240,239,255,0.2)' }}>
          cpu idle {latest?.id ?? 0}%
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          vmstat -S M 1
        </span>
      </div>

      {/* Column group headers */}
      <div
        className="px-4 pt-1.5 pb-0 flex items-center gap-0 select-none"
        style={{ background: 'rgba(255,255,255,0.01)' }}
      >
        {[
          { label: '---procs---',          span: 2,  color: GROUP_COLORS.procs  },
          { label: '-------memory-------', span: 4,  color: GROUP_COLORS.memory },
          { label: '--swap--',             span: 2,  color: GROUP_COLORS.swap   },
          { label: '---io---',             span: 2,  color: GROUP_COLORS.io     },
          { label: '--system--',           span: 2,  color: GROUP_COLORS.system },
          { label: '-------cpu-------',   span: 5,  color: GROUP_COLORS.cpu    },
        ].map((g) => (
          <span
            key={g.label}
            className="text-[7px] uppercase tracking-wider flex-shrink-0"
            style={{ color: g.color + '60', width: `${g.span * 40}px` }}
          >
            {g.label}
          </span>
        ))}
      </div>

      {/* Column headers */}
      <div
        className="px-4 pb-1 flex items-center gap-0 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        {COLS.map((col) => (
          <span
            key={col.key}
            className="text-[7px] uppercase tracking-wider flex-shrink-0"
            style={{ color: GROUP_COLORS[col.group] + '80', width: '40px' }}
          >
            {col.label}
          </span>
        ))}
      </div>

      {/* Data rows */}
      <div className="px-4 py-1.5 space-y-0.5">
        {rows.map((row, ri) => (
          <div key={ri} className="flex items-center gap-0 text-[8px] tabular-nums">
            {COLS.map((col) => {
              const val = row[col.key];
              const color = (col.group === 'cpu')
                ? cpuCellColor(val as number, col.key)
                : 'rgba(240,239,255,0.45)';
              return (
                <span key={col.key} style={{ color, width: '40px', flexShrink: 0 }}>
                  {val}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          live · 1s interval · values in megabytes
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          procps-ng 4.0.4
        </span>
      </div>
    </div>
  );
}
