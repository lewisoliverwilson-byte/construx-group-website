'use client';

import { useEffect, useRef, useState } from 'react';

const EXPERIMENTS = [
  { name: 'scan-classifier', runs: 284, bestMetric: 0.924, metric: 'f1', artifact: 's3://ml/scan/', status: 'active' },
  { name: 'listing-embedder', runs: 42, bestMetric: 0.812, metric: 'cosine', artifact: 's3://ml/embed/', status: 'active' },
  { name: 'intent-detector', runs: 120, bestMetric: 0.886, metric: 'accuracy', artifact: 's3://ml/intent/', status: 'archived' },
];

const RUNS = [
  { name: 'wandering-elk-284', experiment: 'scan-classifier', status: 'FINISHED', accuracy: 0.924, params: 'lr=1e-4, bs=32', duration: '14m' },
  { name: 'careful-owl-283', experiment: 'scan-classifier', status: 'FINISHED', accuracy: 0.918, params: 'lr=5e-5, bs=64', duration: '12m' },
  { name: 'bright-fox-42', experiment: 'listing-embedder', status: 'RUNNING', accuracy: 0.0, params: 'dim=768, ep=10', duration: '8m' },
  { name: 'swift-wolf-119', experiment: 'intent-detector', status: 'FAILED', accuracy: 0.0, params: 'lr=1e-3, bs=128', duration: '2m' },
];

const STATUS_COLOR: Record<string, string> = {
  FINISHED: '#4ade80',
  RUNNING: '#67e8f9',
  FAILED: '#f87171',
  SCHEDULED: '#fbbf24',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function MLflowPanel() {
  const [visible, setVisible] = useState(false);
  const [expRows, setExpRows] = useState(0);
  const [runRows, setRunRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalRuns = EXPERIMENTS.reduce((a, e) => a + e.runs, 0);
  const artifactsMB = useCounter(2840, 18, 1000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const e = setInterval(() => setExpRows((x) => Math.min(x + 1, EXPERIMENTS.length)), 160);
    const r = setInterval(() => setRunRows((x) => Math.min(x + 1, RUNS.length)), 140);
    return () => { clearInterval(e); clearInterval(r); };
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
          mlflow -- ml experiment tracking -- models / artifacts / registry
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalRuns} runs
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>mlflow@tracking</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>mlflow experiments list && mlflow runs list --experiment-name scan-classifier --order-by metric.f1 DESC</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'total runs', value: totalRuns.toString(), color: '#a78bfa' },
          { label: 'artifacts MB', value: artifactsMB.toLocaleString(), color: '#67e8f9' },
          { label: 'experiments', value: EXPERIMENTS.length.toString(), color: '#4ade80' },
          { label: 'running', value: RUNS.filter(r => r.status === 'RUNNING').length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Experiments */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // experiments
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {EXPERIMENTS.slice(0, expRows).map((exp) => (
            <div key={exp.name} style={{ display: 'grid', gridTemplateColumns: '1fr 28px 40px 32px 48px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600 }}>{exp.name}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 8, textAlign: 'center' }}>{exp.runs}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 8, textAlign: 'right', fontWeight: 700 }}>{exp.bestMetric}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{exp.metric}</span>
              <span style={{ color: exp.status === 'active' ? '#4ade80' : 'rgba(255,255,255,0.2)', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{exp.status}</span>
            </div>
          ))}
        </div>

        {/* Runs */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent runs
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {RUNS.slice(0, runRows).map((r) => (
            <div key={r.name} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 36px 44px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: r.status === 'FAILED' ? 'rgba(248,113,113,0.04)' : r.status === 'RUNNING' ? 'rgba(103,232,249,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${r.status === 'FAILED' ? 'rgba(248,113,113,0.1)' : r.status === 'RUNNING' ? 'rgba(103,232,249,0.08)' : 'rgba(74,222,128,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.params}</span>
              <span className="tabular-nums" style={{ color: r.accuracy > 0 ? '#67e8f9' : 'rgba(255,255,255,0.15)', fontSize: 8, textAlign: 'right', fontWeight: r.accuracy > 0 ? 700 : 400 }}>{r.accuracy > 0 ? r.accuracy : '—'}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{r.duration}</span>
              <span style={{ color: STATUS_COLOR[r.status] ?? '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{r.status.slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          mlflow v2.13 - apache 2.0 - ml lifecycle management
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {EXPERIMENTS.length} experiments - {totalRuns} runs
        </span>
      </div>
    </div>
  );
}
