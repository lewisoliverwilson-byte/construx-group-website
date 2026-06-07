'use client';

import { useEffect, useRef, useState } from 'react';

const WORKFLOWS = [
  { name: 'ListingIndexWorkflow', namespace: 'construx-prod', runs: 284, pending: 2, failed: 0, avgDur: '1.2s', status: 'running' },
  { name: 'CheckoutSagaWorkflow', namespace: 'construx-prod', runs: 840, pending: 0, failed: 1, avgDur: '8.4s', status: 'running' },
  { name: 'MediaProcessWorkflow', namespace: 'construx-prod', runs: 48400, pending: 12, failed: 0, avgDur: '4.8s', status: 'running' },
  { name: 'DataExportWorkflow', namespace: 'construx-batch', runs: 4, pending: 0, failed: 0, avgDur: '12m', status: 'running' },
];

const ACTIVITIES = [
  { name: 'FetchListingData', scheduled: 284000, started: 284000, completed: 283997, failed: 3, timeout: '10s' },
  { name: 'ProcessPayment', scheduled: 840, started: 840, completed: 839, failed: 1, timeout: '30s' },
  { name: 'TranscodeVideo', scheduled: 48400, started: 48388, completed: 48385, failed: 3, timeout: '5m' },
  { name: 'SendNotification', scheduled: 120000, started: 120000, completed: 119998, failed: 2, timeout: '5s' },
];

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
  const [wfRows, setWfRows] = useState(0);
  const [acRows, setAcRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const workflowsTotal = useCounter(284000, 480, 500);
  const activitiesPerSec = useCounter(28400, 240, 400);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const w = setInterval(() => setWfRows((x) => Math.min(x + 1, WORKFLOWS.length)), 160);
    const a = setInterval(() => setAcRows((x) => Math.min(x + 1, ACTIVITIES.length)), 140);
    return () => { clearInterval(w); clearInterval(a); };
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
          temporal -- workflow engine -- workflows / activities / namespaces
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {activitiesPerSec.toLocaleString()} act/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>temporal@cloud</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>temporal workflow list --namespace construx-prod --query 'ExecutionStatus="Running"' --limit 50</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'workflows', value: (workflowsTotal / 1000).toFixed(0) + 'k', color: '#a78bfa' },
          { label: 'act/s', value: activitiesPerSec.toLocaleString(), color: '#4ade80' },
          { label: 'workflow types', value: WORKFLOWS.length.toString(), color: '#67e8f9' },
          { label: 'pending', value: WORKFLOWS.reduce((a, w) => a + w.pending, 0).toString(), color: '#fbbf24' },
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
          // workflow types
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {WORKFLOWS.slice(0, wfRows).map((wf) => (
            <div key={wf.name} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 28px 24px 40px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: wf.failed > 0 ? 'rgba(248,113,113,0.04)' : 'rgba(167,139,250,0.04)', border: `1px solid ${wf.failed > 0 ? 'rgba(248,113,113,0.1)' : 'rgba(167,139,250,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wf.name}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{wf.runs}</span>
              <span className="tabular-nums" style={{ color: wf.pending > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{wf.pending}</span>
              <span className="tabular-nums" style={{ color: wf.failed > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{wf.failed}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{wf.avgDur}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{wf.status}</span>
            </div>
          ))}
        </div>

        {/* Activities */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // activities
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ACTIVITIES.slice(0, acRows).map((ac) => (
            <div key={ac.name} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 44px 24px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ac.name}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{(ac.completed / 1000).toFixed(0)}k</span>
              <span className="tabular-nums" style={{ color: ac.failed > 1 ? '#f87171' : '#fbbf24', fontSize: 7, textAlign: 'right' }}>{ac.failed} fail</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{ac.timeout}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{(ac.completed / ac.scheduled * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          temporal v1.24 - mit - durable workflow orchestration
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {(workflowsTotal / 1000).toFixed(0)}k workflows - {activitiesPerSec.toLocaleString()} act/s
        </span>
      </div>
    </div>
  );
}
