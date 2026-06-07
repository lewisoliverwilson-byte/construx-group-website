'use client';

import { useEffect, useRef, useState } from 'react';

const ROUTES = [
  { host: 'api.construxgroup.io', upstream: 'construx-api:8080', tls: 'auto', handler: 'reverse_proxy', reqSec: 2840, p99ms: 28, status: 'active' },
  { host: 'construxgroup.io', upstream: 'construx-web:3000', tls: 'auto', handler: 'reverse_proxy', reqSec: 1200, p99ms: 12, status: 'active' },
  { host: 'grafana.construxgroup.io', upstream: 'grafana:3000', tls: 'auto', handler: 'reverse_proxy', reqSec: 48, p99ms: 84, status: 'active' },
  { host: 'registry.construxgroup.io', upstream: 'harbor-core:8080', tls: 'auto', handler: 'reverse_proxy', reqSec: 284, p99ms: 48, status: 'active' },
];

const CERTS = [
  { domain: 'api.construxgroup.io', issuer: "Let's Encrypt", expires: '2026-09-05', daysLeft: 90, status: 'valid' },
  { domain: 'construxgroup.io', issuer: "Let's Encrypt", expires: '2026-09-05', daysLeft: 90, status: 'valid' },
  { domain: 'grafana.construxgroup.io', issuer: "Let's Encrypt", expires: '2026-09-05', daysLeft: 90, status: 'valid' },
  { domain: 'registry.construxgroup.io', issuer: "Let's Encrypt", expires: '2026-09-05', daysLeft: 90, status: 'valid' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function CaddyPanel() {
  const [visible, setVisible] = useState(false);
  const [routeRows, setRouteRows] = useState(0);
  const [certRows, setCertRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const reqPerSec = useCounter(4372, 48, 400);
  const tlsHandshakes = useCounter(28400, 48, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setRouteRows((x) => Math.min(x + 1, ROUTES.length)), 160);
    const c = setInterval(() => setCertRows((x) => Math.min(x + 1, CERTS.length)), 140);
    return () => { clearInterval(r); clearInterval(c); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(74,222,128,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(74,222,128,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(74,222,128,0.08)', background: 'rgba(74,222,128,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(74,222,128,0.4)' }}>
          caddy -- web server -- routes / automatic-tls / reverse-proxy
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {reqPerSec.toLocaleString()} req/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>caddy@proxy</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>caddy validate --config /etc/caddy/Caddyfile && caddy reload && curl -s localhost:2019/metrics</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'req / sec', value: reqPerSec.toLocaleString(), color: '#4ade80' },
          { label: 'tls handshakes', value: tlsHandshakes.toLocaleString(), color: '#67e8f9' },
          { label: 'routes', value: ROUTES.length.toString(), color: '#a78bfa' },
          { label: 'certs', value: CERTS.length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Routes */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // routes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {ROUTES.slice(0, routeRows).map((route) => (
            <div key={route.host} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 36px 60px 40px 28px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{route.host}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{route.upstream}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{route.tls}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{route.handler}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{route.reqSec}/s</span>
              <span className="tabular-nums" style={{ color: route.p99ms > 50 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{route.p99ms}ms</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{route.status}</span>
            </div>
          ))}
        </div>

        {/* Certs */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // managed certificates
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {CERTS.slice(0, certRows).map((cert, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 84px 64px 28px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.domain}</span>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{cert.issuer}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{cert.expires}</span>
              <span className="tabular-nums" style={{ color: cert.daysLeft < 30 ? '#f87171' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{cert.daysLeft}d</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{cert.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          caddy v2.8 - apache-2.0 - automatic https web server
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {reqPerSec.toLocaleString()} req/s - {tlsHandshakes.toLocaleString()} tls
        </span>
      </div>
    </div>
  );
}
