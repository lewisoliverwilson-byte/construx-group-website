'use client';

import { useEffect, useRef, useState } from 'react';

const APPLICATIONS = [
  { name: 'construx-workspace', provider: 'OAuth2', users: 284, slug: 'construx-ws', mfa: true, status: 'healthy' },
  { name: 'construx-staging', provider: 'OAuth2', users: 12, slug: 'construx-stg', mfa: false, status: 'healthy' },
  { name: 'grafana', provider: 'LDAP', users: 8, slug: 'grafana', mfa: true, status: 'healthy' },
  { name: 'vault', provider: 'OIDC', users: 4, slug: 'vault', mfa: true, status: 'healthy' },
];

const EVENTS = [
  { event: 'login', user: 'lewis@construxgroup.io', app: 'construx-workspace', ip: '100.64.0.10', result: 'success', dt: '2s ago' },
  { event: 'login', user: 'ci-bot@construxgroup.io', app: 'vault', ip: '100.64.0.4', result: 'success', dt: '8m ago' },
  { event: 'login_failed', user: 'unknown@example.com', app: 'grafana', ip: '198.51.100.4', result: 'blocked', dt: '12m ago' },
  { event: 'token_refresh', user: 'lewis@construxgroup.io', app: 'construx-workspace', ip: '100.64.0.10', result: 'success', dt: '14m ago' },
];

const RESULT_COLOR: Record<string, string> = {
  success: '#4ade80',
  blocked: '#f87171',
  failed: '#fbbf24',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function AuthentikPanel() {
  const [visible, setVisible] = useState(false);
  const [appRows, setAppRows] = useState(0);
  const [evRows, setEvRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const activeSessions = useCounter(284, 2, 800);
  const loginsTotal = useCounter(28400, 4, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const a = setInterval(() => setAppRows((x) => Math.min(x + 1, APPLICATIONS.length)), 160);
    const e = setInterval(() => setEvRows((x) => Math.min(x + 1, EVENTS.length)), 140);
    return () => { clearInterval(a); clearInterval(e); };
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
          authentik -- identity provider -- sso / oauth2 / audit
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {activeSessions.toLocaleString()} sessions
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#3b82f6', fontWeight: 600 }}>ak@authentik</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>ak dump_config && curl -H "Authorization: Bearer $TOKEN" https://auth.construxgroup.io/api/v3/core/users/</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'sessions', value: activeSessions.toLocaleString(), color: '#3b82f6' },
          { label: 'logins', value: loginsTotal.toLocaleString(), color: '#4ade80' },
          { label: 'apps', value: APPLICATIONS.length.toString(), color: '#a78bfa' },
          { label: 'blocked', value: EVENTS.filter(e => e.result === 'blocked').length.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Applications */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // applications
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {APPLICATIONS.slice(0, appRows).map((app) => (
            <div key={app.name} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 28px 32px 48px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#3b82f6', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.name}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{app.provider}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{app.users}u</span>
              <span style={{ color: app.mfa ? '#4ade80' : '#fbbf24', fontSize: 7, textAlign: 'center' }}>{app.mfa ? 'mfa' : 'no-mfa'}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{app.status}</span>
            </div>
          ))}
        </div>

        {/* Events */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // audit log
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {EVENTS.slice(0, evRows).map((ev, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '64px 1fr 60px 48px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: ev.result === 'blocked' ? 'rgba(248,113,113,0.04)' : 'rgba(59,130,246,0.04)', border: `1px solid ${ev.result === 'blocked' ? 'rgba(248,113,113,0.1)' : 'rgba(59,130,246,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{ev.event}</span>
              <span style={{ color: 'rgba(240,239,255,0.3)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.user}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{ev.ip}</span>
              <span style={{ color: RESULT_COLOR[ev.result] ?? 'rgba(255,255,255,0.3)', fontSize: 7, fontWeight: 700 }}>{ev.result}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{ev.dt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(59,130,246,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          authentik v2024.4 - mit - identity provider
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {activeSessions.toLocaleString()} sessions - {loginsTotal.toLocaleString()} logins
        </span>
      </div>
    </div>
  );
}
