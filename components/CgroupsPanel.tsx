'use client';

import { useState, useEffect, useRef } from 'react';

interface CgroupService {
  name:         string;
  memCurrent:   number;
  memMax:       number;
  memHighEvts:  number;
  cpuPct:       number;
  cpuQuota:     number;
  tasks:        number;
  oomKills:     number;
}

interface CgtopLine {
  path:    string;
  tasks:   number;
  cpuPct:  string;
  memMib:  string;
}

const SERVICES: CgroupService[] = [
  { name: 'construx-api.service',  memCurrent: 154763264,  memMax: 536870912, memHighEvts: 0,  cpuPct: 18.4, cpuQuota: 200, tasks: 12, oomKills: 0 },
  { name: 'postgresql.service',    memCurrent: 2256207872, memMax: 4294967296, memHighEvts: 0, cpuPct: 12.2, cpuQuota: 400, tasks: 42, oomKills: 0 },
  { name: 'redis.service',         memCurrent: 22020096,   memMax: 134217728, memHighEvts: 0,  cpuPct: 2.1,  cpuQuota: 100, tasks: 5,  oomKills: 0 },
  { name: 'caddy.service',         memCurrent: 41943040,   memMax: 268435456, memHighEvts: 0,  cpuPct: 1.8,  cpuQuota: 100, tasks: 8,  oomKills: 0 },
];

const CGTOP: CgtopLine[] = [
  { path: '/',                                      tasks: 412, cpuPct: '42.3', memMib: '12387' },
  { path: '/system.slice',                          tasks: 180, cpuPct: '38.1', memMib: '8602'  },
  { path: '/system.slice/construx-api.service',     tasks: 12,  cpuPct: '18.4', memMib: '147'   },
  { path: '/system.slice/postgresql.service',       tasks: 42,  cpuPct: '12.2', memMib: '2152'  },
  { path: '/system.slice/redis.service',            tasks: 5,   cpuPct: '2.1',  memMib: '21'    },
  { path: '/system.slice/caddy.service',            tasks: 8,   cpuPct: '1.8',  memMib: '40'    },
];

const TOTAL = SERVICES.length + CGTOP.length + 5;

function fmtMib(bytes: number): string {
  return `${Math.round(bytes / 1048576)}MB`;
}

function memPct(current: number, max: number): number {
  return Math.round((current / max) * 100);
}

function memPctColor(pct: number): string {
  if (pct < 60) return '#4ade80';
  if (pct < 85) return '#fbbf24';
  return '#f87171';
}

function cpuColor(pct: number, quota: number): string {
  const rel = (pct / quota) * 100;
  if (rel < 60) return '#4ade80';
  if (rel < 85) return '#fbbf24';
  return '#f87171';
}

