'use client';

import { useEffect, useRef, useState } from 'react';

const REPOS = [
  { name: 'construx-group-website', prs: 12, merged: 8, open: 4, automerge: 6, manager: 'npm', status: 'active' },
  { name: 'construx-workspace', prs: 28, merged: 24, open: 4, automerge: 20, manager: 'npm+docker', status: 'active' },
  { name: 'construx-infra', prs: 8, merged: 6, open: 2, automerge: 4, manager: 'helm+terraform', status: 'active' },
  { name: 'construx-ml', prs: 4, merged: 2, open: 2, automerge: 0, manager: 'pip', status: 'paused' },
];

const UPDATES = [
  { dep: 'next', from: '15.2.4', to: '15.3.3', type: 'minor', repo: 'construx-group-website', confidence: 'high' },
  { dep: 'typescript', from: '5.4.5', to: '5.5.4', type: 'minor', repo: 'construx-workspace', confidence: 'high' },
  { dep: 'tailwindcss', from: '3.4.3', to: '3.4.7', type: 'patch', repo: 'construx-group-website', confidence: 'high' },
  { dep: 'react', from: '18.3.1', to: '19.0.0', type: 'major', repo: 'construx-workspace', confidence: 'low' },
];

const CONF_COLOR: Record<string, string> = {
  high: '#4ade80',
  medium: '#fbbf24',
  low: '#f87171',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function RenovatePanel() {
  const [visible, setVisible] = useState(false);
  const [repoRows, setRepoRows] = useState(0);
  const [updRows, setUpdRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalMerged = useCounter(40, 1, 2400);
  const depsTracked = useCounter(1732, 2, 1800);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setRepoRows((x) => Math.min(x + 1, REPOS.length)), 160);
    const u = setInterval(() => setUpdRows((x) => Math.min(x + 1, UPDATES.length)), 140);
    return () => { clearInterval(r); clearInterval(u); };
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
          renovate -- dependency automation -- repos / updates / automerge
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {depsTracked.toLocaleString()} deps
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>renovate@bot</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>renovate --platform github --autodiscover --autodiscover-filter "lewisoliverwilson-byte/*"</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'deps tracked', value: depsTracked.toLocaleString(), color: '#4ade80' },
          { label: 'merged', value: totalMerged.toLocaleString(), color: '#67e8f9' },
          { label: 'repos', value: REPOS.length.toString(), color: '#a78bfa' },
          { label: 'open prs', value: REPOS.reduce((a, r) => a + r.open, 0).toString(), color: '#fbbf24' },
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
            <div key={repo.name} style={{ display: 'grid', gridTemplateColumns: '1fr 24px 28px 24px 28px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: repo.status === 'paused' ? 'rgba(251,191,36,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${repo.status === 'paused' ? 'rgba(251,191,36,0.1)' : 'rgba(74,222,128,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{repo.name}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{repo.prs}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{repo.merged}m</span>
              <span className="tabular-nums" style={{ color: repo.open > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{repo.open}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{repo.automerge}a</span>
              <span style={{ color: repo.status === 'active' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{repo.status}</span>
            </div>
          ))}
        </div>

        {/* Updates */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // pending updates
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {UPDATES.slice(0, updRows).map((upd) => (
            <div key={`${upd.dep}-${upd.repo}`} style={{ display: 'grid', gridTemplateColumns: '48px 40px 40px 36px 1fr 40px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 600 }}>{upd.dep}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{upd.from}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7 }}>{upd.to}</span>
              <span style={{ color: upd.type === 'major' ? '#f87171' : upd.type === 'minor' ? '#fbbf24' : '#4ade80', fontSize: 7, fontWeight: 700 }}>{upd.type}</span>
              <span style={{ color: 'rgba(240,239,255,0.25)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{upd.repo}</span>
              <span style={{ color: CONF_COLOR[upd.confidence] ?? 'rgba(255,255,255,0.3)', fontSize: 7, textAlign: 'right' }}>{upd.confidence}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          renovate v37 - agpl-3.0 - mend dependency automation
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {depsTracked.toLocaleString()} tracked - {totalMerged.toLocaleString()} merged
        </span>
      </div>
    </div>
  );
}
