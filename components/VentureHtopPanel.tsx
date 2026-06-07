'use client';

import { useState, useEffect } from 'react';

interface Process {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
  virt: string;
  res: string;
  color: string;
  stable: boolean;
}

const BASE_PROCS: Process[] = [
  { pid: 1,    name: 'systemd',               cpu: 0.1,  mem: 0.2,  virt: '175M', res: '12M',  color: 'rgba(240,239,255,0.35)', stable: true  },
  { pid: 842,  name: 'node [scoutr-api]',      cpu: 12.4, mem: 8.2,  virt: '1.2G', res: '412M', color: '#F97316',                stable: false },
  { pid: 843,  name: 'node [scoutr-worker]',   cpu: 23.1, mem: 11.4, virt: '1.4G', res: '584M', color: '#F97316',                stable: false },
  { pid: 844,  name: 'node [scoutr-scanner]',  cpu: 8.7,  mem: 6.8,  virt: '980M', res: '340M', color: '#F97316',                stable: false },
  { pid: 901,  name: 'node [marqet-api]',      cpu: 4.2,  mem: 5.1,  virt: '820M', res: '254M', color: '#7dd3fc',                stable: false },
  { pid: 902,  name: 'node [marqet-embed]',    cpu: 31.8, mem: 14.2, virt: '1.8G', res: '712M', color: '#7dd3fc',                stable: false },
  { pid: 961,  name: 'node [hyve-api]',        cpu: 5.6,  mem: 4.8,  virt: '760M', res: '238M', color: '#4ade80',                stable: false },
  { pid: 962,  name: 'node [hyve-ws]',         cpu: 7.1,  mem: 6.2,  virt: '890M', res: '308M', color: '#4ade80',                stable: false },
  { pid: 1041, name: 'postgres',               cpu: 2.3,  mem: 3.4,  virt: '520M', res: '168M', color: '#67e8f9',                stable: true  },
  { pid: 1082, name: 'redis-server',           cpu: 0.8,  mem: 1.2,  virt: '140M', res: '48M',  color: '#a78bfa',                stable: true  },
  { pid: 1124, name: 'nginx',                  cpu: 0.4,  mem: 0.6,  virt: '82M',  res: '20M',  color: 'rgba(240,239,255,0.3)',  stable: true  },
];

function jitter(base: number, range: number): number {
  return Math.max(0, Math.min(100, base + (Math.random() - 0.5) * range * 2));
}

function bar(pct: number, width: number, color: string) {
  const filled = Math.round((pct / 100) * width);
  return (
    <span>
      <span style={{ color }}>{`${'|'.repeat(filled)}`}</span>
      <span style={{ color: 'rgba(255,255,255,0.08)' }}>{`${'|'.repeat(Math.max(0, width - filled))}`}</span>
    </span>
  );
}

