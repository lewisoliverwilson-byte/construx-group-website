'use client';

import { useEffect, useRef, useState } from 'react';

const REALMS = [
  { name: 'construx-prod', users: 4820, clients: 12, sessions: 284, enabled: true },
  { name: 'construx-staging', users: 84, clients: 8, sessions: 6, enabled: true },
  { name: 'construx-internal', users: 12, clients: 4, sessions: 2, enabled: true },
];

const SESSIONS = [
  { user: 'lewis.wilson', realm: 'construx-prod', client: 'web-app', ip: '82.14.x.x', started: '2m', protocol: 'openid-connect' },
  { user: 'api-service', realm: 'construx-prod', client: 'm2m-client', ip: '10.0.1.4', started: '12m', protocol: 'openid-connect' },
  { user: 'ci-pipeline', realm: 'construx-staging', client: 'deploy-bot', ip: '10.0.2.8', started: '4m', protocol: 'openid-connect' },
  { user: 'admin', realm: 'construx-internal', client: 'admin-cli', ip: '10.0.0.1', started: '8m', protocol: 'openid-connect' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function KeycloakPanel() {
  const [visible, setVisible] = useState(false);
  const [rRows, setRRows] = useState(0);
  const [sRows, setSRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const tokenIssues = useCounter(2840, 18, 700);
  const totalUsers = REALMS.reduce((a, r) => a + r.users, 0);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setRRows((x) => Math.min(x + 1, REALMS.length)), 160);
    const s = setInterval(() => setSRows((x) => Math.min(x + 1, SESSIONS.length)), 140);
    return () => { clearInterval(r); clearInterval(s); };
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
          keycloak -- cloud-native iam -- oidc / saml / passkeys
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {tokenIssues.toLocaleString()} tokens issued
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>keycloak@iam</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>kcadm.sh get realms && kcadm.sh get sessions/stats --realm construx-prod</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'tokens/issued', value: tokenIssues.toLocaleString(), color: '#a78bfa' },
          { label: 'total users', value: totalUsers.toLocaleString(), color: '#4ade80' },
          { label: 'realms', value: REALMS.length.toString(), color: '#67e8f9' },
          { label: 'active sessions', value: SESSIONS.length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Realms */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // realms
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {REALMS.slice(0, rRows).map((r) => (
            <div key={r.name} style={{ display: 'grid', gridTemplateColumns: '1fr 48px 24px 32px 28px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600 }}>{r.name}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 8, textAlign: 'right' }}>{r.users.toLocaleString()}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 8, textAlign: 'center' }}>{r.clients}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'center' }}>{r.sessions}</span>
              <span style={{ color: r.enabled ? '#4ade80' : '#f87171', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{r.enabled ? 'on' : 'off'}</span>
            </div>
          ))}
        </div>

        {/* Active sessions */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // active sessions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SESSIONS.slice(0, sRows).map((s) => (
            <div key={s.user + s.realm} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 48px 28px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.user}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.client}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{s.ip}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{s.started}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          keycloak v24 - apache 2.0 - cncf
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalUsers.toLocaleString()} users - {REALMS.length} realms
        </span>
      </div>
    </div>
  );
}
