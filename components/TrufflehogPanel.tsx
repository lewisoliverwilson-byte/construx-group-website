'use client';

import { useEffect, useRef, useState } from 'react';

const SCANS = [
  { repo: 'construx-group-website', commits: 2840, verified: 0, unverified: 0, duration: '12s', status: 'clean' },
  { repo: 'construx-workspace', commits: 8400, verified: 0, unverified: 1, duration: '28s', status: 'warn' },
  { repo: 'construx-daily', commits: 1200, verified: 0, unverified: 0, duration: '8s', status: 'clean' },
  { repo: 'construx-studio', commits: 480, verified: 0, unverified: 0, duration: '4s', status: 'clean' },
];

const FINDINGS = [
  { repo: 'construx-workspace', detector: 'AWS', type: 'AccessKey', file: 'scripts/deploy.sh', commit: 'a9f3b2c', verified: false, severity: 'High' },
  { repo: 'construx-workspace', detector: 'Generic API Key', type: 'HexToken', file: '.env.example', commit: 'f7d4e1a', verified: false, severity: 'Low' },
  { repo: 'construx-daily', detector: 'Slack', type: 'WebhookURL', file: 'config/notify.ts', commit: '2b8c5d9', verified: false, severity: 'Medium' },
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

export default function TrufflehogPanel() {
  const [visible, setVisible] = useState(false);
  const [sRows, setSRows] = useState(0);
  const [fRows, setFRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const commitsScanned = useCounter(12920, 48, 800);
  const scansTotal = useCounter(284, 2, 1200);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setSRows((x) => Math.min(x + 1, SCANS.length)), 160);
    const f = setInterval(() => setFRows((x) => Math.min(x + 1, FINDINGS.length)), 140);
    return () => { clearInterval(s); clearInterval(f); };
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
          trufflehog -- secret scanning -- git history / ci / verified credentials
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {scansTotal} scans
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>trufflehog@secrets</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>trufflehog git --only-verified file:///repos/construx-group-website && trufflehog github --org=construxgroup</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'scans', value: scansTotal.toString(), color: '#f97316' },
          { label: 'commits', value: commitsScanned.toLocaleString(), color: '#4ade80' },
          { label: 'findings', value: FINDINGS.length.toString(), color: '#fbbf24' },
          { label: 'verified', value: FINDINGS.filter(f => f.verified).length.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Scans */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // repository scans
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {SCANS.slice(0, sRows).map((sc) => (
            <div key={sc.repo} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 24px 24px 36px 40px', alignItems: 'center', gap: 8, padding: '5px 8px', background: sc.status === 'warn' ? 'rgba(249,115,22,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${sc.status === 'warn' ? 'rgba(249,115,22,0.1)' : 'rgba(74,222,128,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600 }}>{sc.repo}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{sc.commits.toLocaleString()}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{sc.verified}</span>
              <span className="tabular-nums" style={{ color: sc.unverified > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{sc.unverified}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{sc.duration}</span>
              <span style={{ color: sc.status === 'clean' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{sc.status}</span>
            </div>
          ))}
        </div>

        {/* Findings */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // potential secrets
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {FINDINGS.slice(0, fRows).map((f, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 52px 1fr 48px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
              <span style={{ color: SEVERITY_COLOR[f.severity] ?? '#fbbf24', fontSize: 7, fontWeight: 700 }}>{f.severity}</span>
              <span style={{ color: '#f97316', fontSize: 7 }}>{f.detector}</span>
              <span style={{ color: 'rgba(240,239,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.file}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{f.commit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          trufflehog v3.82 - agpl-3.0 - git secret scanner
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {scansTotal} scans - {commitsScanned.toLocaleString()} commits
        </span>
      </div>
    </div>
  );
}
