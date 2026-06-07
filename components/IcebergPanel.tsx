'use client';

import { useEffect, useRef, useState } from 'react';

const TABLES = [
  { name: 'events.raw_clickstream', format: 'parquet', snapshots: 184, rows: '8.4B', size: '2.1 TB', partitions: 'dt, hour' },
  { name: 'events.sessions', format: 'parquet', snapshots: 92, rows: '940M', size: '380 GB', partitions: 'dt' },
  { name: 'metrics.aggregations', format: 'orc', snapshots: 48, rows: '12M', size: '2.4 GB', partitions: 'ts_hour' },
  { name: 'catalog.products', format: 'parquet', snapshots: 21, rows: '2.4M', size: '840 MB', partitions: 'category' },
];

const SNAPSHOTS = [
  { id: '6728491003', op: 'append', added: 240, deleted: 0, addedBytes: '420 MB', ts: '2m ago' },
  { id: '6728490872', op: 'overwrite', added: 0, deleted: 120, addedBytes: '0 B', ts: '18m ago' },
  { id: '6728490410', op: 'append', added: 480, deleted: 0, addedBytes: '840 MB', ts: '1h ago' },
  { id: '6728489201', op: 'replace', added: 240, deleted: 120, addedBytes: '320 MB', ts: '6h ago' },
];

const SCHEMA_COLS = [
  { name: 'user_id', type: 'long', required: true },
  { name: 'event_ts', type: 'timestamptz', required: true },
  { name: 'session_id', type: 'string', required: false },
  { name: 'properties', type: 'map<string,string>', required: false },
  { name: 'device', type: 'struct<os:string,ua:string>', required: false },
];

const OP_COLOR: Record<string, string> = {
  append: '#4ade80',
  overwrite: '#f87171',
  replace: '#fbbf24',
  delete: '#f87171',
};

function useCounter(base: number, delta: number, ms = 1200) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta)), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function IcebergPanel() {
  const [visible, setVisible] = useState(false);
  const [tblRows, setTblRows] = useState(0);
  const [snapRows, setSnapRows] = useState(0);
  const [colRows, setColRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const scans = useCounter(1840, 4, 1100);
  const manifests = useCounter(48200, 60, 1100);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setTblRows((x) => Math.min(x + 1, TABLES.length)), 160);
    const s = setInterval(() => setSnapRows((x) => Math.min(x + 1, SNAPSHOTS.length)), 150);
    const c = setInterval(() => setColRows((x) => Math.min(x + 1, SCHEMA_COLS.length)), 130);
    return () => { clearInterval(t); clearInterval(s); clearInterval(c); };
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
          apache iceberg -- open table format -- lakehouse
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {TABLES.length} tables
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>spark@lakehouse</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>spark-sql --conf spark.sql.extensions=org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'total tables', value: TABLES.length.toString(), color: '#67e8f9' },
          { label: 'manifests', value: manifests.toLocaleString(), color: '#a78bfa' },
          { label: 'scans/hr', value: scans.toLocaleString(), color: '#4ade80' },
          { label: 'schemas', value: 'v4', color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Table catalog */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // table catalog
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {TABLES.slice(0, tblRows).map((t) => (
            <div key={t.name} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 52px 60px 52px 80px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
              <span style={{ color: '#fbbf24', fontSize: 7, textAlign: 'center', padding: '1px 4px', background: 'rgba(251,191,36,0.1)', borderRadius: 2 }}>{t.format}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 8, textAlign: 'right' }}>{t.snapshots} snaps</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 8, textAlign: 'right' }}>{t.rows}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 8, textAlign: 'right' }}>{t.size}</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.partitions}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* Snapshots */}
          <div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
              // snapshot history
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {SNAPSHOTS.slice(0, snapRows).map((snap) => (
                <div key={snap.id} style={{ display: 'grid', gridTemplateColumns: '48px 52px 1fr 40px', alignItems: 'center', gap: 6, padding: '4px 8px', background: `${OP_COLOR[snap.op]}06`, border: `1px solid ${OP_COLOR[snap.op]}18`, borderRadius: 2 }}>
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 7 }}>{snap.id.slice(-6)}</span>
                  <span style={{ color: OP_COLOR[snap.op], fontSize: 8, fontWeight: 700 }}>{snap.op}</span>
                  <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 7 }}>+{snap.added} files</span>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{snap.ts}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Schema */}
          <div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
              // schema (v4)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {SCHEMA_COLS.slice(0, colRows).map((col) => (
                <div key={col.name} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
                  <span style={{ color: '#4ade80', fontSize: 9 }}>{col.name}</span>
                  <span style={{ color: '#67e8f9', fontSize: 7, marginLeft: 'auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col.type}</span>
                  {col.required && <span style={{ fontSize: 7, color: '#f87171', fontWeight: 700 }}>req</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          iceberg v1.5.2 - apache - s3/hdfs/gcs
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {manifests.toLocaleString()} manifests - {scans.toLocaleString()} scans/hr
        </span>
      </div>
    </div>
  );
}
