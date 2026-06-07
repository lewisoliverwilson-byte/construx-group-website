'use client';

import { useEffect, useRef, useState } from 'react';

const ENVIRONMENTS = [
  { name: 'prod/api', namespace: 'prod', cluster: 'construx-prod', diff: 0, components: 8, status: 'in-sync' },
  { name: 'prod/monitoring', namespace: 'monitoring', cluster: 'construx-prod', diff: 0, components: 12, status: 'in-sync' },
  { name: 'staging/api', namespace: 'staging', cluster: 'construx-staging', diff: 2, components: 8, status: 'drift' },
  { name: 'prod/ingress', namespace: 'ingress-nginx', cluster: 'construx-prod', diff: 0, components: 4, status: 'in-sync' },
];

const DIFF = [
  { env: 'staging/api', kind: 'Deployment', name: 'api-server', field: 'spec.replicas', want: '3', got: '2' },
  { env: 'staging/api', kind: 'ConfigMap', name: 'api-config', field: 'data.LOG_LEVEL', want: 'info', got: 'debug' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function TankaPanel() {
  const [visible, setVisible] = useState(false);
  const [eRows, setERows] = useState(0);
  const [dRows, setDRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const appliedObjects = useCounter(1240, 4, 1400);
  const totalComponents = ENVIRONMENTS.reduce((a, e) => a + e.components, 0);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const e = setInterval(() => setERows((x) => Math.min(x + 1, ENVIRONMENTS.length)), 160);
    const d = setInterval(() => setDRows((x) => Math.min(x + 1, DIFF.length)), 140);
    return () => { clearInterval(e); clearInterval(d); };
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
          tanka -- jsonnet k8s config -- grafana labs
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {appliedObjects.toLocaleString()} objects
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>tk@config</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>tk env list && tk diff environments/prod/api && tk apply environments/prod/api</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'objects', value: appliedObjects.toLocaleString(), color: '#f97316' },
          { label: 'components', value: totalComponents.toString(), color: '#4ade80' },
          { label: 'envs', value: ENVIRONMENTS.length.toString(), color: '#a78bfa' },
          { label: 'drift', value: ENVIRONMENTS.filter(e => e.status === 'drift').length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Environments */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // environments
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {ENVIRONMENTS.slice(0, eRows).map((e) => (
            <div key={e.name} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 24px 20px 52px', alignItems: 'center', gap: 8, padding: '5px 8px', background: e.status === 'drift' ? 'rgba(251,191,36,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${e.status === 'drift' ? 'rgba(251,191,36,0.1)' : 'rgba(74,222,128,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.cluster}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 8, textAlign: 'center' }}>{e.components}</span>
              <span className="tabular-nums" style={{ color: e.diff > 0 ? '#fbbf24' : 'rgba(255,255,255,0.2)', fontSize: 8, fontWeight: e.diff > 0 ? 700 : 400, textAlign: 'center' }}>{e.diff}</span>
              <span style={{ color: e.status === 'drift' ? '#fbbf24' : '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{e.status}</span>
            </div>
          ))}
        </div>

        {/* Diff */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // drift diff — staging/api
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {DIFF.slice(0, dRows).map((d) => (
            <div key={d.kind + d.name + d.field} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 36px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.kind}</span>
              <span style={{ color: '#fbbf24', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.field}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.want}</span>
              <span style={{ color: '#f87171', fontSize: 7, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.got}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          tanka v0.26 - apache 2.0 - grafana labs
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {appliedObjects.toLocaleString()} objects - {ENVIRONMENTS.length} envs
        </span>
      </div>
    </div>
  );
}
