'use client';

import { useEffect, useRef, useState } from 'react';

const DATASOURCES = [
  { name: 'construx_events', type: 'kafka', rows: '284M', size: '18.4 GB', segments: 840 },
  { name: 'construx_metrics', type: 'batch', rows: '120M', size: '8.2 GB', segments: 420 },
  { name: 'construx_clicks', type: 'kafka', rows: '48M', size: '2.8 GB', segments: 120 },
  { name: 'construx_sessions', type: 'batch', rows: '12M', size: '840 MB', segments: 42 },
];

const QUERIES = [
  { name: 'realtime_funnel', sql: 'SELECT COUNT(*) FROM construx_events WHERE __time >= CURRENT_TIMESTAMP - INTERVAL 1 HOUR', duration: '14ms', rows: 284200 },
  { name: 'daily_active_users', sql: 'SELECT APPROX_COUNT_DISTINCT(user_id) FROM construx_clicks WHERE __time >= CURRENT_DATE', duration: '28ms', rows: 48200 },
  { name: 'revenue_rollup', sql: 'SELECT SUM(amount) FROM construx_events GROUP BY TIME_FLOOR(__time, PT1H)', duration: '42ms', rows: 2840 },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function DruidPanel() {
  const [visible, setVisible] = useState(false);
  const [dRows, setDRows] = useState(0);
  const [qRows, setQRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const ingestRate = useCounter(28400, 240, 350);
  const queryLatency = useCounter(14, 0, 800);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const d = setInterval(() => setDRows((x) => Math.min(x + 1, DATASOURCES.length)), 160);
    const q = setInterval(() => setQRows((x) => Math.min(x + 1, QUERIES.length)), 140);
    return () => { clearInterval(d); clearInterval(q); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(251,191,36,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(251,191,36,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(251,191,36,0.08)', background: 'rgba(251,191,36,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(251,191,36,0.4)' }}>
          apache druid -- real-time olap -- sub-second queries at scale
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {ingestRate.toLocaleString()} rows/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#fbbf24', fontWeight: 600 }}>druid@olap</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>dsql --host localhost:8888 &lt;&lt;&lt; "SELECT datasource, COUNT(*) segments FROM sys.segments GROUP BY 1"</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'ingest rows/s', value: ingestRate.toLocaleString(), color: '#fbbf24' },
          { label: 'query p99', value: queryLatency + 'ms', color: '#67e8f9' },
          { label: 'datasources', value: DATASOURCES.length.toString(), color: '#a78bfa' },
          { label: 'segments', value: DATASOURCES.reduce((a, d) => a + d.segments, 0).toLocaleString(), color: '#4ade80' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Datasources */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // datasources
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {DATASOURCES.slice(0, dRows).map((ds) => (
            <div key={ds.name} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 56px 52px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#fbbf24', fontSize: 8, fontWeight: 600 }}>{ds.name}</span>
              <span style={{ color: ds.type === 'kafka' ? '#67e8f9' : '#a78bfa', fontSize: 7 }}>{ds.type}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{ds.rows}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 7, textAlign: 'right' }}>{ds.size}</span>
              <span className="tabular-nums" style={{ color: '#f97316', fontSize: 7, textAlign: 'right' }}>{ds.segments}</span>
            </div>
          ))}
        </div>

        {/* SQL Queries */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // native sql queries
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {QUERIES.slice(0, qRows).map((q) => (
            <div key={q.name} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 36px 48px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#fbbf24', fontSize: 8, fontWeight: 600 }}>{q.name}</span>
              <span style={{ color: 'rgba(240,239,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.sql}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{q.duration}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{q.rows.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(251,191,36,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          apache druid v31 - apache-2.0 - real-time olap database
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {DATASOURCES.length} datasources - {ingestRate.toLocaleString()} rows/s
        </span>
      </div>
    </div>
  );
}
