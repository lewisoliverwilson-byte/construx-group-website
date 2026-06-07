'use client';

import { useEffect, useRef, useState } from 'react';

const PROJECTS = [
  { name: 'construx-prod', region: 'aws-eu-west-2', branches: 4, endpoints: 2, size: '8.4 GB' },
  { name: 'construx-staging', region: 'aws-eu-west-2', branches: 6, endpoints: 3, size: '2.1 GB' },
  { name: 'construx-analytics', region: 'aws-us-east-1', branches: 2, endpoints: 1, size: '42.8 GB' },
];

const BRANCHES = [
  { name: 'main', project: 'construx-prod', parent: null, lsn: '0/4A84F20', age: '0s', connections: 12, compute: 'active' },
  { name: 'preview/feat-search', project: 'construx-prod', parent: 'main', lsn: '0/4A83F00', age: '2h', connections: 1, compute: 'idle' },
  { name: 'preview/fix-perf', project: 'construx-prod', parent: 'main', lsn: '0/4A82E80', age: '4h', connections: 0, compute: 'suspended' },
  { name: 'dev/lewis', project: 'construx-staging', parent: 'main', lsn: '0/2B12C40', age: '8m', connections: 2, compute: 'active' },
];

const COMPUTE_COLOR: Record<string, string> = {
  active: '#4ade80',
  idle: '#fbbf24',
  suspended: 'rgba(255,255,255,0.3)',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function NeonPanel() {
  const [visible, setVisible] = useState(false);
  const [pRows, setPRows] = useState(0);
  const [bRows, setBRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const queryRate = useCounter(2840, 28, 700);
  const connections = useCounter(15, 0, 5000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const p = setInterval(() => setPRows((x) => Math.min(x + 1, PROJECTS.length)), 160);
    const b = setInterval(() => setBRows((x) => Math.min(x + 1, BRANCHES.length)), 140);
    return () => { clearInterval(p); clearInterval(b); };
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
          neon -- serverless postgres -- instant branching / autoscale
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {queryRate.toLocaleString()} queries/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>neonctl@postgres</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>neonctl branches list --project-id construx-prod && neonctl branch create --name preview/feat-search</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'queries/s', value: queryRate.toLocaleString(), color: '#4ade80' },
          { label: 'connections', value: connections.toString(), color: '#67e8f9' },
          { label: 'projects', value: PROJECTS.length.toString(), color: '#a78bfa' },
          { label: 'branches', value: BRANCHES.length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Projects */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // projects
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {PROJECTS.slice(0, pRows).map((p) => (
            <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 20px 20px 52px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600 }}>{p.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{p.region}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 8, textAlign: 'center' }}>{p.branches}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 8, textAlign: 'center' }}>{p.endpoints}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{p.size}</span>
            </div>
          ))}
        </div>

        {/* Branches */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // branches
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {BRANCHES.slice(0, bRows).map((b) => (
            <div key={b.name + b.project} style={{ display: 'grid', gridTemplateColumns: '1fr 56px 20px 48px 56px', alignItems: 'center', gap: 8, padding: '4px 8px', background: `${COMPUTE_COLOR[b.compute]}06`, border: `1px solid ${COMPUTE_COLOR[b.compute]}14`, borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.lsn}</span>
              <span className="tabular-nums" style={{ color: b.connections > 0 ? '#fbbf24' : 'rgba(255,255,255,0.2)', fontSize: 8, textAlign: 'center' }}>{b.connections}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{b.age}</span>
              <span style={{ color: COMPUTE_COLOR[b.compute], fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{b.compute}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          neon -- mit -- serverless postgres
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {queryRate.toLocaleString()} q/s - {connections} connections
        </span>
      </div>
    </div>
  );
}
