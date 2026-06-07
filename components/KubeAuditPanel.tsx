'use client';

import { useEffect, useRef, useState } from 'react';

const FINDINGS = [
  { check: 'automount-service-account-token', severity: 'medium', namespace: 'staging', resource: 'Deployment/feature-proxy', remediation: 'set automountServiceAccountToken: false', status: 'open' },
  { check: 'image-pull-policy', severity: 'low', namespace: 'ci', resource: 'Deployment/runner', remediation: 'set imagePullPolicy: Always', status: 'open' },
  { check: 'resource-limits', severity: 'medium', namespace: 'dev', resource: 'Deployment/debug-svc', remediation: 'add cpu/memory limits', status: 'open' },
  { check: 'privileged-containers', severity: 'high', namespace: 'kube-system', resource: 'DaemonSet/debug-privileged', remediation: 'remove privileged: true', status: 'fixed' },
];

const SCANS = [
  { target: 'construx-prod', resources: 284, passed: 280, warned: 4, failed: 0, duration: '8s', dt: '1h ago', status: 'pass' },
  { target: 'construx-staging', resources: 148, passed: 145, warned: 3, failed: 0, duration: '4s', dt: '1h ago', status: 'warn' },
  { target: 'construx-dev', resources: 84, passed: 81, warned: 3, failed: 0, duration: '3s', dt: '1h ago', status: 'warn' },
  { target: 'kube-system', resources: 48, passed: 47, warned: 0, failed: 1, duration: '2s', dt: '1h ago', status: 'warn' },
];

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#f87171',
  high: '#fbbf24',
  medium: '#67e8f9',
  low: '#4ade80',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function KubeAuditPanel() {
  const [visible, setVisible] = useState(false);
  const [findingRows, setFindingRows] = useState(0);
  const [scanRows, setScanRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const scansTotal = useCounter(284, 1, 1200);
  const findingsTotal = useCounter(2840, 4, 800);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const f = setInterval(() => setFindingRows((x) => Math.min(x + 1, FINDINGS.length)), 160);
    const s = setInterval(() => setScanRows((x) => Math.min(x + 1, SCANS.length)), 140);
    return () => { clearInterval(f); clearInterval(s); };
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
          kubeaudit -- k8s security audit -- findings / namespaces / remediation
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {scansTotal.toLocaleString()} scans
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#3b82f6', fontWeight: 600 }}>kubeaudit@ci</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>kubeaudit all --namespace prod --output json | jq && kubeaudit image --namespace staging</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'scans total', value: scansTotal.toLocaleString(), color: '#3b82f6' },
          { label: 'findings', value: findingsTotal.toLocaleString(), color: '#fbbf24' },
          { label: 'namespaces', value: SCANS.length.toString(), color: '#4ade80' },
          { label: 'open', value: FINDINGS.filter(f => f.status === 'open').length.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Findings */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // findings
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {FINDINGS.slice(0, findingRows).map((f, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 48px 60px 1fr 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#3b82f6', fontSize: 7, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.check}</span>
              <span style={{ color: SEVERITY_COLOR[f.severity] ?? '#4ade80', fontSize: 7 }}>{f.severity}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.namespace}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.remediation}</span>
              <span style={{ color: f.status === 'fixed' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{f.status}</span>
            </div>
          ))}
        </div>

        {/* Scans */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent scans
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SCANS.slice(0, scanRows).map((scan, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 28px 28px 20px 28px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scan.target}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{scan.resources}r</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{scan.passed}p</span>
              <span className="tabular-nums" style={{ color: scan.warned > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{scan.warned}w</span>
              <span className="tabular-nums" style={{ color: scan.failed > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{scan.failed}f</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{scan.dt}</span>
              <span style={{ color: scan.status === 'pass' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{scan.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(59,130,246,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          kubeaudit v0.22 - apache-2.0 - kubernetes security auditor
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {scansTotal.toLocaleString()} scans - {findingsTotal.toLocaleString()} findings
        </span>
      </div>
    </div>
  );
}
