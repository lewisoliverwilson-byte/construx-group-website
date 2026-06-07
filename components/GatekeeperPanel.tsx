'use client';

import { useEffect, useRef, useState } from 'react';

const CONSTRAINTS = [
  { name: 'require-resource-limits', kind: 'K8sRequiredResources', enforcementAction: 'deny', violations: 0, total: 284, status: 'active' },
  { name: 'restrict-privileged-containers', kind: 'K8sPSPPrivilegedContainer', enforcementAction: 'deny', violations: 0, total: 284, status: 'active' },
  { name: 'require-labels', kind: 'K8sRequiredLabels', enforcementAction: 'warn', violations: 4, total: 284, status: 'active' },
  { name: 'disallow-latest-tag', kind: 'K8sDisallowedTags', enforcementAction: 'deny', violations: 0, total: 284, status: 'active' },
];

const AUDIT_VIOLATIONS = [
  { constraint: 'require-labels', resource: 'Deployment/staging/feature-proxy', message: 'missing required label: app.kubernetes.io/version', enforcedAt: '8m ago' },
  { constraint: 'require-labels', resource: 'Pod/ci/runner-build-48', message: 'missing required label: team', enforcedAt: '14m ago' },
  { constraint: 'require-labels', resource: 'Service/staging/temp-svc', message: 'missing required label: managed-by', enforcedAt: '28m ago' },
  { constraint: 'require-labels', resource: 'Deployment/dev/debug-proxy', message: 'missing required label: app.kubernetes.io/version', enforcedAt: '1h ago' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function GatekeeperPanel() {
  const [visible, setVisible] = useState(false);
  const [constraintRows, setConstraintRows] = useState(0);
  const [violationRows, setViolationRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const admissionsTotal = useCounter(28400, 48, 500);
  const deniesTotal = useCounter(284, 1, 1400);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const c = setInterval(() => setConstraintRows((x) => Math.min(x + 1, CONSTRAINTS.length)), 160);
    const v = setInterval(() => setViolationRows((x) => Math.min(x + 1, AUDIT_VIOLATIONS.length)), 140);
    return () => { clearInterval(c); clearInterval(v); };
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
          gatekeeper -- policy controller -- constraints / rego / audit
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {CONSTRAINTS.length} constraints
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>kubectl@gatekeeper</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>kubectl get constraints --all-namespaces && kubectl get k8srequiredlabels -o wide</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'admissions', value: admissionsTotal.toLocaleString(), color: '#4ade80' },
          { label: 'denies', value: deniesTotal.toLocaleString(), color: '#f87171' },
          { label: 'constraints', value: CONSTRAINTS.length.toString(), color: '#67e8f9' },
          { label: 'violations', value: CONSTRAINTS.reduce((a, c) => a + c.violations, 0).toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Constraints */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // constraints
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {CONSTRAINTS.slice(0, constraintRows).map((c) => (
            <div key={c.name} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 36px 52px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.kind}</span>
              <span style={{ color: c.enforcementAction === 'deny' ? '#f87171' : '#fbbf24', fontSize: 7, textAlign: 'center' }}>{c.enforcementAction}</span>
              <span className="tabular-nums" style={{ color: c.violations > 0 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{c.violations}v/{c.total}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{c.status}</span>
            </div>
          ))}
        </div>

        {/* Violations */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // audit violations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {AUDIT_VIOLATIONS.slice(0, violationRows).map((v, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.constraint}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.message}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{v.enforcedAt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          gatekeeper v3.16 - apache-2.0 - opa policy controller for k8s
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {admissionsTotal.toLocaleString()} admitted - {deniesTotal.toLocaleString()} denied
        </span>
      </div>
    </div>
  );
}
