'use client';

import { useEffect, useRef, useState } from 'react';

const REPOS = [
  { name: 'construx-docker-local', type: 'docker', artifacts: 284, indexed: 284, violations: 2, status: 'pass' },
  { name: 'construx-npm-local', type: 'npm', artifacts: 1240, indexed: 1240, violations: 8, status: 'warn' },
  { name: 'construx-pypi-local', type: 'pypi', artifacts: 480, indexed: 480, violations: 1, status: 'pass' },
  { name: 'construx-helm-local', type: 'helm', artifacts: 48, indexed: 48, violations: 0, status: 'pass' },
];

const POLICIES = [
  { name: 'sec-critical-block', type: 'security', rules: 3, actions: 'block', triggered: 2, severity: 'CRITICAL' },
  { name: 'lic-gpl-flag', type: 'license', rules: 1, actions: 'notify', triggered: 8, severity: 'HIGH' },
  { name: 'oper-cvss-7plus', type: 'operational', rules: 2, actions: 'block', triggered: 1, severity: 'HIGH' },
  { name: 'malware-quarantine', type: 'security', rules: 1, actions: 'quarantine', triggered: 0, severity: 'CRITICAL' },
];

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: '#f87171',
  HIGH: '#fb923c',
  MEDIUM: '#fbbf24',
  LOW: 'rgba(255,255,255,0.3)',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function JfrogXrayPanel() {
  const [visible, setVisible] = useState(false);
  const [repoRows, setRepoRows] = useState(0);
  const [polRows, setPolRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const scansTotal = useCounter(2052, 4, 700);
  const violationsTotal = useCounter(11, 1, 2000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setRepoRows((x) => Math.min(x + 1, REPOS.length)), 160);
    const p = setInterval(() => setPolRows((x) => Math.min(x + 1, POLICIES.length)), 140);
    return () => { clearInterval(r); clearInterval(p); };
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
          jfrog xray -- artifact security -- sbom / cve / policy enforcement
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {scansTotal.toLocaleString()} scans
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>xray@artifactory</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>jf xr scan --repo construx-docker-local --watch construx-watch --format table</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'scans total', value: scansTotal.toLocaleString(), color: '#4ade80' },
          { label: 'violations', value: violationsTotal.toLocaleString(), color: '#f87171' },
          { label: 'repos', value: REPOS.length.toString(), color: '#67e8f9' },
          { label: 'policies', value: POLICIES.length.toString(), color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Repos */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // indexed repositories
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {REPOS.slice(0, repoRows).map((repo) => (
            <div key={repo.name} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 36px 36px 24px 40px', alignItems: 'center', gap: 8, padding: '5px 8px', background: repo.status === 'warn' ? 'rgba(251,191,36,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${repo.status === 'warn' ? 'rgba(251,191,36,0.1)' : 'rgba(74,222,128,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{repo.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{repo.type}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{repo.artifacts}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 7, textAlign: 'right' }}>{repo.indexed}</span>
              <span className="tabular-nums" style={{ color: repo.violations > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{repo.violations}</span>
              <span style={{ color: repo.status === 'pass' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{repo.status}</span>
            </div>
          ))}
        </div>

        {/* Policies */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // watch policies
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {POLICIES.slice(0, polRows).map((pol) => (
            <div key={pol.name} style={{ display: 'grid', gridTemplateColumns: '1fr 56px 56px 24px 56px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pol.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{pol.type}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{pol.actions}</span>
              <span className="tabular-nums" style={{ color: pol.triggered > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{pol.triggered}</span>
              <span style={{ color: SEVERITY_COLOR[pol.severity] ?? 'rgba(255,255,255,0.3)', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{pol.severity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          jfrog xray v3.88 - jfrog-eula - artifact security scanning
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {scansTotal.toLocaleString()} scans - {violationsTotal.toLocaleString()} violations
        </span>
      </div>
    </div>
  );
}
