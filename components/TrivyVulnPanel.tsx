'use client';

import { useState, useEffect, useRef } from 'react';

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface Vuln {
  id:          string;
  severity:    Severity;
  pkg:         string;
  installed:   string;
  fixed:       string;
  title:       string;
}

interface LayerStat {
  layer:    string;
  size:     string;
  vulns:    number;
}

const VULNS: Vuln[] = [
  { id: 'CVE-2024-3094',  severity: 'CRITICAL', pkg: 'xz-utils',  installed: '5.4.5',  fixed: '5.4.6',   title: 'Backdoor in liblzma — supply chain compromise' },
  { id: 'CVE-2024-32002', severity: 'HIGH',     pkg: 'git',       installed: '2.43.0', fixed: '2.43.4',  title: 'Arbitrary code execution via recursive clone' },
  { id: 'CVE-2023-50387', severity: 'HIGH',     pkg: 'bind9',     installed: '9.18.21', fixed: '9.18.24', title: 'KeyTrap: DNSSEC validation denial of service' },
  { id: 'CVE-2024-2961',  severity: 'MEDIUM',   pkg: 'glibc',     installed: '2.39',   fixed: '2.39-1',  title: 'iconv out-of-bounds write in ISO-2022-CN-EXT' },
  { id: 'CVE-2024-26461', severity: 'LOW',      pkg: 'krb5',      installed: '1.21.2', fixed: '1.21.3',  title: 'Memory leak in Kerberos GSSAPI library' },
];

const LAYERS: LayerStat[] = [
  { layer: 'base (ubuntu:24.04)',          size: '29.5MB', vulns: 3 },
  { layer: 'RUN apt-get install -y ...',   size: '142MB',  vulns: 2 },
  { layer: 'COPY --from=builder /app ...',  size: '18.3MB', vulns: 0 },
];

const TOTAL = 3 + VULNS.length + 2 + LAYERS.length + 3;

function sevColor(s: Severity): string {
  if (s === 'CRITICAL') return '#f87171';
  if (s === 'HIGH')     return '#fb923c';
  if (s === 'MEDIUM')   return '#fbbf24';
  return '#94a3b8';
}

function sevBg(s: Severity): string {
  if (s === 'CRITICAL') return 'rgba(248,113,113,0.1)';
  if (s === 'HIGH')     return 'rgba(251,146,60,0.08)';
  if (s === 'MEDIUM')   return 'rgba(251,191,36,0.07)';
  return 'rgba(148,163,184,0.06)';
}

