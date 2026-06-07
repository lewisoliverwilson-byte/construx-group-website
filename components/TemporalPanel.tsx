'use client';

import { useEffect, useRef, useState } from 'react';

const WORKFLOWS = [
  { id: 'wf-order-a3f2', type: 'OrderWorkflow', status: 'running', run: 1, started: '2m ago', ns: 'commerce' },
  { id: 'wf-onboard-b8c1', type: 'OnboardingWorkflow', status: 'completed', run: 1, started: '8m ago', ns: 'users' },
  { id: 'wf-sync-d4e9', type: 'DataSyncWorkflow', status: 'running', run: 2, started: '14m ago', ns: 'default' },
  { id: 'wf-report-f1a7', type: 'ReportWorkflow', status: 'failed', run: 3, started: '42m ago', ns: 'analytics' },
  { id: 'wf-notify-c6b2', type: 'NotifyWorkflow', status: 'completed', run: 1, started: '1h ago', ns: 'comms' },
];

const ACTIVITIES = [
  { name: 'SendEmail', workflow: 'OnboardingWorkflow', attempt: 1, result: 'completed', dur: '0.8s' },
  { name: 'ChargeCard', workflow: 'OrderWorkflow', attempt: 1, result: 'running', dur: '...' },
  { name: 'FetchReport', workflow: 'ReportWorkflow', attempt: 3, result: 'failed', dur: '30s' },
  { name: 'SyncRecords', workflow: 'DataSyncWorkflow', attempt: 2, result: 'running', dur: '...' },
];

const STATUS_COLOR: Record<string, string> = {
  running: '#fbbf24',
  completed: '#4ade80',
  failed: '#f87171',
  cancelled: 'rgba(255,255,255,0.3)',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function TemporalPanel() {
  const [visible, setVisible] = useState(false);
  const [wRows, setWRows] = useState(0);
  const [aRows, setARows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalWorkflows = useCounter(184200, 18, 800);
  const taskQueueRate = useCounter(420, 6, 700);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const w = setInterval(() => setWRows((x) => Math.min(x + 1, WORKFLOWS.length)), 160);
    const a = setInterval(() => setARows((x) => Math.min(x + 1, ACTIVITIES.length)), 140);
    return () => { clearInterval(w); clearInterval(a); };
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
          temporal -- durable workflow engine -- go sdk
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {taskQueueRate.toLocaleString()} tasks/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>temporal@workflows</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>tctl workflow list --namespace commerce && tctl activity list --workflow-id wf-order-a3f2</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'tasks/s', value: taskQueueRate.toLocaleString(), color: '#67e8f9' },
          { label: 'total workflows', value: totalWorkflows.toLocaleString(), color: '#4ade80' },
          { label: 'running', value: WORKFLOWS.filter(w => w.status === 'running').length.toString(), color: '#fbbf24' },
          { label: 'failed', value: WORKFLOWS.filter(w => w.status === 'failed').length.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Workflows */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // workflows
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {WORKFLOWS.slice(0, wRows).map((w) => (
            <div key={w.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 56px 20px 40px 36px', alignItems: 'center', gap: 8, padding: '5px 8px', background: `${STATUS_COLOR[w.status]}06`, border: `1px solid ${STATUS_COLOR[w.status]}14`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.id}</span>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.type}</span>
              <span style={{ color: STATUS_COLOR[w.status], fontSize: 7, fontWeight: 700 }}>{w.status}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{w.run}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.ns}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{w.started}</span>
            </div>
          ))}
        </div>

        {/* Activities */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // activities
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ACTIVITIES.slice(0, aRows).map((a) => (
            <div key={a.name + a.workflow} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 56px 20px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: `${STATUS_COLOR[a.result]}06`, border: `1px solid ${STATUS_COLOR[a.result]}14`, borderRadius: 2 }}>
              <span style={{ color: STATUS_COLOR[a.result], fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.workflow}</span>
              <span style={{ color: STATUS_COLOR[a.result], fontSize: 7, fontWeight: 700 }}>{a.result}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{a.attempt}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{a.dur}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          temporal v1.24 - mit - durable execution
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalWorkflows.toLocaleString()} workflows - {taskQueueRate.toLocaleString()} tasks/s
        </span>
      </div>
    </div>
  );
}
