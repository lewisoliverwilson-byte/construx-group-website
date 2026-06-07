'use client';

import { useEffect, useRef, useState } from 'react';

const NODES = [
  { host: 'yb-node-01', region: 'us-east-1', tablets: 284, leaderTablets: 96, readOps: 4840, writeOps: 1284, status: 'alive' },
  { host: 'yb-node-02', region: 'us-east-1', tablets: 284, leaderTablets: 92, readOps: 4720, writeOps: 1248, status: 'alive' },
  { host: 'yb-node-03', region: 'eu-west-1', tablets: 284, leaderTablets: 96, readOps: 4800, writeOps: 1264, status: 'alive' },
];

const QUERIES = [
  { type: 'SELECT', table: 'listings', elapsed: 3, rows: 48, cache: 'hit', status: 'ok' },
  { type: 'INSERT', table: 'events', elapsed: 2, rows: 1, cache: 'miss', status: 'ok' },
  { type: 'UPDATE', table: 'users', elapsed: 4, rows: 1, cache: 'miss', status: 'ok' },
  { type: 'SELECT', table: 'audit_log', elapsed: 14, rows: 100, cache: 'hit', status: 'ok' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function YugaBytePanel() {
  const [visible, setVisible] = useState(false);
  const [nodeRows, setNodeRows] = useState(0);
  const [queryRows, setQueryRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const opsPerSec = useCounter(28400, 480, 400);
  const tabletOps = useCounter(4840000, 4800, 500);

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
        border: '1px solid rgba(167,139,250,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(167,139,250,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(167,139,250,0.08)', background: 'rgba(167,139,250,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(167,139,250,0.4)' }}>
          yugabyte db -- distributed sql -- nodes / tablets / ysql
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {opsPerSec.toLocaleString()} ops/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>ysql@yugabyte</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>yb-admin --master_addresses yb-node-01:7100 list_all_tablet_servers && ysqlsh -c "SELECT * FROM pg_stat_activity"</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'ops / sec', value: opsPerSec.toLocaleString(), color: '#a78bfa' },
          { label: 'tablet ops', value: (tabletOps / 1000000).toFixed(1) + 'M', color: '#4ade80' },
          { label: 'nodes', value: NODES.length.toString(), color: '#67e8f9' },
          { label: 'tablets', value: NODES.reduce((a, n) => a + n.tablets, 0).toString(), color: '#fbbf24' },
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
          // tablet servers
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {NODES.slice(0, nodeRows).map((n) => (
            <div key={n.host} style={{ display: 'grid', gridTemplateColumns: '80px 64px 24px 24px 40px 40px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600 }}>{n.host}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{n.region}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{n.tablets}t</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'center' }}>{n.leaderTablets}l</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{n.readOps.toLocaleString()}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{n.writeOps.toLocaleString()}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{n.status}</span>
            </div>
          ))}
        </div>

        {/* Queries */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // ysql queries
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {QUERIES.slice(0, queryRows).map((q, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '44px 80px 32px 24px 32px 24px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 7, fontWeight: 600 }}>{q.type}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7 }}>{q.table}</span>
              <span className="tabular-nums" style={{ color: q.elapsed > 10 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{q.elapsed}ms</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{q.rows}r</span>
              <span style={{ color: q.cache === 'hit' ? '#4ade80' : 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{q.cache}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{q.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          yugabyte db v2.23 - apache-2.0 - distributed sql built on google spanner
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {opsPerSec.toLocaleString()} ops/s - {(tabletOps / 1000000).toFixed(1)}M tablet ops
        </span>
      </div>
    </div>
  );
}
