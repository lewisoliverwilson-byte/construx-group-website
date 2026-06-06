'use client';

import { useState, useEffect, useRef } from 'react';

interface PkgEntry {
  name:     string;
  current:  string;
  wanted:   string;
  latest:   string;
  type:     'dependencies' | 'devDependencies';
  status:   'major' | 'minor' | 'patch' | 'current';
}

const PKGS: PkgEntry[] = [
  { name: 'next',                    current: '15.3.3',  wanted: '15.3.3',  latest: '15.3.3',  type: 'dependencies',    status: 'current' },
  { name: 'react',                   current: '19.0.0',  wanted: '19.1.0',  latest: '19.1.0',  type: 'dependencies',    status: 'patch' },
  { name: 'react-dom',               current: '19.0.0',  wanted: '19.1.0',  latest: '19.1.0',  type: 'dependencies',    status: 'patch' },
  { name: '@tanstack/react-query',   current: '5.51.11', wanted: '5.62.3',  latest: '5.62.3',  type: 'dependencies',    status: 'minor' },
  { name: 'three',                   current: '0.166.0', wanted: '0.168.0', latest: '0.168.0', type: 'dependencies',    status: 'minor' },
  { name: 'zod',                     current: '3.22.4',  wanted: '3.25.1',  latest: '3.25.1',  type: 'dependencies',    status: 'minor' },
  { name: 'drizzle-orm',             current: '0.30.10', wanted: '0.33.0',  latest: '0.33.0',  type: 'dependencies',    status: 'minor' },
  { name: 'lucide-react',            current: '0.418.0', wanted: '0.454.0', latest: '0.454.0', type: 'dependencies',    status: 'minor' },
  { name: '@auth/core',              current: '0.34.1',  wanted: '0.37.2',  latest: '0.37.2',  type: 'dependencies',    status: 'patch' },
  { name: 'typescript',              current: '5.4.5',   wanted: '5.8.3',   latest: '5.8.3',   type: 'devDependencies', status: 'minor' },
  { name: 'tailwindcss',             current: '3.4.4',   wanted: '3.4.17',  latest: '4.1.8',   type: 'devDependencies', status: 'major' },
  { name: 'eslint',                  current: '8.57.0',  wanted: '8.57.1',  latest: '9.25.1',  type: 'devDependencies', status: 'major' },
  { name: '@playwright/test',        current: '1.44.1',  wanted: '1.52.0',  latest: '1.52.0',  type: 'devDependencies', status: 'minor' },
  { name: 'vitest',                  current: '1.6.0',   wanted: '2.1.9',   latest: '3.2.2',   type: 'devDependencies', status: 'major' },
  { name: 'drizzle-kit',             current: '0.21.2',  wanted: '0.30.5',  latest: '0.30.5',  type: 'devDependencies', status: 'major' },
  { name: '@types/node',             current: '20.14.9', wanted: '22.15.3', latest: '22.15.3', type: 'devDependencies', status: 'major' },
  { name: '@types/react',            current: '18.3.3',  wanted: '19.1.4',  latest: '19.1.4',  type: 'devDependencies', status: 'major' },
  { name: 'tsx',                     current: '4.15.7',  wanted: '4.19.2',  latest: '4.19.2',  type: 'devDependencies', status: 'minor' },
];

function statusColor(s: PkgEntry['status']): string {
  if (s === 'major')   return '#f87171';
  if (s === 'minor')   return '#fbbf24';
  if (s === 'patch')   return '#60a5fa';
  return 'rgba(74,222,128,0.5)';
}

function statusBadge(s: PkgEntry['status']): string {
  if (s === 'major')   return 'MAJOR';
  if (s === 'minor')   return 'MINOR';
  if (s === 'patch')   return 'PATCH';
  return 'CURRENT';
}

function typeColor(t: PkgEntry['type']): string {
  return t === 'dependencies' ? 'rgba(249,115,22,0.6)' : 'rgba(96,165,250,0.5)';
}

export default function NpmOutdatedPanel() {
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
    if (revealed === 0 || revealed > PKGS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 75);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone   = revealed > PKGS.length;
  const displayed = PKGS.slice(0, allDone ? PKGS.length : revealed);

  const majorCount   = PKGS.filter((p) => p.status === 'major').length;
  const minorCount   = PKGS.filter((p) => p.status === 'minor').length;
  const patchCount   = PKGS.filter((p) => p.status === 'patch').length;
  const currentCount = PKGS.filter((p) => p.status === 'current').length;
  const outdated     = PKGS.filter((p) => p.status !== 'current').length;

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
          construx@sys — npm outdated
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(241,75,75,0.55)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${outdated} outdated` : 'scanning…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>npm outdated --long</span>
      </div>

      {/* Column headers */}
      {revealed > 0 && (
        <div
          className="flex items-center px-4 py-1 text-[7px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.16)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ minWidth: '196px', flexShrink: 0 }}>Package</span>
          <span style={{ minWidth: '72px',  flexShrink: 0 }}>Current</span>
          <span style={{ minWidth: '72px',  flexShrink: 0 }}>Wanted</span>
          <span style={{ minWidth: '72px',  flexShrink: 0 }}>Latest</span>
          <span style={{ minWidth: '80px',  flexShrink: 0 }}>Type</span>
          <span>Status</span>
        </div>
      )}

      {/* Package rows */}
      <div className="px-4 py-1.5 space-y-0.5">
        {displayed.map((p, i) => (
          <div key={i} className="flex items-center text-[8px] leading-[1.7]">
            <span style={{ color: 'rgba(240,239,255,0.55)', minWidth: '196px', flexShrink: 0, fontWeight: 500 }}>
              {p.name}
            </span>
            <span style={{ color: p.status === 'current' ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.25)', minWidth: '72px', flexShrink: 0 }}>
              {p.current}
            </span>
            <span style={{ color: p.wanted !== p.current ? '#fbbf24' : 'rgba(240,239,255,0.25)', minWidth: '72px', flexShrink: 0 }}>
              {p.wanted}
            </span>
            <span style={{ color: statusColor(p.status), minWidth: '72px', flexShrink: 0, fontWeight: 600 }}>
              {p.latest}
            </span>
            <span style={{ color: typeColor(p.type), minWidth: '80px', flexShrink: 0 }}>
              {p.type === 'dependencies' ? 'prod' : 'dev'}
            </span>
            <span
              className="px-1 py-px text-[6.5px] uppercase tracking-widest"
              style={{
                color:      statusColor(p.status),
                background: `${statusColor(p.status)}15`,
                borderRadius: '2px',
              }}
            >
              {statusBadge(p.status)}
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
          className="flex items-center gap-4 px-4 py-1.5 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#f87171' }}>{majorCount} major</span>
          <span style={{ color: '#fbbf24' }}>{minorCount} minor</span>
          <span style={{ color: '#60a5fa' }}>{patchCount} patch</span>
          <span style={{ color: 'rgba(74,222,128,0.5)' }}>{currentCount} current</span>
          <span className="ml-auto">{PKGS.length} packages total</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          npm 10.8.1 · node 22.3.0 · registry.npmjs.org
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(241,75,75,0.4)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? `${outdated} updates available` : 'loading'}
        </span>
      </div>
    </div>
  );
}
