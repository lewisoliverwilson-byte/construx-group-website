'use client';

import { useEffect, useRef, useState } from 'react';

const SECRETS = [
  { path: 'secret/construx/db', engine: 'kv-v2', leases: 84, ttl: '24h', status: 'active' },
  { path: 'pki/construx/cert', engine: 'pki', leases: 12, ttl: '8760h', status: 'active' },
  { path: 'aws/creds/deploy', engine: 'aws', leases: 4, ttl: '1h', status: 'active' },
  { path: 'transit/construx/key', engine: 'transit', leases: 0, ttl: 'n/a', status: 'active' },
];

const POLICIES = [
  { name: 'construx-app', paths: 6, capabilities: 'read,list', bound: 'k8s:construx-prod', status: 'OK' },
  { name: 'construx-ci', paths: 3, capabilities: 'read', bound: 'github:lewisoliverwilson-byte', status: 'OK' },
  { name: 'construx-ops', paths: 14, capabilities: 'read,create,update', bound: 'ldap:ops-team', status: 'OK' },
  { name: 'emergency-break', paths: 1, capabilities: 'sudo', bound: 'token:root', status: 'WARN' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function VaultSecretsPanel() {
  const [visible, setVisible] = useState(false);
  const [secRows, setSecRows] = useState(0);
  const [polRows, setPolRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const leaseRenewals = useCounter(28400, 12, 700);
  const tokenOps = useCounter(8400, 8, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setSecRows((x) => Math.min(x + 1, SECRETS.length)), 160);
    const p = setInterval(() => setPolRows((x) => Math.min(x + 1, POLICIES.length)), 140);
    return () => { clearInterval(s); clearInterval(p); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(251,191,36,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(251,191,36,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(251,191,36,0.08)', background: 'rgba(251,191,36,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(251,191,36,0.4)' }}>
          vault -- secrets management -- kv / pki / aws / transit
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {tokenOps.toLocaleString()} token ops
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#fbbf24', fontWeight: 600 }}>vault@construx</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>vault secrets list --detailed && vault lease lookup --prefix secret/construx</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'lease renewals', value: leaseRenewals.toLocaleString(), color: '#fbbf24' },
          { label: 'token ops', value: tokenOps.toLocaleString(), color: '#4ade80' },
          { label: 'secret engines', value: SECRETS.length.toString(), color: '#a78bfa' },
          { label: 'policies', value: POLICIES.length.toString(), color: '#67e8f9' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Secret engines */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // secret engines
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {SECRETS.slice(0, secRows).map((sec) => (
            <div key={sec.path} style={{ display: 'grid', gridTemplateColumns: '1fr 56px 28px 40px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#fbbf24', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sec.path}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{sec.engine}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{sec.leases}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{sec.ttl}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{sec.status}</span>
            </div>
          ))}
        </div>

        {/* Policies */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // acl policies
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {POLICIES.slice(0, polRows).map((pol) => (
            <div key={pol.name} style={{ display: 'grid', gridTemplateColumns: '80px 24px 1fr 1fr 40px', alignItems: 'center', gap: 8, padding: '4px 8px', background: pol.status === 'WARN' ? 'rgba(251,191,36,0.06)' : 'rgba(251,191,36,0.03)', border: `1px solid ${pol.status === 'WARN' ? 'rgba(251,191,36,0.18)' : 'rgba(251,191,36,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: '#fbbf24', fontSize: 7, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pol.name}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{pol.paths}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pol.capabilities}</span>
              <span style={{ color: 'rgba(240,239,255,0.3)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pol.bound}</span>
              <span style={{ color: pol.status === 'OK' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{pol.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(251,191,36,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          vault v1.17 - bsl-1.1 - secrets management
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {leaseRenewals.toLocaleString()} renewals - {tokenOps.toLocaleString()} token ops
        </span>
      </div>
    </div>
  );
}
