'use client';

import { useState, useEffect, useRef } from 'react';

interface VulnRow {
  library:   string;
  vulnId:    string;
  severity:  'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  installed: string;
  fixed:     string;
  title:     string;
}

const VULNS: VulnRow[] = [
  { library: 'openssl',          vulnId: 'CVE-2030-10234', severity: 'CRITICAL', installed: '3.1.4',   fixed: '3.1.5',   title: 'Heap overflow in TLS 1.3 handshake path' },
  { library: 'libcurl',          vulnId: 'CVE-2030-28319', severity: 'HIGH',     installed: '8.4.0',   fixed: '8.5.0',   title: 'NTLM credential injection via HTTP redirect' },
  { library: 'libc',             vulnId: 'CVE-2030-11499', severity: 'HIGH',     installed: '2.36',    fixed: '2.37',    title: 'Stack overflow in __getaddrinfo_a' },
  { library: 'busybox',          vulnId: 'CVE-2029-48116', severity: 'MEDIUM',   installed: '1.36.0',  fixed: '1.36.1',  title: 'awk: integer overflow in format specifier' },
  { library: 'node',             vulnId: 'CVE-2030-44141', severity: 'MEDIUM',   installed: '22.3.0',  fixed: '22.4.1',  title: 'HTTP/2 CONTINUATION frame DoS (CONTINUATION Flood)' },
  { library: 'zlib',             vulnId: 'CVE-2030-52801', severity: 'MEDIUM',   installed: '1.2.13',  fixed: '1.2.14',  title: 'Heap-based buffer over-read in inflate' },
  { library: 'expat',            vulnId: 'CVE-2030-30773', severity: 'LOW',      installed: '2.5.0',   fixed: '2.6.0',   title: 'XML entity expansion (billion laughs variant)' },
  { library: 'libxml2',          vulnId: 'CVE-2030-22144', severity: 'LOW',      installed: '2.10.4',  fixed: '2.11.0',  title: 'Use-after-free in xpath evaluation' },
  { library: 'musl',             vulnId: 'CVE-2030-19901', severity: 'NONE',     installed: '1.2.4',   fixed: 'n/a',     title: 'Integer overflow in strtod (not exploitable)' },
];

const LAYERS = [
  { layer: 'base (alpine 3.19)',  vulns: 5, critical: 1, high: 2, medium: 2, low: 0  },
  { layer: 'node:22-alpine',      vulns: 2, critical: 0, high: 0, medium: 1, low: 1  },
  { layer: 'COPY node_modules',   vulns: 0, critical: 0, high: 0, medium: 0, low: 0  },
  { layer: 'COPY .next',          vulns: 0, critical: 0, high: 0, medium: 0, low: 0  },
  { layer: 'RUN adduser nextjs',  vulns: 2, critical: 0, high: 1, medium: 0, low: 1  },
];

function severityColor(s: VulnRow['severity']): string {
  if (s === 'CRITICAL') return '#f87171';
  if (s === 'HIGH')     return '#fb923c';
  if (s === 'MEDIUM')   return '#fbbf24';
  if (s === 'LOW')      return '#60a5fa';
  return 'rgba(240,239,255,0.2)';
}

const TOTAL = VULNS.length + LAYERS.length;

