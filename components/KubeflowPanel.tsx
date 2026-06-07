'use client';

import { useEffect, useRef, useState } from 'react';

const PIPELINES = [
  { name: 'embedding-train-v2', version: 'v2.1', runs: 28, last: '4h ago', status: 'succeeded', steps: 6 },
  { name: 'data-preprocess', version: 'v1.4', runs: 84, last: '1h ago', status: 'running', steps: 4 },
  { name: 'model-eval', version: 'v3.0', runs: 12, last: '12h ago', status: 'succeeded', steps: 8 },
  { name: 'hyperparameter-tune', version: 'v1.0', runs: 4, last: '2d ago', status: 'failed', steps: 10 },
];

const EXPERIMENTS = [
  { name: 'embedding-v2-exp', pipeline: 'embedding-train-v2', runs: 8, best: '0.924 acc', status: 'active' },
  { name: 'preproc-ablation', pipeline: 'data-preprocess', runs: 12, best: '-', status: 'running' },
  { name: 'eval-baseline', pipeline: 'model-eval', runs: 4, best: '0.881 f1', status: 'archived' },
];

const STATUS_COLOR: Record<string, string> = {
  succeeded: '#4ade80',
  running: '#fbbf24',
  failed: '#f87171',
  archived: 'rgba(255,255,255,0.3)',
  active: '#4ade80',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function KubeflowPanel() {
  const [visible, setVisible] = useState(false);
  const [pRows, setPRows] = useState(0);
  const [eRows, setERows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalRuns = useCounter(128, 2, 1400);
  const gpuHours = useCounter(2840, 8, 900);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const p = setInterval(() => setPRows((x) => Math.min(x + 1, PIPELINES.length)), 160);
    const e = setInterval(() => setERows((x) => Math.min(x + 1, EXPERIMENTS.length)), 140);
    return () => { clearInterval(p); clearInterval(e); };
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
          kubeflow -- mlops on kubernetes -- pipelines / training
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {gpuHours.toLocaleString()} gpu-hrs
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>kfp@mlops</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>kfp run list --experiment-name embedding-v2-exp && kfp pipeline list --all</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'gpu hours', value: gpuHours.toLocaleString(), color: '#67e8f9' },
          { label: 'total runs', value: totalRuns.toString(), color: '#4ade80' },
          { label: 'pipelines', value: PIPELINES.length.toString(), color: '#a78bfa' },
          { label: 'failed', value: PIPELINES.filter(p => p.status === 'failed').length.toString(), color: '#f87171' },
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
          {PIPELINES.slice(0, pRows).map((p) => (
            <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '1fr 32px 20px 24px 40px 56px', alignItems: 'center', gap: 8, padding: '5px 8px', background: `${STATUS_COLOR[p.status]}06`, border: `1px solid ${STATUS_COLOR[p.status]}14`, borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{p.version}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 8, textAlign: 'center' }}>{p.steps}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'center' }}>{p.runs}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{p.last}</span>
              <span style={{ color: STATUS_COLOR[p.status], fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{p.status}</span>
            </div>
          ))}
        </div>

        {/* Experiments */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // experiments
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {EXPERIMENTS.slice(0, eRows).map((e) => (
            <div key={e.name} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 20px 56px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: `${STATUS_COLOR[e.status]}06`, border: `1px solid ${STATUS_COLOR[e.status]}14`, borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.pipeline}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'center' }}>{e.runs}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.best}</span>
              <span style={{ color: STATUS_COLOR[e.status], fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{e.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          kubeflow v1.8 - apache 2.0 - cncf incubating
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalRuns} runs - {gpuHours.toLocaleString()} gpu-hrs
        </span>
      </div>
    </div>
  );
}
