'use client';

import { useEffect, useRef, useState } from 'react';

const CONSTRAINTS = [
  { name: 'require-resource-limits', kind: 'K8sRequiredLabels', action: 'deny', violations: 0, audit: '0/28' },
  { name: 'no-privileged-containers', kind: 'K8sPrivilegedContainer', action: 'deny', violations: 0, audit: '0/186' },
  { name: 'require-image-digest', kind: 'K8sImageDigests', action: 'warn', violations: 4, audit: '4/186' },
  { name: 'allowed-repos', kind: 'K8sAllowedRepos', action: 'deny', violations: 0, audit: '0/186' },
  { name: 'unique-ingress-host', kind: 'K8sUniqueIngressHost', action: 'deny', violations: 0, audit: '0/14' },
];

const VIOLATIONS = [
  { constraint: 'require-image-digest', resource: 'deploy/ml-worker', ns: 'prod', reason: 'image tag :latest not allowed', ts: '4m ago' },
  { constraint: 'require-image-digest', resource: 'deploy/cron-jobs', ns: 'staging', reason: 'image tag :dev not allowed', ts: '12m ago' },
  { constraint: 'require-image-digest', resource: 'pod/debug-shell', ns: 'default', reason: 'image tag :latest not allowed', ts: '1h ago' },
];

const ACTION_COLOR: Record<string, string> = { deny: '#f87171', warn: '#fbbf24', dryrun: '#67e8f9' };

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta)), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function OpaGatekeeperPanel() {
  const [visible, setVisible] = useState(false);
  const [cRows, setCRows] = useState(0);
  const [vRows, setVRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const admissions = useCounter(48200, 24, 700);
  const denied = useCounter(8, 0, 30000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const c = setInterval(() => setCRows((x) => Math.min(x + 1, CONSTRAINTS.length)), 150);
    const v = setInterval(() => setVRows((x) => Math.min(x + 1, VIOLATIONS.length)), 170);
    return () => { clearInterval(c); clearInterval(v); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(248,113,113,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(248,113,113,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(248,113,113,0.08)', background: 'rgba(248,113,113,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(248,113,113,0.4)' }}>
          opa gatekeeper -- admission control -- rego policies
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {admissions.toLocaleString()} admissions
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f87171', fontWeight: 600 }}>gk@admission</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>kubectl get constraints --all-namespaces && kubectl get violations.gatekeeper.sh -A</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'admissions', value: admissions.toLocaleString(), color: '#f87171' },
          { label: 'denied', value: denied.toLocaleString(), color: '#fbbf24' },
          { label: 'constraints', value: CONSTRAINTS.length.toString(), color: '#4ade80' },
          { label: 'violations', value: VIOLATIONS.length.toString(), color: '#fbbf24' },
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
          // constraint templates
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {CONSTRAINTS.slice(0, cRows).map((c) => (
            <div key={c.name} style={{ display: 'grid', gridTemplateColumns: '1fr 96px 36px 40px 40px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#f87171', fontSize: 9, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.kind}</span>
              <span style={{ color: ACTION_COLOR[c.action], fontSize: 7, fontWeight: 700, textAlign: 'center', padding: '1px 4px', background: `${ACTION_COLOR[c.action]}14`, borderRadius: 2 }}>{c.action}</span>
              <span className="tabular-nums" style={{ color: c.violations > 0 ? '#fbbf24' : '#4ade80', fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{c.violations}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 8, textAlign: 'right' }}>{c.audit}</span>
            </div>
          ))}
        </div>

        {/* Violations */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // active violations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {VIOLATIONS.slice(0, vRows).map((v) => (
            <div key={v.resource + v.ts} style={{ display: 'grid', gridTemplateColumns: '1fr 56px 1fr 28px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.12)', borderRadius: 2 }}>
              <span style={{ color: '#fbbf24', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{v.resource}</span>
              <span style={{ color: '#67e8f9', fontSize: 8 }}>{v.ns}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.reason}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{v.ts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(248,113,113,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          opa gatekeeper v3.16 - cncf - rego + audit
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {admissions.toLocaleString()} admissions - {denied} denied
        </span>
      </div>
    </div>
  );
}
