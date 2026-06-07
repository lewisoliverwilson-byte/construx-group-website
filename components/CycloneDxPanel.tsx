'use client';

import { useEffect, useRef, useState } from 'react';

const SBOMS = [
  { name: 'construx-api:2.4.1', format: 'JSON', components: 284, licenses: 18, specVersion: '1.6', status: 'valid' },
  { name: 'construx-worker:1.2.0', format: 'XML', components: 120, licenses: 12, specVersion: '1.5', status: 'valid' },
  { name: 'construx-ui:3.1.0', format: 'JSON', components: 840, licenses: 24, specVersion: '1.6', status: 'valid' },
  { name: 'base-image:ubuntu-24.04', format: 'JSON', components: 488, licenses: 8, specVersion: '1.6', status: 'warn' },
];

const VULNS = [
  { id: 'CVE-2024-21626', component: 'runc@1.1.11', severity: 'CRITICAL', cvss: 9.1, fixed: '1.1.12', state: 'exploitable' },
  { id: 'CVE-2024-3094', component: 'xz-utils@5.6.0', severity: 'CRITICAL', cvss: 10.0, fixed: '5.6.1', state: 'not-affected' },
  { id: 'CVE-2024-28849', component: 'follow-redirects@1.15.3', severity: 'MEDIUM', cvss: 6.5, fixed: '1.15.6', state: 'in-triage' },
];

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: '#f87171',
  HIGH: '#fb923c',
  MEDIUM: '#fbbf24',
  LOW: 'rgba(255,255,255,0.3)',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function CycloneDxPanel() {
  const [visible, setVisible] = useState(false);
  const [sbomRows, setSbomRows] = useState(0);
  const [vulnRows, setVulnRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const componentsTracked = useCounter(1732, 4, 800);
  const scansRun = useCounter(284, 1, 1200);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setSbomRows((x) => Math.min(x + 1, SBOMS.length)), 160);
    const v = setInterval(() => setVulnRows((x) => Math.min(x + 1, VULNS.length)), 140);
    return () => { clearInterval(s); clearInterval(v); };
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
          cyclonedx -- sbom -- components / licenses / vulnerabilities
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {componentsTracked.toLocaleString()} components
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#3b82f6', fontWeight: 600 }}>cdx@sbom</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>cyclonedx-cli analyze --input construx-api.cdx.json --output-format table --detect-vulnerabilities</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'components', value: componentsTracked.toLocaleString(), color: '#3b82f6' },
          { label: 'scans run', value: scansRun.toLocaleString(), color: '#4ade80' },
          { label: 'sboms', value: SBOMS.length.toString(), color: '#a78bfa' },
          { label: 'critical cves', value: VULNS.filter(v => v.severity === 'CRITICAL').length.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* SBOMs */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // sbom inventory
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {SBOMS.slice(0, sbomRows).map((sbom) => (
            <div key={sbom.name} style={{ display: 'grid', gridTemplateColumns: '1fr 32px 28px 24px 40px 40px', alignItems: 'center', gap: 8, padding: '5px 8px', background: sbom.status === 'warn' ? 'rgba(251,191,36,0.04)' : 'rgba(59,130,246,0.04)', border: `1px solid ${sbom.status === 'warn' ? 'rgba(251,191,36,0.1)' : 'rgba(59,130,246,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#3b82f6', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sbom.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{sbom.format}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{sbom.components}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{sbom.licenses}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>v{sbom.specVersion}</span>
              <span style={{ color: sbom.status === 'valid' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{sbom.status}</span>
            </div>
          ))}
        </div>

        {/* Vulnerabilities */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // vex / vulnerabilities
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {VULNS.slice(0, vulnRows).map((vuln) => (
            <div key={vuln.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 52px 32px 48px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{vuln.id}</span>
              <span style={{ color: 'rgba(240,239,255,0.3)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vuln.component}</span>
              <span style={{ color: SEVERITY_COLOR[vuln.severity] ?? 'rgba(255,255,255,0.3)', fontSize: 7, fontWeight: 700 }}>{vuln.severity}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{vuln.cvss}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vuln.state}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(59,130,246,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          cyclonedx v1.6 - apache-2.0 - software bill of materials
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {componentsTracked.toLocaleString()} tracked - {scansRun.toLocaleString()} scans
        </span>
      </div>
    </div>
  );
}
