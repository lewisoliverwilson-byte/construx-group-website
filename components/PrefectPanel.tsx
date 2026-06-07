'use client';

import { useEffect, useRef, useState } from 'react';

const DEPLOYMENTS = [
  { name: 'data-pipeline', flow: 'etl-main', schedule: '0 */6 * * *', runs: 284, state: 'SCHEDULED' },
  { name: 'model-training', flow: 'train-loop', schedule: '0 2 * * *', runs: 42, state: 'RUNNING' },
  { name: 'report-gen', flow: 'daily-report', schedule: '0 8 * * 1-5', runs: 120, state: 'SCHEDULED' },
];

const FLOW_RUNS = [
  { name: 'etl-main-2027-06-07-0600', deployment: 'data-pipeline', state: 'COMPLETED', duration: '4m 12s', worker: 'pool-1' },
  { name: 'train-loop-2027-06-07', deployment: 'model-training', state: 'RUNNING', duration: '18m 44s', worker: 'gpu-1' },
  { name: 'daily-report-2027-06-07', deployment: 'report-gen', state: 'COMPLETED', duration: '1m 08s', worker: 'pool-1' },
  { name: 'etl-main-2027-06-07-0000', deployment: 'data-pipeline', state: 'FAILED', duration: '2m 04s', worker: 'pool-2' },
];

const STATE_COLOR: Record<string, string> = {
  COMPLETED: '#4ade80',
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

export default function PrefectPanel() {
  const [visible, setVisible] = useState(false);
  const [dRows, setDRows] = useState(0);
  const [fRows, setFRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalRuns = DEPLOYMENTS.reduce((a, d) => a + d.runs, 0);
  const taskRuns = useCounter(2840, 18, 900);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const d = setInterval(() => setDRows((x) => Math.min(x + 1, DEPLOYMENTS.length)), 160);
    const f = setInterval(() => setFRows((x) => Math.min(x + 1, FLOW_RUNS.length)), 140);
    return () => { clearInterval(d); clearInterval(f); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(59,130,246,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(59,130,246,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(59,130,246,0.08)', background: 'rgba(59,130,246,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(59,130,246,0.4)' }}>
          prefect -- workflow orchestration -- deployments / work pools
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {taskRuns.toLocaleString()} task runs
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#3b82f6', fontWeight: 600 }}>prefect@flow</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>prefect deployment ls && prefect flow-run ls --state RUNNING --limit 5</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'task runs', value: taskRuns.toLocaleString(), color: '#3b82f6' },
          { label: 'flow runs', value: totalRuns.toString(), color: '#4ade80' },
          { label: 'deployments', value: DEPLOYMENTS.length.toString(), color: '#a78bfa' },
          { label: 'failed', value: FLOW_RUNS.filter(r => r.state === 'FAILED').length.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Deployments */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // deployments
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {DEPLOYMENTS.slice(0, dRows).map((d) => (
            <div key={d.name} style={{ display: 'grid', gridTemplateColumns: '1fr 72px 76px 36px 56px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#3b82f6', fontSize: 8, fontWeight: 600 }}>{d.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{d.flow}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{d.schedule}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 8, textAlign: 'center' }}>{d.runs}</span>
              <span style={{ color: STATE_COLOR[d.state] ?? '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{d.state}</span>
            </div>
          ))}
        </div>

        {/* Flow runs */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent flow runs
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {FLOW_RUNS.slice(0, fRows).map((r) => (
            <div key={r.name} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 52px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: r.state === 'FAILED' ? 'rgba(248,113,113,0.04)' : r.state === 'RUNNING' ? 'rgba(103,232,249,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${r.state === 'FAILED' ? 'rgba(248,113,113,0.1)' : r.state === 'RUNNING' ? 'rgba(103,232,249,0.08)' : 'rgba(74,222,128,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.3)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{r.worker}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{r.duration}</span>
              <span style={{ color: STATE_COLOR[r.state] ?? '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{r.state.slice(0, 4)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(59,130,246,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          prefect v3.0 - apache 2.0 - workflow orchestration
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {DEPLOYMENTS.length} deployments - {taskRuns.toLocaleString()} tasks
        </span>
      </div>
    </div>
  );
}
