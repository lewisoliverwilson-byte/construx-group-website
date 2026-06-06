'use client';

import { useState, useEffect, useRef } from 'react';

interface ComposeService {
  name:     string;
  image:    string;
  status:   'running' | 'exited' | 'restarting';
  health:   'healthy' | 'unhealthy' | 'starting' | 'none';
  ports:    string;
  cpuPct:   number;
  memMB:    number;
  replicas: string;
}

const SERVICES: ComposeService[] = [
  { name: 'api',        image: 'construx/api:latest',         status: 'running',    health: 'healthy',   ports: '0.0.0.0:3001->3001/tcp',  cpuPct: 4.2,  memMB: 312,  replicas: '3/3' },
  { name: 'web',        image: 'construx/web:latest',         status: 'running',    health: 'healthy',   ports: '0.0.0.0:3000->3000/tcp',  cpuPct: 1.8,  memMB: 228,  replicas: '2/2' },
  { name: 'worker',     image: 'construx/worker:latest',      status: 'running',    health: 'healthy',   ports: '',                        cpuPct: 7.1,  memMB: 189,  replicas: '2/2' },
  { name: 'postgres',   image: 'postgres:16-alpine',          status: 'running',    health: 'healthy',   ports: '127.0.0.1:5432->5432/tcp',cpuPct: 2.3,  memMB: 94,   replicas: '1/1' },
  { name: 'redis',      image: 'redis:7-alpine',              status: 'running',    health: 'healthy',   ports: '127.0.0.1:6379->6379/tcp',cpuPct: 0.4,  memMB: 18,   replicas: '1/1' },
  { name: 'caddy',      image: 'caddy:2-alpine',              status: 'running',    health: 'none',      ports: '0.0.0.0:80->80/tcp 0.0.0.0:443->443/tcp', cpuPct: 0.2, memMB: 12, replicas: '1/1' },
  { name: 'prometheus', image: 'prom/prometheus:v2.55.1',     status: 'running',    health: 'none',      ports: '127.0.0.1:9090->9090/tcp',cpuPct: 0.8,  memMB: 41,   replicas: '1/1' },
  { name: 'grafana',    image: 'grafana/grafana:11.4.0',      status: 'running',    health: 'none',      ports: '127.0.0.1:3003->3000/tcp',cpuPct: 0.6,  memMB: 78,   replicas: '1/1' },
  { name: 'mailpit',    image: 'axllent/mailpit:latest',      status: 'running',    health: 'none',      ports: '127.0.0.1:8025->8025/tcp',cpuPct: 0.1,  memMB: 8,    replicas: '1/1' },
  { name: 'otel-col',   image: 'otel/opentelemetry-collector:0.115.0', status: 'running', health: 'none', ports: '127.0.0.1:4317->4317/tcp', cpuPct: 0.3, memMB: 22, replicas: '1/1' },
  { name: 'pgadmin',    image: 'dpage/pgadmin4:8.13',         status: 'exited',     health: 'none',      ports: '',                        cpuPct: 0.0,  memMB: 0,    replicas: '0/1' },
];

const TOTAL = SERVICES.length;

function statusColor(s: ComposeService['status']): string {
  if (s === 'running')    return '#4ade80';
  if (s === 'restarting') return '#fbbf24';
  return 'rgba(240,239,255,0.2)';
}

function healthColor(h: ComposeService['health']): string {
  if (h === 'healthy')   return '#4ade80';
  if (h === 'unhealthy') return '#f87171';
  if (h === 'starting')  return '#fbbf24';
  return 'rgba(240,239,255,0.2)';
}

function cpuColor(pct: number): string {
  if (pct > 20) return '#f87171';
  if (pct > 8)  return '#fbbf24';
  return '#4ade80';
}

function memColor(mb: number): string {
  if (mb > 400) return '#f87171';
  if (mb > 200) return '#fbbf24';
  return 'rgba(240,239,255,0.4)';
}

