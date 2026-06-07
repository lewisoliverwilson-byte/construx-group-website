'use client';

import { useEffect, useRef, useState } from 'react';

const KEYSPACES = [
  { name: 'construx_listings', shards: 4, tablets: 12, replicationLag: 0, rows: 284000, size: '48GB', status: 'serving' },
  { name: 'construx_users', shards: 2, tablets: 6, replicationLag: 0, rows: 48400, size: '8GB', status: 'serving' },
  { name: 'construx_events', shards: 8, tablets: 24, replicationLag: 1, rows: 1284000, size: '184GB', status: 'serving' },
  { name: 'construx_audit', shards: 2, tablets: 4, replicationLag: 0, rows: 284000, size: '24GB', status: 'serving' },
];

const VTGATE_QUERIES = [
  { type: 'SELECT', keyspace: 'construx_listings', table: 'listings', durationMs: 4, rows: 48, status: 'ok' },
  { type: 'INSERT', keyspace: 'construx_events', table: 'events', durationMs: 2, rows: 1, status: 'ok' },
  { type: 'UPDATE', keyspace: 'construx_users', table: 'users', durationMs: 3, rows: 1, status: 'ok' },
  { type: 'SELECT', keyspace: 'construx_audit', table: 'audit_log', durationMs: 12, rows: 100, status: 'ok' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function VitessPanel() {
  const [visible, setVisible] = useState(false);
  const [ksRows, setKsRows] = useState(0);
  const [qRows, setQRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const qpsTotal = useCounter(28400, 480, 400);
  const rowsExamined = useCounter(4840000, 4800, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const k = setInterval(() => setKsRows((x) => Math.min(x + 1, KEYSPACES.length)), 160);
    const q = setInterval(() => setQRows((x) => Math.min(x + 1, VTGATE_QUERIES.length)), 140);
    return () => { clearInterval(k); clearInterval(q); };
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
          vitess -- mysql sharding -- keyspaces / tablets / vtgate
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {qpsTotal.toLocaleString()} qps
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>vtctld@cluster</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>vtctldclient GetKeyspaces && vtctldclient GetTablets --keyspace construx_listings</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'qps', value: qpsTotal.toLocaleString(), color: '#f97316' },
          { label: 'rows examined', value: (rowsExamined / 1000000).toFixed(1) + 'M', color: '#4ade80' },
          { label: 'keyspaces', value: KEYSPACES.length.toString(), color: '#67e8f9' },
          { label: 'total shards', value: KEYSPACES.reduce((a, k) => a + k.shards, 0).toString(), color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Keyspaces */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // keyspaces
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {KEYSPACES.slice(0, ksRows).map((ks) => (
            <div key={ks.name} style={{ display: 'grid', gridTemplateColumns: '1fr 20px 24px 20px 52px 32px 48px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ks.name}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{ks.shards}s</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{ks.tablets}t</span>
              <span className="tabular-nums" style={{ color: ks.replicationLag > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{ks.replicationLag}s</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{ks.rows.toLocaleString()}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{ks.size}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{ks.status}</span>
            </div>
          ))}
        </div>

        {/* VTGate Queries */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // vtgate queries
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {VTGATE_QUERIES.slice(0, qRows).map((q, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 80px 36px 32px 28px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 7, fontWeight: 600 }}>{q.type}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.keyspace}</span>
              <span style={{ color: '#a78bfa', fontSize: 7 }}>{q.table}</span>
              <span className="tabular-nums" style={{ color: q.durationMs > 10 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{q.durationMs}ms</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{q.rows}r</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{q.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          vitess v20 - apache-2.0 - scalable mysql-compatible database clustering
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {qpsTotal.toLocaleString()} qps - {(rowsExamined / 1000000).toFixed(1)}M rows
        </span>
      </div>
    </div>
  );
}
