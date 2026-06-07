'use client';

import { useEffect, useRef, useState } from 'react';

const PIPELINES = [
  { name: 'construx-listing-enrichment', version: 'v2.4', runs: 284, components: 8, schedule: '0 2 * * *', lastRun: '2h ago', status: 'enabled' },
  { name: 'construx-image-processing', version: 'v1.8', runs: 184, components: 5, schedule: '*/30 * * * *', lastRun: '28m ago', status: 'enabled' },
  { name: 'construx-recommender-train', version: 'v3.1', runs: 48, components: 12, schedule: '0 0 * * 0', lastRun: '3d ago', status: 'enabled' },
  { name: 'construx-data-validation', version: 'v1.2', runs: 840, components: 4, schedule: '*/15 * * * *', lastRun: '4m ago', status: 'enabled' },
];

const RUNS = [
  { pipeline: 'construx-listing-enrichment', runId: 'run-a1b2c3', startedAt: '02:00:04', duration: '4m 28s', steps: 8, status: 'Succeeded' },
  { pipeline: 'construx-image-processing', runId: 'run-d4e5f6', startedAt: '03:30:01', duration: '1m 52s', steps: 5, status: 'Succeeded' },
  { pipeline: 'construx-data-validation', runId: 'run-g7h8i9', startedAt: '03:45:00', duration: '38s', steps: 4, status: 'Succeeded' },
  { pipeline: 'construx-image-processing', runId: 'run-j1k2l3', startedAt: '04:00:01', duration: '1m 48s', steps: 5, status: 'Running' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function KubeflowPipelinesPanel() {
  const [visible, setVisible] = useState(false);
  const [pipelineRows, setPipelineRows] = useState(0);
  const [runRows, setRunRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const runsTotal = useCounter(2840, 4, 800);
  const experimentsTotal = useCounter(48, 1, 3600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const p = setInterval(() => setPipelineRows((x) => Math.min(x + 1, PIPELINES.length)), 160);
    const r = setInterval(() => setRunRows((x) => Math.min(x + 1, RUNS.length)), 140);
    return () => { clearInterval(p); clearInterval(r); };
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
          kubeflow pipelines -- mlops -- pipelines / runs / experiments
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {runsTotal.toLocaleString()} runs
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>kfp@cluster</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>kfp pipeline list && kfp run list --experiment-id construx-prod --status Running</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'runs total', value: runsTotal.toLocaleString(), color: '#4ade80' },
          { label: 'experiments', value: experimentsTotal.toLocaleString(), color: '#67e8f9' },
          { label: 'pipelines', value: PIPELINES.length.toString(), color: '#a78bfa' },
          { label: 'running', value: RUNS.filter(r => r.status === 'Running').length.toString(), color: '#fbbf24' },
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
          {PIPELINES.slice(0, pipelineRows).map((p) => (
            <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '1fr 28px 24px 20px 72px 40px 48px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{p.version}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{p.runs}r</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{p.components}c</span>
              <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 7, fontFamily: 'monospace' }}>{p.schedule}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{p.lastRun}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{p.status}</span>
            </div>
          ))}
        </div>

        {/* Runs */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent runs
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {RUNS.slice(0, runRows).map((run, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 56px 40px 40px 20px 56px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{run.pipeline}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, fontFamily: 'monospace' }}>{run.runId}</span>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{run.startedAt}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{run.duration}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{run.steps}s</span>
              <span style={{ color: run.status === 'Succeeded' ? '#4ade80' : run.status === 'Running' ? '#fbbf24' : '#f87171', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{run.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          kubeflow pipelines v2.3 - apache-2.0 - ml workflows on kubernetes
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {runsTotal.toLocaleString()} runs - {experimentsTotal.toLocaleString()} experiments
        </span>
      </div>
    </div>
  );
}
