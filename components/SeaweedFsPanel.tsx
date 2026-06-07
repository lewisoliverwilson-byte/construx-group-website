'use client';

import { useEffect, useRef, useState } from 'react';

const VOLUMES = [
  { id: 1, server: 'volume-1:8080', files: 284200, size: '18.4 GB', collections: 4, status: 'active' },
  { id: 2, server: 'volume-2:8080', files: 120400, size: '8.2 GB', collections: 3, status: 'active' },
  { id: 3, server: 'volume-3:8080', files: 48200, size: '3.1 GB', collections: 2, status: 'active' },
  { id: 4, server: 'volume-4:8080', files: 8400, size: '0.6 GB', collections: 1, status: 'readonly' },
];

const OPERATIONS = [
  { op: 'PUT', path: '/listings/img/scan_2840.jpg', size: '284 KB', latency: '8ms', status: 201 },
  { op: 'GET', path: '/listings/img/listing_120.jpg', size: '142 KB', latency: '2ms', status: 200 },
  { op: 'PUT', path: '/documents/report_q4.pdf', size: '1.8 MB', latency: '42ms', status: 201 },
  { op: 'DELETE', path: '/listings/img/old_48.jpg', size: '—', latency: '1ms', status: 204 },
];

const STATUS_COLOR: Record<number, string> = {
  200: '#4ade80',
  201: '#4ade80',
  204: '#4ade80',
  404: '#f87171',
  500: '#f87171',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function SeaweedFsPanel() {
  const [visible, setVisible] = useState(false);
  const [vRows, setVRows] = useState(0);
  const [oRows, setORows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const opsPerSec = useCounter(2840, 48, 500);
  const totalFiles = useCounter(461200, 480, 800);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const v = setInterval(() => setVRows((x) => Math.min(x + 1, VOLUMES.length)), 160);
    const o = setInterval(() => setORows((x) => Math.min(x + 1, OPERATIONS.length)), 140);
    return () => { clearInterval(v); clearInterval(o); };
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
          seaweedfs -- distributed blob store -- volumes / filer / s3 api
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {opsPerSec.toLocaleString()} ops/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#fbbf24', fontWeight: 600 }}>weed@storage</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>weed server -dir=/data -s3 -filer && weed shell -master=localhost:9333 &lt;&lt;&lt; "volume.list"</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'ops/s', value: opsPerSec.toLocaleString(), color: '#fbbf24' },
          { label: 'total files', value: (totalFiles / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'volumes', value: VOLUMES.length.toString(), color: '#67e8f9' },
          { label: 'size', value: '30.3 GB', color: '#a78bfa' },
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
          // volume servers
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {VOLUMES.slice(0, vRows).map((vol) => (
            <div key={vol.id} style={{ display: 'grid', gridTemplateColumns: '1fr 56px 48px 24px 52px', alignItems: 'center', gap: 8, padding: '5px 8px', background: vol.status === 'readonly' ? 'rgba(251,191,36,0.04)' : 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#fbbf24', fontSize: 8, fontWeight: 600 }}>{vol.server}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{vol.files.toLocaleString()}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{vol.size}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{vol.collections}</span>
              <span style={{ color: vol.status === 'active' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{vol.status}</span>
            </div>
          ))}
        </div>

        {/* Operations */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // filer operations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {OPERATIONS.slice(0, oRows).map((op, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 52px 36px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.08)', borderRadius: 2 }}>
              <span style={{ color: op.op === 'DELETE' ? '#f87171' : op.op === 'PUT' ? '#4ade80' : '#67e8f9', fontSize: 7, fontWeight: 700 }}>{op.op}</span>
              <span style={{ color: 'rgba(240,239,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{op.path}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{op.size}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{op.latency}</span>
              <span className="tabular-nums" style={{ color: STATUS_COLOR[op.status] ?? '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{op.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(251,191,36,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          seaweedfs v3.68 - apache-2.0 - distributed file system
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {VOLUMES.length} volumes - {opsPerSec.toLocaleString()} ops/s
        </span>
      </div>
    </div>
  );
}
