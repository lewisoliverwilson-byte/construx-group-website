'use client';

import { useState, useEffect } from 'react';

interface Container {
  name: string;
  image: string;
  cpu: number;
  mem: number;
  memLimit: string;
  netIn: string;
  netOut: string;
  pids: number;
  accentColor: string;
}

function randomDelta(base: number, variance: number): number {
  return Math.max(0.1, base + (Math.random() - 0.5) * variance);
}

const BASE_CONTAINERS: Container[] = [
  { name: 'scoutr-api',       image: 'construx/scoutr:1.4.2',      cpu: 3.2,  mem: 28.4, memLimit: '512MiB', netIn: '2.1MB',  netOut: '8.4MB',  pids: 12, accentColor: '#F97316' },
  { name: 'scoutr-worker',    image: 'construx/scoutr-w:1.4.2',    cpu: 18.7, mem: 156.2, memLimit: '1GiB',   netIn: '44MB',   netOut: '12MB',   pids: 8,  accentColor: '#F97316' },
  { name: 'marqet-api',       image: 'construx/marqet:2.1.0',      cpu: 1.4,  mem: 44.1, memLimit: '512MiB', netIn: '0.8MB',  netOut: '3.2MB',  pids: 10, accentColor: '#7dd3fc' },
  { name: 'marqet-embed',     image: 'construx/embed:2.1.0',       cpu: 24.1, mem: 312.0, memLimit: '2GiB',   netIn: '18MB',   netOut: '6.4MB',  pids: 6,  accentColor: '#7dd3fc' },
  { name: 'hyve-api',         image: 'construx/hyve:0.9.1',        cpu: 2.8,  mem: 88.4, memLimit: '512MiB', netIn: '1.4MB',  netOut: '5.8MB',  pids: 14, accentColor: '#4ade80' },
  { name: 'hyve-ws',          image: 'construx/hyve-ws:0.9.1',     cpu: 4.2,  mem: 112.8, memLimit: '1GiB',   netIn: '284MB',  netOut: '291MB',  pids: 4,  accentColor: '#4ade80' },
  { name: 'postgres',         image: 'postgres:16-alpine',          cpu: 1.1,  mem: 48.2, memLimit: '512MiB', netIn: '2.4MB',  netOut: '14MB',   pids: 7,  accentColor: 'rgba(240,239,255,0.5)' },
  { name: 'redis',            image: 'redis:7.2-alpine',            cpu: 0.4,  mem: 12.8, memLimit: '256MiB', netIn: '0.4MB',  netOut: '1.2MB',  pids: 4,  accentColor: 'rgba(240,239,255,0.5)' },
];

function formatCpu(v: number): string {
  return v.toFixed(1).padStart(5, ' ') + '%';
}

function cpuColor(v: number): string {
  if (v >= 50) return 'rgba(248,113,113,0.85)';
  if (v >= 20) return 'rgba(253,224,71,0.8)';
  return 'rgba(74,222,128,0.8)';
}

function memColor(mem: number, limit: string): string {
  const limitMb = limit.includes('GiB') ? parseFloat(limit) * 1024 : parseFloat(limit);
  const pct = mem / limitMb;
  if (pct >= 0.8) return 'rgba(248,113,113,0.85)';
  if (pct >= 0.5) return 'rgba(253,224,71,0.8)';
  return 'rgba(240,239,255,0.55)';
}

export default function DockerStatsPanel() {
  const [containers, setContainers] = useState<Container[]>(BASE_CONTAINERS);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setContainers((prev) =>
        prev.map((c) => ({
          ...c,
          cpu: randomDelta(c.cpu, c.cpu * 0.3),
          mem: randomDelta(c.mem, c.mem * 0.05),
        })),
      );
      setTick((t) => t + 1);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="overflow-hidden font-mono"
      style={{
        background: 'rgba(1,1,10,0.97)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '3px',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.6)',
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
          construx@sys — docker runtime
        </span>
        <span className="flex items-center gap-1.5 text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.6)' }}>
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{
              background: '#4ade80',
              boxShadow: '0 0 4px #4ade80',
              opacity: tick % 2 === 0 ? 0.4 : 1,
              transition: 'opacity 0.7s ease',
            }}
          />
          {containers.length} running
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          docker stats --no-trunc --format table
        </span>
      </div>

      {/* Column headers */}
      <div
        className="flex items-center gap-2 px-4 py-1 text-[7px] uppercase tracking-widest select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.18)' }}
      >
        <span style={{ minWidth: '120px' }}>CONTAINER</span>
        <span style={{ minWidth: '64px' }}>CPU %</span>
        <span style={{ minWidth: '100px' }}>MEM USAGE</span>
        <span style={{ minWidth: '60px' }}>NET IN</span>
        <span style={{ minWidth: '60px' }}>NET OUT</span>
        <span style={{ minWidth: '30px' }}>PIDS</span>
      </div>

      {/* Containers */}
      <div>
        {containers.map((c, ci) => (
          <div
            key={c.name}
            className="flex items-center gap-2 px-4 py-1.5 text-[8px]"
            style={{
              borderBottom: ci < containers.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
            }}
          >
            <span
              className="truncate"
              style={{ color: c.accentColor, minWidth: '120px', maxWidth: '120px' }}
            >
              {c.name}
            </span>
            <span
              className="tabular-nums"
              style={{ color: cpuColor(c.cpu), minWidth: '64px', transition: 'color 0.5s ease' }}
            >
              {formatCpu(c.cpu)}
            </span>
            <span
              className="tabular-nums"
              style={{ color: memColor(c.mem, c.memLimit), minWidth: '100px' }}
            >
              {c.mem.toFixed(1)}MiB / {c.memLimit}
            </span>
            <span className="tabular-nums" style={{ color: 'rgba(240,239,255,0.3)', minWidth: '60px' }}>
              {c.netIn}
            </span>
            <span className="tabular-nums" style={{ color: 'rgba(240,239,255,0.3)', minWidth: '60px' }}>
              {c.netOut}
            </span>
            <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', minWidth: '30px' }}>
              {c.pids}
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
          construx production cluster
        </span>
        <span className="text-[8px]" style={{ color: 'rgba(249,115,22,0.35)' }}>Railway · eu-west</span>
      </div>
    </div>
  );
}
