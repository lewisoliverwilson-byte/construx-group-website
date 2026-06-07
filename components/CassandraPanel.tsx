'use client';

import { useEffect, useRef, useState } from 'react';

const NODES = [
  { dc: 'us-east-1', id: 'node-001', status: 'UN', load: '284GB', owns: '25.1%', tokens: 256 },
  { dc: 'us-east-1', id: 'node-002', status: 'UN', load: '276GB', owns: '24.8%', tokens: 256 },
  { dc: 'eu-west-1', id: 'node-003', status: 'UN', load: '291GB', owns: '25.3%', tokens: 256 },
  { dc: 'eu-west-1', id: 'node-004', status: 'DN', load: '0GB', owns: '24.8%', tokens: 256 },
];

const KEYSPACES = [
  { name: 'construx_prod', tables: 14, rf: 3, strategy: 'NetworkTopology', reads: 284000, writes: 48400 },
  { name: 'construx_sessions', tables: 2, rf: 2, strategy: 'SimpleStrategy', reads: 840000, writes: 120000 },
  { name: 'construx_analytics', tables: 8, rf: 1, strategy: 'SimpleStrategy', reads: 12000, writes: 284000 },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function CassandraPanel() {
  const [visible, setVisible] = useState(false);
  const [nodeRows, setNodeRows] = useState(0);
  const [ksRows, setKsRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const readsPerSec = useCounter(28400, 240, 400);
  const writesPerSec = useCounter(4840, 48, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const n = setInterval(() => setNodeRows((x) => Math.min(x + 1, NODES.length)), 160);
    const k = setInterval(() => setKsRows((x) => Math.min(x + 1, KEYSPACES.length)), 140);
    return () => { clearInterval(n); clearInterval(k); };
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
          cassandra -- distributed db -- nodetool / keyspaces / ring
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {readsPerSec.toLocaleString()} reads/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>nodetool@cass</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>nodetool status && nodetool tpstats && nodetool tablestats construx_prod</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'reads/s', value: readsPerSec.toLocaleString(), color: '#67e8f9' },
          { label: 'writes/s', value: writesPerSec.toLocaleString(), color: '#4ade80' },
          { label: 'nodes', value: NODES.length.toString(), color: '#a78bfa' },
          { label: 'down', value: NODES.filter(n => n.status === 'DN').length.toString(), color: '#f87171' },
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
          // ring status
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {NODES.slice(0, nodeRows).map((node) => (
            <div key={node.id} style={{ display: 'grid', gridTemplateColumns: '56px 64px 24px 40px 36px 36px', alignItems: 'center', gap: 8, padding: '5px 8px', background: node.status === 'DN' ? 'rgba(248,113,113,0.04)' : 'rgba(103,232,249,0.04)', border: `1px solid ${node.status === 'DN' ? 'rgba(248,113,113,0.1)' : 'rgba(103,232,249,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600 }}>{node.dc}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 7 }}>{node.id}</span>
              <span style={{ color: node.status === 'UN' ? '#4ade80' : '#f87171', fontSize: 7, fontWeight: 700, textAlign: 'center' }}>{node.status}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{node.load}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{node.owns}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{node.tokens}</span>
            </div>
          ))}
        </div>

        {/* Keyspaces */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // keyspaces
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {KEYSPACES.slice(0, ksRows).map((ks) => (
            <div key={ks.name} style={{ display: 'grid', gridTemplateColumns: '1fr 24px 24px 1fr 52px 52px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ks.name}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{ks.tables}t</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'center' }}>rf{ks.rf}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ks.strategy}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{(ks.reads / 1000).toFixed(0)}k</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{(ks.writes / 1000).toFixed(0)}k</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          cassandra v5.0 - apache-2.0 - distributed wide-column store
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {readsPerSec.toLocaleString()} reads/s - {writesPerSec.toLocaleString()} writes/s
        </span>
      </div>
    </div>
  );
}
