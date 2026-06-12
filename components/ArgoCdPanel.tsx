'use client';

import { useEffect, useRef, useState } from 'react';

const APPLICATIONS = [
  { name: 'construx-api', source: 'github.com/construxgroup/infra', health: 'Healthy', sync: 'Synced', revision: 'a1b2c3d', status: 'ok' },
  { name: 'construx-workspace', source: 'github.com/construxgroup/infra', health: 'Healthy', sync: 'Synced', revision: 'e5f6a7b', status: 'ok' },
  { name: 'monitoring-stack', source: 'github.com/construxgroup/infra', health: 'Progressing', sync: 'Synced', revision: 'c9d0e1f', status: 'degraded' },
  { name: 'cert-manager', source: 'github.com/construxgroup/infra', health: 'Healthy', sync: 'OutOfSync', revision: '8f4b2a1', status: 'outofsync' },
];

const REPOS = [
  { name: 'construxgroup/infra', type: 'git', connection: 'valid', lastFetch: '30s ago' },
  { name: 'construxgroup/helm-charts', type: 'helm', connection: 'valid', lastFetch: '2m ago' },
  { name: 'registry-1.docker.io', type: 'oci', connection: 'valid', lastFetch: '5m ago' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function ArgoCDPanel() {
  const [visible, setVisible] = useState(false);
  const [appRows, setAppRows] = useState(0);
  const [repoRows, setRepoRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const appsTotal = useCounter(28, 1, 3600);
  const syncsTotal = useCounter(2840, 4, 800);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const a = setInterval(() => setAppRows((x) => Math.min(x + 1, APPLICATIONS.length)), 160);
    const r = setInterval(() => setRepoRows((x) => Math.min(x + 1, REPOS.length)), 140);
    return () => { clearInterval(a); clearInterval(r); };
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
          argocd -- gitops cd -- apps / sync / health
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {syncsTotal.toLocaleString()} syncs
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>argocd@cluster</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>argocd app list --output wide && argocd app sync construx-api --prune --force</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'apps', value: appsTotal.toLocaleString(), color: '#67e8f9' },
          { label: 'syncs', value: (syncsTotal / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'healthy', value: APPLICATIONS.filter(a => a.health === 'Healthy').length.toString(), color: '#4ade80' },
          { label: 'out of sync', value: APPLICATIONS.filter(a => a.sync !== 'Synced').length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Applications */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // applications
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {APPLICATIONS.slice(0, appRows).map((app) => (
            <div key={app.name} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 64px 64px 52px', alignItems: 'center', gap: 8, padding: '5px 8px', background: app.status === 'outofsync' ? 'rgba(251,191,36,0.04)' : app.status === 'degraded' ? 'rgba(248,113,113,0.04)' : 'rgba(103,232,249,0.04)', border: `1px solid ${app.status === 'outofsync' ? 'rgba(251,191,36,0.1)' : app.status === 'degraded' ? 'rgba(248,113,113,0.1)' : 'rgba(103,232,249,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600 }}>{app.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.source}</span>
              <span style={{ color: app.health === 'Healthy' ? '#4ade80' : '#fbbf24', fontSize: 7, textAlign: 'center' }}>{app.health}</span>
              <span style={{ color: app.sync === 'Synced' ? '#4ade80' : '#fbbf24', fontSize: 7, textAlign: 'center' }}>{app.sync}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{app.revision}</span>
            </div>
          ))}
        </div>

        {/* Repositories */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // connected repositories
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {REPOS.slice(0, repoRows).map((repo, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 32px 48px 56px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{repo.name}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{repo.type}</span>
              <span style={{ color: repo.connection === 'valid' ? '#4ade80' : '#f87171', fontSize: 7, fontWeight: 700 }}>{repo.connection}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{repo.lastFetch}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          argocd v2.11 - apache-2.0 - gitops continuous delivery
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {appsTotal.toLocaleString()} apps - {(syncsTotal / 1000).toFixed(0)}k syncs
        </span>
      </div>
    </div>
  );
}
