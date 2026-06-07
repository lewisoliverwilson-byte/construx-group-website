'use client';

import { useEffect, useRef, useState } from 'react';

const REPOS = [
  { name: 'construx-group-website', score: 9.2, policy: 'enforced', pinned: 100, harden: true },
  { name: 'construx-workspace', score: 8.7, policy: 'enforced', pinned: 94, harden: true },
  { name: 'construx-daily', score: 8.1, policy: 'audit', pinned: 88, harden: false },
  { name: 'construx-studio', score: 7.9, policy: 'audit', pinned: 82, harden: false },
];

const FINDINGS = [
  { repo: 'construx-daily', check: 'Token-Permissions', severity: 'Medium', finding: 'write-all permissions in workflow', remediation: 'pin to read-all + explicit' },
  { repo: 'construx-daily', check: 'Pinned-Dependencies', severity: 'Low', finding: '6 actions not pinned to SHA', remediation: 'use harden-runner fix' },
  { repo: 'construx-studio', check: 'Dangerous-Workflow', severity: 'High', finding: 'pull_request_target with checkout', remediation: 'restrict to safe contexts' },
  { repo: 'construx-studio', check: 'Branch-Protection', severity: 'Medium', finding: 'force-push allowed on main', remediation: 'enable branch protection rules' },
];

const SEVERITY_COLOR: Record<string, string> = {
  Critical: '#f87171',
  High: '#f97316',
  Medium: '#fbbf24',
  Low: '#67e8f9',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function StepSecurityPanel() {
  const [visible, setVisible] = useState(false);
  const [rRows, setRRows] = useState(0);
  const [fRows, setFRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const scansRun = useCounter(284, 2, 1200);
  const checksTotal = useCounter(2840, 8, 700);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setRRows((x) => Math.min(x + 1, REPOS.length)), 160);
    const f = setInterval(() => setFRows((x) => Math.min(x + 1, FINDINGS.length)), 140);
    return () => { clearInterval(r); clearInterval(f); };
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
          stepsecurity -- cicd hardening -- scorecard / harden-runner / findings
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {checksTotal.toLocaleString()} checks
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>step@cicd</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>scorecard --repo github.com/construxgroup/construx-group-website --show-details --format json</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'scans run', value: scansRun.toString(), color: '#a78bfa' },
          { label: 'checks', value: checksTotal.toLocaleString(), color: '#4ade80' },
          { label: 'repos', value: REPOS.length.toString(), color: '#67e8f9' },
          { label: 'findings', value: FINDINGS.length.toString(), color: '#fbbf24' },
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
          // repositories
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {REPOS.slice(0, rRows).map((repo) => (
            <div key={repo.name} style={{ display: 'grid', gridTemplateColumns: '1fr 28px 56px 36px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600 }}>{repo.name}</span>
              <span className="tabular-nums" style={{ color: repo.score >= 9 ? '#4ade80' : repo.score >= 8 ? '#fbbf24' : '#f87171', fontSize: 8, fontWeight: 700, textAlign: 'center' }}>{repo.score}</span>
              <span style={{ color: repo.policy === 'enforced' ? '#4ade80' : '#fbbf24', fontSize: 7 }}>{repo.policy}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{repo.pinned}%</span>
              <span style={{ color: repo.harden ? '#4ade80' : 'rgba(255,255,255,0.2)', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{repo.harden ? 'harden' : 'bare'}</span>
            </div>
          ))}
        </div>

        {/* Findings */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // security findings
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {FINDINGS.slice(0, fRows).map((f, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '64px 72px 40px 1fr', alignItems: 'center', gap: 8, padding: '4px 8px', background: f.severity === 'High' ? 'rgba(249,115,22,0.04)' : 'rgba(248,113,113,0.04)', border: `1px solid ${f.severity === 'High' ? 'rgba(249,115,22,0.1)' : 'rgba(251,191,36,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: SEVERITY_COLOR[f.severity] ?? '#fbbf24', fontSize: 7, fontWeight: 700 }}>{f.severity}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{f.check}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.repo}</span>
              <span style={{ color: 'rgba(240,239,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.finding}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          stepsecurity v1.0 - mit - github actions security
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {REPOS.length} repos - {FINDINGS.length} findings
        </span>
      </div>
    </div>
  );
}