export default function TrivyVulnPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [liveTotal, setLiveTotal] = useState(5);
  const ref      = useRef<HTMLDivElement>(null);
  const started  = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
          timerRef.current = setInterval(() => {
            setLiveTotal((t) => (t === 5 ? 5 : 5));
          }, 2200);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 83);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const allDone     = revealed > TOTAL;
  const vulnStart   = 3;
  const layerStart  = vulnStart + VULNS.length + 2;

  const shownVulns  = VULNS.slice(0,  Math.max(0, revealed - vulnStart));
  const shownLayers = LAYERS.slice(0, Math.max(0, revealed - layerStart));

  const critCount = VULNS.filter((v) => v.severity === 'CRITICAL').length;
  const highCount = VULNS.filter((v) => v.severity === 'HIGH').length;

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
          construx@ci-01 — trivy image scan · construx-api:2.4.1
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? (critCount > 0 ? '#f87171' : '#fbbf24') : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${critCount} critical · ${highCount} high` : 'scanning…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>ci@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          trivy image --format table --exit-code 1 construx-api:2.4.1
        </span>
      </div>

      {/* Image info */}
      {revealed > 2 && (
        <div className="px-4 pt-1.5 pb-1 text-[7.5px]" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ color: 'rgba(240,239,255,0.3)' }}>Image: </span>
          <span style={{ color: '#67e8f9' }}>construx-api:2.4.1</span>
          <span style={{ color: 'rgba(240,239,255,0.18)' }}> · </span>
          <span style={{ color: 'rgba(240,239,255,0.3)' }}>OS: </span>
          <span style={{ color: 'rgba(240,239,255,0.55)' }}>ubuntu 24.04</span>
          <span style={{ color: 'rgba(240,239,255,0.18)' }}> · </span>
          <span style={{ color: 'rgba(240,239,255,0.3)' }}>Total size: </span>
          <span style={{ color: 'rgba(240,239,255,0.55)' }}>189.8MB</span>
        </div>
      )}

      {/* Vulnerability table */}
      {shownVulns.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1.5" style={{ color: 'rgba(240,239,255,0.18)' }}>
            Vulnerabilities — {VULNS.length} found
          </div>
          <div
            className="flex items-center text-[6.5px] uppercase tracking-widest mb-1"
            style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '2px' }}
          >
            <span style={{ minWidth: '110px', flexShrink: 0 }}>CVE ID</span>
            <span style={{ minWidth: '72px', flexShrink: 0 }}>Severity</span>
            <span style={{ minWidth: '80px', flexShrink: 0 }}>Package</span>
            <span style={{ minWidth: '60px', flexShrink: 0 }}>Installed</span>
            <span style={{ minWidth: '60px', flexShrink: 0 }}>Fixed In</span>
            <span>Title</span>
          </div>
          {shownVulns.map((v) => (
            <div
              key={v.id}
              className="flex items-center text-[7.5px] leading-[1.85] px-1"
              style={{ background: shownVulns.indexOf(v) % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}
            >
              <span style={{ color: sevColor(v.severity), minWidth: '110px', flexShrink: 0, fontFamily: 'monospace' }}>{v.id}</span>
              <span
                style={{ color: sevColor(v.severity), background: sevBg(v.severity), minWidth: '72px', flexShrink: 0, padding: '0 4px', borderRadius: '2px', fontSize: '6.5px', fontWeight: 700, letterSpacing: '0.08em' }}
              >
                {v.severity}
              </span>
              <span style={{ color: 'rgba(240,239,255,0.5)', minWidth: '80px', flexShrink: 0 }}>{v.pkg}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', minWidth: '60px', flexShrink: 0 }}>{v.installed}</span>
              <span style={{ color: '#4ade80', minWidth: '60px', flexShrink: 0 }}>{v.fixed}</span>
              <span style={{ color: 'rgba(240,239,255,0.28)' }}>{v.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Layer breakdown */}
      {shownLayers.length > 0 && (
        <div className="px-4 pt-2 pb-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.18)' }}>
            Vulnerable layers
          </div>
          {shownLayers.map((l, i) => (
            <div key={i} className="flex items-center text-[7.5px] leading-[1.85]">
              <span style={{ color: l.vulns > 0 ? (l.vulns > 2 ? '#f87171' : '#fbbf24') : '#4ade80', minWidth: '24px', flexShrink: 0 }}>
                {l.vulns > 0 ? `${l.vulns}✕` : '✓'}
              </span>
              <span style={{ color: 'rgba(240,239,255,0.45)', minWidth: '260px', flexShrink: 0 }}>{l.layer}</span>
              <span style={{ color: 'rgba(240,239,255,0.25)' }}>{l.size}</span>
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
          <span style={{ color: '#f87171' }}>{critCount} critical</span>
          <span style={{ color: '#fb923c' }}>{highCount} high</span>
          <span style={{ color: '#fbbf24' }}>1 medium</span>
          <span style={{ color: '#94a3b8' }}>1 low</span>
          <span style={{ color: '#f87171' }}>exit code 1 — scan failed</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          trivy 0.57.1 · db: 2032-02-21T06:00:00Z · scanner: vuln
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#f87171' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● patch required' : 'loading'}
        </span>
      </div>
    </div>
  );
}
