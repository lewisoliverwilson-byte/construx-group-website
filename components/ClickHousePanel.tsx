'use client';

import { useEffect, useRef, useState } from 'react';

const TABLES = [
  { name: 'events', database: 'construx', rows: 284000000, size: '48GB', engine: 'MergeTree', parts: 284, status: 'ok' },
  { name: 'listings_history', database: 'construx', rows: 48000000, size: '12GB', engine: 'ReplacingMergeTree', parts: 48, status: 'ok' },
  { name: 'metrics', database: 'infra', rows: 8400000000, size: '840GB', engine: 'AggregatingMergeTree', parts: 8400, status: 'ok' },
  { name: 'sessions', database: 'construx', rows: 28400000, size: '8GB', engine: 'CollapsingMergeTree', parts: 120, status: 'merging' },
];

const QUERIES = [
  { query: 'SELECT uniq(user_id) FROM events WHERE...', durationMs: 48, memoryMB: 284, rowsRead: 28400000, status: 'ok' },
  { query: 'SELECT quantile(0.99)(latency) FROM metrics...', durationMs: 840, memoryMB: 1200, rowsRead: 840000000, status: 'ok' },
  { query: 'SELECT listing_id, count() FROM events GROUP...', durationMs: 28, memoryMB: 48, rowsRead: 4800000, status: 'ok' },
  { query: 'INSERT INTO events SELECT * FROM s3(\'s3://...\')', durationMs: 2840, memoryMB: 480, rowsRead: 120000000, status: 'running' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function ClickHousePanel() {
  const [visible, setVisible] = useState(false);
  const [tableRows, setTableRows] = useState(0);
  const [qRows, setQRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const insertsPerSec = useCounter(28400, 480, 400);
  const queriesPerSec = useCounter(2840, 24, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setTableRows((x) => Math.min(x + 1, TABLES.length)), 160);
    const q = setInterval(() => setQRows((x) => Math.min(x + 1, QUERIES.length)), 140);
    return () => { clearInterval(t); clearInterval(q); };
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
          clickhouse -- columnar olap -- tables / queries / mergetree
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {insertsPerSec.toLocaleString()} rows/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>ch@clickhouse</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>clickhouse-client --query "SELECT * FROM system.replication_queue" && clickhouse-benchmark -i 100</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'inserts/s', value: insertsPerSec.toLocaleString(), color: '#67e8f9' },
          { label: 'queries/s', value: queriesPerSec.toLocaleString(), color: '#4ade80' },
          { label: 'tables', value: TABLES.length.toString(), color: '#a78bfa' },
          { label: 'total rows', value: (TABLES.reduce((a, t) => a + t.rows, 0) / 1000000000).toFixed(1) + 'B', color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Tables */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // tables
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {TABLES.slice(0, tableRows).map((tbl) => (
            <div key={tbl.name} style={{ display: 'grid', gridTemplateColumns: '72px 48px 48px 28px 1fr 32px 48px', alignItems: 'center', gap: 8, padding: '5px 8px', background: tbl.status === 'merging' ? 'rgba(251,191,36,0.04)' : 'rgba(103,232,249,0.04)', border: `1px solid ${tbl.status === 'merging' ? 'rgba(251,191,36,0.1)' : 'rgba(103,232,249,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600 }}>{tbl.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{tbl.database}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{(tbl.rows / 1000000).toFixed(0)}M</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{tbl.size}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tbl.engine}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{tbl.parts}p</span>
              <span style={{ color: tbl.status === 'ok' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{tbl.status}</span>
            </div>
          ))}
        </div>

        {/* Queries */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent queries
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {QUERIES.slice(0, qRows).map((q, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 44px 56px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: q.status === 'running' ? 'rgba(103,232,249,0.06)' : 'rgba(103,232,249,0.04)', border: `1px solid ${q.status === 'running' ? 'rgba(103,232,249,0.2)' : 'rgba(103,232,249,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.query}</span>
              <span className="tabular-nums" style={{ color: q.durationMs > 500 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{q.durationMs}ms</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{q.memoryMB}MB</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{(q.rowsRead / 1000000).toFixed(0)}M rows</span>
              <span style={{ color: q.status === 'ok' ? '#4ade80' : '#fbbf24', fontSize: 7, textAlign: 'right' }}>{q.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          clickhouse v24.5 - apache-2.0 - fast columnar olap database
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {insertsPerSec.toLocaleString()} rows/s - {queriesPerSec.toLocaleString()} queries/s
        </span>
      </div>
    </div>
  );
}
