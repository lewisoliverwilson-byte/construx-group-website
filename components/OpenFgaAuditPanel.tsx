'use client';

import { useEffect, useRef, useState } from 'react';

const TUPLES = [
  { user: 'user:lewis', relation: 'owner', object: 'workspace:construx-prod', created: '84d ago' },
  { user: 'user:ci-bot', relation: 'writer', object: 'repo:construx/api', created: '42d ago' },
  { user: 'team:eng', relation: 'member', object: 'project:hyve', created: '28d ago' },
  { user: 'user:alex', relation: 'viewer', object: 'workspace:construx-staging', created: '12d ago' },
  { user: 'service:api-gateway', relation: 'reader', object: 'secret:db-creds', created: '8d ago' },
];

const CHECKS = [
  { user: 'user:lewis', relation: 'owner', object: 'workspace:construx-prod', allowed: true, lat: '2ms' },
  { user: 'user:alex', relation: 'owner', object: 'workspace:construx-prod', allowed: false, lat: '1ms' },
  { user: 'team:eng', relation: 'member', object: 'project:hyve', allowed: true, lat: '2ms' },
  { user: 'user:ci-bot', relation: 'admin', object: 'repo:construx/api', allowed: false, lat: '1ms' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function OpenFgaAuditPanel() {
  const [visible, setVisible] = useState(false);
  const [tupRows, setTupRows] = useState(0);
  const [chkRows, setChkRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const checksRate = useCounter(48200, 40, 600);
  const tupleCount = useCounter(12840, 4, 2000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setTupRows((x) => Math.min(x + 1, TUPLES.length)), 160);
    const c = setInterval(() => setChkRows((x) => Math.min(x + 1, CHECKS.length)), 150);
    return () => { clearInterval(t); clearInterval(c); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(249,115,22,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(249,115,22,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(249,115,22,0.08)', background: 'rgba(249,115,22,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(249,115,22,0.4)' }}>
          openfga -- relationship-based authz -- zanzibar model
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {checksRate.toLocaleString()} checks/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>fga@authz</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>fga tuple read --store construx && fga check user:lewis owner workspace:construx-prod</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'checks/s', value: checksRate.toLocaleString(), color: '#f97316' },
          { label: 'tuples', value: tupleCount.toLocaleString(), color: '#4ade80' },
          { label: 'allowed', value: CHECKS.filter(c => c.allowed).length.toString(), color: '#4ade80' },
          { label: 'denied', value: CHECKS.filter(c => !c.allowed).length.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Tuples */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // relationship tuples
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {TUPLES.slice(0, tupRows).map((tup) => (
            <div key={tup.user + tup.object} style={{ display: 'grid', gridTemplateColumns: '1fr 48px 1fr 40px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tup.user}</span>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600, textAlign: 'center' }}>{tup.relation}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tup.object}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{tup.created}</span>
            </div>
          ))}
        </div>

        {/* Checks */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // authorization checks
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {CHECKS.slice(0, chkRows).map((chk) => (
            <div key={chk.user + chk.object} style={{ display: 'grid', gridTemplateColumns: '1fr 48px 1fr 40px 28px', alignItems: 'center', gap: 8, padding: '4px 8px', background: chk.allowed ? 'rgba(74,222,128,0.04)' : 'rgba(248,113,113,0.04)', border: `1px solid ${chk.allowed ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: chk.allowed ? '#4ade80' : '#f87171', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chk.user}</span>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600, textAlign: 'center' }}>{chk.relation}</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chk.object}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{chk.lat}</span>
              <span style={{ color: chk.allowed ? '#4ade80' : '#f87171', fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{chk.allowed ? 'OK' : 'NO'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          openfga v1.5 - apache 2.0 - cncf sandbox
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {checksRate.toLocaleString()} checks - {tupleCount.toLocaleString()} tuples
        </span>
      </div>
    </div>
  );
}
