'use client';

import { useEffect, useRef, useState } from 'react';

const CLUSTERS = [
  { name: 'construx-dev', version: 'v1.30.2', nodes: 3, controlPlane: 1, workers: 2, status: 'Ready' },
  { name: 'construx-e2e', version: 'v1.30.2', nodes: 4, controlPlane: 1, workers: 3, status: 'Ready' },
  { name: 'construx-upgrade-test', version: 'v1.31.0', nodes: 1, controlPlane: 1, workers: 0, status: 'Ready' },
];

const NODES = [
  { name: 'construx-dev-control-plane', cluster: 'construx-dev', role: 'control-plane', image: 'kindest/node:v1.30.2', status: 'Ready' },
  { name: 'construx-dev-worker', cluster: 'construx-dev', role: 'worker', image: 'kindest/node:v1.30.2', status: 'Ready' },
  { name: 'construx-dev-worker2', cluster: 'construx-dev', role: 'worker', image: 'kindest/node:v1.30.2', status: 'Ready' },
  { name: 'construx-e2e-control-plane', cluster: 'construx-e2e', role: 'control-plane', image: 'kindest/node:v1.30.2', status: 'Ready' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function KindPanel() {
  const [visible, setVisible] = useState(false);
  const [clusterRows, setClusterRows] = useState(0);
  const [nodeRows, setNodeRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const clustersCreated = useCounter(284, 1, 1800);
  const testRunsTotal = useCounter(2840, 4, 800);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const c = setInterval(() => setClusterRows((x) => Math.min(x + 1, CLUSTERS.length)), 160);
    const n = setInterval(() => setNodeRows((x) => Math.min(x + 1, NODES.length)), 140);
    return () => { clearInterval(c); clearInterval(n); };
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
          kind -- k8s in docker -- clusters / nodes / e2e testing
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {CLUSTERS.length} clusters
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#3b82f6', fontWeight: 600 }}>kind@local</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>kind create cluster --name construx-e2e --config kind-config.yaml && kubectl cluster-info --context kind-construx-e2e</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'clusters created', value: clustersCreated.toLocaleString(), color: '#3b82f6' },
          { label: 'test runs', value: testRunsTotal.toLocaleString(), color: '#4ade80' },
          { label: 'active', value: CLUSTERS.length.toString(), color: '#a78bfa' },
          { label: 'nodes', value: CLUSTERS.reduce((a, c) => a + c.nodes, 0).toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Clusters */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // clusters
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {CLUSTERS.slice(0, clusterRows).map((cl) => (
            <div key={cl.name} style={{ display: 'grid', gridTemplateColumns: '1fr 48px 28px 20px 20px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#3b82f6', fontSize: 8, fontWeight: 600 }}>{cl.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{cl.version}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{cl.nodes}n</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'center' }}>{cl.controlPlane}cp</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{cl.workers}w</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{cl.status}</span>
            </div>
          ))}
        </div>

        {/* Nodes */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // nodes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NODES.slice(0, nodeRows).map((node) => (
            <div key={node.name} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 64px 80px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: node.role === 'control-plane' ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)', border: `1px solid ${node.role === 'control-plane' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.name}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.cluster}</span>
              <span style={{ color: node.role === 'control-plane' ? '#fbbf24' : '#67e8f9', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.role}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.image.split(':')[1]}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{node.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(59,130,246,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          kind v0.23 - apache-2.0 - kubernetes in docker
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {clustersCreated.toLocaleString()} created - {testRunsTotal.toLocaleString()} test runs
        </span>
      </div>
    </div>
  );
}
