'use client';

import { useEffect, useRef, useState } from 'react';

const VOLUMES = [
  { id: 'vol-1', server: 'seaweed-volume-01', files: 284000, size: '84GB', collections: 'construx-assets', writable: true, status: 'active' },
  { id: 'vol-2', server: 'seaweed-volume-02', files: 184000, size: '48GB', collections: 'construx-thumbnails', writable: true, status: 'active' },
  { id: 'vol-3', server: 'seaweed-volume-01', files: 484000, size: '124GB', collections: 'construx-uploads', writable: true, status: 'active' },
  { id: 'vol-4', server: 'seaweed-volume-03', files: 84000, size: '28GB', collections: 'construx-backups', writable: false, status: 'readonly' },
];

const FILER_OPS = [
  { op: 'WRITE', path: '/construx/assets/prop-48291/hero.webp', size: '248KB', latency: 28, status: 'ok' },
  { op: 'READ', path: '/construx/thumbnails/prop-48291/thumb-sm.webp', size: '12KB', latency: 4, status: 'ok' },
  { op: 'WRITE', path: '/construx/uploads/users/lewis/avatar.jpg', size: '84KB', latency: 12, status: 'ok' },
  { op: 'DELETE', path: '/construx/assets/prop-47820/old-hero.jpg', size: '0', latency: 8, status: 'ok' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function SeaweedFSPanel() {
  const [visible, setVisible] = useState(false);
  const [volumeRows, setVolumeRows] = useState(0);
  const [opRows, setOpRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const opsPerSec = useCounter(28400, 480, 400);
  const totalFiles = useCounter(1036000, 1200, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const v = setInterval(() => setVolumeRows((x) => Math.min(x + 1, VOLUMES.length)), 160);
    const o = setInterval(() => setOpRows((x) => Math.min(x + 1, FILER_OPS.length)), 140);
    return () => { clearInterval(v); clearInterval(o); };
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
          seaweedfs -- distributed file system -- volumes / filer / s3-compatible
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {(totalFiles / 1000).toFixed(0)}k files
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>weed@master</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>weed shell -master=localhost:9333 && volume.list && filer.ls /construx/assets</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'ops / sec', value: opsPerSec.toLocaleString(), color: '#a78bfa' },
          { label: 'total files', value: (totalFiles / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'volumes', value: VOLUMES.length.toString(), color: '#67e8f9' },
          { label: 'total size', value: '284GB', color: '#fbbf24' },
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
            <div key={vol.id} style={{ display: 'grid', gridTemplateColumns: '36px 80px 52px 36px 1fr 28px 52px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 7, fontWeight: 600 }}>{vol.id}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vol.server}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{vol.files.toLocaleString()}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{vol.size}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vol.collections}</span>
              <span style={{ color: vol.writable ? '#4ade80' : '#fbbf24', fontSize: 7, textAlign: 'center' }}>{vol.writable ? 'rw' : 'ro'}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{vol.status}</span>
            </div>
          ))}
        </div>

        {/* Filer Ops */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // filer operations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {FILER_OPS.slice(0, opRows).map((op, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 40px 36px 24px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 7, fontWeight: 600 }}>{op.op}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{op.path}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{op.size}</span>
              <span className="tabular-nums" style={{ color: op.latency > 20 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{op.latency}ms</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{op.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          seaweedfs v3.70 - apache-2.0 - simple and highly scalable distributed file system
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {opsPerSec.toLocaleString()} ops/s - {(totalFiles / 1000).toFixed(0)}k files
        </span>
      </div>
    </div>
  );
}
