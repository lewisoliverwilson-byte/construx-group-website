'use client';

import { useEffect, useRef, useState } from 'react';

const WORKSPACES = [
  { name: 'construx-prod-infra', source: 'github:construx/infra', status: 'applied', resources: 148, drift: false },
  { name: 'construx-staging', source: 'github:construx/infra', status: 'applied', resources: 84, drift: false },
  { name: 'construx-dns', source: 'github:construx/dns', status: 'planning', resources: 28, drift: false },
  { name: 'construx-data', source: 'github:construx/data', status: 'applied', resources: 64, drift: true },
];

const RUNS = [
  { workspace: 'construx-prod-infra', trigger: 'push', status: 'applied', dur: '3m 12s', changes: '+2 ~1 -0' },
  { workspace: 'construx-dns', trigger: 'manual', status: 'planning', dur: '1m 4s', changes: '...' },
  { workspace: 'construx-data', trigger: 'drift', status: 'needs-review', dur: '2m 48s', changes: '~3' },
];

const STATUS_COLOR: Record<string, string> = {
  applied: '#4ade80',
  planning: '#fbbf24',
  'needs-review': '#f97316',
  errored: '#f87171',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta)), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function TerraformCloudPanel() {
  const [visible, setVisible] = useState(false);
  const [wsRows, setWsRows] = useState(0);
  const [runRows, setRunRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalRuns = useCounter(4820, 4, 1200);
  const totalResources = useCounter(324, 1, 3000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const w = setInterval(() => setWsRows((x) => Math.min(x + 1, WORKSPACES.length)), 160);
    const r = setInterval(() => setRunRows((x) => Math.min(x + 1, RUNS.length)), 150);
    return () => { clearInterval(w); clearInterval(r); };
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
          terraform cloud -- remote runs -- drift detection
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalResources} managed
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>tf@hcp-cloud</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>terraform plan -var-file=prod.tfvars -out=prod.plan && terraform show prod.plan</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'total runs', value: totalRuns.toLocaleString(), color: '#a78bfa' },
          { label: 'managed', value: totalResources.toLocaleString(), color: '#4ade80' },
          { label: 'workspaces', value: WORKSPACES.length.toString(), color: '#67e8f9' },
          { label: 'drift', value: WORKSPACES.filter(w => w.drift).length.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Workspaces */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // workspaces
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {WORKSPACES.slice(0, wsRows).map((ws) => (
            <div key={ws.name} style={{ display: 'grid', gridTemplateColumns: '128px 1fr 28px 40px 40px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 9, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.source}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 8, textAlign: 'right' }}>{ws.resources}</span>
              <span style={{ color: ws.drift ? '#f87171' : 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{ws.drift ? 'DRIFT' : 'SYNC'}</span>
              <span style={{ color: STATUS_COLOR[ws.status] || '#4ade80', fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{ws.status.toUpperCase().slice(0, 5)}</span>
            </div>
          ))}
        </div>

        {/* Recent runs */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent runs
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {RUNS.slice(0, runRows).map((run) => (
            <div key={run.workspace + run.trigger} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 40px 48px 52px', alignItems: 'center', gap: 8, padding: '4px 8px', background: `${STATUS_COLOR[run.status] || '#4ade80'}06`, border: `1px solid ${STATUS_COLOR[run.status] || '#4ade80'}14`, borderRadius: 2 }}>
              <span style={{ color: STATUS_COLOR[run.status] || '#4ade80', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{run.workspace}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 7 }}>{run.trigger}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 7, textAlign: 'right' }}>{run.dur}</span>
              <span style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{run.changes}</span>
              <span style={{ color: STATUS_COLOR[run.status] || '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{run.status.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          terraform cloud - hcp - sentinel policy engine
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalRuns.toLocaleString()} runs - {totalResources} resources
        </span>
      </div>
    </div>
  );
}
