'use client';

import { useState, useEffect, useRef } from 'react';

interface ServiceEntry {
  unit:        string;
  load:        string;
  active:      string;
  sub:         string;
  description: string;
}

const BASE_SERVICES: ServiceEntry[] = [
  { unit: 'nginx.service',           load: 'loaded', active: 'active', sub: 'running', description: 'A high performance web server and reverse proxy' },
  { unit: 'postgresql.service',      load: 'loaded', active: 'active', sub: 'running', description: 'PostgreSQL 16 Database Server' },
  { unit: 'redis.service',           load: 'loaded', active: 'active', sub: 'running', description: 'Advanced key-value store' },
  { unit: 'construx-api.service',    load: 'loaded', active: 'active', sub: 'running', description: 'Construx Group API (Node.js / Bun)' },
  { unit: 'construx-worker.service', load: 'loaded', active: 'active', sub: 'running', description: 'Temporal workflow worker' },
  { unit: 'cloudflared.service',     load: 'loaded', active: 'active', sub: 'running', description: 'Cloudflare Tunnel' },
  { unit: 'prometheus.service',      load: 'loaded', active: 'active', sub: 'running', description: 'Monitoring system and time series database' },
  { unit: 'node-exporter.service',   load: 'loaded', active: 'active', sub: 'running', description: 'Prometheus exporter for machine metrics' },
  { unit: 'fail2ban.service',        load: 'loaded', active: 'active', sub: 'running', description: 'Daemon to ban hosts that cause multiple auth errors' },
  { unit: 'unattended-upgrades.service', load: 'loaded', active: 'active', sub: 'running', description: 'Unattended Upgrades Shutdown' },
  { unit: 'systemd-resolved.service',load: 'loaded', active: 'active', sub: 'running', description: 'Network Name Resolution' },
  { unit: 'chronyd.service',         load: 'loaded', active: 'active', sub: 'running', description: 'NTP client/server' },
];

const TICKER_ENTRIES: ServiceEntry[] = [
  { unit: 'scoutr-api.service',   load: 'loaded', active: 'active', sub: 'running',      description: 'Scoutr market research API' },
  { unit: 'hyve-ctx.service',     load: 'loaded', active: 'active', sub: 'running',      description: 'Hyve context extraction worker' },
  { unit: 'marqet-scraper.service', load: 'loaded', active: 'activating', sub: 'start',  description: 'Marqet product scraper (restarting)' },
];

function subColor(sub: string) {
  if (sub === 'running')     return '#4ade80';
  if (sub === 'start')       return '#fbbf24';
  if (sub === 'stop')        return '#f87171';
  return 'rgba(240,239,255,0.3)';
}

function unitColor(unit: string) {
  if (unit.startsWith('construx')) return '#a78bfa';
  if (unit.startsWith('nginx'))    return '#67e8f9';
  if (unit.startsWith('postgres')) return '#60a5fa';
  if (unit.startsWith('redis'))    return '#f87171';
  if (unit.startsWith('cloud'))    return '#fbbf24';
  if (unit.startsWith('prom') || unit.startsWith('node-exp')) return '#fb923c';
  return 'rgba(240,239,255,0.5)';
}

export default function SystemdServicesPanel() {
  const [entries, setEntries]   = useState<ServiceEntry[]>([]);
  const [revealed, setRevealed] = useState(0);
  const tickIdx = useRef(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setEntries(BASE_SERVICES);
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > BASE_SERVICES.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 75);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= BASE_SERVICES.length) return;
    const id = setInterval(() => {
      const next = TICKER_ENTRIES[tickIdx.current % TICKER_ENTRIES.length];
      tickIdx.current++;
      setEntries((prev) => {
        const without = prev.filter((e) => e.unit !== next.unit);
        return [...without.slice(0, 11), next];
      });
    }, 4200);
    return () => clearInterval(id);
  }, [revealed]);

  const allDone  = revealed > BASE_SERVICES.length;
  const displayed = allDone ? entries : BASE_SERVICES.slice(0, revealed);
  const activeCount = displayed.filter((e) => e.sub === 'running').length;

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
          construx@sys — systemd units
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${activeCount} running` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          systemctl list-units --type=service --state=running --no-pager
        </span>
      </div>

      {/* Column headers */}
      <div className="px-4 pt-2 pb-1 flex gap-2 text-[7px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.18)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span style={{ minWidth: '180px' }}>UNIT</span>
        <span style={{ minWidth: '52px' }}>LOAD</span>
        <span style={{ minWidth: '52px' }}>ACTIVE</span>
        <span style={{ minWidth: '52px' }}>SUB</span>
        <span>DESCRIPTION</span>
      </div>

      {/* Entries */}
      <div className="px-4 py-2 space-y-1">
        {displayed.map((e, i) => (
          <div key={i} className="flex items-start gap-2 text-[8px]">
            <span style={{ color: unitColor(e.unit), minWidth: '180px', flexShrink: 0 }}>
              {e.unit}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '52px', flexShrink: 0 }}>
              {e.load}
            </span>
            <span style={{ color: 'rgba(74,222,128,0.6)', minWidth: '52px', flexShrink: 0 }}>
              {e.active}
            </span>
            <span style={{ color: subColor(e.sub), minWidth: '52px', flexShrink: 0, fontWeight: 700 }}>
              {e.sub}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.28)', lineHeight: 1.4 }}>
              {e.description}
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
          {activeCount} active · 0 failed · systemd 255 · kernel 6.8.4
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● live' : 'loading'}
        </span>
      </div>
    </div>
  );
}
