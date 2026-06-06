'use client';

import { useState, useEffect, useRef } from 'react';

interface ServiceUnit {
  name: string;
  description: string;
  status: 'active' | 'activating' | 'inactive';
  uptime: string;
  pid: number;
  memory: string;
  accent: string;
}

const UNITS: ServiceUnit[] = [
  { name: 'construx-scoutr-api.service',    description: 'Scoutr — product optimisation API',          status: 'active',     uptime: '97d 14h 22m', pid: 3812,  memory: '128.4M', accent: '#F97316' },
  { name: 'construx-scoutr-worker.service', description: 'Scoutr — background scan worker',            status: 'active',     uptime: '97d 14h 21m', pid: 3847,  memory: '96.2M',  accent: '#F97316' },
  { name: 'construx-marqet-web.service',    description: 'The Marqet — marketplace web frontend',      status: 'active',     uptime: '83d 09h 04m', pid: 4021,  memory: '64.1M',  accent: '#7dd3fc' },
  { name: 'construx-marqet-embed.service',  description: 'The Marqet — AI embed generation worker',   status: 'active',     uptime: '83d 09h 01m', pid: 4058,  memory: '248.7M', accent: '#7dd3fc' },
  { name: 'construx-hyve-api.service',      description: 'The Hyve — workspace REST API',              status: 'active',     uptime: '61d 22h 50m', pid: 5103,  memory: '112.3M', accent: '#4ade80' },
  { name: 'construx-hyve-ws.service',       description: 'The Hyve — WebSocket realtime gateway',     status: 'active',     uptime: '61d 22h 50m', pid: 5117,  memory: '44.8M',  accent: '#4ade80' },
  { name: 'construx-lattice-landing.service', description: 'The Lattice — demand test landing page', status: 'active',     uptime: '30d 11h 19m', pid: 6804,  memory: '28.2M',  accent: '#a78bfa' },
  { name: 'construx-postgres.service',      description: 'PostgreSQL 16 — primary datastore',          status: 'active',     uptime: '97d 14h 30m', pid: 1044,  memory: '512.0M', accent: '#67e8f9' },
  { name: 'construx-redis.service',         description: 'Redis 7 — cache and job queue',              status: 'active',     uptime: '97d 14h 29m', pid: 1071,  memory: '38.6M',  accent: '#67e8f9' },
];

const DOT_ACTIVE = '●';

export default function SystemdStatusPanel() {
  const [revealed, setRevealed] = useState(0);
  const [tick, setTick] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
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
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > UNITS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 80);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3100);
    return () => clearInterval(id);
  }, []);

  const activeCount = UNITS.filter((u) => u.status === 'active').length;

  return (
    <div
      ref={ref}
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
          construx@sys — systemd unit status
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.5)' }}>
          {activeCount}/{UNITS.length} running
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          systemctl status construx-*.service --no-pager
        </span>
      </div>

      {/* Unit list */}
      <div className="px-4 py-3 space-y-2.5">
        {UNITS.map((unit, i) => {
          const visible = i < revealed;
          const pulse = tick % 2 === 0;
          return (
            <div
              key={unit.name}
              style={{
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.12s ease',
              }}
            >
              {/* Unit header line */}
              <div className="flex items-center gap-2.5 text-[8px] mb-0.5">
                <span
                  style={{
                    color: unit.status === 'active'
                      ? (pulse ? 'rgba(74,222,128,0.9)' : 'rgba(74,222,128,0.55)')
                      : 'rgba(234,179,8,0.8)',
                    transition: 'color 0.6s ease',
                  }}
                >
                  {DOT_ACTIVE}
                </span>
                <span style={{ color: unit.accent, fontWeight: 600 }}>{unit.name}</span>
              </div>

              {/* Description + state line */}
              <div className="text-[8px] pl-4 mb-0.5" style={{ color: 'rgba(240,239,255,0.35)' }}>
                {unit.description}
              </div>

              {/* Meta line */}
              <div className="flex items-center gap-5 text-[8px] pl-4">
                <span>
                  <span style={{ color: 'rgba(255,255,255,0.18)' }}>Loaded: </span>
                  <span style={{ color: 'rgba(74,222,128,0.55)' }}>enabled</span>
                </span>
                <span>
                  <span style={{ color: 'rgba(255,255,255,0.18)' }}>Active: </span>
                  <span style={{ color: 'rgba(74,222,128,0.7)' }}>active (running)</span>
                  <span style={{ color: 'rgba(255,255,255,0.15)' }}> — up {unit.uptime}</span>
                </span>
                <span>
                  <span style={{ color: 'rgba(255,255,255,0.18)' }}>PID: </span>
                  <span style={{ color: unit.accent, opacity: 0.6 }}>{unit.pid}</span>
                </span>
                <span>
                  <span style={{ color: 'rgba(255,255,255,0.18)' }}>Mem: </span>
                  <span style={{ color: 'rgba(240,239,255,0.45)' }}>{unit.memory}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          systemd · {UNITS.length} units loaded
        </span>
        <span
          className="text-[8px] uppercase tracking-widest flex items-center gap-1.5"
          style={{ color: 'rgba(74,222,128,0.5)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: '#4ade80', boxShadow: '0 0 4px rgba(74,222,128,0.6)' }}
          />
          all nominal
        </span>
      </div>
    </div>
  );
}
