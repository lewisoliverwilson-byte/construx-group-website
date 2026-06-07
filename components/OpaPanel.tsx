'use client';

import { useEffect, useRef, useState } from 'react';

const POLICIES = [
  { name: 'k8s/admission/require-labels', path: 'policies/k8s/admission.rego', rules: 4, violations: 0, effect: 'deny' },
  { name: 'k8s/admission/no-privileged', path: 'policies/k8s/security.rego', rules: 3, violations: 2, effect: 'deny' },
  { name: 'api/authz/rbac', path: 'policies/api/rbac.rego', rules: 8, violations: 0, effect: 'deny' },
  { name: 'data/privacy/pii-mask', path: 'policies/data/privacy.rego', rules: 6, violations: 0, effect: 'mask' },
];

const EVALUATIONS = [
  { input: 'k8s AdmissionReview pod/privileged:true', policy: 'no-privileged', result: 'DENY', latency: '0.4ms', reason: 'privileged mode not allowed' },
  { input: 'api POST /listings user:alice role:viewer', policy: 'rbac', result: 'ALLOW', latency: '0.2ms', reason: 'viewer can read+create' },
  { input: 'k8s AdmissionReview deploy/no-labels', policy: 'require-labels', result: 'DENY', latency: '0.3ms', reason: 'missing app, env labels' },
  { input: 'data query pii fields user:dave', policy: 'pii-mask', result: 'MASK', latency: '0.1ms', reason: 'phone, email redacted' },
];

const RESULT_COLOR: Record<string, string> = {
  ALLOW: '#4ade80',
  DENY: '#f87171',
  MASK: '#fbbf24',
  WARN: '#f97316',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function OpaPanel() {
  const [visible, setVisible] = useState(false);
  const [pRows, setPRows] = useState(0);
  const [eRows, setERows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const decisionsPerSec = useCounter(28400, 120, 400);
  const bundleVersion = useCounter(284, 1, 1800);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const p = setInterval(() => setPRows((x) => Math.min(x + 1, POLICIES.length)), 160);
    const e = setInterval(() => setERows((x) => Math.min(x + 1, EVALUATIONS.length)), 140);
    return () => { clearInterval(p); clearInterval(e); };
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
          opa -- open policy agent -- rego / admission / api authz
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {decisionsPerSec.toLocaleString()} dec/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>opa@policy</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>opa run --server --bundle policies/ && opa eval -d policies/ -i input.json "data.k8s.admission.deny"</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'decisions/s', value: decisionsPerSec.toLocaleString(), color: '#4ade80' },
          { label: 'bundle rev', value: bundleVersion.toString(), color: '#67e8f9' },
          { label: 'policies', value: POLICIES.length.toString(), color: '#a78bfa' },
          { label: 'violations', value: POLICIES.reduce((a, p) => a + p.violations, 0).toString(), color: '#f87171' },
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
          // rego policies
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {POLICIES.slice(0, pRows).map((pol) => (
            <div key={pol.name} style={{ display: 'grid', gridTemplateColumns: '1fr 28px 24px 40px', alignItems: 'center', gap: 8, padding: '5px 8px', background: pol.violations > 0 ? 'rgba(248,113,113,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${pol.violations > 0 ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pol.name}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{pol.rules}r</span>
              <span className="tabular-nums" style={{ color: pol.violations > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center', fontWeight: pol.violations > 0 ? 700 : 400 }}>{pol.violations}</span>
              <span style={{ color: pol.effect === 'deny' ? '#f87171' : '#fbbf24', fontSize: 7, textAlign: 'right', fontWeight: 700 }}>{pol.effect}</span>
            </div>
          ))}
        </div>

        {/* Evaluations */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent evaluations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {EVALUATIONS.slice(0, eRows).map((ev) => (
            <div key={ev.input} style={{ display: 'grid', gridTemplateColumns: '1fr 48px 36px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: ev.result === 'DENY' ? 'rgba(248,113,113,0.04)' : ev.result === 'ALLOW' ? 'rgba(74,222,128,0.04)' : 'rgba(251,191,36,0.04)', border: `1px solid ${ev.result === 'DENY' ? 'rgba(248,113,113,0.1)' : ev.result === 'ALLOW' ? 'rgba(74,222,128,0.08)' : 'rgba(251,191,36,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.input}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.policy}</span>
              <span style={{ color: RESULT_COLOR[ev.result] ?? '#fbbf24', fontSize: 7, fontWeight: 700 }}>{ev.result}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{ev.latency}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          opa v0.68 - apache-2.0 - open policy agent
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {decisionsPerSec.toLocaleString()} dec/s - {POLICIES.length} policies
        </span>
      </div>
    </div>
  );
}
