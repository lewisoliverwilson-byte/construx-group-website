'use client';

import { useEffect, useRef, useState } from 'react';

const BUCKETS = [
  { name: 'construx-builds', objects: 28400, size: '148GB', versioning: 'on', lifecycle: 'on', replication: 'on', status: 'healthy' },
  { name: 'construx-backups', objects: 8400, size: '420GB', versioning: 'on', lifecycle: 'on', replication: 'off', status: 'healthy' },
  { name: 'construx-assets', objects: 48000, size: '84GB', versioning: 'off', lifecycle: 'on', replication: 'on', status: 'healthy' },
  { name: 'construx-logs', objects: 284000, size: '62GB', versioning: 'off', lifecycle: 'on', replication: 'off', status: 'healthy' },
];

const OPERATIONS = [
  { op: 'PutObject', bucket: 'construx-builds', key: 'release/v2.4.1/api.tar.gz', size: '48MB', latency: 284, status: 'ok' },
  { op: 'GetObject', bucket: 'construx-assets', key: 'images/hero-2024.webp', size: '1.2MB', latency: 28, status: 'ok' },
  { op: 'CopyObject', bucket: 'construx-backups', key: 'pg-prod-01/2026-06-07.dump', size: '840MB', latency: 1840, status: 'ok' },
  { op: 'DeleteObject', bucket: 'construx-logs', key: 'archive/2025-11/*.log', size: '284MB', latency: 48, status: 'ok' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function MinIOPanel() {
  const [visible, setVisible] = useState(false);
  const [bucketRows, setBucketRows] = useState(0);
  const [opRows, setOpRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const opsPerSec = useCounter(28400, 480, 400);
  const totalObjects = useCounter(369000, 240, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const b = setInterval(() => setBucketRows((x) => Math.min(x + 1, BUCKETS.length)), 160);
    const o = setInterval(() => setOpRows((x) => Math.min(x + 1, OPERATIONS.length)), 140);
    return () => { clearInterval(b); clearInterval(o); };
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
          minio -- s3-compatible object store -- buckets / objects / ops
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {BUCKETS.length} buckets
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#fbbf24', fontWeight: 600 }}>mc@minio</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>mc ls minio/construx-builds --recursive --summarize && mc admin info minio</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'ops / sec', value: opsPerSec.toLocaleString(), color: '#fbbf24' },
          { label: 'total objects', value: (totalObjects / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'buckets', value: BUCKETS.length.toString(), color: '#67e8f9' },
          { label: 'total size', value: '714GB', color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Buckets */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // buckets
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {BUCKETS.slice(0, bucketRows).map((bkt) => (
            <div key={bkt.name} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 48px 28px 28px 28px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#fbbf24', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bkt.name}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{bkt.objects.toLocaleString()}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{bkt.size}</span>
              <span style={{ color: bkt.versioning === 'on' ? '#4ade80' : 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>v</span>
              <span style={{ color: bkt.lifecycle === 'on' ? '#4ade80' : 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>lc</span>
              <span style={{ color: bkt.replication === 'on' ? '#4ade80' : 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>r</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{bkt.status}</span>
            </div>
          ))}
        </div>

        {/* Operations */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent operations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {OPERATIONS.slice(0, opRows).map((op, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '56px 80px 1fr 40px 48px 24px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#fbbf24', fontSize: 7, fontWeight: 600 }}>{op.op}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{op.bucket}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{op.key}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{op.size}</span>
              <span className="tabular-nums" style={{ color: op.latency > 1000 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{op.latency}ms</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{op.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(251,191,36,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          minio v7 - agpl-3.0 - s3-compatible object storage
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {opsPerSec.toLocaleString()} ops/s - {(totalObjects / 1000).toFixed(0)}k objects
        </span>
      </div>
    </div>
  );
}
