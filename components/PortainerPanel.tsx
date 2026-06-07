'use client';

import { useEffect, useRef, useState } from 'react';

const ENVIRONMENTS = [
  { name: 'construx-prod', type: 'kubernetes', nodes: 6, containers: 42, status: 'up' },
  { name: 'construx-staging', type: 'kubernetes', nodes: 3, containers: 18, status: 'up' },
  { name: 'construx-local', type: 'docker', nodes: 1, containers: 8, status: 'up' },
];

const CONTAINERS = [
  { name: 'api-server-7d9f4', image: 'construx/api:v2.4.1', env: 'prod', cpu: '0.8%', mem: '284MB', state: 'running' },
  { name: 'worker-6b8c2', image: 'construx/worker:v2.4.1', env: 'prod', cpu: '2.1%', mem: '512MB', state: 'running' },
  { name: 'postgres-0', image: 'postgres:16-alpine', env: 'prod', cpu: '0.4%', mem: '842MB', state: 'running' },
  { name: 'redis-0', image: 'redis:7-alpine', env: 'prod', cpu: '0.1%', mem: '48MB', state: 'running' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function PortainerPanel() {
  const [visible, setVisible] = useState(false);
  const [eRows, setERows] = useState(0);
  const [cRows, setCRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalContainers = ENVIRONMENTS.reduce((a, e) => a + e.containers, 0);
  const apiCalls = useCounter(2840, 12, 800);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const e = setInterval(() => setERows((x) => Math.min(x + 1, ENVIRONMENTS.length)), 160);
    const c = setInterval(() => setCRows((x) => Math.min(x + 1, CONTAINERS.length)), 140);
    return () => { clearInterval(e); clearInterval(c); };
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
          portainer -- container management -- docker / kubernetes
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {apiCalls.toLocaleString()} api calls
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#3b82f6', fontWeight: 600 }}>portainer@mgmt</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>portainer --admin-password-file=/run/secrets/portainer --tunnel-port=8000</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'api calls', value: apiCalls.toLocaleString(), color: '#3b82f6' },
          { label: 'containers', value: totalContainers.toString(), color: '#4ade80' },
          { label: 'environments', value: ENVIRONMENTS.length.toString(), color: '#a78bfa' },
          { label: 'running', value: CONTAINERS.filter(c => c.state === 'running').length.toString(), color: '#67e8f9' },
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
          {ENVIRONMENTS.slice(0, eRows).map((env) => (
            <div key={env.name} style={{ display: 'grid', gridTemplateColumns: '1fr 56px 24px 24px 28px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#3b82f6', fontSize: 8, fontWeight: 600 }}>{env.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{env.type}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 8, textAlign: 'center' }}>{env.nodes}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 8, textAlign: 'center' }}>{env.containers}</span>
              <span style={{ color: env.status === 'up' ? '#4ade80' : '#f87171', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{env.status}</span>
            </div>
          ))}
        </div>

        {/* Containers */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // containers
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {CONTAINERS.slice(0, cRows).map((c) => (
            <div key={c.name} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 32px 40px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.image}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{c.cpu}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{c.mem}</span>
              <span style={{ color: c.state === 'running' ? '#4ade80' : '#f87171', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{c.state}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(59,130,246,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          portainer v2.20 - zlib - container mgmt ui
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {ENVIRONMENTS.length} envs - {totalContainers} containers
        </span>
      </div>
    </div>
  );
}
