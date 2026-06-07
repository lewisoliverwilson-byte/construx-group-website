'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'crit' | 'high' | 'med' | 'pass' | 'sbom' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# trivy: container, IaC, and K8s vulnerability scanner + SBOM' },
  { kind: 'prompt',  text: 'trivy image --severity HIGH,CRITICAL construx/api:v1.8.3' },
  { kind: 'stat',    text: 'construx/api:v1.8.3 (alpine 3.20.2)' },
  { kind: 'crit',    text: '  libcurl     CVE-2024-12345  CRITICAL  8.5.0 → 8.6.0' },
  { kind: 'high',    text: '  openssl     CVE-2024-67890  HIGH      3.2.1 → 3.2.2' },
  { kind: 'stat',    text: '  Total: 2  (CRITICAL: 1  HIGH: 1)' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# scan IaC — Terraform misconfigurations' },
  { kind: 'prompt',  text: 'trivy config ./terraform/' },
  { kind: 'crit',    text: '  FAIL  RDS not publicly accessible       rds.tf:28' },
  { kind: 'high',    text: '  FAIL  S3 public access not blocked      s3.tf:15' },
  { kind: 'pass',    text: '  PASS  EKS secrets encryption enabled' },
  { kind: 'pass',    text: '  PASS  RDS backup retention > 7 days' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# generate SBOM in CycloneDX format' },
  { kind: 'prompt',  text: 'trivy image --format cyclonedx --output sbom.json construx/api:v1.8.3' },
  { kind: 'sbom',    text: '  components: 142  (os: 48  go: 94)' },
  { kind: 'sbom',    text: '  licenses: MIT(62) Apache-2.0(48) BSD-3(32)' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# CI: fail build on CRITICAL (exit code 1)' },
  { kind: 'prompt',  text: 'trivy image --exit-code 1 --ignore-unfixed --severity CRITICAL construx/api:v1.8.4' },
  { kind: 'pass',    text: '  ✓  No CRITICAL vulnerabilities found (after upgrade)' },
  { kind: 'stat',    text: '  exit code 0 → build continues' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'crit':    return '#f87171';
    case 'high':    return '#fb923c';
    case 'med':     return '#fbbf24';
    case 'pass':    return '#4ade80';
    case 'sbom':    return '#67e8f9';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    default:        return 'transparent';
  }
}

export default function TrivyPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [liveVulns, setLiveVulns] = useState(2);
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
            setLiveVulns(Math.floor(1 + Math.random() * 4));
          }, 2350);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 82;
    const id = setTimeout(() => setRevealed((r) => r + 1), delay);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const allDone    = revealed > TOTAL;
  const shownLines = LINES.slice(0, Math.max(0, revealed - 1));

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
          construx@ci-01 — trivy · vulnerability scanner · SBOM
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#f87171' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveVulns} critical` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@ci-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          trivy · image · config · IaC · Kubernetes · SBOM · CycloneDX
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => (
          <div
            key={i}
            className="text-[7.5px] leading-[1.8]"
            style={{ color: lineColor(l.kind) }}
          >
            {l.kind === 'blank' ? ' ' : (
              <>
                {l.kind === 'prompt' && (
                  <span style={{ color: 'rgba(74,222,128,0.45)', marginRight: '6px' }}>$</span>
                )}
                {l.text}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Metadata */}
      {allDone && (
        <div
          className="flex items-center gap-4 flex-wrap px-4 py-1.5 text-[7.5px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Trivy v0.58 ·</span>
          <span style={{ color: '#f87171' }}>{liveVulns} critical</span>
          <span style={{ color: '#4ade80' }}>IaC pass</span>
          <span style={{ color: '#67e8f9' }}>SBOM 142 components</span>
          <span style={{ color: '#a78bfa' }}>CycloneDX</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          trivy · CVE · SBOM · CycloneDX · SPDX · IaC · Kubernetes · CI
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● scanned' : 'loading'}
        </span>
      </div>
    </div>
  );
}
