'use client';

import { useEffect, useRef, useState } from 'react';

const CONNECTORS = [
  { name: 'postgres-source', type: 'source', connector: 'Postgres', records: 284200, state: 'active' },
  { name: 's3-destination', type: 'dest', connector: 'S3', records: 284200, state: 'active' },
  { name: 'shopify-source', type: 'source', connector: 'Shopify', records: 48200, state: 'active' },
  { name: 'bigquery-dest', type: 'dest', connector: 'BigQuery', records: 48200, state: 'active' },
];

const SYNCS = [
  { connection: 'postgres → s3', status: 'succeeded', records: 18400, duration: '2m 14s', started: '6m ago' },
  { connection: 'shopify → bigquery', status: 'succeeded', records: 2840, duration: '48s', started: '1h ago' },
  { connection: 'postgres → s3', status: 'running', records: 8400, duration: '1m 02s', started: '1m ago' },
  { connection: 'shopify → bigquery', status: 'failed', records: 0, duration: '12s', started: '3h ago' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function AirbytePanel() {
  const [visible, setVisible] = useState(false);
  const [cRows, setCRows] = useState(0);
  const [sRows, setSRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const recordsSynced = useCounter(284000, 180, 500);
  const syncOps = useCounter(2840, 4, 1200);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const c = setInterval(() => setCRows((x) => Math.min(x + 1, CONNECTORS.length)), 160);
    const s = setInterval(() => setSRows((x) => Math.min(x + 1, SYNCS.length)), 140);
    return () => { clearInterval(c); clearInterval(s); };
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
          airbyte -- open-source elt -- 300+ connectors / data movement
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {syncOps.toLocaleString()} syncs
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#3b82f6', fontWeight: 600 }}>airbyte@elt</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>abctl local install && airbyte connections list --workspace construx</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'syncs', value: syncOps.toLocaleString(), color: '#3b82f6' },
          { label: 'records moved', value: (recordsSynced / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'connectors', value: CONNECTORS.length.toString(), color: '#a78bfa' },
          { label: 'failed', value: SYNCS.filter(s => s.status === 'failed').length.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Connectors */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // connectors
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {CONNECTORS.slice(0, cRows).map((c) => (
            <div key={c.name} style={{ display: 'grid', gridTemplateColumns: '1fr 48px 64px 64px 36px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#3b82f6', fontSize: 8, fontWeight: 600 }}>{c.name}</span>
              <span style={{ color: c.type === 'source' ? '#4ade80' : '#fbbf24', fontSize: 7 }}>{c.type}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{c.connector}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{c.records.toLocaleString()}</span>
              <span style={{ color: c.state === 'active' ? '#4ade80' : '#f87171', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{c.state}</span>
            </div>
          ))}
        </div>

        {/* Syncs */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent syncs
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SYNCS.slice(0, sRows).map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 56px 40px 44px 48px', alignItems: 'center', gap: 8, padding: '4px 8px', background: s.status === 'failed' ? 'rgba(248,113,113,0.04)' : s.status === 'running' ? 'rgba(103,232,249,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${s.status === 'failed' ? 'rgba(248,113,113,0.1)' : s.status === 'running' ? 'rgba(103,232,249,0.08)' : 'rgba(74,222,128,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.3)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.connection}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{s.records.toLocaleString()}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{s.duration}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{s.started}</span>
              <span style={{ color: s.status === 'failed' ? '#f87171' : s.status === 'running' ? '#67e8f9' : '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{s.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(59,130,246,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          airbyte v1.0 - elv2 - open-source elt platform
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {syncOps.toLocaleString()} syncs - {(recordsSynced / 1000).toFixed(0)}k records
        </span>
      </div>
    </div>
  );
}
