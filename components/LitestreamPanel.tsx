'use client';

import { useEffect, useRef, useState } from 'react';

const DATABASES = [
  { path: '/data/construx-sessions.db', size: '284MB', wals: 840, replicas: 2, lagBytes: 0, status: 'synced' },
  { path: '/data/construx-config.db', size: '12MB', wals: 48, replicas: 1, lagBytes: 0, status: 'synced' },
  { path: '/data/construx-queue.db', size: '48MB', wals: 284, replicas: 2, lagBytes: 128, status: 'lagging' },
  { path: '/data/construx-cache.db', size: '840MB', wals: 4800, replicas: 1, lagBytes: 0, status: 'synced' },
];

const REPLICAS = [
  { name: 'construx-primary', type: 's3', target: 's3://construx-backups/db/sessions', snapshots: 28, retention: '72h', lastSync: '0s' },
  { name: 'construx-config', type: 's3', target: 's3://construx-backups/db/config', snapshots: 14, retention: '168h', lastSync: '2s' },
  { name: 'construx-queue', type: 'sftp', target: 'sftp://backup.construxgroup.io/queue', snapshots: 48, retention: '24h', lastSync: '8s' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function LitestreamPanel() {
  const [visible, setVisible] = useState(false);
  const [dbRows, setDbRows] = useState(0);
  const [repRows, setRepRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const walFrames = useCounter(5972, 12, 700);
  const snapshotsTotal = useCounter(90, 1, 3600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const d = setInterval(() => setDbRows((x) => Math.min(x + 1, DATABASES.length)), 160);
    const r = setInterval(() => setRepRows((x) => Math.min(x + 1, REPLICAS.length)), 140);
    return () => { clearInterval(d); clearInterval(r); };
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
          litestream -- sqlite replication -- wal / s3 / snapshots
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {walFrames.toLocaleString()} wal frames
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>litestream@replicate</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>litestream replicate /data/construx-sessions.db s3://construx-backups/db/sessions</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'wal frames', value: walFrames.toLocaleString(), color: '#4ade80' },
          { label: 'snapshots', value: snapshotsTotal.toLocaleString(), color: '#67e8f9' },
          { label: 'databases', value: DATABASES.length.toString(), color: '#a78bfa' },
          { label: 'lagging', value: DATABASES.filter(d => d.status === 'lagging').length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Databases */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // databases
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {DATABASES.slice(0, dbRows).map((db) => (
            <div key={db.path} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 28px 24px 40px 48px', alignItems: 'center', gap: 8, padding: '5px 8px', background: db.status === 'lagging' ? 'rgba(251,191,36,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${db.status === 'lagging' ? 'rgba(251,191,36,0.1)' : 'rgba(74,222,128,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{db.path}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{db.size}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{db.wals}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{db.replicas}r</span>
              <span className="tabular-nums" style={{ color: db.lagBytes > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'right' }}>{db.lagBytes}b</span>
              <span style={{ color: db.status === 'synced' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{db.status}</span>
            </div>
          ))}
        </div>

        {/* Replicas */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // replica destinations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {REPLICAS.slice(0, repRows).map((rep) => (
            <div key={rep.name} style={{ display: 'grid', gridTemplateColumns: '56px 28px 1fr 24px 36px 32px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 600 }}>{rep.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{rep.type}</span>
              <span style={{ color: 'rgba(240,239,255,0.25)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rep.target}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{rep.snapshots}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{rep.retention}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{rep.lastSync}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          litestream v0.3 - apache-2.0 - sqlite continuous replication
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {walFrames.toLocaleString()} wal frames - {snapshotsTotal.toLocaleString()} snapshots
        </span>
      </div>
    </div>
  );
}
