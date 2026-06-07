'use client';

import { useEffect, useRef, useState } from 'react';

const WORKERS = [
  { name: 'construx-api-proxy', routes: 3, cputime: 0.8, requests: 284000, errors: 4, status: 'active' },
  { name: 'construx-auth-gate', routes: 1, cputime: 1.2, requests: 120000, errors: 0, status: 'active' },
  { name: 'construx-image-resize', routes: 2, cputime: 12.4, requests: 48400, errors: 2, status: 'active' },
  { name: 'construx-cache-purge', routes: 1, cputime: 0.3, requests: 840, errors: 0, status: 'active' },
];

const KV_NAMESPACES = [
  { name: 'CONSTRUX_SESSIONS', keys: 28400, reads: 284000, writes: 12000, ttl: '1h' },
  { name: 'CONSTRUX_FEATURE_FLAGS', keys: 24, reads: 840000, writes: 8, ttl: '∞' },
  { name: 'CONSTRUX_RATE_LIMIT', keys: 4800, reads: 4800000, writes: 4800, ttl: '60s' },
  { name: 'CONSTRUX_CACHE', keys: 1240, reads: 128000, writes: 1240, ttl: '5m' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function CloudflareWorkersPanel() {
  const [visible, setVisible] = useState(false);
  const [wRows, setWRows] = useState(0);
  const [kvRows, setKvRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const reqPerSec = useCounter(28400, 240, 400);
  const kvReadsPerSec = useCounter(5280000, 840, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const w = setInterval(() => setWRows((x) => Math.min(x + 1, WORKERS.length)), 160);
    const k = setInterval(() => setKvRows((x) => Math.min(x + 1, KV_NAMESPACES.length)), 140);
    return () => { clearInterval(w); clearInterval(k); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(249,115,22,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(249,115,22,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(249,115,22,0.08)', background: 'rgba(249,115,22,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(249,115,22,0.4)' }}>
          cloudflare workers -- edge runtime -- workers / kv / routes
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {reqPerSec.toLocaleString()} req/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>wrangler@edge</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>wrangler deploy --env production && wrangler tail construx-api-proxy --format pretty</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'req/s', value: reqPerSec.toLocaleString(), color: '#f97316' },
          { label: 'kv reads/s', value: (kvReadsPerSec / 1000).toFixed(0) + 'k', color: '#67e8f9' },
          { label: 'workers', value: WORKERS.length.toString(), color: '#4ade80' },
          { label: 'kv namespaces', value: KV_NAMESPACES.length.toString(), color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Workers */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // workers
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {WORKERS.slice(0, wRows).map((w) => (
            <div key={w.name} style={{ display: 'grid', gridTemplateColumns: '1fr 24px 44px 52px 24px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{w.routes}r</span>
              <span className="tabular-nums" style={{ color: w.cputime > 10 ? '#fbbf24' : '#67e8f9', fontSize: 7, textAlign: 'right' }}>{w.cputime}ms</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{(w.requests / 1000).toFixed(0)}k</span>
              <span className="tabular-nums" style={{ color: w.errors > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{w.errors}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{w.status}</span>
            </div>
          ))}
        </div>

        {/* KV Namespaces */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // kv namespaces
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {KV_NAMESPACES.slice(0, kvRows).map((kv) => (
            <div key={kv.name} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 52px 44px 32px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kv.name}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{(kv.keys / 1000).toFixed(0)}k</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{(kv.reads / 1000).toFixed(0)}k</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{(kv.writes / 1000).toFixed(1)}k</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 7, textAlign: 'right' }}>{kv.ttl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          wrangler v3.60 - apache-2.0 - cloudflare workers edge runtime
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {reqPerSec.toLocaleString()} req/s - {(kvReadsPerSec / 1000).toFixed(0)}k kv/s
        </span>
      </div>
    </div>
  );
}
