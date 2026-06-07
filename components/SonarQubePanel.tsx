'use client';

import { useEffect, useRef, useState } from 'react';

const PROJECTS = [
  { key: 'construx-api', name: 'construx-api', coverage: 84.2, duplications: 1.8, issues: 12, smells: 28, bugs: 0, vulnerabilities: 0, status: 'passed' },
  { key: 'construx-worker', name: 'construx-worker', coverage: 76.4, duplications: 2.4, issues: 8, smells: 18, bugs: 0, vulnerabilities: 1, status: 'passed' },
  { key: 'construx-web', name: 'construx-web', coverage: 68.8, duplications: 3.2, issues: 24, smells: 48, bugs: 1, vulnerabilities: 0, status: 'warning' },
  { key: 'construx-infra', name: 'construx-infra', coverage: 0, duplications: 0, issues: 4, smells: 8, bugs: 0, vulnerabilities: 2, status: 'warning' },
];

const ISSUES = [
  { type: 'CODE_SMELL', severity: 'MAJOR', project: 'construx-api', rule: 'python:S1135', message: 'Complete the task associated to this TODO comment', file: 'src/listings/enricher.py:148', status: 'OPEN' },
  { type: 'VULNERABILITY', severity: 'MINOR', project: 'construx-worker', rule: 'python:S4790', message: 'Using a weak cryptographic hash function', file: 'src/utils/hash.py:24', status: 'OPEN' },
  { type: 'BUG', severity: 'MAJOR', project: 'construx-web', rule: 'typescript:S6571', message: 'Non-nullable assertion on a nullable value', file: 'components/ListingCard.tsx:84', status: 'OPEN' },
  { type: 'VULNERABILITY', severity: 'MAJOR', project: 'construx-infra', rule: 'terraform:S6303', message: 'S3 bucket should have server-side encryption enabled', file: 'modules/storage/main.tf:28', status: 'OPEN' },
];

const SEVERITY_COLOR: Record<string, string> = {
  BLOCKER: '#f87171',
  CRITICAL: '#f87171',
  MAJOR: '#fbbf24',
  MINOR: '#67e8f9',
  INFO: '#4ade80',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function SonarQubePanel() {
  const [visible, setVisible] = useState(false);
  const [projectRows, setProjectRows] = useState(0);
  const [issueRows, setIssueRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const linesAnalysed = useCounter(284000, 2400, 500);
  const analysesTotal = useCounter(2840, 4, 800);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const p = setInterval(() => setProjectRows((x) => Math.min(x + 1, PROJECTS.length)), 160);
    const i = setInterval(() => setIssueRows((x) => Math.min(x + 1, ISSUES.length)), 140);
    return () => { clearInterval(p); clearInterval(i); };
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
          sonarqube -- code quality -- projects / coverage / issues
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {(linesAnalysed / 1000).toFixed(0)}k lines
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>sonar@scanner</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>sonar-scanner -Dsonar.projectKey=construx-api -Dsonar.host.url=$SONAR_HOST && sonar-quality-gate check</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'lines analysed', value: (linesAnalysed / 1000).toFixed(0) + 'k', color: '#67e8f9' },
          { label: 'analyses', value: analysesTotal.toLocaleString(), color: '#4ade80' },
          { label: 'projects', value: PROJECTS.length.toString(), color: '#a78bfa' },
          { label: 'open issues', value: PROJECTS.reduce((a, p) => a + p.issues, 0).toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Projects */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // projects
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {PROJECTS.slice(0, projectRows).map((p) => (
            <div key={p.key} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 32px 24px 24px 24px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600 }}>{p.name}</span>
              <span className="tabular-nums" style={{ color: p.coverage >= 80 ? '#4ade80' : p.coverage >= 60 ? '#fbbf24' : '#f87171', fontSize: 7, textAlign: 'right' }}>{p.coverage}%</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{p.duplications}%d</span>
              <span className="tabular-nums" style={{ color: p.bugs > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{p.bugs}b</span>
              <span className="tabular-nums" style={{ color: p.vulnerabilities > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{p.vulnerabilities}v</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{p.smells}s</span>
              <span style={{ color: p.status === 'passed' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{p.status}</span>
            </div>
          ))}
        </div>

        {/* Issues */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // open issues
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ISSUES.slice(0, issueRows).map((issue, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 48px 80px 1fr 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.type}</span>
              <span style={{ color: SEVERITY_COLOR[issue.severity] ?? '#4ade80', fontSize: 7 }}>{issue.severity}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.project}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.message}</span>
              <span style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{issue.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          sonarqube v10.6 - lgpl-3.0 - static code analysis
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {analysesTotal.toLocaleString()} analyses - {(linesAnalysed / 1000).toFixed(0)}k lines
        </span>
      </div>
    </div>
  );
}
