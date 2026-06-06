'use client';

import { useState, useEffect, useRef } from 'react';

interface Process {
  pid:     number;
  user:    string;
  cpu:     number;
  mem:     number;
  vsz:     string;
  rss:     string;
  stat:    string;
  command: string;
  accent?: string;
}

const BASE_PROCESSES: Process[] = [
  { pid: 1847, user: 'node',     cpu: 4.2,  mem: 2.8, vsz: '987M',  rss: '148M', stat: 'Sl', command: 'node /app/scoutr/server.js',          accent: '#F97316' },
  { pid: 1203, user: 'postgres', cpu: 2.7,  mem: 1.9, vsz: '312M',  rss: '96M',  stat: 'Ss', command: 'postgres: construx main',             accent: '#7dd3fc' },
  { pid: 2041, user: 'node',     cpu: 2.1,  mem: 1.4, vsz: '764M',  rss: '112M', stat: 'Sl', command: 'node /app/marqet/server.js',           accent: '#7dd3fc' },
  { pid: 1988, user: 'node',     cpu: 1.8,  mem: 1.2, vsz: '721M',  rss: '98M',  stat: 'Sl', command: 'node /app/hyve/server.js',             accent: '#4ade80' },
  { pid: 2210, user: 'node',     cpu: 1.3,  mem: 0.9, vsz: '612M',  rss: '78M',  stat: 'Sl', command: 'node /app/construx-web/server.js',     accent: '#a78bfa' },
  { pid: 891,  user: 'redis',    cpu: 0.9,  mem: 0.4, vsz: '48M',   rss: '18M',  stat: 'Ssl', command: 'redis-server *:6379',                 accent: '#f87171' },
  { pid: 744,  user: 'www-data', cpu: 0.6,  mem: 0.3, vsz: '188M',  rss: '14M',  stat: 'Ss', command: 'nginx: master process /usr/sbin/nginx' },
  { pid: 2318, user: 'node',     cpu: 0.4,  mem: 0.6, vsz: '544M',  rss: '64M',  stat: 'Sl', command: 'node /app/scoutr/worker.js',           accent: '#F97316' },
  { pid: 1104, user: 'postgres', cpu: 0.3,  mem: 0.2, vsz: '298M',  rss: '22M',  stat: 'Ss', command: 'postgres: autovacuum worker' },
  { pid: 2490, user: 'node',     cpu: 0.2,  mem: 0.4, vsz: '481M',  rss: '48M',  stat: 'Sl', command: 'node /app/marqet/embed-worker.js',     accent: '#7dd3fc' },
  { pid: 812,  user: 'root',     cpu: 0.1,  mem: 0.1, vsz: '14M',   rss: '3M',   stat: 'Ss', command: 'cron' },
  { pid: 588,  user: 'root',     cpu: 0.0,  mem: 0.1, vsz: '22M',   rss: '4M',   stat: 'Ss', command: 'sshd: construx [priv]' },
];

const LOAD_AVG = [0.42, 0.38, 0.41];

function cpuColor(cpu: number): string {
  if (cpu < 1)  return 'rgba(240,239,255,0.3)';
  if (cpu < 3)  return '#4ade80';
  if (cpu < 6)  return '#fbbf24';
  return '#F97316';
}

function memColor(mem: number): string {
  if (mem < 1)  return 'rgba(240,239,255,0.3)';
  if (mem < 2)  return '#4ade80';
  if (mem < 4)  return '#fbbf24';
  return '#f87171';
}

function statColor(stat: string): string {
  if (stat.startsWith('S')) return '#4ade80';
  if (stat.startsWith('R')) return '#F97316';
  if (stat.startsWith('D')) return '#fbbf24';
  return 'rgba(240,239,255,0.3)';
}

