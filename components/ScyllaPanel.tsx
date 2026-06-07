'use client';

import { useEffect, useRef, useState } from 'react';

const NODES = [
  { host: 'scylla-node-01', dc: 'dc1', rack: 'rack1', tokens: 256, load: '84GB', status: 'UN', state: 'normal' },
  { host: 'scylla-node-02', dc: 'dc1', rack: 'rack2', tokens: 256, load: '82GB', status: 'UN', state: 'normal' },
  { host: 'scylla-node-03', dc: 'dc1', rack: 'rack3', tokens: 256, load: '86GB', status: 'UN', state: 'normal' },
  { host: 'scylla-node-04', dc: 'dc2', rack: 'rack1', tokens: 256, load: '81GB', status: 'UN', state: 'normal' },
];

const QUERIES = [
  { type: 'SELECT', keyspace: 'construx', table: 'listings', latency: 2, rows: 48, coordinator: 'scylla-node-01', status: 'ok' },
  { type: 'INSERT', keyspace: 'construx', table: 'events', latency: 1, rows: 1, coordinator: 'scylla-node-02', status: 'ok' },
  { type: 'SELECT', keyspace: 'construx', table: 'users', latency: 3, rows: 1, coordinator: 'scylla-node-01', status: 'ok' },
  { type: 'UPDATE', keyspace: 'construx', table: 'sessions', latency: 2, rows: 1, coordinator: 'scylla-node-03', status: 'ok' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function ScyllaPanel() {
  const [visible, setVisible] = useState(false);
  const [nodeRows, setNodeRows] = useState(0);
  const [queryRows, setQueryRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const opsPerSec = useCounter(284000, 2400, 400);
  const readsPerSec = useCounter(184000, 1200, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const n = setInterval(() => setNodeRows((x) => Math.min(x + 1, NODES.length)), 160);
    const q = setInterval(() => setQueryRows((x) => Math.min(x + 1, QUERIES.length)), 140);
    return () => { clearInterval(n); clearInterval(q); };
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
          scylladb -- low-latency nosql -- nodes / ring / cql
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {(opsPerSec / 1000).toFixed(0)}k ops/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>cqlsh@scylla</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>nodetool status && cqlsh scylla-node-01 -e "SELECT * FROM system.peers" && nodetool tpstats</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'ops / sec', value: (opsPerSec / 1000).toFixed(0) + 'k', color: '#f97316' },
          { label: 'reads / sec', value: (readsPerSec / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'nodes', value: NODES.length.toString(), color: '#67e8f9' },
          { label: 'all up', value: NODES.filter(n => n.status === 'UN').length.toString(), color: '#a78bfa' },
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
          // ring nodes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {NODES.slice(0, nodeRows).map((n) => (
            <div key={n.host} style={{ display: 'grid', gridTemplateColumns: '84px 28px 36px 24px 36px 28px 48px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600 }}>{n.host}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{n.dc}</span>
              <span style={{ color: '#a78bfa', fontSize: 7 }}>{n.rack}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{n.tokens}</span>
              <span style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{n.load}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700 }}>{n.status}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{n.state}</span>
            </div>
          ))}
        </div>

        {/* Queries */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // cql queries
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {QUERIES.slice(0, queryRows).map((q, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '44px 56px 60px 28px 24px 84px 24px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 7, fontWeight: 600 }}>{q.type}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{q.keyspace}</span>
              <span style={{ color: '#a78bfa', fontSize: 7 }}>{q.table}</span>
              <span className="tabular-nums" style={{ color: q.latency > 5 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{q.latency}ms</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{q.rows}r</span>
              <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.coordinator}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{q.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          scylladb v6.2 - agpl-3.0 - real-time big data database
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {(opsPerSec / 1000).toFixed(0)}k ops/s - {(readsPerSec / 1000).toFixed(0)}k reads/s
        </span>
      </div>
    </div>
  );
}
