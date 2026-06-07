'use client';

import { useEffect, useRef, useState } from 'react';

const CLUSTERS = [
  { name: 'prod-pg', instances: 3, primary: 'pod/prod-pg-1', version: '16.2', storage: '500 GB', status: 'healthy' },
  { name: 'analytics-pg', instances: 2, primary: 'pod/analytics-pg-1', version: '16.2', storage: '2 TB', status: 'healthy' },
  { name: 'staging-pg', instances: 1, primary: 'pod/staging-pg-1', version: '15.6', storage: '50 GB', status: 'degraded' },
];

const REPLICAS = [
  { pod: 'prod-pg-2', role: 'standby', lag: '0ms', streaming: true, sync: 'async' },
  { pod: 'prod-pg-3', role: 'standby', lag: '2ms', streaming: true, sync: 'async' },
  { pod: 'analytics-pg-2', role: 'standby', lag: '0ms', streaming: true, sync: 'sync' },
];

const BACKUPS = [
  { name: 'prod-pg-full-20260607', type: 'base', size: '84 GB', status: 'completed', ts: '6h ago' },
  { name: 'prod-pg-wal-20260607', type: 'wal', size: '1.2 GB', status: 'completed', ts: '10m ago' },
  { name: 'analytics-pg-full-20260607', type: 'base', size: '380 GB', status: 'running', ts: '2m ago' },
];

const STATUS_COLOR: Record<string, string> = { healthy: '#4ade80', degraded: '#fbbf24', failed: '#f87171' };
const BACKUP_COLOR: Record<string, string> = { completed: '#4ade80', running: '#fbbf24', failed: '#f87171' };

function useCounter(base: number, delta: number, ms = 1000) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta)), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function CloudNativePGPanel() {
  const [visible, setVisible] = useState(false);
  const [clRows, setClRows] = useState(0);
  const [repRows, setRepRows] = useState(0);
  const [bkRows, setBkRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const walBytes = useCounter(48200, 120, 800);
  const tps = useCounter(4840, 20, 800);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const c = setInterval(() => setClRows((x) => Math.min(x + 1, CLUSTERS.length)), 160);
    const r = setInterval(() => setRepRows((x) => Math.min(x + 1, REPLICAS.length)), 150);
    const b = setInterval(() => setBkRows((x) => Math.min(x + 1, BACKUPS.length)), 170);
    return () => { clearInterval(c); clearInterval(r); clearInterval(b); };
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
          cloudnative-pg -- postgres operator -- ha replication
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {tps.toLocaleString()} tps
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>pg@operator</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>kubectl cnpg status prod-pg && kubectl cnpg backup prod-pg --method=barmanObjectStore</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'clusters', value: CLUSTERS.length.toString(), color: '#67e8f9' },
          { label: 'tps', value: tps.toLocaleString(), color: '#4ade80' },
          { label: 'wal bytes/s', value: (walBytes * 1024).toLocaleString(), color: '#a78bfa' },
          { label: 'replicas', value: REPLICAS.length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Clusters */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // postgres clusters
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {CLUSTERS.slice(0, clRows).map((cl) => (
            <div key={cl.name} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 28px 48px 56px 60px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 9, fontWeight: 600 }}>{cl.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cl.primary}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 8, textAlign: 'center' }}>{cl.instances}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8 }}>pg{cl.version}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{cl.storage}</span>
              <span style={{ color: STATUS_COLOR[cl.status], fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{cl.status.toUpperCase()}</span>
            </div>
          ))}
        </div>

        {/* Replicas + backups */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
              // streaming replicas
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {REPLICAS.slice(0, repRows).map((rep) => (
                <div key={rep.pod} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 36px', alignItems: 'center', gap: 6, padding: '4px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
                  <span style={{ color: '#4ade80', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rep.pod}</span>
                  <span className="tabular-nums" style={{ color: rep.lag === '0ms' ? '#4ade80' : '#fbbf24', fontSize: 8 }}>{rep.lag}</span>
                  <span style={{ color: rep.sync === 'sync' ? '#67e8f9' : 'rgba(255,255,255,0.3)', fontSize: 7, textAlign: 'right' }}>{rep.sync}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
              // barman backups
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {BACKUPS.slice(0, bkRows).map((bk) => (
                <div key={bk.name} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 44px 44px', alignItems: 'center', gap: 6, padding: '4px 8px', background: `${BACKUP_COLOR[bk.status]}06`, border: `1px solid ${BACKUP_COLOR[bk.status]}18`, borderRadius: 2 }}>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 7, padding: '1px 4px', background: 'rgba(255,255,255,0.06)', borderRadius: 2, textAlign: 'center' }}>{bk.type}</span>
                  <span style={{ color: 'rgba(240,239,255,0.55)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bk.name.split('-').slice(-1)[0]}</span>
                  <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{bk.size}</span>
                  <span style={{ color: BACKUP_COLOR[bk.status], fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{bk.status === 'completed' ? 'OK' : bk.status.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          cloudnative-pg v1.23 - cncf - postgres 16
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {tps.toLocaleString()} tps - {REPLICAS.length} streaming replicas
        </span>
      </div>
    </div>
  );
}