export default function VentureHtopPanel() {
  const [procs, setProcs] = useState(BASE_PROCS);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setProcs((prev) =>
        prev.map((p) =>
          p.stable
            ? p
            : {
                ...p,
                cpu: jitter(p.cpu, 4),
                mem: jitter(p.mem, 1),
              }
        )
      );
      setTick((t) => t + 1);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  const totalCpu = procs.reduce((s, p) => s + p.cpu, 0);
  const totalMem = procs.reduce((s, p) => s + p.mem, 0);
  const cpuBar = Math.min(100, totalCpu / 2);  // Normalised for display
  const memBar = Math.min(100, totalMem);

  const uptime = `${Math.floor((Date.now() - new Date('2026-01-15').getTime()) / 86400000)}d`;

  return (
    <div
      className="overflow-hidden font-mono"
      style={{
        background: 'rgba(0,2,10,0.98)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '3px',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 20px 60px rgba(0,0,0,0.6)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}
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
          construx@sys — htop — resource monitor
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.5)' }}>
          up {uptime}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.2)' }}>
          htop --sort-key=CPU --no-color --delay=18 --pid=$(pgrep -d, node)
        </span>
      </div>

      {/* System meters */}
      <div
        className="grid grid-cols-2 gap-4 px-4 py-3 text-[10px]"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,4,0.4)' }}
      >
        {/* CPU */}
        <div className="space-y-1">
          {['1', '2', '3', '4'].map((cpu, i) => {
            const load = Math.min(100, cpuBar + (i % 2 === 0 ? 8 : -8) + (tick % 3 === i % 3 ? 5 : 0));
            return (
              <div key={cpu} className="flex items-center gap-2">
                <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '2ch' }}>C{cpu}</span>
                <span>[</span>
                {bar(load, 18, load > 80 ? '#F97316' : load > 50 ? '#FBBF24' : '#4ade80')}
                <span>]</span>
                <span className="tabular-nums" style={{ color: 'rgba(240,239,255,0.5)', minWidth: '4ch' }}>
                  {load.toFixed(0).padStart(3)}%
                </span>
              </div>
            );
          })}
        </div>
        {/* Memory + Swp + Load avg */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '4ch' }}>Mem</span>
            <span>[</span>
            {bar(memBar * 1.2, 16, memBar > 80 ? '#F97316' : '#7dd3fc')}
            <span>]</span>
            <span className="tabular-nums" style={{ color: 'rgba(240,239,255,0.5)' }}>
              {(totalMem * 0.8).toFixed(1)}G/8G
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '4ch' }}>Swp</span>
            <span>[</span>
            {bar(4, 16, '#a78bfa')}
            <span>]</span>
            <span className="tabular-nums" style={{ color: 'rgba(240,239,255,0.5)' }}>
              0.2G/4G
            </span>
          </div>
          <div style={{ color: 'rgba(240,239,255,0.3)' }}>
            Avg:{' '}
            <span style={{ color: 'rgba(240,239,255,0.65)' }}>
              {(totalCpu / 100 * 0.8).toFixed(2)} {(totalCpu / 100 * 0.6).toFixed(2)} {(totalCpu / 100 * 0.5).toFixed(2)}
            </span>
          </div>
          <div style={{ color: 'rgba(240,239,255,0.3)' }}>
            Tasks:{' '}
            <span style={{ color: 'rgba(74,222,128,0.75)' }}>{procs.length}</span>
            {', '}
            <span style={{ color: 'rgba(240,239,255,0.5)' }}>{procs.filter((p) => p.cpu > 5).length} running</span>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div
        className="grid px-4 py-1 text-[8px] uppercase tracking-[0.12em] select-none"
        style={{
          gridTemplateColumns: '44px 1fr 52px 52px 54px 54px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          background: 'rgba(249,115,22,0.04)',
          color: 'rgba(249,115,22,0.5)',
        }}
      >
        <span>PID</span>
        <span>COMMAND</span>
        <span className="text-right">CPU%</span>
        <span className="text-right">MEM%</span>
        <span className="text-right">VIRT</span>
        <span className="text-right">RES</span>
      </div>

      {/* Process rows */}
      <div>
        {procs.map((proc, i) => (
          <div
            key={proc.pid}
            className="grid items-center px-4 py-[3px] text-[10px]"
            style={{
              gridTemplateColumns: '44px 1fr 52px 52px 54px 54px',
              borderBottom: i < procs.length - 1 ? '1px solid rgba(255,255,255,0.025)' : 'none',
              background: proc.cpu > 20 ? 'rgba(249,115,22,0.03)' : 'transparent',
            }}
          >
            <span style={{ color: 'rgba(240,239,255,0.25)' }}>{proc.pid}</span>
            <span
              className="truncate pr-2"
              style={{ color: proc.color }}
            >
              {proc.name}
            </span>
            <span
              className="text-right tabular-nums"
              style={{ color: proc.cpu > 20 ? '#F97316' : proc.cpu > 10 ? '#FBBF24' : 'rgba(240,239,255,0.5)' }}
            >
              {proc.cpu.toFixed(1)}
            </span>
            <span
              className="text-right tabular-nums"
              style={{ color: 'rgba(103,232,249,0.6)' }}
            >
              {proc.mem.toFixed(1)}
            </span>
            <span className="text-right" style={{ color: 'rgba(240,239,255,0.2)' }}>{proc.virt}</span>
            <span className="text-right" style={{ color: 'rgba(240,239,255,0.2)' }}>{proc.res}</span>
          </div>
        ))}
      </div>

      {/* Status footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.6)' }}
      >
        <div className="flex items-center gap-4">
          <span
            className="flex items-center gap-1.5 text-[8px] uppercase tracking-widest"
            style={{ color: 'rgba(74,222,128,0.55)' }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{
                background: '#4ade80',
                boxShadow: '0 0 4px #4ade80',
                opacity: tick % 2 === 0 ? 0.4 : 1,
                transition: 'opacity 0.6s ease',
              }}
            />
            LIVE
          </span>
          <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.15)' }}>
            {procs.length} PROCS
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.1)' }}>F10:QUIT</span>
          <span className="text-[8px]" style={{ color: 'rgba(249,115,22,0.35)' }}>construx@sys</span>
        </div>
      </div>
    </div>
  );
}
