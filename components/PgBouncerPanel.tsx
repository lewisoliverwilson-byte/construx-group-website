'use client';

import { useEffect, useRef, useState } from 'react';

const POOLS = [
  { database: 'construx_prod', user: 'app_user', mode: 'transaction', cl_active: 28, sv_active: 8, sv_idle: 4, maxConn: 100 },
  { database: 'construx_analytics', user: 'analytics_ro', mode: 'session', cl_active: 4, sv_active: 4, sv_idle: 0, maxConn: 20 },
  { database: 'construx_ml', user: 'ml_user', mode: 'transaction', cl_active: 8, sv_active: 3, sv_idle: 2, maxConn: 50 },
  { database: 'pgbouncer', user: 'pgbouncer', mode: 'statement', cl_active: 1, sv_active: 0, sv_idle: 0, maxConn: 2 },
];

const STATS = [
  { database: 'construx_prod', total_xact_count: 2840200, avg_xact_time: 4.2, total_received: '840 MB', total_sent: '2.1 GB' },
  { database: 'construx_analytics', total_xact_count: 48400, avg_xact_time: 280.4, total_received: '120 MB', total_sent: '840 MB' },
  { database: 'construx_ml', total_xact_count: 12400, avg_xact_time: 42.8, total_received: '28 MB', total_sent: '84 MB' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function PgBouncerPanel() {
  const [visible, setVisible] = useState(false);
  const [pRows, setPRows] = useState(0);
  const [sRows, setSRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const txnPerSec = useCounter(2840, 28, 600);
  const totalClients = useCounter(41, 0, 1100);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const p = setInterval(() => setPRows((x) => Math.min(x + 1, POOLS.length)), 160);
    const s = setInterval(() => setSRows((x) => Math.min(x + 1, STATS.length)), 140);
    return () => { clearInterval(p); clearInterval(s); };
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
          pgbouncer -- postgres connection pooler -- pools / stats / modes
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {txnPerSec.toLocaleString()} txn/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>pgbouncer@pool</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>psql -p 5432 pgbouncer -U pgbouncer -c "SHOW POOLS;" && psql -p 5432 pgbouncer -U pgbouncer -c "SHOW STATS;"</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'txn/s', value: txnPerSec.toLocaleString(), color: '#67e8f9' },
          { label: 'clients', value: totalClients.toString(), color: '#4ade80' },
          { label: 'pools', value: POOLS.length.toString(), color: '#a78bfa' },
          { label: 'sv_active', value: POOLS.reduce((a, p) => a + p.sv_active, 0).toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Pools */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // connection pools
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {POOLS.slice(0, pRows).map((pool) => (
            <div key={pool.database + pool.user} style={{ display: 'grid', gridTemplateColumns: '1fr 64px 28px 28px 28px 40px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600 }}>{pool.database}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{pool.mode}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{pool.cl_active}c</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'center' }}>{pool.sv_active}a</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{pool.sv_idle}i</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'right' }}>/{pool.maxConn}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // database stats
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {STATS.slice(0, sRows).map((st) => (
            <div key={st.database} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 48px 52px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.database}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{st.avg_xact_time}ms</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{st.total_received}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{st.total_sent}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          pgbouncer v1.23 - isc - postgres connection pooler
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalClients} clients - {txnPerSec.toLocaleString()} txn/s
        </span>
      </div>
    </div>
  );
}
