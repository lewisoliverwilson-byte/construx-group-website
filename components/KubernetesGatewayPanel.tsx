'use client';

import { useEffect, useRef, useState } from 'react';

const GATEWAYS = [
  { name: 'construx-prod-gw', class: 'nginx', listeners: 3, routes: 28, state: 'Programmed' },
  { name: 'construx-staging-gw', class: 'nginx', listeners: 2, routes: 12, state: 'Programmed' },
  { name: 'construx-internal-gw', class: 'traefik', listeners: 2, routes: 8, state: 'Programmed' },
];

const ROUTES = [
  { name: 'construx-web-route', gateway: 'construx-prod-gw', hostnames: 'construxgroup.io', backend: 'construx-web:3000', status: 'Accepted' },
  { name: 'scoutr-route', gateway: 'construx-prod-gw', hostnames: 'scoutr.io', backend: 'scoutr-svc:8080', status: 'Accepted' },
  { name: 'marqet-route', gateway: 'construx-prod-gw', hostnames: 'marqet.io', backend: 'marqet-svc:8080', status: 'Accepted' },
  { name: 'api-route', gateway: 'construx-prod-gw', hostnames: 'api.construxgroup.io', backend: 'api-svc:4000', status: 'Accepted' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function KubernetesGatewayPanel() {
  const [visible, setVisible] = useState(false);
  const [gRows, setGRows] = useState(0);
  const [rRows, setRRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const requestsPerSec = useCounter(28400, 120, 500);
  const totalRoutes = GATEWAYS.reduce((a, g) => a + g.routes, 0);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const g = setInterval(() => setGRows((x) => Math.min(x + 1, GATEWAYS.length)), 160);
    const r = setInterval(() => setRRows((x) => Math.min(x + 1, ROUTES.length)), 140);
    return () => { clearInterval(g); clearInterval(r); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(59,130,246,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(59,130,246,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(59,130,246,0.08)', background: 'rgba(59,130,246,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(59,130,246,0.4)' }}>
          kubernetes gateway api -- httproutes / listeners / backends
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {requestsPerSec.toLocaleString()} req/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#3b82f6', fontWeight: 600 }}>kubectl@gateway</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>kubectl get gateways,httproutes -A && kubectl describe gateway construx-prod-gw -n prod</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'req/s', value: requestsPerSec.toLocaleString(), color: '#3b82f6' },
          { label: 'gateways', value: GATEWAYS.length.toString(), color: '#a78bfa' },
          { label: 'routes', value: totalRoutes.toString(), color: '#4ade80' },
          { label: 'listeners', value: GATEWAYS.reduce((a, g) => a + g.listeners, 0).toString(), color: '#67e8f9' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Gateways */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // gateways
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {GATEWAYS.slice(0, gRows).map((gw) => (
            <div key={gw.name} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 32px 32px 72px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#3b82f6', fontSize: 8, fontWeight: 600 }}>{gw.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{gw.class}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{gw.listeners}l</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{gw.routes}r</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{gw.state}</span>
            </div>
          ))}
        </div>

        {/* HTTPRoutes */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // httproutes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ROUTES.slice(0, rRows).map((rt) => (
            <div key={rt.name} style={{ display: 'grid', gridTemplateColumns: '1fr 72px 1fr 52px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rt.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rt.hostnames}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rt.backend}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{rt.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(59,130,246,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          kubernetes gateway api v1.1 - apache-2.0 - ingress successor
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {GATEWAYS.length} gateways - {requestsPerSec.toLocaleString()} req/s
        </span>
      </div>
    </div>
  );
}
