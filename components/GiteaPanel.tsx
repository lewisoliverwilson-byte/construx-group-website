'use client';

import { useEffect, useRef, useState } from 'react';

const REPOS = [
  { name: 'construx-group-website', stars: 4, forks: 0, issues: 0, prs: 2, status: 'active' },
  { name: 'construx-workspace', stars: 8, forks: 1, issues: 3, prs: 4, status: 'active' },
  { name: 'construx-infra', stars: 2, forks: 0, issues: 1, prs: 1, status: 'active' },
  { name: 'data-pipelines', stars: 1, forks: 0, issues: 0, prs: 0, status: 'archived' },
];

const PUSHES = [
  { user: 'lewis', repo: 'construx-group-website', branch: 'master', commits: 4, dt: '12s ago', size: '+284/-48' },
  { user: 'ci-bot', repo: 'construx-workspace', branch: 'main', commits: 1, dt: '4m ago', size: '+12/-0' },
  { user: 'lewis', repo: 'construx-infra', branch: 'feat/consul', commits: 2, dt: '18m ago', size: '+120/-8' },
  { user: 'renovate', repo: 'construx-workspace', branch: 'renovate/deps', commits: 1, dt: '2h ago', size: '+8/-8' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function GiteaPanel() {
  const [visible, setVisible] = useState(false);
  const [repoRows, setRepoRows] = useState(0);
  const [pushRows, setPushRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const reposTotal = useCounter(28, 1, 3600);
  const commitsTotal = useCounter(2840, 4, 800);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setRepoRows((x) => Math.min(x + 1, REPOS.length)), 160);
    const p = setInterval(() => setPushRows((x) => Math.min(x + 1, PUSHES.length)), 140);
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
          gitea -- self-hosted git -- repos / pushes / ci
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {commitsTotal.toLocaleString()} commits
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>gitea@server</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>gitea admin user list && curl -H "Authorization: token $GITEA_TOKEN" https://git.construxgroup.io/api/v1/repos/search</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'repos', value: reposTotal.toLocaleString(), color: '#4ade80' },
          { label: 'commits', value: (commitsTotal / 1000).toFixed(0) + 'k', color: '#67e8f9' },
          { label: 'open prs', value: REPOS.reduce((a, r) => a + r.prs, 0).toString(), color: '#a78bfa' },
          { label: 'open issues', value: REPOS.reduce((a, r) => a + r.issues, 0).toString(), color: '#fbbf24' },
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
            <div key={repo.name} style={{ display: 'grid', gridTemplateColumns: '1fr 24px 24px 24px 24px 52px', alignItems: 'center', gap: 8, padding: '5px 8px', background: repo.status === 'archived' ? 'rgba(255,255,255,0.02)' : 'rgba(74,222,128,0.04)', border: `1px solid ${repo.status === 'archived' ? 'rgba(255,255,255,0.05)' : 'rgba(74,222,128,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: repo.status === 'archived' ? 'rgba(255,255,255,0.2)' : '#4ade80', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{repo.name}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'center' }}>{repo.stars}★</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{repo.forks}f</span>
              <span className="tabular-nums" style={{ color: repo.issues > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{repo.issues}i</span>
              <span className="tabular-nums" style={{ color: repo.prs > 0 ? '#a78bfa' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{repo.prs}p</span>
              <span style={{ color: repo.status === 'active' ? '#4ade80' : 'rgba(255,255,255,0.2)', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{repo.status}</span>
            </div>
          ))}
        </div>

        {/* Recent pushes */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent pushes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {PUSHES.slice(0, pushRows).map((push, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 80px 20px 60px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{push.user}</span>
              <span style={{ color: '#4ade80', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{push.repo}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{push.branch}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{push.commits}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{push.size}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{push.dt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          gitea v1.22 - mit - self-hosted git service
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {reposTotal.toLocaleString()} repos - {(commitsTotal / 1000).toFixed(0)}k commits
        </span>
      </div>
    </div>
  );
}
