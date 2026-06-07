'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'healthy' | 'failing' | 'kv' | 'intention' | 'dns' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',   text: '# consul: service discovery, health checks, KV, and service mesh' },
  { kind: 'prompt',    text: 'consul catalog services' },
  { kind: 'healthy',   text: '  construx-api     3 healthy / 3 total  :8080' },
  { kind: 'healthy',   text: '  postgres         2 healthy / 2 total  :5432' },
  { kind: 'failing',   text: '  redis            1 healthy / 2 total  :6379  (1 failing)' },
  { kind: 'healthy',   text: '  worker           4 healthy / 4 total  :9000' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# resolve via DNS — clients need no Consul client library' },
  { kind: 'prompt',    text: 'dig @127.0.0.1 -p 8600 construx-api.service.consul SRV +short' },
  { kind: 'dns',       text: '  1 1 8080 ip-10-0-1-10.node.eu-west-1.consul.' },
  { kind: 'dns',       text: '  1 1 8080 ip-10-0-1-11.node.eu-west-1.consul.' },
  { kind: 'dns',       text: '  1 1 8080 ip-10-0-1-12.node.eu-west-1.consul.' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# KV store: distributed configuration' },
  { kind: 'prompt',    text: 'consul kv get -recurse construx/config/' },
  { kind: 'kv',        text: '  construx/config/log-level: warn' },
  { kind: 'kv',        text: '  construx/config/rate-limit/api: 1000' },
  { kind: 'kv',        text: '  construx/config/feature-flags/new-checkout: true' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# Connect intentions: control which services can talk' },
  { kind: 'prompt',    text: 'consul intention list' },
  { kind: 'intention', text: '  construx-api → postgres   allow' },
  { kind: 'intention', text: '  construx-api → redis      allow' },
  { kind: 'failing',   text: '  *            → *          deny   (default)' },
  { kind: 'stat',      text: '  mTLS enforced by Envoy sidecar — intentions evaluated at proxy' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':   return 'rgba(240,239,255,0.22)';
    case 'prompt':    return 'rgba(240,239,255,0.6)';
    case 'healthy':   return '#4ade80';
    case 'failing':   return '#f87171';
    case 'kv':        return '#67e8f9';
    case 'intention': return '#a78bfa';
    case 'dns':       return '#fbbf24';
    case 'stat':      return 'rgba(240,239,255,0.45)';
    default:          return 'transparent';
  }
}

export default function ConsulPanel() {
  const [revealed,      setRevealed]      = useState(0);
  const [liveServices,  setLiveServices]  = useState(4);
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
            setLiveServices(Math.floor(3 + Math.random() * 4));
          }, 1900);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 79;
    const id = setTimeout(() => setRevealed((r) => r + 1), delay);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const allDone    = revealed > TOTAL;
  const shownLines = LINES.slice(0, Math.max(0, revealed - 1));

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
          construx@prod-eu — consul · service discovery · KV · mesh
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveServices} services` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-eu# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          consul · services · DNS · KV · intentions · mTLS · health
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => (
          <div
            key={i}
            className="text-[7.5px] leading-[1.8]"
            style={{ color: lineColor(l.kind) }}
          >
            {l.kind === 'blank' ? ' ' : (
              <>
                {l.kind === 'prompt' && (
                  <span style={{ color: 'rgba(74,222,128,0.45)', marginRight: '6px' }}>$</span>
                )}
                {l.text}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Metadata */}
      {allDone && (
        <div
          className="flex items-center gap-4 flex-wrap px-4 py-1.5 text-[7.5px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Consul v1.20 ·</span>
          <span style={{ color: '#4ade80' }}>{liveServices} services</span>
          <span style={{ color: '#fbbf24' }}>DNS SRV</span>
          <span style={{ color: '#67e8f9' }}>KV config</span>
          <span style={{ color: '#a78bfa' }}>mTLS intentions</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          consul · service-discovery · DNS · KV · Envoy · mTLS · intentions
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● watching' : 'loading'}
        </span>
      </div>
    </div>
  );
}
