'use client';

import { useEffect, useRef, useState } from 'react';

const REPOS = [
  { name: 'construx/api-gateway', tags: 48, size: '2.8 GB', pulls: 1840, vuln: 0, signed: true },
  { name: 'construx/ml-service', tags: 24, size: '12.4 GB', pulls: 420, vuln: 2, signed: true },
  { name: 'construx/web-app', tags: 120, size: '840 MB', pulls: 4820, vuln: 0, signed: true },
  { name: 'construx/worker', tags: 36, size: '1.2 GB', pulls: 2840, vuln: 1, signed: false },
];

const SCANS = [
  { image: 'api-gateway:v2.48.0', critical: 0, high: 0, medium: 3, low: 8, status: 'scanned' },
  { image: 'ml-service:v1.12.0', critical: 0, high: 2, medium: 8, low: 14, status: 'scanned' },
  { image: 'web-app:v3.84.0', critical: 0, high: 0, medium: 1, low: 4, status: 'scanned' },
  { image: 'worker:v1.36.0', critical: 0, high: 1, medium: 4, low: 9, status: 'scanned' },
];

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
  const [repoRows, setRepoRows] = useState(0);
  const [scanRows, setScanRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const pulls = useCounter(9920, 16, 700);
  const images = useCounter(228, 1, 4000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setRepoRows((x) => Math.min(x + 1, REPOS.length)), 160);
    const s = setInterval(() => setScanRows((x) => Math.min(x + 1, SCANS.length)), 150);
    return () => { clearInterval(r); clearInterval(s); };
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
          harbor -- oci registry -- trivy scan + cosign sign
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {pulls.toLocaleString()} pulls
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>harbor@registry</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>harbor-cli repo list --project construx && trivy image registry.construx.io/construx/api-gateway:latest</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'total pulls', value: pulls.toLocaleString(), color: '#67e8f9' },
          { label: 'images', value: images.toLocaleString(), color: '#4ade80' },
          { label: 'repos', value: REPOS.length.toString(), color: '#a78bfa' },
          { label: 'critical CVEs', value: '0', color: '#4ade80' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Repos */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // repositories
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {REPOS.slice(0, repoRows).map((repo) => (
            <div key={repo.name} style={{ display: 'grid', gridTemplateColumns: '1fr 24px 40px 40px 32px 32px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 9, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{repo.name}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 8, textAlign: 'center' }}>{repo.tags}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{repo.size}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, textAlign: 'right' }}>{repo.pulls.toLocaleString()}</span>
              <span style={{ color: repo.vuln > 0 ? '#f87171' : '#4ade80', fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{repo.vuln > 0 ? repo.vuln : '✓'}</span>
              <span style={{ color: repo.signed ? '#4ade80' : 'rgba(255,255,255,0.2)', fontSize: 8, textAlign: 'right' }}>{repo.signed ? 'SIG' : '—'}</span>
            </div>
          ))}
        </div>

        {/* Scan results */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // trivy scan results
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SCANS.slice(0, scanRows).map((sc) => (
            <div key={sc.image} style={{ display: 'grid', gridTemplateColumns: '1fr 28px 24px 32px 28px', alignItems: 'center', gap: 8, padding: '4px 8px', background: sc.high > 0 ? 'rgba(248,113,113,0.04)' : 'rgba(74,222,128,0.03)', border: `1px solid ${sc.high > 0 ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.5)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sc.image}</span>
              <span className="tabular-nums" style={{ color: '#f87171', fontSize: 7, textAlign: 'right' }}>{sc.critical}C</span>
              <span className="tabular-nums" style={{ color: sc.high > 0 ? '#f87171' : 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{sc.high}H</span>
              <span className="tabular-nums" style={{ color: sc.medium > 0 ? '#fbbf24' : 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{sc.medium}M</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{sc.low}L</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          harbor v2.10 - cncf graduated - trivy + cosign
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {pulls.toLocaleString()} pulls - {images} images
        </span>
      </div>
    </div>
  );
}