export default function CgroupsPanel() {
  const [revealed,   setRevealed]   = useState(0);
  const [liveMemApi, setLiveMemApi] = useState(154763264);
  const [liveCpuApi, setLiveCpuApi] = useState(18.4);
  const ref      = useRef<HTMLDivElement>(null);
  const started  = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
          timerRef.current = setInterval(() => {
            setLiveMemApi(Math.floor(140_000_000 + Math.random() * 30_000_000));
            setLiveCpuApi(Math.round((14 + Math.random() * 10) * 10) / 10);
          }, 2100);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 83);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const allDone       = revealed > TOTAL;
  const serviceStart  = 2;
  const cgtopStart    = SERVICES.length + 3;
  const shownServices = SERVICES.slice(0, Math.max(0, revealed - serviceStart));
  const shownCgtop    = CGTOP.slice(0, Math.max(0, revealed - cgtopStart));

  const liveApiPct = memPct(liveMemApi, 536870912);

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
          construx@prod-01 — cgroups v2 · systemd-cgtop
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: liveApiPct > 80 ? '#fbbf24' : '#4ade80' }}>
          {allDone ? `LIVE api: ${fmtMib(liveMemApi)} / ${liveCpuApi}% CPU` : 'sampling…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>root@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          cat /sys/fs/cgroup/system.slice/*/memory.current && systemd-cgtop -1
        </span>
      </div>

      {/* Service cgroup stats */}
      {shownServices.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.18)' }}>
            Service cgroup accounting — cgroups v2 · linux 6.11
          </div>
          <div
            className="flex items-center text-[6.5px] uppercase tracking-widest mb-0.5"
            style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '2px' }}
          >
            <span style={{ minWidth: '196px', flexShrink: 0 }}>Service</span>
            <span style={{ minWidth: '80px',  flexShrink: 0 }}>Mem used</span>
            <span style={{ minWidth: '56px',  flexShrink: 0 }}>Mem %</span>
            <span style={{ minWidth: '56px',  flexShrink: 0 }}>CPU %</span>
            <span style={{ minWidth: '56px',  flexShrink: 0 }}>Quota</span>
            <span style={{ minWidth: '36px',  flexShrink: 0 }}>Tasks</span>
            <span>OOM</span>
          </div>
          {shownServices.map((s) => {
            const mp = memPct(s.memCurrent, s.memMax);
            return (
              <div key={s.name} className="flex items-center text-[7.5px] leading-[1.85]">
                <span style={{ color: 'rgba(240,239,255,0.45)', minWidth: '196px', flexShrink: 0 }}>{s.name}</span>
                <span style={{ color: memPctColor(mp), minWidth: '80px', flexShrink: 0 }}>{fmtMib(s.memCurrent)}</span>
                <span style={{ color: memPctColor(mp), minWidth: '56px', flexShrink: 0 }}>{mp}%</span>
                <span style={{ color: cpuColor(s.cpuPct, s.cpuQuota), minWidth: '56px', flexShrink: 0 }}>{s.cpuPct}%</span>
                <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '56px', flexShrink: 0 }}>{s.cpuQuota}%</span>
                <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '36px', flexShrink: 0 }}>{s.tasks}</span>
                <span style={{ color: s.oomKills > 0 ? '#f87171' : 'rgba(240,239,255,0.18)' }}>{s.oomKills}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* systemd-cgtop output */}
      {shownCgtop.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.18)' }}>
            systemd-cgtop — cgroup hierarchy
          </div>
          <div
            className="flex items-center text-[6.5px] uppercase tracking-widest mb-0.5"
            style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '2px' }}
          >
            <span style={{ flexGrow: 1 }}>Path</span>
            <span style={{ minWidth: '44px', flexShrink: 0, textAlign: 'right' }}>Tasks</span>
            <span style={{ minWidth: '52px', flexShrink: 0, textAlign: 'right' }}>%CPU</span>
            <span style={{ minWidth: '64px', flexShrink: 0, textAlign: 'right' }}>Memory</span>
          </div>
          {shownCgtop.map((l, i) => (
            <div key={i} className="flex items-center text-[7.5px] leading-[1.85]">
              <span style={{ color: l.path === '/' ? 'rgba(240,239,255,0.55)' : 'rgba(240,239,255,0.35)', flexGrow: 1 }}>{l.path}</span>
              <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '44px', flexShrink: 0, textAlign: 'right' }}>{l.tasks}</span>
              <span style={{ color: '#fbbf24', minWidth: '52px', flexShrink: 0, textAlign: 'right' }}>{l.cpuPct}%</span>
              <span style={{ color: '#4ade80', minWidth: '64px', flexShrink: 0, textAlign: 'right' }}>{l.memMib}MB</span>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>4 services healthy</span>
          <span style={{ color: '#4ade80' }}>0 OOM kills</span>
          <span style={{ color: '#4ade80' }}>all within limits</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          linux 6.11.0 · cgroups v2 · systemd 256 · unified hierarchy
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● all within limits' : 'loading'}
        </span>
      </div>
    </div>
  );
}
