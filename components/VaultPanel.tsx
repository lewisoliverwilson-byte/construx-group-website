'use client';

import { useEffect, useRef, useState } from 'react';

const SECRET_ENGINES = [
  { path: 'secret/', type: 'kv-v2', description: 'Application secrets', keys: 284, status: 'active' },
  { path: 'pki/', type: 'pki', description: 'Internal CA', keys: 48, status: 'active' },
  { path: 'database/', type: 'database', description: 'Dynamic DB creds', keys: 12, status: 'active' },
  { path: 'transit/', type: 'transit', description: 'Encryption as a service', keys: 8, status: 'active' },
];

const AUDIT_ENTRIES = [
  { op: 'read', path: 'secret/data/api/prod', accessor: 'approle', auth: 'approle/construx-api', latency: '2ms', status: 'allowed' },
  { op: 'read', path: 'database/creds/readonly', accessor: 'approle', auth: 'approle/construx-worker', latency: '8ms', status: 'allowed' },
  { op: 'write', path: 'transit/encrypt/app-key', accessor: 'jwt', auth: 'jwt/github-actions', latency: '4ms', status: 'allowed' },
  { op: 'read', path: 'pki/issue/internal', accessor: 'cert', auth: 'cert/k8s-node', latency: '14ms', status: 'allowed' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function VaultPanel() {
  const [visible, setVisible] = useState(false);
  const [engineRows, setEngineRows] = useState(0);
  const [auditRows, setAuditRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const secretReads = useCounter(28400, 48, 500);
  const tokenRenewals = useCounter(2840, 4, 700);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const e = setInterval(() => setEngineRows((x) => Math.min(x + 1, SECRET_ENGINES.length)), 160);
    const a = setInterval(() => setAuditRows((x) => Math.min(x + 1, AUDIT_ENTRIES.length)), 140);
    return () => { clearInterval(e); clearInterval(a); };
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
          vault -- secrets management -- engines / policies / audit
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {secretReads.toLocaleString()} reads
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#fbbf24', fontWeight: 600 }}>vault@server</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>vault secrets list && vault kv get secret/api/prod && vault status</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'secret reads', value: secretReads.toLocaleString(), color: '#fbbf24' },
          { label: 'token renewals', value: tokenRenewals.toLocaleString(), color: '#4ade80' },
          { label: 'engines', value: SECRET_ENGINES.length.toString(), color: '#67e8f9' },
          { label: 'total secrets', value: SECRET_ENGINES.reduce((a, e) => a + e.keys, 0).toString(), color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Secret Engines */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // secret engines
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {SECRET_ENGINES.slice(0, engineRows).map((eng) => (
            <div key={eng.path} style={{ display: 'grid', gridTemplateColumns: '60px 60px 1fr 36px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#fbbf24', fontSize: 8, fontWeight: 600 }}>{eng.path}</span>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{eng.type}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{eng.description}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{eng.keys}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{eng.status}</span>
            </div>
          ))}
        </div>

        {/* Audit Log */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // audit log
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {AUDIT_ENTRIES.slice(0, auditRows).map((entry, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 72px 32px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#fbbf24', fontSize: 7, fontWeight: 600 }}>{entry.op}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.path}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.auth}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{entry.latency}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{entry.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(251,191,36,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          vault v1.17 - bsl-1.1 - secrets & encryption management
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {secretReads.toLocaleString()} reads - {tokenRenewals.toLocaleString()} renewals
        </span>
      </div>
    </div>
  );
}
