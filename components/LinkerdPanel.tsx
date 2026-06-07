'use client';

import { useEffect, useRef, useState } from 'react';

const DEPLOYMENTS = [
  { name: 'construx-api', namespace: 'prod', meshed: 4, unmeshed: 0, successRate: 99.9, p99: 48, rps: 284 },
  { name: 'construx-worker', namespace: 'prod', meshed: 2, unmeshed: 0, successRate: 99.7, p99: 840, rps: 48 },
  { name: 'construx-auth', namespace: 'prod', meshed: 3, unmeshed: 0, successRate: 100.0, p99: 12, rps: 120 },
  { name: 'construx-media', namespace: 'prod', meshed: 2, unmeshed: 0, successRate: 96.2, p99: 8400, rps: 8 },
];

const ROUTES = [
  { route: 'GET /api/listings', deployment: 'construx-api', rps: 84, successRate: 99.9, p99: 28, effectiveTimeout: '30s' },
  { route: 'POST /api/search', deployment: 'construx-api', rps: 48, successRate: 99.6, p99: 184, effectiveTimeout: '10s' },
  { route: 'POST /api/checkout', deployment: 'construx-api', rps: 4, successRate: 99.8, p99: 840, effectiveTimeout: '60s' },
  { route: 'GET /healthz', deployment: 'construx-auth', rps: 120, successRate: 100.0, p99: 2, effectiveTimeout: '5s' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function LinkerdPanel() {
  const [visible, setVisible] = useState(false);
  const [depRows, setDepRows] = useState(0);
  const [rtRows, setRtRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const rpsTotal = useCounter(460, 4, 400);
  const requestsTotal = useCounter(2840000, 840, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const d = setInterval(() => setDepRows((x) => Math.min(x + 1, DEPLOYMENTS.length)), 160);
    const r = setInterval(() => setRtRows((x) => Math.min(x + 1, ROUTES.length)), 140);
    return () => { clearInterval(d); clearInterval(r); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(167,139,250,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(167,139,250,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(167,139,250,0.08)', background: 'rgba(167,139,250,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(167,139,250,0.4)' }}>
          linkerd -- service mesh -- mTLS / routes / golden signals
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {rpsTotal.toLocaleString()} rps
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>linkerd@mesh</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>linkerd viz stat deployments -n prod --from deploy/construx-api && linkerd viz routes deploy/construx-api</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'rps', value: rpsTotal.toLocaleString(), color: '#a78bfa' },
          { label: 'requests', value: (requestsTotal / 1000000).toFixed(1) + 'M', color: '#4ade80' },
          { label: 'deployments', value: DEPLOYMENTS.length.toString(), color: '#67e8f9' },
          { label: 'degraded', value: DEPLOYMENTS.filter(d => d.successRate < 99).length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Deployments */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // deployments
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {DEPLOYMENTS.slice(0, depRows).map((dep) => (
            <div key={dep.name} style={{ display: 'grid', gridTemplateColumns: '72px 36px 24px 48px 36px 36px', alignItems: 'center', gap: 8, padding: '5px 8px', background: dep.successRate < 99 ? 'rgba(251,191,36,0.04)' : 'rgba(167,139,250,0.04)', border: `1px solid ${dep.successRate < 99 ? 'rgba(251,191,36,0.1)' : 'rgba(167,139,250,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dep.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{dep.namespace}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{dep.meshed}</span>
              <span className="tabular-nums" style={{ color: dep.successRate < 99 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{dep.successRate}%</span>
              <span className="tabular-nums" style={{ color: dep.p99 > 1000 ? '#f87171' : dep.p99 > 200 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{dep.p99}ms</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{dep.rps}/s</span>
            </div>
          ))}
        </div>

        {/* Routes */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // routes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ROUTES.slice(0, rtRows).map((rt) => (
            <div key={rt.route} style={{ display: 'grid', gridTemplateColumns: '1fr 28px 48px 40px 32px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rt.route}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'center' }}>{rt.rps}/s</span>
              <span className="tabular-nums" style={{ color: rt.successRate < 99.5 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{rt.successRate}%</span>
              <span className="tabular-nums" style={{ color: rt.p99 > 500 ? '#fbbf24' : '#67e8f9', fontSize: 7, textAlign: 'right' }}>{rt.p99}ms</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{rt.effectiveTimeout}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          linkerd v2.15 - apache-2.0 - cncf service mesh
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {rpsTotal.toLocaleString()} rps - {(requestsTotal / 1000000).toFixed(1)}M total
        </span>
      </div>
    </div>
  );
}
