'use client';

import { useEffect, useRef, useState } from 'react';

const PACKAGES = [
  { name: 'next', version: '15.3.3', score: 98, alerts: 0, license: 'MIT' },
  { name: 'react', version: '19.0.0', score: 99, alerts: 0, license: 'MIT' },
  { name: 'tailwindcss', version: '3.4.17', score: 95, alerts: 0, license: 'MIT' },
  { name: 'lucide-react', version: '0.511.0', score: 92, alerts: 1, license: 'ISC' },
];

const ALERTS = [
  { pkg: 'lucide-react', type: 'Install Script', severity: 'Medium', detail: 'postinstall script detected', cve: null },
  { pkg: 'sharp', type: 'Network Access', severity: 'Low', detail: 'optional binary download in install', cve: null },
  { pkg: 'ws', type: 'CVE', severity: 'High', detail: 'ReDoS in permessage-deflate', cve: 'CVE-2024-37890' },
  { pkg: 'esbuild', type: 'Dev-Only', severity: 'Info', detail: 'prod bundle may include devDep', cve: null },
];

const SEVERITY_COLOR: Record<string, string> = {
  Critical: '#f87171',
  High: '#f97316',
  Medium: '#fbbf24',
  Low: '#67e8f9',
  Info: 'rgba(255,255,255,0.3)',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function SocketPanel() {
  const [visible, setVisible] = useState(false);
  const [pRows, setPRows] = useState(0);
  const [aRows, setARows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const scanned = useCounter(284, 4, 1000);
  const totalPackages = useCounter(840, 2, 1200);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const p = setInterval(() => setPRows((x) => Math.min(x + 1, PACKAGES.length)), 160);
    const a = setInterval(() => setARows((x) => Math.min(x + 1, ALERTS.length)), 140);
    return () => { clearInterval(p); clearInterval(a); };
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
          socket.dev -- supply chain security -- packages / alerts / cves
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalPackages.toLocaleString()} pkgs
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>socket@supply-chain</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>socket scan --report --format json . && socket npm install lucide-react</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'packages', value: totalPackages.toLocaleString(), color: '#67e8f9' },
          { label: 'scanned', value: scanned.toString(), color: '#4ade80' },
          { label: 'alerts', value: ALERTS.length.toString(), color: '#fbbf24' },
          { label: 'high+', value: ALERTS.filter(a => a.severity === 'High' || a.severity === 'Critical').length.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Packages */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // packages
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {PACKAGES.slice(0, pRows).map((pkg) => (
            <div key={pkg.name} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 28px 24px 32px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600 }}>{pkg.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{pkg.version}</span>
              <span className="tabular-nums" style={{ color: pkg.score >= 95 ? '#4ade80' : pkg.score >= 85 ? '#fbbf24' : '#f87171', fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{pkg.score}</span>
              <span className="tabular-nums" style={{ color: pkg.alerts > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'right' }}>{pkg.alerts}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{pkg.license}</span>
            </div>
          ))}
        </div>

        {/* Alerts */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // security alerts
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ALERTS.slice(0, aRows).map((al, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '48px 64px 48px 1fr', alignItems: 'center', gap: 8, padding: '4px 8px', background: al.severity === 'High' ? 'rgba(249,115,22,0.04)' : al.severity === 'Medium' ? 'rgba(251,191,36,0.04)' : 'rgba(103,232,249,0.04)', border: `1px solid ${al.severity === 'High' ? 'rgba(249,115,22,0.1)' : al.severity === 'Medium' ? 'rgba(251,191,36,0.1)' : 'rgba(103,232,249,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: SEVERITY_COLOR[al.severity] ?? '#fbbf24', fontSize: 7, fontWeight: 700 }}>{al.severity}</span>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{al.pkg}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{al.type}</span>
              <span style={{ color: 'rgba(240,239,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{al.cve ?? al.detail}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          socket.dev - proprietary - npm supply chain security
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalPackages.toLocaleString()} pkgs - {ALERTS.length} alerts
        </span>
      </div>
    </div>
  );
}
