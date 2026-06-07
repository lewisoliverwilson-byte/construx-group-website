'use client';

import { useEffect, useRef, useState } from 'react';

const VOLUMES = [
  { name: 'pg-prod-data-0', size: '500Gi', state: 'attached', node: 'k8s-worker-01', replicas: 3, frontend: 'blockdev', status: 'healthy' },
  { name: 'pg-prod-data-1', size: '500Gi', state: 'attached', node: 'k8s-worker-02', replicas: 3, frontend: 'blockdev', status: 'healthy' },
  { name: 'redis-data-0', size: '20Gi', state: 'attached', node: 'k8s-worker-03', replicas: 2, frontend: 'blockdev', status: 'healthy' },
  { name: 'loki-chunks-0', size: '200Gi', state: 'attached', node: 'k8s-worker-01', replicas: 2, frontend: 'blockdev', status: 'healthy' },
];

const SNAPSHOTS = [
  { volume: 'pg-prod-data-0', name: 'snap-20260607-0200', size: '48GB', createdAt: '4h ago', removed: false, status: 'ready' },
  { volume: 'pg-prod-data-1', name: 'snap-20260607-0200', size: '44GB', createdAt: '4h ago', removed: false, status: 'ready' },
  { volume: 'pg-prod-data-0', name: 'snap-20260606-0200', size: '46GB', createdAt: '1d ago', removed: false, status: 'ready' },
  { volume: 'loki-chunks-0', name: 'snap-20260605-0200', size: '120GB', createdAt: '2d ago', removed: false, status: 'ready' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function LonghornPanel() {
  const [visible, setVisible] = useState(false);
  const [volumeRows, setVolumeRows] = useState(0);
  const [snapRows, setSnapRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const opsPerSec = useCounter(28400, 480, 400);
  const snapshotsTotal = useCounter(284, 2, 1000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const v = setInterval(() => setVolumeRows((x) => Math.min(x + 1, VOLUMES.length)), 160);
    const s = setInterval(() => setSnapRows((x) => Math.min(x + 1, SNAPSHOTS.length)), 140);
    return () => { clearInterval(v); clearInterval(s); };
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
          longhorn -- cloud-native distributed storage -- volumes / snapshots / backups
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {VOLUMES.length} volumes
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>kubectl@longhorn</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>kubectl get volumes -n longhorn-system && longhornctl get volume pg-prod-data-0</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'iops', value: opsPerSec.toLocaleString(), color: '#a78bfa' },
          { label: 'snapshots', value: snapshotsTotal.toLocaleString(), color: '#4ade80' },
          { label: 'volumes', value: VOLUMES.length.toString(), color: '#67e8f9' },
          { label: 'total size', value: '1.22Ti', color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Volumes */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // volumes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {VOLUMES.slice(0, volumeRows).map((vol) => (
            <div key={vol.name} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 40px 72px 20px 52px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vol.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{vol.size}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{vol.state}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vol.node}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'center' }}>{vol.replicas}r</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{vol.frontend}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{vol.status}</span>
            </div>
          ))}
        </div>

        {/* Snapshots */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // volume snapshots
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SNAPSHOTS.slice(0, snapRows).map((snap, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '72px 1fr 48px 40px 28px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{snap.volume}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{snap.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{snap.size}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{snap.createdAt}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{snap.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          longhorn v1.7 - apache-2.0 - cloud-native distributed block storage
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {opsPerSec.toLocaleString()} iops - {snapshotsTotal.toLocaleString()} snapshots
        </span>
      </div>
    </div>
  );
}
