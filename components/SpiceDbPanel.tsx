'use client';

import { useEffect, useRef, useState } from 'react';

const SCHEMA = [
  { resource: 'document', relations: 4, permissions: 8, caveat: false },
  { resource: 'organization', relations: 3, permissions: 6, caveat: false },
  { resource: 'project', relations: 5, permissions: 10, caveat: true },
  { resource: 'user', relations: 2, permissions: 4, caveat: false },
];

const CHECKS = [
  { subject: 'user:alice', permission: 'read', resource: 'document:annual_report', result: 'PERMISSIONSHIP_HAS_PERMISSION', latency: '1.2ms' },
  { subject: 'user:bob', permission: 'write', resource: 'project:construx_v2', result: 'PERMISSIONSHIP_HAS_PERMISSION', latency: '0.8ms' },
  { subject: 'user:carol', permission: 'delete', resource: 'document:private_memo', result: 'PERMISSIONSHIP_NO_PERMISSION', latency: '0.6ms' },
  { subject: 'user:dave', permission: 'admin', resource: 'organization:construx', result: 'PERMISSIONSHIP_HAS_PERMISSION', latency: '1.4ms' },
];

const RESULT_COLOR: Record<string, string> = {
  PERMISSIONSHIP_HAS_PERMISSION: '#4ade80',
  PERMISSIONSHIP_NO_PERMISSION: '#f87171',
  PERMISSIONSHIP_CONDITIONAL_PERMISSION: '#fbbf24',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function SpiceDbPanel() {
  const [visible, setVisible] = useState(false);
  const [sRows, setSRows] = useState(0);
  const [cRows, setCRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const checksPerSec = useCounter(2840, 28, 600);
  const relationships = useCounter(48200, 48, 1100);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setSRows((x) => Math.min(x + 1, SCHEMA.length)), 160);
    const c = setInterval(() => setCRows((x) => Math.min(x + 1, CHECKS.length)), 140);
    return () => { clearInterval(s); clearInterval(c); };
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
          spicedb -- zanzibar-inspired authz -- schema / relationships / checks
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {checksPerSec.toLocaleString()} checks/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>spicedb@authz</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>zed permission check document:annual_report read user:alice --endpoint localhost:50051</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'checks/s', value: checksPerSec.toLocaleString(), color: '#a78bfa' },
          { label: 'relationships', value: (relationships / 1000).toFixed(1) + 'k', color: '#4ade80' },
          { label: 'resources', value: SCHEMA.length.toString(), color: '#67e8f9' },
          { label: 'permissions', value: SCHEMA.reduce((a, s) => a + s.permissions, 0).toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Schema */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // schema resources
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {SCHEMA.slice(0, sRows).map((s) => (
            <div key={s.resource} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 44px 48px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600 }}>{s.resource}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{s.relations} rel</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{s.permissions} perm</span>
              <span style={{ color: s.caveat ? '#fbbf24' : 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{s.caveat ? 'caveat' : 'plain'}</span>
            </div>
          ))}
        </div>

        {/* Permission checks */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // permission checks
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {CHECKS.slice(0, cRows).map((ch) => (
            <div key={ch.subject + ch.resource} style={{ display: 'grid', gridTemplateColumns: '64px 40px 1fr 32px', alignItems: 'center', gap: 8, padding: '4px 8px', background: ch.result === 'PERMISSIONSHIP_HAS_PERMISSION' ? 'rgba(74,222,128,0.04)' : 'rgba(248,113,113,0.04)', border: `1px solid ${ch.result === 'PERMISSIONSHIP_HAS_PERMISSION' ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.3)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.subject}</span>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{ch.permission}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.resource}</span>
              <span style={{ color: RESULT_COLOR[ch.result] ?? '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{ch.result === 'PERMISSIONSHIP_HAS_PERMISSION' ? 'ALLOW' : 'DENY'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          spicedb v1.33 - apache-2.0 - google zanzibar authz
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {checksPerSec.toLocaleString()} checks/s - {(relationships / 1000).toFixed(1)}k rels
        </span>
      </div>
    </div>
  );
}
