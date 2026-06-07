'use client';

import { useEffect, useRef, useState } from 'react';

const REPOS = [
  { name: 'construx-api', org: 'construxgroup', builds: 284, passing: 282, branch: 'main', lastBuild: '14m ago', status: 'passing' },
  { name: 'construx-web', org: 'construxgroup', builds: 184, passing: 183, branch: 'main', lastBuild: '48m ago', status: 'passing' },
  { name: 'construx-worker', org: 'construxgroup', builds: 148, passing: 147, branch: 'main', lastBuild: '2h ago', status: 'passing' },
  { name: 'construx-infra', org: 'construxgroup', builds: 84, passing: 84, branch: 'main', lastBuild: '4h ago', status: 'passing' },
];

const BUILDS = [
  { repo: 'construx-api', build: '#284', event: 'push', branch: 'main', steps: 6, duration: '2m 18s', status: 'success' },
  { repo: 'construx-web', build: '#184', event: 'push', branch: 'main', steps: 8, duration: '3m 44s', status: 'success' },
  { repo: 'construx-worker', build: '#148', event: 'pr', branch: 'feat/enricher', steps: 5, duration: '1m 56s', status: 'success' },
  { repo: 'construx-infra', build: '#84', event: 'push', branch: 'main', steps: 4, duration: '1m 12s', status: 'running' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function DronePanel() {
  const [visible, setVisible] = useState(false);
  const [repoRows, setRepoRows] = useState(0);
  const [buildRows, setBuildRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const buildsTotal = useCounter(2840, 4, 800);
  const stepsTotal = useCounter(28400, 48, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setRepoRows((x) => Math.min(x + 1, REPOS.length)), 160);
    const b = setInterval(() => setBuildRows((x) => Math.min(x + 1, BUILDS.length)), 140);
    return () => { clearInterval(r); clearInterval(b); };
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
          drone ci -- container-native ci/cd -- repos / builds / steps
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {buildsTotal.toLocaleString()} builds
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>drone@server</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>drone build ls construxgroup/construx-api && drone build info construxgroup/construx-api 284</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'builds total', value: buildsTotal.toLocaleString(), color: '#f97316' },
          { label: 'steps run', value: stepsTotal.toLocaleString(), color: '#4ade80' },
          { label: 'repos', value: REPOS.length.toString(), color: '#67e8f9' },
          { label: 'running', value: BUILDS.filter(b => b.status === 'running').length.toString(), color: '#fbbf24' },
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
          {REPOS.slice(0, repoRows).map((r) => (
            <div key={r.name} style={{ display: 'grid', gridTemplateColumns: '1fr 48px 24px 24px 36px 44px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{r.org}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{r.passing}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{r.builds}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.branch}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{r.lastBuild}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{r.status}</span>
            </div>
          ))}
        </div>

        {/* Builds */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent builds
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {BUILDS.slice(0, buildRows).map((b, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 36px 44px 60px 20px 44px 48px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.repo}</span>
              <span style={{ color: '#f97316', fontSize: 7 }}>{b.build}</span>
              <span style={{ color: '#a78bfa', fontSize: 7 }}>{b.event}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.branch}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{b.steps}s</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{b.duration}</span>
              <span style={{ color: b.status === 'success' ? '#4ade80' : b.status === 'running' ? '#fbbf24' : '#f87171', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{b.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          drone ci v2.24 - apache-2.0 - container-native, continuous delivery platform
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {buildsTotal.toLocaleString()} builds - {stepsTotal.toLocaleString()} steps
        </span>
      </div>
    </div>
  );
}
