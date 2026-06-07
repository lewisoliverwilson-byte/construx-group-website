'use client';

import { useEffect, useRef, useState } from 'react';

const TABLES = [
  { name: 'gold.user_events', version: 482, rows: '2.4B', size: '1.2 TB', partitioned: 'dt', format: 'parquet' },
  { name: 'silver.sessions', version: 240, rows: '180M', size: '84 GB', partitioned: 'dt, hour', format: 'parquet' },
  { name: 'bronze.raw_logs', version: 1841, rows: '12B', size: '4.8 TB', partitioned: 'year, month', format: 'parquet' },
];

const TX_LOG = [
  { version: 482, op: 'WRITE', mode: 'Append', files: '+120', stats: '48M rows', ts: '1m ago' },
  { version: 481, op: 'OPTIMIZE', mode: 'ZOrder', files: '-80,+12', stats: 'dt,user_id', ts: '2h ago' },
  { version: 480, op: 'DELETE', mode: 'Predicate', files: '-4', stats: '240k rows', ts: '6h ago' },
  { version: 479, op: 'WRITE', mode: 'Append', files: '+240', stats: '96M rows', ts: '12h ago' },
  { version: 478, op: 'VACUUM', mode: 'Retain168h', files: '-480', stats: '8.2 GB freed', ts: '1d ago' },
];

const OP_COLOR: Record<string, string> = {
  WRITE: '#4ade80',
  OPTIMIZE: '#67e8f9',
  DELETE: '#f87171',
  VACUUM: '#fbbf24',
  MERGE: '#a78bfa',
};

function useCounter(base: number, delta: number, ms = 1400) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta)), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function DeltaLakePanel() {
  const [visible, setVisible] = useState(false);
  const [tblRows, setTblRows] = useState(0);
  const [logRows, setLogRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const commits = useCounter(2563, 1, 3000);
  const filesTotal = useCounter(48200, 120, 1400);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setTblRows((x) => Math.min(x + 1, TABLES.length)), 160);
    const l = setInterval(() => setLogRows((x) => Math.min(x + 1, TX_LOG.length)), 150);
    return () => { clearInterval(t); clearInterval(l); };
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
          delta lake -- acid lakehouse -- databricks / linux
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {commits.toLocaleString()} commits
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>spark@delta</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>{'delta log --table gold.user_events --version 482 && delta history --limit 5'}</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'commits', value: commits.toLocaleString(), color: '#4ade80' },
          { label: 'data files', value: filesTotal.toLocaleString(), color: '#67e8f9' },
          { label: 'tables', value: TABLES.length.toString(), color: '#a78bfa' },
          { label: 'acid ops', value: 'MVCC', color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Table list */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // delta tables (medallion architecture)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {TABLES.slice(0, tblRows).map((t) => (
            <div key={t.name} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 60px 60px 80px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 8, textAlign: 'right' }}>v{t.version}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 8, textAlign: 'right' }}>{t.rows}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 8, textAlign: 'right' }}>{t.size}</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.partitioned}</span>
              <span style={{ color: '#fbbf24', fontSize: 7, padding: '1px 4px', background: 'rgba(251,191,36,0.1)', borderRadius: 2, textAlign: 'center' }}>{t.format}</span>
            </div>
          ))}
        </div>

        {/* Transaction log */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // transaction log (gold.user_events)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TX_LOG.slice(0, logRows).map((entry) => (
            <div key={entry.version} style={{ display: 'grid', gridTemplateColumns: '48px 56px 64px 1fr 60px 52px', alignItems: 'center', gap: 8, padding: '4px 8px', background: `${OP_COLOR[entry.op] ?? '#fff'}06`, border: `1px solid ${OP_COLOR[entry.op] ?? '#fff'}18`, borderRadius: 2 }}>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8 }}>v{entry.version}</span>
              <span style={{ color: OP_COLOR[entry.op] ?? '#fff', fontSize: 9, fontWeight: 700 }}>{entry.op}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8 }}>{entry.mode}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 8 }}>{entry.files}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.stats}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{entry.ts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          delta lake v3.1.0 - linux foundation - s3/adls/gcs
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {commits.toLocaleString()} commits - {filesTotal.toLocaleString()} files
        </span>
      </div>
    </div>
  );
}
