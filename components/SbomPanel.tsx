'use client';

import { useState, useEffect, useRef } from 'react';

interface SbomEntry {
  name:     string;
  version:  string;
  license:  string;
  type:     'direct' | 'transitive';
  vulns:    number;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

const PACKAGES: SbomEntry[] = [
  { name: 'next',                   version: '15.3.3',  license: 'MIT',         type: 'direct',     vulns: 0, severity: 'none'   },
  { name: 'react',                  version: '19.1.0',  license: 'MIT',         type: 'direct',     vulns: 0, severity: 'none'   },
  { name: 'react-dom',              version: '19.1.0',  license: 'MIT',         type: 'direct',     vulns: 0, severity: 'none'   },
  { name: '@tanstack/react-query',  version: '5.62.3',  license: 'MIT',         type: 'direct',     vulns: 0, severity: 'none'   },
  { name: 'zod',                    version: '3.24.1',  license: 'MIT',         type: 'direct',     vulns: 0, severity: 'none'   },
  { name: 'hono',                   version: '4.6.16',  license: 'MIT',         type: 'direct',     vulns: 0, severity: 'none'   },
  { name: 'drizzle-orm',            version: '0.38.3',  license: 'Apache-2.0',  type: 'direct',     vulns: 0, severity: 'none'   },
  { name: 'posthog-js',             version: '1.192.0', license: 'MIT',         type: 'direct',     vulns: 0, severity: 'none'   },
  { name: 'resend',                 version: '4.0.1',   license: 'MIT',         type: 'direct',     vulns: 0, severity: 'none'   },
  { name: 'lucide-react',           version: '0.468.0', license: 'ISC',         type: 'direct',     vulns: 0, severity: 'none'   },
  { name: 'webpack',                version: '5.96.1',  license: 'MIT',         type: 'transitive', vulns: 0, severity: 'none'   },
  { name: 'esbuild',                version: '0.24.2',  license: 'MIT',         type: 'transitive', vulns: 0, severity: 'none'   },
  { name: 'undici',                 version: '6.21.0',  license: 'MIT',         type: 'transitive', vulns: 1, severity: 'medium' },
  { name: 'ws',                     version: '8.18.0',  license: 'MIT',         type: 'transitive', vulns: 0, severity: 'none'   },
  { name: 'semver',                 version: '7.6.3',   license: 'ISC',         type: 'transitive', vulns: 0, severity: 'none'   },
  { name: 'micromatch',             version: '4.0.8',   license: 'MIT',         type: 'transitive', vulns: 0, severity: 'none'   },
  { name: '@opentelemetry/api',     version: '1.9.0',   license: 'Apache-2.0',  type: 'transitive', vulns: 0, severity: 'none'   },
  { name: 'node-fetch',             version: '3.3.2',   license: 'MIT',         type: 'transitive', vulns: 0, severity: 'none'   },
];

const TOTAL = PACKAGES.length;

const directCount    = PACKAGES.filter((p) => p.type === 'direct').length;
const transitiveCount= PACKAGES.filter((p) => p.type === 'transitive').length;
const vulnTotal      = PACKAGES.reduce((s, p) => s + p.vulns, 0);

function licenseColor(l: string): string {
  if (l === 'MIT')        return '#4ade80';
  if (l === 'ISC')        return '#60a5fa';
  if (l === 'Apache-2.0') return '#fbbf24';
  if (l === 'BSD-3-Clause') return '#a78bfa';
  return 'rgba(240,239,255,0.3)';
}

function sevColor(s: SbomEntry['severity']): string {
  if (s === 'critical') return '#f87171';
  if (s === 'high')     return '#fb923c';
  if (s === 'medium')   return '#fbbf24';
  if (s === 'low')      return '#60a5fa';
  return 'rgba(240,239,255,0.2)';
}

export default function SbomPanel() {
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

  const allDone    = revealed > TOTAL;
  const shownPkgs  = PACKAGES.slice(0, Math.max(0, Math.min(PACKAGES.length, revealed)));

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
          construx@dev-macbook — sbom scan
        </span>
        <span className="text-[8px]" style={{ color: allDone ? (vulnTotal > 0 ? '#fbbf24' : '#4ade80') : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${vulnTotal} vuln${vulnTotal !== 1 ? 's' : ''}` : 'scanning…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@dev-macbook:~/construx-website$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          syft . -o spdx-json | grype --add-cpes-if-none
        </span>
      </div>

      {/* Column headers */}
      {shownPkgs.length > 0 && (
        <div
          className="flex items-center px-4 py-0.5 text-[6.5px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ minWidth: '188px', flexShrink: 0 }}>Package</span>
          <span style={{ minWidth: '72px',  flexShrink: 0 }}>Version</span>
          <span style={{ minWidth: '88px',  flexShrink: 0 }}>License</span>
          <span style={{ minWidth: '80px',  flexShrink: 0 }}>Type</span>
          <span>Vulns</span>
        </div>
      )}

      {/* Rows */}
      <div className="px-4 py-1.5 space-y-0.5">
        {shownPkgs.map((p, i) => (
          <div
            key={i}
            className="flex items-center text-[7.5px] leading-[1.7]"
            style={{
              borderLeft: `2px solid ${p.vulns > 0 ? sevColor(p.severity) + '66' : p.type === 'direct' ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.04)'}`,
              paddingLeft: '4px',
            }}
          >
            <span style={{ color: p.type === 'direct' ? 'rgba(240,239,255,0.55)' : 'rgba(240,239,255,0.3)', minWidth: '188px', flexShrink: 0 }}>
              {p.name}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.28)', minWidth: '72px', flexShrink: 0 }}>{p.version}</span>
            <span style={{ color: licenseColor(p.license), minWidth: '88px', flexShrink: 0, fontSize: '7px' }}>{p.license}</span>
            <span style={{ color: p.type === 'direct' ? '#60a5fa' : 'rgba(240,239,255,0.2)', minWidth: '80px', flexShrink: 0, fontSize: '7px' }}>
              {p.type}
            </span>
            <span style={{ color: p.vulns > 0 ? sevColor(p.severity) : 'rgba(240,239,255,0.18)' }}>
              {p.vulns > 0 ? `${p.vulns} ${p.severity}` : '—'}
            </span>
          </div>
        ))}
      </div>

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>{directCount} direct</span>
          <span>{transitiveCount} transitive</span>
          <span style={{ color: vulnTotal > 0 ? '#fbbf24' : '#4ade80' }}>
            {vulnTotal > 0 ? `${vulnTotal} vulnerabilities` : '0 vulnerabilities'}
          </span>
          <span className="ml-auto">spdx-2.3 · syft 1.18.0 · grype 0.82.0</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          syft 1.18.0 · grype 0.82.0 · spdx-2.3
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? (vulnTotal > 0 ? '#fbbf24' : '#4ade80') : 'rgba(240,239,255,0.15)' }}>
          {allDone ? `● ${PACKAGES.length} packages` : 'loading'}
        </span>
      </div>
    </div>
  );
}
