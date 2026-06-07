'use client';

import { useEffect, useRef, useState } from 'react';

const SERVERS = [
  { host: 'keeper-01', port: 9181, role: 'leader', epoch: 284, sessions: 48, latency: 2, status: 'alive' },
  { host: 'keeper-02', port: 9181, role: 'follower', epoch: 284, sessions: 0, latency: 3, status: 'alive' },
  { host: 'keeper-03', port: 9181, role: 'follower', epoch: 284, sessions: 0, latency: 2, status: 'alive' },
];

const ZNODES = [
  { path: '/clickhouse/tables/construx/listings', type: 'persistent', children: 4, dataLen: 284, czxid: '0x1a4', status: 'ok' },
  { path: '/clickhouse/tables/construx/events', type: 'persistent', children: 8, dataLen: 184, czxid: '0x2b8', status: 'ok' },
  { path: '/clickhouse/task_queue/mutations', type: 'persistent', children: 12, dataLen: 48, czxid: '0x3c1', status: 'ok' },
  { path: '/clickhouse/replicas/construx/listings/r1', type: 'ephemeral', children: 0, dataLen: 128, czxid: '0x4d2', status: 'ok' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function ClickHouseKeeperPanel() {
  const [visible, setVisible] = useState(false);
  const [serverRows, setServerRows] = useState(0);
  const [znodeRows, setZnodeRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const requestsTotal = useCounter(28400, 480, 400);
  const commitsTotal = useCounter(284000, 2400, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setServerRows((x) => Math.min(x + 1, SERVERS.length)), 160);
    const z = setInterval(() => setZnodeRows((x) => Math.min(x + 1, ZNODES.length)), 140);
    return () => { clearInterval(s); clearInterval(z); };
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
          clickhouse keeper -- distributed coordination -- raft / znodes / replication
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {requestsTotal.toLocaleString()} req/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#fbbf24', fontWeight: 600 }}>keeper@raft</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>clickhouse-keeper-client -h keeper-01 -p 9181 && ls /clickhouse/tables/construx</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'requests / sec', value: requestsTotal.toLocaleString(), color: '#fbbf24' },
          { label: 'commits', value: (commitsTotal / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'servers', value: SERVERS.length.toString(), color: '#67e8f9' },
          { label: 'znodes', value: ZNODES.length.toString(), color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Servers */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // servers
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {SERVERS.slice(0, serverRows).map((s) => (
            <div key={s.host} style={{ display: 'grid', gridTemplateColumns: '80px 36px 48px 24px 20px 24px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#fbbf24', fontSize: 8, fontWeight: 600 }}>{s.host}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{s.port}</span>
              <span style={{ color: s.role === 'leader' ? '#4ade80' : '#67e8f9', fontSize: 7 }}>{s.role}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{s.epoch}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{s.sessions}</span>
              <span className="tabular-nums" style={{ color: s.latency > 5 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'center' }}>{s.latency}ms</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{s.status}</span>
            </div>
          ))}
        </div>

        {/* ZNodes */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // znodes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ZNODES.slice(0, znodeRows).map((z, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 56px 20px 24px 44px 24px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{z.path}</span>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{z.type}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{z.children}c</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{z.dataLen}b</span>
              <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 7, fontFamily: 'monospace' }}>{z.czxid}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{z.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(251,191,36,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          clickhouse keeper v24.8 - apache-2.0 - raft-based coordination for clickhouse clusters
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {requestsTotal.toLocaleString()} req/s - {(commitsTotal / 1000).toFixed(0)}k commits
        </span>
      </div>
    </div>
  );
}
