'use client';

import { useState, useEffect, useRef } from 'react';

interface Route {
  dest:    string;
  via?:    string;
  dev:     string;
  proto:   string;
  scope?:  string;
  metric?: number;
  src?:    string;
  accent:  string;
}

const BASE_ROUTES: Route[] = [
  { dest: 'default',          via: '185.12.44.1',  dev: 'eth0',    proto: 'static',  metric: 100,  accent: '#F97316' },
  { dest: '10.0.0.0/8',       via: '10.8.0.1',     dev: 'tun0',    proto: 'static',  metric: 50,   accent: '#a78bfa' },
  { dest: '10.8.0.0/24',                           dev: 'tun0',    proto: 'kernel',  scope: 'link', accent: '#a78bfa' },
  { dest: '127.0.0.0/8',                           dev: 'lo',      proto: 'kernel',  scope: 'host', accent: '#4ade80' },
  { dest: '172.17.0.0/16',                         dev: 'docker0', proto: 'kernel',  scope: 'link', accent: '#67e8f9' },
  { dest: '172.18.0.0/16',                         dev: 'br-k8s',  proto: 'kernel',  scope: 'link', accent: '#67e8f9' },
  { dest: '185.12.44.0/24',                        dev: 'eth0',    proto: 'kernel',  scope: 'link', accent: '#4ade80' },
  { dest: '185.12.44.1',                           dev: 'eth0',    proto: 'kernel',  scope: 'link', accent: '#4ade80' },
  { dest: '185.12.44.201',    src: '185.12.44.201', dev: 'eth0',   proto: 'kernel',  scope: 'host', accent: '#fbbf24' },
  { dest: '192.168.100.0/24',                      dev: 'tun0',    proto: 'static',  metric: 50,   accent: '#a78bfa' },
  { dest: '224.0.0.0/4',                           dev: 'eth0',    proto: 'kernel',  scope: 'link', accent: 'rgba(240,239,255,0.25)' },
  { dest: '255.255.255.255/32',                    dev: 'eth0',    proto: 'kernel',  scope: 'link', accent: 'rgba(240,239,255,0.2)' },
];

function protoColor(proto: string) {
  if (proto === 'static') return '#F97316';
  if (proto === 'kernel') return 'rgba(240,239,255,0.3)';
  return 'rgba(240,239,255,0.2)';
}

export default function RoutingTablePanel() {
  const [revealed, setRevealed] = useState(0);
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
    if (revealed === 0 || revealed > BASE_ROUTES.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 70);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone     = revealed > BASE_ROUTES.length;
  const staticCount = BASE_ROUTES.filter((r) => r.proto === 'static').length;

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
          construx@sys — routing table
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.6)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${BASE_ROUTES.length} routes` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          ip route show table main
        </span>
      </div>

      {/* Column headers */}
      <div
        className="flex items-center gap-3 px-4 py-1 text-[7px] uppercase tracking-widest select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
      >
        <span style={{ minWidth: '160px', flexShrink: 0 }}>DESTINATION</span>
        <span style={{ minWidth: '108px', flexShrink: 0 }}>VIA</span>
        <span style={{ minWidth: '72px', flexShrink: 0 }}>DEV</span>
        <span style={{ minWidth: '56px', flexShrink: 0 }}>PROTO</span>
        <span>METRIC / SCOPE</span>
      </div>

      {/* Route rows */}
      <div className="px-4 py-2 space-y-1.5">
        {BASE_ROUTES.slice(0, revealed).map((r, i) => (
          <div key={i} className="flex items-center gap-3 text-[8px] tabular-nums">
            <span style={{ color: r.accent, minWidth: '160px', flexShrink: 0, fontWeight: r.dest === 'default' ? 700 : 500 }}>
              {r.dest}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.4)', minWidth: '108px', flexShrink: 0 }}>
              {r.via ? `via ${r.via}` : '—'}
            </span>
            <span style={{ color: '#67e8f9', minWidth: '72px', flexShrink: 0 }}>
              {r.dev}
            </span>
            <span style={{ color: protoColor(r.proto), minWidth: '56px', flexShrink: 0 }}>
              {r.proto}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.25)' }}>
              {r.metric != null ? `metric ${r.metric}` : r.scope ?? ''}
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
          {BASE_ROUTES.length} routes · {staticCount} static · iproute2 6.7
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          table main
        </span>
      </div>
    </div>
  );
}
