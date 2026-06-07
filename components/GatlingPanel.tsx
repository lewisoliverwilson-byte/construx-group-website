'use client';

import { useEffect, useRef, useState } from 'react';

const SIMULATIONS = [
  { name: 'ConstructionListingLoad', users: 500, duration: '10m', requests: 284200, errors: 12, status: 'passed' },
  { name: 'SearchApiStress', users: 1000, duration: '5m', requests: 120400, errors: 84, status: 'failed' },
  { name: 'CheckoutSoak', users: 200, duration: '60m', requests: 840200, errors: 4, status: 'passed' },
];

const STATS = [
  { name: 'All Requests', okCount: 1244800, koCount: 100, p50: 28, p95: 184, p99: 840, meanRps: 2840 },
  { name: 'GET /listings', okCount: 284200, koCount: 12, p50: 18, p95: 84, p99: 420, meanRps: 840 },
  { name: 'POST /search', okCount: 120400, koCount: 84, p50: 84, p95: 480, p99: 2400, meanRps: 284 },
  { name: 'GET /listing/:id', okCount: 840200, koCount: 4, p50: 12, p95: 48, p99: 184, meanRps: 1400 },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function GatlingPanel() {
  const [visible, setVisible] = useState(false);
  const [simRows, setSimRows] = useState(0);
  const [stRows, setStRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const activeUsers = useCounter(500, 8, 600);
  const rps = useCounter(2840, 48, 400);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setSimRows((x) => Math.min(x + 1, SIMULATIONS.length)), 160);
    const st = setInterval(() => setStRows((x) => Math.min(x + 1, STATS.length)), 140);
    return () => { clearInterval(s); clearInterval(st); };
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
          gatling -- load testing -- simulations / rps / percentiles
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {rps.toLocaleString()} req/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>gatling@load</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>gatling.sh --simulation ConstructionListingLoad --run-description "prod load test v2.4.1"</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'req/s', value: rps.toLocaleString(), color: '#f97316' },
          { label: 'active users', value: activeUsers.toLocaleString(), color: '#a78bfa' },
          { label: 'simulations', value: SIMULATIONS.length.toString(), color: '#4ade80' },
          { label: 'failed', value: SIMULATIONS.filter(s => s.status === 'failed').length.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Simulations */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // simulations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {SIMULATIONS.slice(0, simRows).map((sim) => (
            <div key={sim.name} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 40px 52px 24px 48px', alignItems: 'center', gap: 8, padding: '5px 8px', background: sim.status === 'failed' ? 'rgba(248,113,113,0.04)' : 'rgba(249,115,22,0.04)', border: `1px solid ${sim.status === 'failed' ? 'rgba(248,113,113,0.1)' : 'rgba(249,115,22,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sim.name}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{sim.users}u</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{sim.duration}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{(sim.requests / 1000).toFixed(0)}k</span>
              <span className="tabular-nums" style={{ color: sim.errors > 10 ? '#f87171' : '#fbbf24', fontSize: 7, textAlign: 'center' }}>{sim.errors}</span>
              <span style={{ color: sim.status === 'passed' ? '#4ade80' : '#f87171', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{sim.status}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // request stats (ms)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {STATS.slice(0, stRows).map((st) => (
            <div key={st.name} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 36px 40px 48px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.name}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{st.p50}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{st.p95}</span>
              <span className="tabular-nums" style={{ color: st.p99 > 500 ? '#f87171' : '#67e8f9', fontSize: 7, textAlign: 'right' }}>{st.p99}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{st.meanRps.toLocaleString()}/s</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          gatling v3.11 - apache-2.0 - scala load testing
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {rps.toLocaleString()} req/s - {activeUsers.toLocaleString()} users
        </span>
      </div>
    </div>
  );
}
