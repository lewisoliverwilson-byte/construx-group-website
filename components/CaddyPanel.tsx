'use client';

import { useEffect, useRef, useState } from 'react';

const ROUTES = [
  { host: 'api.construxgroup.io', upstream: 'http://api-svc:8080', tls: 'auto', rps: 284, p99: '48ms', status: 'UP' },
  { host: 'app.construxgroup.io', upstream: 'http://web-svc:3000', tls: 'auto', rps: 820, p99: '12ms', status: 'UP' },
  { host: 'ml.construxgroup.io', upstream: 'http://ml-svc:8000', tls: 'auto', rps: 48, p99: '240ms', status: 'UP' },
  { host: 'metrics.construxgroup.io', upstream: 'http://grafana:3000', tls: 'auto', rps: 12, p99: '28ms', status: 'UP' },
];

const CERTS = [
  { domain: 'api.construxgroup.io', issuer: "Let's Encrypt", expiry: '89d', renew: 'auto' },
  { domain: 'app.construxgroup.io', issuer: "Let's Encrypt", expiry: '89d', renew: 'auto' },
  { domain: 'ml.construxgroup.io', issuer: "Let's Encrypt", expiry: '88d', renew: 'auto' },
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
  const [rtRows, setRtRows] = useState(0);
  const [certRows, setCertRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalRps = useCounter(1164, 12, 600);
  const tlsRenewals = useCounter(48, 1, 8000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setRtRows((x) => Math.min(x + 1, ROUTES.length)), 160);
    const c = setInterval(() => setCertRows((x) => Math.min(x + 1, CERTS.length)), 170);
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
          caddy -- automatic https -- caddyfile / json api
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalRps.toLocaleString()} rps
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>caddy@proxy</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>caddy adapt --config Caddyfile && curl -s localhost:2019/config/ | jq .apps.http</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'total rps', value: totalRps.toLocaleString(), color: '#4ade80' },
          { label: 'tls renewals', value: tlsRenewals.toLocaleString(), color: '#67e8f9' },
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
          // reverse proxy routes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {ROUTES.slice(0, rtRows).map((rt) => (
            <div key={rt.host} style={{ display: 'grid', gridTemplateColumns: '1fr 96px 32px 40px 44px 24px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 9, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rt.host}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rt.upstream}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{rt.tls}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{rt.rps}/s</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 8, textAlign: 'right' }}>{rt.p99}</span>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 700, textAlign: 'right' }}>UP</span>
            </div>
          ))}
        </div>

        {/* TLS certs */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // tls certificates (acme)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {CERTS.slice(0, certRows).map((cert) => (
            <div key={cert.domain} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 40px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(103,232,249,0.03)', border: '1px solid rgba(103,232,249,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.domain}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8 }}>{cert.issuer}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 8, textAlign: 'right' }}>{cert.expiry}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{cert.renew}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          caddy v2.8 - apache 2.0 - automatic https
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalRps.toLocaleString()} rps - {tlsRenewals} cert renewals
        </span>
      </div>
    </div>
  );
}
