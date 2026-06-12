'use client';

import { useEffect, useRef, useState } from 'react';

const POLICIES = [
  { name: 'construx.authz.api', rules: 12, version: 'v1.4', bundle: 'construx-bundle', lastEval: '28ms ago', status: 'active' },
  { name: 'construx.authz.data', rules: 8, version: 'v1.2', bundle: 'construx-bundle', lastEval: '124ms ago', status: 'active' },
  { name: 'construx.rbac.workspace', rules: 16, version: 'v2.1', bundle: 'construx-bundle', lastEval: '4ms ago', status: 'active' },
  { name: 'construx.compliance.gdpr', rules: 6, version: 'v1.0', bundle: 'compliance-bundle', lastEval: '1s ago', status: 'active' },
];

const DECISIONS = [
  { policy: 'construx.authz.api', input: 'POST /api/listings', result: 'allow', reason: 'role=admin', latency: 3, status: 'ok' },
  { policy: 'construx.authz.data', input: 'SELECT listings WHERE org=construx', result: 'allow', reason: 'owner=true', latency: 4, status: 'ok' },
  { policy: 'construx.rbac.workspace', input: 'DELETE workspace:84291', result: 'deny', reason: 'role=member', latency: 2, status: 'ok' },
  { policy: 'construx.compliance.gdpr', input: 'EXPORT user:lewis data', result: 'allow', reason: 'consent=true', latency: 8, status: 'ok' },
];

const RESULT_COLOR: Record<string, string> = {
  allow: '#4ade80',
  deny: '#f87171',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function OPAPanel() {
  const [visible, setVisible] = useState(false);
  const [policyRows, setPolicyRows] = useState(0);
  const [decisionRows, setDecisionRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const decisionsPerSec = useCounter(28400, 480, 400);
  const bundleUpdates = useCounter(284, 1, 1200);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const p = setInterval(() => setPolicyRows((x) => Math.min(x + 1, POLICIES.length)), 160);
    const d = setInterval(() => setDecisionRows((x) => Math.min(x + 1, DECISIONS.length)), 140);
    return () => { clearInterval(p); clearInterval(d); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(103,232,249,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(103,232,249,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(103,232,249,0.08)', background: 'rgba(103,232,249,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(103,232,249,0.4)' }}>
          opa -- open policy agent -- rego / bundles / decisions
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {decisionsPerSec.toLocaleString()} dec/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>opa@policy</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>opa eval -d policy.rego -i input.json "data.construx.authz.api.allow" && opa test ./policies/</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'decisions / sec', value: decisionsPerSec.toLocaleString(), color: '#67e8f9' },
          { label: 'bundle updates', value: bundleUpdates.toLocaleString(), color: '#4ade80' },
          { label: 'policies', value: POLICIES.length.toString(), color: '#a78bfa' },
          { label: 'total rules', value: POLICIES.reduce((a, p) => a + p.rules, 0).toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Policies */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // policies
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {POLICIES.slice(0, policyRows).map((p) => (
            <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '1fr 20px 28px 80px 44px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{p.rules}r</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{p.version}</span>
              <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.bundle}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{p.lastEval}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{p.status}</span>
            </div>
          ))}
        </div>

        {/* Decisions */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent decisions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {DECISIONS.slice(0, decisionRows).map((d, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 36px 44px 24px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.input}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.reason}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{d.latency}ms</span>
              <span style={{ color: RESULT_COLOR[d.result] ?? '#4ade80', fontSize: 7, fontWeight: 700 }}>{d.result}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{d.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          opa v0.68 - apache-2.0 - open policy agent, general-purpose policy engine
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {decisionsPerSec.toLocaleString()} dec/s - {bundleUpdates.toLocaleString()} bundles
        </span>
      </div>
    </div>
  );
}
