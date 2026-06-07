'use client';

import { useEffect, useRef, useState } from 'react';

const WORKERS = [
  { name: 'api-router', routes: ['construxgroup.io/api/*'], req: 14200, errPct: 0.04, cpu: 0.8 },
  { name: 'og-image', routes: ['*/opengraph-image*'], req: 870, errPct: 0.0, cpu: 12 },
  { name: 'auth-gate', routes: ['*/dashboard*'], req: 3400, errPct: 0.12, cpu: 1.2 },
  { name: 'geo-redirect', routes: ['construxgroup.io/*'], req: 28000, errPct: 0.0, cpu: 0.2 },
];

const BINDINGS = [
  { type: 'KV', name: 'CACHE', desc: 'edge key-value store', color: '#fbbf24', ops: 48200 },
  { type: 'R2', name: 'ASSETS', desc: 'object storage bucket', color: '#67e8f9', ops: 1240 },
  { type: 'D1', name: 'DB', desc: 'serverless sqlite edge', color: '#4ade80', ops: 890 },
  { type: 'DO', name: 'SESSIONS', desc: 'durable objects actor', color: '#a78bfa', ops: 340 },
];

const EDGES = ['LAX', 'LHR', 'SIN', 'FRA', 'SYD', 'GRU', 'NRT', 'IAD'];

function useCounter(base: number, delta: number, ms = 800) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function CloudflareWorkersPanel() {
  const [visible, setVisible] = useState(false);
  const [rows, setRows] = useState(0);
  const [bindRows, setBindRows] = useState(0);
  const [activeEdge, setActiveEdge] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalReq = useCounter(46470, 28, 700);
  const p99 = useCounter(18, 0, 3000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setRows((x) => Math.min(x + 1, WORKERS.length)), 150);
    const b = setInterval(() => setBindRows((x) => Math.min(x + 1, BINDINGS.length)), 160);
    return () => { clearInterval(r); clearInterval(b); };
  }, [visible]);

  useEffect(() => {
    const id = setInterval(() => setActiveEdge((e) => (e + 1) % EDGES.length), 700);
    return () => clearInterval(id);
  }, []);

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(249,115,22,0.08)', background: 'rgba(249,115,22,0.025)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(249,115,22,0.4)' }}>
          cloudflare workers -- edge compute -- global network
        </span>
        <span
          style={{ fontSize: 8, color: '#f97316', fontWeight: 600, padding: '1px 6px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 2 }}
        >
          {EDGES[activeEdge]}
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>wrangler@edge</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>wrangler deploy --env production --minify && wrangler tail --format=pretty</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'req/min', value: totalReq.toLocaleString(), color: '#f97316' },
          { label: 'p99 latency', value: `${p99}ms`, color: '#4ade80' },
          { label: 'workers', value: WORKERS.length.toString(), color: '#67e8f9' },
          { label: 'edge nodes', value: '300+', color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Workers table */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // worker deployments
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {WORKERS.slice(0, rows).map((w) => (
            <div key={w.name} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 60px 52px 48px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 9, fontWeight: 600 }}>{w.name}</span>
              <span style={{ color: 'rgba(240,239,255,0.4)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.routes[0]}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 8, textAlign: 'right' }}>{w.req.toLocaleString()}/m</span>
              <span className="tabular-nums" style={{ color: w.errPct > 0.1 ? '#f87171' : 'rgba(255,255,255,0.3)', fontSize: 8, textAlign: 'right' }}>{w.errPct}%</span>
              <span className="tabular-nums" style={{ color: w.cpu > 5 ? '#fbbf24' : 'rgba(255,255,255,0.3)', fontSize: 8, textAlign: 'right' }}>{w.cpu}ms</span>
            </div>
          ))}
        </div>

        {/* Bindings */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // bindings
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {BINDINGS.slice(0, bindRows).map((b) => (
            <div key={b.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: `${b.color}08`, border: `1px solid ${b.color}28`, borderRadius: 2 }}>
              <span style={{ fontSize: 7, color: b.color, fontWeight: 700, padding: '1px 4px', background: `${b.color}14`, borderRadius: 2 }}>{b.type}</span>
              <span style={{ fontSize: 9, color: 'rgba(240,239,255,0.65)', fontWeight: 600 }}>{b.name}</span>
              <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>{b.desc}</span>
              <span className="tabular-nums" style={{ fontSize: 7, color: b.color, marginLeft: 2 }}>{b.ops.toLocaleString()} ops/m</span>
            </div>
          ))}
        </div>

        {/* Edge PoPs */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginTop: 10, marginBottom: 6 }}>
          // active edge pops
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {EDGES.map((pop, i) => (
            <span
              key={pop}
              style={{
                fontSize: 8,
                padding: '2px 6px',
                background: i === activeEdge ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${i === activeEdge ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 2,
                color: i === activeEdge ? '#f97316' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease',
                fontWeight: i === activeEdge ? 700 : 400,
              }}
            >
              {pop}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          wrangler v3.60 - workers runtime v8
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalReq.toLocaleString()} req/min - {WORKERS.length} workers deployed
        </span>
      </div>
    </div>
  );
}
