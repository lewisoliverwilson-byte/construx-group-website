'use client';

import { useEffect, useRef, useState } from 'react';

const REPOS = [
  { name: 'construx-group-website', score: 8.4, branch: 'master', stars: 12, checks: 18, passing: 16, status: 'good' },
  { name: 'construx-workspace', score: 7.2, branch: 'main', stars: 8, checks: 18, passing: 13, status: 'warn' },
  { name: 'construx-infra', score: 9.1, branch: 'main', stars: 4, checks: 18, passing: 17, status: 'good' },
  { name: 'construx-ml', score: 5.4, branch: 'main', stars: 2, checks: 18, passing: 10, status: 'fail' },
];

const CHECKS = [
  { name: 'Branch-Protection', score: 10, weight: 1, reason: 'default branch protected' },
  { name: 'Code-Review', score: 9, weight: 1, reason: 'PRs require 1 review' },
  { name: 'Dependency-Update-Tool', score: 10, weight: 1, reason: 'renovate detected' },
  { name: 'Fuzzing', score: 0, weight: 1, reason: 'no fuzzing detected' },
  { name: 'SAST', score: 10, weight: 1, reason: 'CodeQL workflow found' },
  { name: 'Security-Policy', score: 9, weight: 1, reason: 'SECURITY.md found' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function ScorecardPanel() {
  const [visible, setVisible] = useState(false);
  const [repoRows, setRepoRows] = useState(0);
  const [checkRows, setCheckRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const scansTotal = useCounter(284, 1, 1800);
  const avgScore = 7.5;

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setRepoRows((x) => Math.min(x + 1, REPOS.length)), 160);
    const c = setInterval(() => setCheckRows((x) => Math.min(x + 1, CHECKS.length)), 140);
    return () => { clearInterval(r); clearInterval(c); };
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
          openssf scorecard -- supply chain -- checks / scores / repos
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          avg {avgScore}/10
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>scorecard@ossf</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>scorecard --repo github.com/lewisoliverwilson-byte/construx-group-website --show-details --format json</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'avg score', value: avgScore + '/10', color: '#4ade80' },
          { label: 'scans', value: scansTotal.toLocaleString(), color: '#67e8f9' },
          { label: 'repos', value: REPOS.length.toString(), color: '#a78bfa' },
          { label: 'failing', value: REPOS.filter(r => r.status === 'fail').length.toString(), color: '#f87171' },
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
          {REPOS.slice(0, repoRows).map((repo) => (
            <div key={repo.name} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 28px 28px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: repo.status === 'fail' ? 'rgba(248,113,113,0.04)' : repo.status === 'warn' ? 'rgba(251,191,36,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${repo.status === 'fail' ? 'rgba(248,113,113,0.1)' : repo.status === 'warn' ? 'rgba(251,191,36,0.1)' : 'rgba(74,222,128,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{repo.name}</span>
              <span className="tabular-nums" style={{ color: repo.score >= 8 ? '#4ade80' : repo.score >= 6 ? '#fbbf24' : '#f87171', fontSize: 7, textAlign: 'right', fontWeight: 700 }}>{repo.score}/10</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{repo.passing}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{repo.checks}c</span>
              <span style={{ color: repo.status === 'good' ? '#4ade80' : repo.status === 'warn' ? '#fbbf24' : '#f87171', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{repo.status}</span>
            </div>
          ))}
        </div>

        {/* Checks */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // check results
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {CHECKS.slice(0, checkRows).map((check) => (
            <div key={check.name} style={{ display: 'grid', gridTemplateColumns: '1fr 32px 1fr', alignItems: 'center', gap: 8, padding: '4px 8px', background: check.score < 5 ? 'rgba(248,113,113,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${check.score < 5 ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{check.name}</span>
              <span className="tabular-nums" style={{ color: check.score >= 8 ? '#4ade80' : check.score >= 5 ? '#fbbf24' : '#f87171', fontSize: 7, textAlign: 'center', fontWeight: 700 }}>{check.score}</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{check.reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          scorecard v5 - apache-2.0 - openssf supply chain security
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          avg {avgScore}/10 - {scansTotal.toLocaleString()} scans
        </span>
      </div>
    </div>
  );
}
