'use client';

import { useEffect, useRef, useState } from 'react';

const IMAGES = [
  { image: 'construxgroup/api:2.4.1', os: 'alpine:3.20', packages: 284, critical: 0, high: 0, medium: 2, low: 4, status: 'passed' },
  { image: 'construxgroup/web:1.8.0', os: 'debian:12-slim', packages: 184, critical: 0, high: 1, medium: 3, low: 8, status: 'review' },
  { image: 'construxgroup/worker:3.1.2', os: 'alpine:3.20', packages: 124, critical: 0, high: 0, medium: 1, low: 2, status: 'passed' },
  { image: 'construxgroup/scraper:1.2.4', os: 'ubuntu:24.04', packages: 348, critical: 0, high: 0, medium: 4, low: 12, status: 'passed' },
];

const CVES = [
  { cve: 'CVE-2024-24786', severity: 'MEDIUM', pkg: 'google.golang.org/protobuf', version: 'v1.32.0', fixedIn: 'v1.33.0', status: 'fix-available' },
  { cve: 'CVE-2024-34156', severity: 'HIGH', pkg: 'stdlib', version: 'go1.22.0', fixedIn: 'go1.23.0', status: 'fix-available' },
  { cve: 'CVE-2024-6104', severity: 'MEDIUM', pkg: 'go-retryablehttp', version: 'v0.7.6', fixedIn: 'v0.7.7', status: 'fix-available' },
  { cve: 'CVE-2024-45338', severity: 'MEDIUM', pkg: 'golang.org/x/net', version: 'v0.28.0', fixedIn: 'v0.33.0', status: 'fix-available' },
];

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: '#f87171',
  HIGH: '#fbbf24',
  MEDIUM: '#67e8f9',
  LOW: '#4ade80',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function GrypePanel() {
  const [visible, setVisible] = useState(false);
  const [imageRows, setImageRows] = useState(0);
  const [cveRows, setCveRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const scansTotal = useCounter(284, 1, 1200);
  const vulnsFound = useCounter(2840, 4, 800);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const im = setInterval(() => setImageRows((x) => Math.min(x + 1, IMAGES.length)), 160);
    const cv = setInterval(() => setCveRows((x) => Math.min(x + 1, CVES.length)), 140);
    return () => { clearInterval(im); clearInterval(cv); };
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
          grype -- vulnerability scanner -- images / cves / sbom
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {scansTotal.toLocaleString()} scans
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>grype@scanner</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>grype construxgroup/api:latest --output table && grype db update && grype sbom:./sbom.json</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'scans total', value: scansTotal.toLocaleString(), color: '#a78bfa' },
          { label: 'vulns found', value: vulnsFound.toLocaleString(), color: '#fbbf24' },
          { label: 'images', value: IMAGES.length.toString(), color: '#67e8f9' },
          { label: 'passed', value: IMAGES.filter(i => i.status === 'passed').length.toString(), color: '#4ade80' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Images */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // images scanned
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {IMAGES.slice(0, imageRows).map((img, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 64px 20px 20px 20px 20px 48px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.image}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.os}</span>
              <span className="tabular-nums" style={{ color: img.critical > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{img.critical}C</span>
              <span className="tabular-nums" style={{ color: img.high > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{img.high}H</span>
              <span className="tabular-nums" style={{ color: img.medium > 0 ? '#67e8f9' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{img.medium}M</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{img.low}L</span>
              <span style={{ color: img.status === 'passed' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{img.status}</span>
            </div>
          ))}
        </div>

        {/* CVEs */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // cve findings
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {CVES.slice(0, cveRows).map((cve, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '96px 44px 1fr 52px 72px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 7, fontWeight: 600 }}>{cve.cve}</span>
              <span style={{ color: SEVERITY_COLOR[cve.severity] ?? '#4ade80', fontSize: 7 }}>{cve.severity}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cve.pkg}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{cve.version}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{cve.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          grype v0.79 - apache-2.0 - a vulnerability scanner for container images and filesystems
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {scansTotal.toLocaleString()} scans - {vulnsFound.toLocaleString()} vulns
        </span>
      </div>
    </div>
  );
}
