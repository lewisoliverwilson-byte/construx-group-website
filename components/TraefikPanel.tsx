'use client';

import { useEffect, useRef, useState } from 'react';

const ROUTERS = [
  { name: 'construx-api-router', rule: 'Host(`api.construxgroup.io`)', service: 'construx-api-svc', tls: true, priority: 0, status: 'enabled' },
  { name: 'construx-ws-router', rule: 'Host(`app.construxgroup.io`)', service: 'construx-ws-svc', tls: true, priority: 0, status: 'enabled' },
  { name: 'metrics-router', rule: 'Host(`metrics.construxgroup.io`) && PathPrefix(`/`)', service: 'grafana-svc', tls: true, priority: 10, status: 'enabled' },
  { name: 'staging-router', rule: 'Host(`staging.construxgroup.io`)', service: 'staging-svc', tls: true, priority: 0, status: 'enabled' },
];

const SERVICES = [
  { name: 'construx-api-svc', type: 'loadbalancer', servers: 4, healthy: 4, rps: 2840, status: 'up' },
  { name: 'construx-ws-svc', type: 'loadbalancer', servers: 2, healthy: 2, rps: 840, status: 'up' },
  { name: 'grafana-svc', type: 'loadbalancer', servers: 1, healthy: 1, rps: 48, status: 'up' },
  { name: 'staging-svc', type: 'loadbalancer', servers: 2, healthy: 1, rps: 120, status: 'degraded' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function TraefikPanel() {
  const [visible, setVisible] = useState(false);
  const [routerRows, setRouterRows] = useState(0);
  const [svcRows, setSvcRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const reqPerSec = useCounter(28400, 240, 400);
  const totalReq = useCounter(1292400, 2400, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setRouterRows((x) => Math.min(x + 1, ROUTERS.length)), 160);
    const s = setInterval(() => setSvcRows((x) => Math.min(x + 1, SERVICES.length)), 140);
    return () => { clearInterval(r); clearInterval(s); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(103,232,249,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(103,232,249,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(103,232,249,0.08)', background: 'rgba(103,232,249,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(103,232,249,0.4)' }}>
          traefik -- reverse proxy -- routers / services / tls
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {reqPerSec.toLocaleString()} req/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>traefik@proxy</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>curl -s localhost:8080/api/http/routers | jq '.[] | {name,rule,status}' && traefik healthcheck</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'req/s', value: reqPerSec.toLocaleString(), color: '#67e8f9' },
          { label: 'total req', value: (totalReq / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'routers', value: ROUTERS.length.toString(), color: '#a78bfa' },
          { label: 'services up', value: SERVICES.filter(s => s.status === 'up').length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Routers */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // http routers
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {ROUTERS.slice(0, routerRows).map((router) => (
            <div key={router.name} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 24px 24px 48px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 7, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{router.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{router.rule}</span>
              <span style={{ color: router.tls ? '#4ade80' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{router.tls ? 'tls' : '-'}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{router.priority}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{router.status}</span>
            </div>
          ))}
        </div>

        {/* Services */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // backend services
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SERVICES.slice(0, svcRows).map((svc) => (
            <div key={svc.name} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 20px 20px 40px 52px', alignItems: 'center', gap: 8, padding: '4px 8px', background: svc.status === 'degraded' ? 'rgba(251,191,36,0.04)' : 'rgba(103,232,249,0.04)', border: `1px solid ${svc.status === 'degraded' ? 'rgba(251,191,36,0.1)' : 'rgba(103,232,249,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{svc.name}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{svc.type}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{svc.servers}</span>
              <span className="tabular-nums" style={{ color: svc.healthy < svc.servers ? '#f87171' : '#4ade80', fontSize: 7, textAlign: 'center' }}>{svc.healthy}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{svc.rps}/s</span>
              <span style={{ color: svc.status === 'up' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{svc.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          traefik v3.1 - mit - cloud-native reverse proxy
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {reqPerSec.toLocaleString()} req/s - {(totalReq / 1000).toFixed(0)}k total
        </span>
      </div>
    </div>
  );
}
