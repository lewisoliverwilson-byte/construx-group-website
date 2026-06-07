'use client';

import { useEffect, useRef, useState } from 'react';

const SCANS = [
  { target: 'construxgroup/api:2.4.1', type: 'image', packages: 284, ecosystems: 6, format: 'cyclonedx', status: 'done' },
  { target: 'construxgroup/worker:1.2.0', type: 'image', packages: 120, ecosystems: 4, format: 'spdx', status: 'done' },
  { target: './construx-ui', type: 'dir', packages: 840, ecosystems: 2, format: 'syft-json', status: 'done' },
  { target: 'ubuntu:24.04', type: 'image', packages: 488, ecosystems: 5, format: 'cyclonedx', status: 'done' },
];

const PACKAGES = [
  { name: 'openssl', version: '3.0.13', ecosystem: 'deb', cpes: 3, licenses: 'openssl', location: '/usr/lib' },
  { name: 'next', version: '15.3.3', ecosystem: 'npm', cpes: 1, licenses: 'MIT', location: 'node_modules' },
  { name: 'cryptography', version: '42.0.5', ecosystem: 'python', cpes: 2, licenses: 'Apache-2.0', location: '/usr/local' },
  { name: 'stdlib', version: '1.22.3', ecosystem: 'go', cpes: 1, licenses: 'BSD-3-Clause', location: 'go/src' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function SyftPanel() {
  const [visible, setVisible] = useState(false);
  const [scanRows, setScanRows] = useState(0);
  const [pkgRows, setPkgRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalPackages = useCounter(1732, 4, 800);
  const scansRun = useCounter(284, 1, 1400);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setScanRows((x) => Math.min(x + 1, SCANS.length)), 160);
    const p = setInterval(() => setPkgRows((x) => Math.min(x + 1, PACKAGES.length)), 140);
    return () => { clearInterval(s); clearInterval(p); };
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
          syft -- sbom generator -- packages / cpes / ecosystems
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalPackages.toLocaleString()} packages
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#fbbf24', fontWeight: 600 }}>syft@sbom</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>syft construxgroup/api:2.4.1 -o cyclonedx-json --file construx-api.cdx.json</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'packages', value: totalPackages.toLocaleString(), color: '#fbbf24' },
          { label: 'scans', value: scansRun.toLocaleString(), color: '#4ade80' },
          { label: 'targets', value: SCANS.length.toString(), color: '#a78bfa' },
          { label: 'ecosystems', value: [...new Set(PACKAGES.map(p => p.ecosystem))].length.toString(), color: '#67e8f9' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Scans */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // scan targets
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {SCANS.slice(0, scanRows).map((scan) => (
            <div key={scan.target} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 28px 28px 56px 36px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#fbbf24', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scan.target}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{scan.type}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{scan.packages}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{scan.ecosystems}e</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{scan.format}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{scan.status}</span>
            </div>
          ))}
        </div>

        {/* Packages */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // notable packages
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {PACKAGES.slice(0, pkgRows).map((pkg) => (
            <div key={`${pkg.name}-${pkg.ecosystem}`} style={{ display: 'grid', gridTemplateColumns: '64px 52px 44px 24px 56px 1fr', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pkg.name}</span>
              <span style={{ color: '#4ade80', fontSize: 7 }}>{pkg.version}</span>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{pkg.ecosystem}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'center' }}>{pkg.cpes}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pkg.licenses}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pkg.location}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(251,191,36,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          syft v1.4 - apache-2.0 - anchore sbom generator
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalPackages.toLocaleString()} packages - {scansRun.toLocaleString()} scans
        </span>
      </div>
    </div>
  );
}
