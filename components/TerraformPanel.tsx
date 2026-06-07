'use client';

import { useEffect, useRef, useState } from 'react';

const WORKSPACES = [
  { name: 'construx-prod-infra', backend: 's3', resources: 284, managed: 284, tainted: 0, version: '1.9.2', status: 'clean' },
  { name: 'construx-prod-k8s', backend: 's3', resources: 148, managed: 148, tainted: 0, version: '1.9.2', status: 'clean' },
  { name: 'construx-staging-infra', backend: 's3', resources: 184, managed: 184, tainted: 0, version: '1.9.2', status: 'clean' },
  { name: 'construx-dns', backend: 's3', resources: 48, managed: 48, tainted: 0, version: '1.9.2', status: 'clean' },
];

const PLANS = [
  { workspace: 'construx-prod-infra', add: 0, change: 2, destroy: 0, trigger: 'push', branch: 'main', dt: '12m ago', status: 'applied' },
  { workspace: 'construx-prod-k8s', add: 1, change: 0, destroy: 0, trigger: 'push', branch: 'main', dt: '1h ago', status: 'applied' },
  { workspace: 'construx-staging-infra', add: 3, change: 1, destroy: 1, trigger: 'manual', branch: 'feat/scaling', dt: '3h ago', status: 'applied' },
  { workspace: 'construx-dns', add: 0, change: 1, destroy: 0, trigger: 'push', branch: 'main', dt: '1d ago', status: 'applied' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function TerraformPanel() {
  const [visible, setVisible] = useState(false);
  const [wsRows, setWsRows] = useState(0);
  const [planRows, setPlanRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const appliesTotal = useCounter(2840, 4, 800);
  const resourcesManaged = useCounter(664, 2, 1200);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const w = setInterval(() => setWsRows((x) => Math.min(x + 1, WORKSPACES.length)), 160);
    const p = setInterval(() => setPlanRows((x) => Math.min(x + 1, PLANS.length)), 140);
    return () => { clearInterval(w); clearInterval(p); };
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
          terraform -- infrastructure as code -- workspaces / plans / state
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {resourcesManaged} resources
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>terraform@ci</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>terraform plan -out=tfplan && terraform apply -auto-approve tfplan</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'applies total', value: appliesTotal.toLocaleString(), color: '#a78bfa' },
          { label: 'resources', value: resourcesManaged.toLocaleString(), color: '#4ade80' },
          { label: 'workspaces', value: WORKSPACES.length.toString(), color: '#67e8f9' },
          { label: 'tainted', value: WORKSPACES.reduce((a, w) => a + w.tainted, 0).toString(), color: '#fbbf24' },
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
            <div key={ws.name} style={{ display: 'grid', gridTemplateColumns: '1fr 28px 44px 28px 28px 52px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{ws.backend}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{ws.resources}r</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{ws.managed}m</span>
              <span className="tabular-nums" style={{ color: ws.tainted > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{ws.tainted}t</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{ws.version}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{ws.status}</span>
            </div>
          ))}
        </div>

        {/* Plans */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent applies
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {PLANS.slice(0, planRows).map((plan, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 20px 20px 20px 48px 40px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plan.workspace}</span>
              <span className="tabular-nums" style={{ color: plan.add > 0 ? '#4ade80' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>+{plan.add}</span>
              <span className="tabular-nums" style={{ color: plan.change > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{plan.change}~</span>
              <span className="tabular-nums" style={{ color: plan.destroy > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>-{plan.destroy}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plan.branch}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{plan.dt}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{plan.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          terraform v1.9 - bsl-1.1 - infrastructure as code
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {appliesTotal.toLocaleString()} applies - {resourcesManaged.toLocaleString()} resources
        </span>
      </div>
    </div>
  );
}
