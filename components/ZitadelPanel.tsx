'use client';

import { useEffect, useRef, useState } from 'react';

const APPS = [
  { name: 'construx-web', type: 'OIDC/web', redirectUri: 'construxgroup.io/callback', pkce: true, users: 3240 },
  { name: 'construx-api', type: 'OIDC/service', redirectUri: 'api.construxgroup.io', pkce: false, users: 0 },
  { name: 'admin-portal', type: 'SAML/sp', redirectUri: 'admin.construxgroup.io/saml', pkce: false, users: 48 },
  { name: 'mobile-app', type: 'OIDC/native', redirectUri: 'construx://callback', pkce: true, users: 1840 },
];

const SESSIONS = [
  { user: 'lewis@construxgroup.io', mfa: 'passkey', age: '2m', ip: '82.44.x.x', device: 'Chrome/macOS' },
  { user: 'admin@construxgroup.io', mfa: 'totp', age: '18m', ip: '10.0.0.1', device: 'Safari/iOS' },
  { user: 'svc-deploy@construxgroup.io', mfa: 'none', age: '4h', ip: '10.0.1.40', device: 'k8s/SA' },
  { user: 'dev-01@construxgroup.io', mfa: 'passkey', age: '1h', ip: '82.44.x.y', device: 'Firefox/Linux' },
];

const GRANT_TYPES = ['authorization_code', 'client_credentials', 'refresh_token', 'device_code'];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function ZitadelPanel() {
  const [visible, setVisible] = useState(false);
  const [appRows, setAppRows] = useState(0);
  const [sesRows, setSesRows] = useState(0);
  const [activeGrant, setActiveGrant] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const tokensMinted = useCounter(48200, 12, 800);
  const logins = useCounter(8420, 4, 1200);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const a = setInterval(() => setAppRows((x) => Math.min(x + 1, APPS.length)), 160);
    const s = setInterval(() => setSesRows((x) => Math.min(x + 1, SESSIONS.length)), 150);
    const g = setInterval(() => setActiveGrant((x) => (x + 1) % GRANT_TYPES.length), 1200);
    return () => { clearInterval(a); clearInterval(s); clearInterval(g); };
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
          zitadel -- cloud-native iam -- oidc / saml / passkeys
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {tokensMinted.toLocaleString()} tokens
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>zitadel@iam</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>zitadel-cli project list && zitadel-cli app list --project construx --output=table</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'tokens/hr', value: tokensMinted.toLocaleString(), color: '#a78bfa' },
          { label: 'logins/hr', value: logins.toLocaleString(), color: '#4ade80' },
          { label: 'apps', value: APPS.length.toString(), color: '#67e8f9' },
          { label: 'sessions', value: SESSIONS.length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Grant type ticker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>grant_type</span>
          <span style={{ fontSize: 9, color: '#a78bfa', fontWeight: 600, padding: '1px 8px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 2, transition: 'opacity 0.3s' }}>
            {GRANT_TYPES[activeGrant]}
          </span>
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)', marginLeft: 'auto' }}>RFC 6749 · PKCE</span>
        </div>

        {/* Apps */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // registered apps
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {APPS.slice(0, appRows).map((app) => (
            <div key={app.name} style={{ display: 'grid', gridTemplateColumns: '90px 72px 1fr 36px 52px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 9, fontWeight: 600 }}>{app.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 8 }}>{app.type}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.redirectUri}</span>
              <span style={{ color: app.pkce ? '#4ade80' : 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center', fontWeight: app.pkce ? 700 : 400 }}>{app.pkce ? 'PKCE' : '-'}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{app.users > 0 ? app.users.toLocaleString() + 'u' : 'svc'}</span>
            </div>
          ))}
        </div>

        {/* Sessions */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // active sessions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SESSIONS.slice(0, sesRows).map((ses) => (
            <div key={ses.user} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 28px 52px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.03)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ses.user}</span>
              <span style={{ color: ses.mfa === 'passkey' ? '#a78bfa' : ses.mfa === 'totp' ? '#fbbf24' : 'rgba(255,255,255,0.25)', fontSize: 7, textAlign: 'center', padding: '1px 4px', background: ses.mfa !== 'none' ? 'rgba(167,139,250,0.1)' : 'transparent', borderRadius: 2 }}>{ses.mfa}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{ses.age}</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{ses.device}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          zitadel v2.57 - zitadel.com - oidc / saml2
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {tokensMinted.toLocaleString()} tokens - {logins.toLocaleString()} logins/hr
        </span>
      </div>
    </div>
  );
}
