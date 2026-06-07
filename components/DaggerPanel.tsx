'use client';

import { useEffect, useRef, useState } from 'react';

const PIPELINES = [
  { name: 'build-and-push', trigger: 'push', steps: 8, duration: '4m12s', cacheHit: true, status: 'passed' },
  { name: 'integration-tests', trigger: 'push', steps: 12, duration: '8m44s', cacheHit: true, status: 'passed' },
  { name: 'deploy-staging', trigger: 'manual', steps: 6, duration: '2m18s', cacheHit: false, status: 'running' },
  { name: 'security-scan', trigger: 'schedule', steps: 4, duration: '1m08s', cacheHit: true, status: 'passed' },
];

const CACHE_ENTRIES = [
  { key: 'go-mod-cache', size: '284MB', hits: 48, age: '2d', type: 'volume', status: 'warm' },
  { key: 'node-modules', size: '840MB', hits: 120, age: '6h', type: 'volume', status: 'warm' },
  { key: 'docker-layer/base', size: '1.2GB', hits: 240, age: '12h', type: 'layer', status: 'warm' },
  { key: 'test-fixtures', size: '48MB', hits: 8, age: '4d', type: 'volume', status: 'stale' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function DaggerPanel() {
  const [visible, setVisible] = useState(false);
  const [pipRows, setPipRows] = useState(0);
  const [cacheRows, setCacheRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const runsTotal = useCounter(2840, 4, 800);
  const cacheHits = useCounter(28400, 48, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const p = setInterval(() => setPipRows((x) => Math.min(x + 1, PIPELINES.length)), 160);
    const c = setInterval(() => setCacheRows((x) => Math.min(x + 1, CACHE_ENTRIES.length)), 140);
    return () => { clearInterval(p); clearInterval(c); };
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
          dagger -- programmatic ci -- pipelines / cache / services
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {runsTotal.toLocaleString()} runs
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>dagger@engine</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>dagger call --mod github.com/construxgroup/ci build --src . && dagger functions</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'runs', value: runsTotal.toLocaleString(), color: '#f97316' },
          { label: 'cache hits', value: cacheHits.toLocaleString(), color: '#4ade80' },
          { label: 'pipelines', value: PIPELINES.length.toString(), color: '#a78bfa' },
          { label: 'passing', value: PIPELINES.filter(p => p.status === 'passed').length.toString(), color: '#67e8f9' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Pipelines */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // pipelines
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {PIPELINES.slice(0, pipRows).map((pip) => (
            <div key={pip.name} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 28px 24px 40px 52px', alignItems: 'center', gap: 8, padding: '5px 8px', background: pip.status === 'running' ? 'rgba(249,115,22,0.06)' : 'rgba(249,115,22,0.04)', border: `1px solid ${pip.status === 'running' ? 'rgba(249,115,22,0.2)' : 'rgba(249,115,22,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pip.name}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{pip.trigger}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{pip.steps}s</span>
              <span style={{ color: pip.cacheHit ? '#4ade80' : 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{pip.cacheHit ? 'hit' : 'miss'}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{pip.duration}</span>
              <span style={{ color: pip.status === 'passed' ? '#4ade80' : pip.status === 'running' ? '#f97316' : '#f87171', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{pip.status}</span>
            </div>
          ))}
        </div>

        {/* Cache */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // cache volumes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {CACHE_ENTRIES.slice(0, cacheRows).map((entry) => (
            <div key={entry.key} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 28px 28px 44px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: entry.status === 'stale' ? 'rgba(251,191,36,0.04)' : 'rgba(249,115,22,0.04)', border: `1px solid ${entry.status === 'stale' ? 'rgba(251,191,36,0.1)' : 'rgba(249,115,22,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.key}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{entry.size}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{entry.hits}h</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{entry.age}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{entry.type}</span>
              <span style={{ color: entry.status === 'warm' ? '#4ade80' : '#fbbf24', fontSize: 7, textAlign: 'right', fontWeight: 700 }}>{entry.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          dagger v0.12 - apache-2.0 - programmable ci/cd engine
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {runsTotal.toLocaleString()} runs - {cacheHits.toLocaleString()} cache hits
        </span>
      </div>
    </div>
  );
}
