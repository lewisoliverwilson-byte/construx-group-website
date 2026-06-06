'use client';

import { useState, useEffect, useRef } from 'react';

interface SarEntry {
  time:   string;
  user:   number;
  nice:   number;
  system: number;
  iowait: number;
  steal:  number;
  idle:   number;
}

const BASE: SarEntry[] = [
  { time: '08:14:00', user: 4.21,  nice: 0.00, system: 1.12, iowait: 0.08, steal: 0.01, idle: 94.58 },
  { time: '08:14:01', user: 8.44,  nice: 0.00, system: 2.11, iowait: 0.14, steal: 0.00, idle: 89.31 },
  { time: '08:14:02', user: 12.89, nice: 0.00, system: 3.41, iowait: 0.22, steal: 0.01, idle: 83.47 },
  { time: '08:14:03', user: 31.22, nice: 0.00, system: 5.88, iowait: 0.41, steal: 0.00, idle: 62.49 },
  { time: '08:14:04', user: 28.14, nice: 0.00, system: 5.22, iowait: 0.38, steal: 0.02, idle: 66.24 },
  { time: '08:14:05', user: 22.41, nice: 0.00, system: 4.11, iowait: 0.28, steal: 0.00, idle: 73.20 },
  { time: '08:14:06', user: 14.88, nice: 0.00, system: 2.88, iowait: 0.18, steal: 0.01, idle: 82.05 },
  { time: '08:14:07', user: 9.22,  nice: 0.00, system: 1.94, iowait: 0.12, steal: 0.00, idle: 88.72 },
  { time: '08:14:08', user: 6.44,  nice: 0.00, system: 1.44, iowait: 0.09, steal: 0.00, idle: 92.03 },
  { time: '08:14:09', user: 4.88,  nice: 0.00, system: 1.22, iowait: 0.07, steal: 0.01, idle: 93.82 },
  { time: '08:14:10', user: 3.99,  nice: 0.00, system: 1.08, iowait: 0.06, steal: 0.00, idle: 94.87 },
  { time: '08:14:11', user: 3.41,  nice: 0.00, system: 0.98, iowait: 0.05, steal: 0.00, idle: 95.56 },
];

function userColor(user: number): string {
  if (user >= 30) return '#f87171';
  if (user >= 15) return '#fbbf24';
  return '#4ade80';
}

function cpuBar(pct: number, char: string = '█'): string {
  const bars = Math.round(pct / 5);
  return char.repeat(Math.min(bars, 20)) + '░'.repeat(Math.max(0, 20 - bars));
}

function rnd(base: number, spread: number): number {
  return parseFloat((base + (Math.random() - 0.5) * spread * 2).toFixed(2));
}

export default function SarPanel() {
  const [revealed, setRevealed] = useState(0);
  const [live, setLive]         = useState<SarEntry[]>([]);
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
    if (revealed === 0 || revealed > BASE.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 78);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= BASE.length) return;
    const id = setInterval(() => {
      const d    = new Date();
      const time = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
      const user = rnd(6, 4);
      const sys  = rnd(1.5, 0.8);
      const iow  = rnd(0.08, 0.05);
      const entry: SarEntry = {
        time,
        user,
        nice:   0.00,
        system: sys,
        iowait: iow,
        steal:  0.00,
        idle:   parseFloat((100 - user - sys - iow).toFixed(2)),
      };
      setLive((prev) => [...prev.slice(-5), entry]);
    }, 2000);
    return () => clearInterval(id);
  }, [revealed]);

  const allDone  = revealed > BASE.length;
  const displayed = BASE.slice(0, allDone ? BASE.length : revealed);
  const rows      = [...displayed, ...live];

  const avgUser = rows.length > 0
    ? (rows.reduce((s, r) => s + r.user, 0) / rows.length).toFixed(2)
    : '0.00';
  const peakUser = rows.length > 0
    ? Math.max(...rows.map((r) => r.user)).toFixed(2)
    : '0.00';

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
          construx@sys — sar -u 1 12
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `avg ${avgUser}%` : 'sampling…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>sar -u 1 12</span>
      </div>

      {/* Column headers */}
      {revealed > 0 && (
        <div
          className="flex items-center px-4 py-1 text-[7px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.18)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ minWidth: '68px', flexShrink: 0 }}>Time</span>
          <span style={{ minWidth: '52px', flexShrink: 0 }}>%user</span>
          <span style={{ minWidth: '52px', flexShrink: 0 }}>%system</span>
          <span style={{ minWidth: '52px', flexShrink: 0 }}>%iowait</span>
          <span style={{ minWidth: '52px', flexShrink: 0 }}>%idle</span>
          <span>CPU bar</span>
        </div>
      )}

      {/* Rows */}
      <div className="px-4 py-1.5 space-y-0.5">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center text-[8px] leading-[1.7] tabular-nums">
            <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '68px', flexShrink: 0 }}>
              {row.time}
            </span>
            <span style={{ color: userColor(row.user), minWidth: '52px', flexShrink: 0, fontWeight: 600 }}>
              {row.user.toFixed(2)}
            </span>
            <span style={{ color: '#60a5fa', minWidth: '52px', flexShrink: 0 }}>
              {row.system.toFixed(2)}
            </span>
            <span style={{ color: 'rgba(251,191,36,0.6)', minWidth: '52px', flexShrink: 0 }}>
              {row.iowait.toFixed(2)}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '52px', flexShrink: 0 }}>
              {row.idle.toFixed(2)}
            </span>
            <span className="text-[7px] tracking-tight" style={{ color: userColor(row.user), opacity: 0.7 }}>
              {cpuBar(row.user + row.system)}
            </span>
          </div>
        ))}
        {allDone && (
          <div className="text-[8px] mt-0.5" style={{ color: 'rgba(74,222,128,0.3)' }}>▌</div>
        )}
      </div>

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-6 px-4 py-1.5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
        >
          <span className="text-[8px]">
            <span style={{ color: 'rgba(240,239,255,0.2)' }}>avg user </span>
            <span style={{ color: '#4ade80', fontWeight: 600 }}>{avgUser}%</span>
          </span>
          <span className="text-[8px]">
            <span style={{ color: 'rgba(240,239,255,0.2)' }}>peak user </span>
            <span style={{ color: userColor(parseFloat(peakUser)), fontWeight: 600 }}>{peakUser}%</span>
          </span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          sysstat 12.7 · sar · Linux 6.8.0-construx
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● sampling' : 'loading'}
        </span>
      </div>
    </div>
  );
}