export default function DockerComposePanel() {
  const [revealed,   setRevealed]   = useState(0);
  const [liveCpu,    setLiveCpu]    = useState(17.8);
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
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 84);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => {
      setLiveCpu((v) => Math.max(12, Math.min(32, v + (Math.random() - 0.5) * 3)));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const allDone      = revealed > TOTAL;
  const shownSvcs    = SERVICES.slice(0, Math.max(0, Math.min(SERVICES.length, revealed)));
  const runningCount = SERVICES.filter((s) => s.status === 'running').length;
  const totalMemMB   = SERVICES.filter(s => s.status === 'running').reduce((sum, s) => sum + s.memMB, 0);

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
          construx@vps-fra01 — docker compose ps
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveCpu.toFixed(1)}% CPU` : 'querying…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@vps-fra01:~/construx$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          docker compose ps --format &apos;table \{'{'}\{'{'}.Name{'}'}{'}'},\{'{'}\{'{'}.Image{'}'}{'}'},\{'{'}\{'{'}.Status{'}'}{'}'},\{'{'}\{'{'}.Ports{'}'}{'}'}&apos;
        </span>
      </div>

      {/* Column headers */}
      {shownSvcs.length > 0 && (
        <div
          className="flex items-center px-4 py-0.5 text-[6.5px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ minWidth: '104px', flexShrink: 0 }}>Service</span>
          <span style={{ minWidth: '196px', flexShrink: 0 }}>Image</span>
          <span style={{ minWidth: '72px',  flexShrink: 0 }}>Status</span>
          <span style={{ minWidth: '64px',  flexShrink: 0 }}>Health</span>
          <span style={{ minWidth: '44px',  flexShrink: 0, textAlign: 'right' }}>CPU</span>
          <span style={{ minWidth: '52px',  flexShrink: 0, textAlign: 'right' }}>Mem</span>
          <span style={{ minWidth: '44px',  flexShrink: 0, textAlign: 'center' }}>Scale</span>
          <span>Ports</span>
        </div>
      )}

      {/* Rows */}
      <div className="px-4 py-1.5 space-y-0.5">
        {shownSvcs.map((s, i) => (
          <div
            key={i}
            className="flex items-center text-[7.5px] leading-[1.7]"
            style={{
              borderLeft: `2px solid ${s.status === 'running' ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.05)'}`,
              paddingLeft: '4px',
            }}
          >
            <span style={{ color: s.status === 'running' ? 'rgba(240,239,255,0.55)' : 'rgba(240,239,255,0.2)', minWidth: '104px', flexShrink: 0, fontWeight: 500 }}>
              {s.name}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.22)', minWidth: '196px', flexShrink: 0, fontSize: '7px' }}>{s.image}</span>
            <span style={{ color: statusColor(s.status), minWidth: '72px', flexShrink: 0 }}>{s.status}</span>
            <span style={{ color: healthColor(s.health), minWidth: '64px', flexShrink: 0, fontSize: '7px' }}>
              {s.health !== 'none' ? s.health : '—'}
            </span>
            <span style={{ color: cpuColor(s.cpuPct), minWidth: '44px', flexShrink: 0, textAlign: 'right' }}>
              {s.status === 'running' ? `${s.cpuPct.toFixed(1)}%` : '—'}
            </span>
            <span style={{ color: memColor(s.memMB), minWidth: '52px', flexShrink: 0, textAlign: 'right' }}>
              {s.status === 'running' ? `${s.memMB}M` : '—'}
            </span>
            <span style={{ color: '#fbbf24', minWidth: '44px', flexShrink: 0, textAlign: 'center', fontSize: '7px' }}>{s.replicas}</span>
            <span style={{ color: 'rgba(240,239,255,0.2)', fontSize: '7px', whiteSpace: 'nowrap' }}>{s.ports || '—'}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>{runningCount} running</span>
          <span>{SERVICES.length - runningCount} stopped</span>
          <span style={{ color: '#60a5fa' }}>{(totalMemMB / 1024).toFixed(1)} GB mem</span>
          <span style={{ color: '#fbbf24' }}>{liveCpu.toFixed(1)}% CPU total</span>
          <span className="ml-auto" style={{ color: 'rgba(240,239,255,0.25)' }}>
            docker 27.4.1 · compose 2.31.0 · construx stack
          </span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          docker compose · {SERVICES.length} services · vps-fra01
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? `● ${runningCount}/${SERVICES.length} up` : 'loading'}
        </span>
      </div>
    </div>
  );
}
