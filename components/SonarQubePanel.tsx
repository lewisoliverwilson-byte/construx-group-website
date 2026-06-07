'use client';

import { useEffect, useRef, useState } from 'react';

const PROJECTS = [
  { key: 'construx:api', name: 'api-gateway', bugs: 2, vulns: 0, smells: 14, coverage: 84, duplication: 1.2, gate: 'OK' },
  { key: 'construx:ml', name: 'ml-service', bugs: 0, vulns: 1, smells: 8, coverage: 71, duplication: 0.8, gate: 'WARN' },
  { key: 'construx:web', name: 'web-app', bugs: 0, vulns: 0, smells: 28, coverage: 68, duplication: 2.4, gate: 'OK' },
  { key: 'construx:worker', name: 'worker', bugs: 1, vulns: 0, smells: 6, coverage: 88, duplication: 0.4, gate: 'OK' },
];

const ISSUES = [
  { severity: 'MAJOR', type: 'BUG', rule: 'java:S2259', file: 'AuthService.java:84', effort: '30min' },
  { severity: 'CRITICAL', type: 'VULNERABILITY', rule: 'py:S4719', file: 'ml_infer.py:12', effort: '1h' },
  { severity: 'MAJOR', type: 'BUG', rule: 'go:S1128', file: 'router.go:42', effort: '20min' },
  { severity: 'MINOR', type: 'CODE_SMELL', rule: 'ts:S3776', file: 'pipeline.ts:108', effort: '45min' },
];

const SEV_COLOR: Record<string, string> = { CRITICAL: '#f87171', MAJOR: '#fbbf24', MINOR: '#67e8f9', INFO: 'rgba(255,255,255,0.3)' };
const GATE_COLOR: Record<string, string> = { OK: '#4ade80', WARN: '#fbbf24', FAIL: '#f87171' };

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta)), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function SonarQubePanel() {
  const [visible, setVisible] = useState(false);
  const [projRows, setProjRows] = useState(0);
  const [issRows, setIssRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const linesAnalyzed = useCounter(284000, 200, 800);
  const avgCoverage = useCounter(77, 0, 60000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const p = setInterval(() => setProjRows((x) => Math.min(x + 1, PROJECTS.length)), 160);
    const i = setInterval(() => setIssRows((x) => Math.min(x + 1, ISSUES.length)), 150);
    return () => { clearInterval(p); clearInterval(i); };
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
          sonarqube -- code quality -- coverage / security gates
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {avgCoverage}% avg coverage
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>sonar@quality</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>sonar-scanner -Dsonar.projectKey=construx:api -Dsonar.sources=. -Dsonar.host.url=https://sonar.construx.io</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'lines analyzed', value: linesAnalyzed.toLocaleString(), color: '#4ade80' },
          { label: 'avg coverage', value: `${avgCoverage}%`, color: '#67e8f9' },
          { label: 'projects', value: PROJECTS.length.toString(), color: '#a78bfa' },
          { label: 'open issues', value: ISSUES.length.toString(), color: '#fbbf24' },
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
          {PROJECTS.slice(0, projRows).map((proj) => (
            <div key={proj.key} style={{ padding: '5px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ color: '#4ade80', fontSize: 9, fontWeight: 600 }}>{proj.name}</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {proj.bugs > 0 && <span className="tabular-nums" style={{ color: '#f87171', fontSize: 7 }}>{proj.bugs}B</span>}
                  {proj.vulns > 0 && <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7 }}>{proj.vulns}V</span>}
                  <span style={{ color: GATE_COLOR[proj.gate], fontSize: 7, padding: '1px 5px', background: `${GATE_COLOR[proj.gate]}14`, borderRadius: 2, fontWeight: 700 }}>{proj.gate}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${proj.coverage}%`, background: proj.coverage > 80 ? '#4ade80' : proj.coverage > 70 ? '#fbbf24' : '#f87171', transition: 'width 0.8s ease' }} />
                </div>
                <span className="tabular-nums" style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>{proj.coverage}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Issues */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // open issues
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ISSUES.slice(0, issRows).map((iss) => (
            <div key={iss.rule + iss.file} style={{ display: 'grid', gridTemplateColumns: '48px 72px 72px 1fr 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: `${SEV_COLOR[iss.severity]}06`, border: `1px solid ${SEV_COLOR[iss.severity]}14`, borderRadius: 2 }}>
              <span style={{ color: SEV_COLOR[iss.severity], fontSize: 7, fontWeight: 700 }}>{iss.severity.slice(0, 5)}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 7 }}>{iss.type.split('_')[0]}</span>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{iss.rule}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{iss.file}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{iss.effort}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          sonarqube community v10.5 - sonarsource
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {linesAnalyzed.toLocaleString()} lines - {avgCoverage}% coverage
        </span>
      </div>
    </div>
  );
}
