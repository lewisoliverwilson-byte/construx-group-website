'use client';

import { useEffect, useRef, useState } from 'react';

const PROJECTS = [
  { name: 'construxgroup', repos: 12, images: 284, size: '28GB', public: false, scanEnabled: true, status: 'active' },
  { name: 'construx-base', repos: 4, images: 48, size: '4.2GB', public: false, scanEnabled: true, status: 'active' },
  { name: 'construx-charts', repos: 8, images: 120, size: '840MB', public: false, scanEnabled: true, status: 'active' },
  { name: 'construx-public', repos: 2, images: 24, size: '1.2GB', public: true, scanEnabled: true, status: 'active' },
];

const SCAN_RESULTS = [
  { image: 'construxgroup/api:2.4.1', critical: 0, high: 0, medium: 2, low: 8, fixable: 2, scannedAt: '4m ago', status: 'passed' },
  { image: 'construxgroup/worker:1.8.0', critical: 0, high: 1, medium: 3, low: 12, fixable: 4, scannedAt: '12m ago', status: 'review' },
  { image: 'construxgroup/api:2.4.0', critical: 0, high: 0, medium: 4, low: 10, fixable: 4, scannedAt: '2h ago', status: 'passed' },
  { image: 'construx-base/node:20-slim', critical: 0, high: 0, medium: 1, low: 4, fixable: 1, scannedAt: '6h ago', status: 'passed' },
];

const SCAN_STATUS_COLOR: Record<string, string> = {
  passed: '#4ade80',
  review: '#fbbf24',
  failed: '#f87171',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function HarborPanel() {
  const [visible, setVisible] = useState(false);
  const [projectRows, setProjectRows] = useState(0);
  const [scanRows, setScanRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const pullsTotal = useCounter(28400, 48, 500);
  const scansTotal = useCounter(2840, 4, 700);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const p = setInterval(() => setProjectRows((x) => Math.min(x + 1, PROJECTS.length)), 160);
    const s = setInterval(() => setScanRows((x) => Math.min(x + 1, SCAN_RESULTS.length)), 140);
    return () => { clearInterval(p); clearInterval(s); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(59,130,246,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(59,130,246,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(59,130,246,0.08)', background: 'rgba(59,130,246,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(59,130,246,0.4)' }}>
          harbor -- container registry -- projects / images / vulnerability scanning
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {pullsTotal.toLocaleString()} pulls
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#3b82f6', fontWeight: 600 }}>docker@harbor</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>docker push registry.construxgroup.io/construxgroup/api:2.4.1 && harbor scan construxgroup/api:2.4.1</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'pulls', value: pullsTotal.toLocaleString(), color: '#3b82f6' },
          { label: 'scans', value: scansTotal.toLocaleString(), color: '#4ade80' },
          { label: 'projects', value: PROJECTS.length.toString(), color: '#a78bfa' },
          { label: 'images', value: PROJECTS.reduce((a, p) => a + p.images, 0).toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Projects */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // projects
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {PROJECTS.slice(0, projectRows).map((proj) => (
            <div key={proj.name} style={{ display: 'grid', gridTemplateColumns: '1fr 24px 40px 36px 28px 28px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#3b82f6', fontSize: 8, fontWeight: 600 }}>{proj.name}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{proj.repos}r</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{proj.images}img</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{proj.size}</span>
              <span style={{ color: proj.public ? '#fbbf24' : 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{proj.public ? 'pub' : 'prv'}</span>
              <span style={{ color: proj.scanEnabled ? '#4ade80' : 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>sc</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{proj.status}</span>
            </div>
          ))}
        </div>

        {/* Scan Results */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // vulnerability scans
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SCAN_RESULTS.slice(0, scanRows).map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 20px 20px 20px 20px 40px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.image}</span>
              <span className="tabular-nums" style={{ color: s.critical > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{s.critical}C</span>
              <span className="tabular-nums" style={{ color: s.high > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{s.high}H</span>
              <span className="tabular-nums" style={{ color: s.medium > 0 ? '#67e8f9' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{s.medium}M</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{s.low}L</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{s.scannedAt}</span>
              <span style={{ color: SCAN_STATUS_COLOR[s.status] ?? 'rgba(255,255,255,0.3)', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{s.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(59,130,246,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          harbor v2.11 - apache-2.0 - cloud native registry
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {pullsTotal.toLocaleString()} pulls - {scansTotal.toLocaleString()} scans
        </span>
      </div>
    </div>
  );
}
