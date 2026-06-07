'use client';

import { useEffect, useRef, useState } from 'react';

const REALMS = [
  { name: 'construx', users: 284, sessions: 48, clients: 12, idpEnabled: true, mfaPercent: 94, status: 'active' },
  { name: 'construx-staging', users: 28, sessions: 4, clients: 6, idpEnabled: false, mfaPercent: 100, status: 'active' },
  { name: 'construx-internal', users: 12, sessions: 8, clients: 4, idpEnabled: true, mfaPercent: 100, status: 'active' },
];

const EVENTS = [
  { type: 'LOGIN', user: 'lewis@construxgroup.io', realm: 'construx', client: 'construx-workspace', ip: '100.64.0.10', dt: '4s ago' },
  { type: 'TOKEN_REFRESH', user: 'ci-bot@construxgroup.io', realm: 'construx', client: 'construx-api', ip: '100.64.0.4', dt: '12s ago' },
  { type: 'LOGIN_ERROR', user: 'unknown@example.com', realm: 'construx', client: 'construx-workspace', ip: '198.51.100.9', dt: '2m ago' },
  { type: 'LOGOUT', user: 'lewis@construxgroup.io', realm: 'construx-staging', client: 'construx-staging', ip: '100.64.0.10', dt: '8m ago' },
];

const EVENT_COLOR: Record<string, string> = {
  LOGIN: '#4ade80',
  TOKEN_REFRESH: '#67e8f9',
  LOGIN_ERROR: '#f87171',
  LOGOUT: 'rgba(255,255,255,0.3)',
};

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
  const [realmRows, setRealmRows] = useState(0);
  const [eventRows, setEventRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const activeSessions = useCounter(284, 2, 800);
  const loginsTotal = useCounter(28400, 12, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setRealmRows((x) => Math.min(x + 1, REALMS.length)), 160);
    const e = setInterval(() => setEventRows((x) => Math.min(x + 1, EVENTS.length)), 140);
    return () => { clearInterval(r); clearInterval(e); };
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
          keycloak -- iam -- realms / sessions / audit events
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {activeSessions.toLocaleString()} sessions
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#3b82f6', fontWeight: 600 }}>kcadm@keycloak</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>kcadm.sh get realms --fields realm,enabled && kcadm.sh get sessions/stats --realm construx</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'sessions', value: activeSessions.toLocaleString(), color: '#3b82f6' },
          { label: 'logins', value: (loginsTotal / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'realms', value: REALMS.length.toString(), color: '#a78bfa' },
          { label: 'errors', value: EVENTS.filter(e => e.type === 'LOGIN_ERROR').length.toString(), color: '#f87171' },
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
          {REALMS.slice(0, realmRows).map((realm) => (
            <div key={realm.name} style={{ display: 'grid', gridTemplateColumns: '80px 28px 28px 28px 28px 40px 48px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#3b82f6', fontSize: 8, fontWeight: 600 }}>{realm.name}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{realm.users}u</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{realm.sessions}s</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{realm.clients}c</span>
              <span style={{ color: realm.idpEnabled ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{realm.idpEnabled ? 'idp' : '-'}</span>
              <span className="tabular-nums" style={{ color: realm.mfaPercent === 100 ? '#4ade80' : '#fbbf24', fontSize: 7, textAlign: 'right' }}>{realm.mfaPercent}%mfa</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{realm.status}</span>
            </div>
          ))}
        </div>

        {/* Events */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // audit events
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {EVENTS.slice(0, eventRows).map((ev, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '76px 1fr 52px 48px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: ev.type === 'LOGIN_ERROR' ? 'rgba(248,113,113,0.04)' : 'rgba(59,130,246,0.04)', border: `1px solid ${ev.type === 'LOGIN_ERROR' ? 'rgba(248,113,113,0.1)' : 'rgba(59,130,246,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: EVENT_COLOR[ev.type] ?? 'rgba(255,255,255,0.3)', fontSize: 7, fontWeight: 700 }}>{ev.type}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.user}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.ip}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.realm}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{ev.dt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(59,130,246,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          keycloak v25 - apache-2.0 - open source iam
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {activeSessions.toLocaleString()} sessions - {(loginsTotal / 1000).toFixed(0)}k logins
        </span>
      </div>
    </div>
  );
}
