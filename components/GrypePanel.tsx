'use client';

import { useEffect, useRef, useState } from 'react';

const SCANS = [
  { target: 'ghcr.io/construxgroup/construx-web:v2.4.1', type: 'container', vulns: 0, critical: 0, high: 0, medium: 0, status: 'clean' },
  { target: 'ghcr.io/construxgroup/construx-api:v1.8.0', type: 'container', vulns: 2, critical: 0, high: 0, medium: 2, status: 'warn' },
  { target: 'ghcr.io/construxgroup/ml-inference:v0.9.0', type: 'container', vulns: 5, critical: 0, high: 1, medium: 3, status: 'warn' },
  { target: 'construx-group-website/', type: 'dir', vulns: 0, critical: 0, high: 0, medium: 0, status: 'clean' },
];

const VULNS = [
  { cve: 'CVE-2024-3094', pkg: 'xz-utils', version: '5.4.5', fixedIn: '5.4.6', severity: 'Critical', target: 'ml-inference' },
  { cve: 'CVE-2023-46234', pkg: 'browserify-sign', version: '4.2.1', fixedIn: '4.2.3', severity: 'High', target: 'construx-api' },
  { cve: 'CVE-2024-29180', pkg: 'webpack-dev-middleware', version: '5.3.3', fixedIn: '5.3.4', severity: 'High', target: 'ml-inference' },
];

const SEVERITY_COLOR: Record<string, string> = {
  Critical: '#f87171',
  High: '#f97316',
  Medium: '#fbbf24',
  Low: '#67e8f9',
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
  const [sRows, setSRows] = useState(0);
  const [vRows, setVRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const scansTotal = useCounter(284, 2, 1200);
  const databaseAge = useCounter(2, 0, 3600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setSRows((x) => Math.min(x + 1, SCANS.length)), 160);
    const v = setInterval(() => setVRows((x) => Math.min(x + 1, VULNS.length)), 140);
    return () => { clearInterval(s); clearInterval(v); };
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
          grype -- vulnerability scanner -- cve / cvss / containers / sbom
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {scansTotal} scans
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>grype@vuln</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>grype ghcr.io/construxgroup/construx-web:v2.4.1 --add-cpes-if-none && grype db update</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'scans', value: scansTotal.toString(), color: '#a78bfa' },
          { label: 'total vulns', value: SCANS.reduce((a, s) => a + s.vulns, 0).toString(), color: '#fbbf24' },
          { label: 'critical', value: SCANS.reduce((a, s) => a + s.critical, 0).toString(), color: '#f87171' },
          { label: 'db age', value: databaseAge + 'h', color: '#4ade80' },
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
          // scan results
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {SCANS.slice(0, sRows).map((sc) => (
            <div key={sc.target} style={{ display: 'grid', gridTemplateColumns: '1fr 32px 28px 28px 28px 48px', alignItems: 'center', gap: 8, padding: '5px 8px', background: sc.status === 'warn' ? 'rgba(251,191,36,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${sc.status === 'warn' ? 'rgba(251,191,36,0.1)' : 'rgba(74,222,128,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sc.target.split('/').pop()}</span>
              <span className="tabular-nums" style={{ color: sc.critical > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center', fontWeight: sc.critical > 0 ? 700 : 400 }}>C:{sc.critical}</span>
              <span className="tabular-nums" style={{ color: sc.high > 0 ? '#f97316' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>H:{sc.high}</span>
              <span className="tabular-nums" style={{ color: sc.medium > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>M:{sc.medium}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{sc.type}</span>
              <span style={{ color: sc.status === 'clean' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{sc.status}</span>
            </div>
          ))}
        </div>

        {/* Vulnerabilities */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // vulnerabilities
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {VULNS.slice(0, vRows).map((v) => (
            <div key={v.cve} style={{ display: 'grid', gridTemplateColumns: '80px 72px 1fr 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: v.severity === 'Critical' ? 'rgba(248,113,113,0.04)' : 'rgba(249,115,22,0.04)', border: `1px solid ${v.severity === 'Critical' ? 'rgba(248,113,113,0.1)' : 'rgba(249,115,22,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: SEVERITY_COLOR[v.severity] ?? '#fbbf24', fontSize: 7, fontWeight: 700 }}>{v.severity}</span>
              <span style={{ color: '#a78bfa', fontSize: 7 }}>{v.pkg}</span>
              <span style={{ color: 'rgba(240,239,255,0.2)', fontSize: 7 }}>{v.cve}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>→{v.fixedIn}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          grype v0.79 - apache-2.0 - anchore vuln scanner
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {scansTotal} scans - {VULNS.length} vulns
        </span>
      </div>
    </div>
  );
}