export default function TrivyScanPanel() {
  const [revealed, setRevealed] = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 84);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone = revealed > TOTAL;

  const shownVulns  = VULNS.slice(0, Math.max(0, Math.min(VULNS.length, revealed)));
  const shownLayers = LAYERS.slice(0, Math.max(0, Math.min(LAYERS.length, revealed - VULNS.length)));

  const critical = VULNS.filter((v) => v.severity === 'CRITICAL').length;
  const high     = VULNS.filter((v) => v.severity === 'HIGH').length;
  const medium   = VULNS.filter((v) => v.severity === 'MEDIUM').length;
  const low      = VULNS.filter((v) => v.severity === 'LOW').length;

  return (
    <div
      ref={ref}
      className="overflow-x-auto font-mono"
      style={{
        background:   'rgba(1,1,10,0.97)',
        border:       '1px solid rgba(255,255,255,0.07)',
        borderRadius: '3px',
        boxShadow:    '0 0 0 1px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.6)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57', boxShadow: '0 0 4px rgba(255,95,87,0.4)' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E', boxShadow: '0 0 4px rgba(255,189,46,0.3)' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840', boxShadow: '0 0 4px rgba(40,200,64,0.3)' }} />
        </div>
        <span
          className="flex-1 text-center text-[9px] uppercase tracking-[0.2em]"
          style={{ color: 'rgba(255,255,255,0.22)' }}
        >
          construx@sys — trivy image ghcr.io/construx/website
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#f87171' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${VULNS.length} vulns` : 'scanning…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          trivy image --severity CRITICAL,HIGH,MEDIUM,LOW ghcr.io/construx/website:latest
        </span>
      </div>

      {/* Column headers */}
      {shownVulns.length > 0 && (
        <div
          className="flex items-center px-4 py-1 text-[7px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.16)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ minWidth: '100px', flexShrink: 0 }}>Library</span>
          <span style={{ minWidth: '108px', flexShrink: 0 }}>CVE</span>
          <span style={{ minWidth: '68px',  flexShrink: 0 }}>Severity</span>
          <span style={{ minWidth: '64px',  flexShrink: 0 }}>Installed</span>
          <span style={{ minWidth: '56px',  flexShrink: 0 }}>Fixed</span>
          <span>Description</span>
        </div>
      )}

      {/* Vuln rows */}
      <div className="px-4 py-1.5 space-y-0.5">
        {shownVulns.map((v, i) => (
          <div key={i} className="flex items-start text-[8px] leading-[1.65]">
            <span style={{ color: 'rgba(240,239,255,0.45)', minWidth: '100px', flexShrink: 0 }}>{v.library}</span>
            <span style={{ color: 'rgba(240,239,255,0.3)',  minWidth: '108px', flexShrink: 0 }}>{v.vulnId}</span>
            <span style={{ color: severityColor(v.severity), minWidth: '68px', flexShrink: 0, fontWeight: 700 }}>{v.severity}</span>
            <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '64px', flexShrink: 0 }}>{v.installed}</span>
            <span style={{ color: v.fixed === 'n/a' ? 'rgba(240,239,255,0.2)' : '#4ade80', minWidth: '56px', flexShrink: 0 }}>{v.fixed}</span>
            <span style={{ color: 'rgba(240,239,255,0.3)' }}>{v.title}</span>
          </div>
        ))}
        {allDone && (
          <div className="text-[8px] mt-0.5" style={{ color: 'rgba(74,222,128,0.3)' }}>▌</div>
        )}
      </div>

      {/* Layer breakdown */}
      {shownLayers.length > 0 && (
        <div className="px-4 py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — by layer
          </div>
          {shownLayers.map((l, i) => (
            <div key={i} className="flex items-center text-[8px] leading-[1.65] gap-3">
              <span style={{ color: 'rgba(240,239,255,0.35)', minWidth: '192px', flexShrink: 0 }}>{l.layer}</span>
              {l.critical > 0 && <span style={{ color: '#f87171' }}>{l.critical} CRIT</span>}
              {l.high > 0     && <span style={{ color: '#fb923c' }}>{l.high} HIGH</span>}
              {l.medium > 0   && <span style={{ color: '#fbbf24' }}>{l.medium} MED</span>}
              {l.low > 0      && <span style={{ color: '#60a5fa' }}>{l.low} LOW</span>}
              {l.vulns === 0  && <span style={{ color: 'rgba(74,222,128,0.4)' }}>clean</span>}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          {critical > 0 && <span style={{ color: '#f87171' }}>{critical} critical</span>}
          {high > 0     && <span style={{ color: '#fb923c' }}>{high} high</span>}
          {medium > 0   && <span style={{ color: '#fbbf24' }}>{medium} medium</span>}
          {low > 0      && <span style={{ color: '#60a5fa' }}>{low} low</span>}
          <span className="ml-auto">base image update recommended</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          trivy 0.57.1 · ghcr.io/construx/website:latest · linux/amd64
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#f87171' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? `● ${critical} critical` : 'loading'}
        </span>
      </div>
    </div>
  );
}