export default function TopProcessPanel() {
  const [processes, setProcesses] = useState<Process[]>(BASE_PROCESSES);
  const [revealed,  setRevealed]  = useState(0);
  const [tick,      setTick]      = useState(0);
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
    if (revealed === 0 || revealed > BASE_PROCESSES.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 70);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setProcesses((prev) =>
        prev.map((p) => ({
          ...p,
          cpu: Math.max(0, p.cpu + (Math.random() - 0.48) * 0.4),
          mem: Math.max(0, p.mem + (Math.random() - 0.5) * 0.05),
        })).sort((a, b) => b.cpu - a.cpu),
      );
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const visibleProcesses = processes.slice(0, revealed);
  const totalCpu = processes.reduce((s, p) => s + p.cpu, 0);

  return (
    <div
      ref={ref}
      className="overflow-hidden font-mono"
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
          construx@sys — process monitor
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: 'rgba(240,239,255,0.2)' }}>
          cpu {totalCpu.toFixed(1)}%
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          top -bn1 -o%CPU | head -20
        </span>
      </div>

      {/* Load average strip */}
      <div
        className="px-4 py-1.5 flex items-center gap-6 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          load avg:{' '}
          <span style={{ color: '#4ade80' }}>{LOAD_AVG[0].toFixed(2)}</span>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>,</span>{' '}
          <span style={{ color: '#4ade80' }}>{LOAD_AVG[1].toFixed(2)}</span>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>,</span>{' '}
          <span style={{ color: '#4ade80' }}>{LOAD_AVG[2].toFixed(2)}</span>
        </span>
        <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          tasks: <span style={{ color: 'rgba(240,239,255,0.5)' }}>142</span> total,{' '}
          <span style={{ color: '#F97316' }}>2</span> running,{' '}
          <span style={{ color: 'rgba(240,239,255,0.5)' }}>140</span> sleeping
        </span>
        <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          uptime: <span style={{ color: 'rgba(240,239,255,0.5)' }}>47d 14:22</span>
        </span>
      </div>

      {/* Column headers */}
      <div
        className="px-4 py-1 flex items-center gap-0 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.025)' }}
      >
        {[
          { label: 'PID',     width: '44px'  },
          { label: 'USER',    width: '64px'  },
          { label: '%CPU',    width: '44px'  },
          { label: '%MEM',    width: '44px'  },
          { label: 'VSZ',     width: '48px'  },
          { label: 'RSS',     width: '48px'  },
          { label: 'STAT',    width: '36px'  },
          { label: 'COMMAND', width: 'auto'  },
        ].map((col) => (
          <span
            key={col.label}
            className="text-[8px] uppercase tracking-wider tabular-nums"
            style={{ color: 'rgba(255,255,255,0.2)', minWidth: col.width, flexShrink: 0 }}
          >
            {col.label}
          </span>
        ))}
      </div>

      {/* Process rows */}
      <div className="px-4 py-2 space-y-0.5">
        {visibleProcesses.map((proc) => (
          <div key={proc.pid} className="flex items-center gap-0 text-[8px] tabular-nums">
            <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '44px', flexShrink: 0 }}>
              {proc.pid}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.35)', minWidth: '64px', flexShrink: 0 }}>
              {proc.user}
            </span>
            <span style={{ color: cpuColor(proc.cpu), minWidth: '44px', flexShrink: 0, fontWeight: proc.cpu > 1 ? 600 : 400 }}>
              {proc.cpu.toFixed(1)}
            </span>
            <span style={{ color: memColor(proc.mem), minWidth: '44px', flexShrink: 0 }}>
              {proc.mem.toFixed(1)}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '48px', flexShrink: 0 }}>
              {proc.vsz}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '48px', flexShrink: 0 }}>
              {proc.rss}
            </span>
            <span style={{ color: statColor(proc.stat), minWidth: '36px', flexShrink: 0 }}>
              {proc.stat}
            </span>
            <span
              className="truncate"
              style={{ color: proc.accent ?? 'rgba(240,239,255,0.4)', flex: 1, minWidth: 0 }}
            >
              {proc.command}
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
          {BASE_PROCESSES.length} processes · live · 2.2s interval
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: 'rgba(240,239,255,0.15)' }}>
          tick {tick}
        </span>
      </div>
    </div>
  );
}
