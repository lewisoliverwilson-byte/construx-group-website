'use client';

import { useEffect, useRef, useState } from 'react';

const NODES = [
  { name: 'construx-prod-api-01', type: 'node', os: 'ubuntu-24.04', labels: 'env=prod,role=api', sessions: 0, status: 'online' },
  { name: 'construx-prod-db-01', type: 'node', os: 'ubuntu-24.04', labels: 'env=prod,role=db', sessions: 1, status: 'online' },
  { name: 'construx-staging-01', type: 'node', os: 'ubuntu-24.04', labels: 'env=staging', sessions: 0, status: 'online' },
  { name: 'construx-k8s-cluster', type: 'kube', os: 'eks-1.30', labels: 'env=prod,type=k8s', sessions: 2, status: 'online' },
];

const SESSIONS = [
  { id: 'sess-001', user: 'lewis@construxgroup.io', target: 'construx-prod-db-01', type: 'ssh', duration: '4m12s', recorded: true },
  { id: 'sess-002', user: 'lewis@construxgroup.io', target: 'construx-k8s-cluster', type: 'kubectl', duration: '12m44s', recorded: true },
  { id: 'sess-003', user: 'ci-bot@construxgroup.io', target: 'construx-staging-01', type: 'ssh', duration: '28s', recorded: true },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function TeleportPanel() {
  const [visible, setVisible] = useState(false);
  const [nodeRows, setNodeRows] = useState(0);
  const [sessRows, setSessRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalSessions = useCounter(2840, 4, 700);
  const auditEvents = useCounter(28400, 48, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const n = setInterval(() => setNodeRows((x) => Math.min(x + 1, NODES.length)), 160);
    const s = setInterval(() => setSessRows((x) => Math.min(x + 1, SESSIONS.length)), 140);
    return () => { clearInterval(n); clearInterval(s); };
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
          teleport -- infra access -- nodes / sessions / audit log
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {NODES.filter(n => n.sessions > 0).length} active
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>tsh@teleport</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>tsh ls --labels env=prod && tsh ssh lewis@construx-prod-db-01 --cluster construxgroup.io</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'sessions', value: totalSessions.toLocaleString(), color: '#a78bfa' },
          { label: 'audit events', value: (auditEvents / 1000).toFixed(0) + 'k', color: '#67e8f9' },
          { label: 'nodes', value: NODES.length.toString(), color: '#4ade80' },
          { label: 'active sess', value: SESSIONS.length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Nodes */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // registered nodes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {NODES.slice(0, nodeRows).map((node) => (
            <div key={node.name} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 56px 1fr 24px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: node.sessions > 0 ? 'rgba(251,191,36,0.04)' : 'rgba(167,139,250,0.04)', border: `1px solid ${node.sessions > 0 ? 'rgba(251,191,36,0.1)' : 'rgba(167,139,250,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{node.type}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{node.os}</span>
              <span style={{ color: '#fbbf24', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.labels}</span>
              <span className="tabular-nums" style={{ color: node.sessions > 0 ? '#f97316' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{node.sessions}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{node.status}</span>
            </div>
          ))}
        </div>

        {/* Sessions */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // active sessions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SESSIONS.slice(0, sessRows).map((sess) => (
            <div key={sess.id} style={{ display: 'grid', gridTemplateColumns: '48px 1fr 1fr 36px 40px 32px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{sess.id}</span>
              <span style={{ color: 'rgba(240,239,255,0.3)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sess.user}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sess.target}</span>
              <span style={{ color: '#fbbf24', fontSize: 7, textAlign: 'center' }}>{sess.type}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{sess.duration}</span>
              <span style={{ color: sess.recorded ? '#4ade80' : '#f87171', fontSize: 7, textAlign: 'right' }}>{sess.recorded ? 'rec' : 'no-rec'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          teleport v15 - agpl-3.0 - infrastructure access platform
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalSessions.toLocaleString()} sessions - {(auditEvents / 1000).toFixed(0)}k events
        </span>
      </div>
    </div>
  );
}
