'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'crit' | 'high' | 'med' | 'low' | 'fixed' | 'stat' | 'header' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# grype: container image + filesystem vulnerability scanner — SBOM-aware' },
  { kind: 'prompt',  text: 'grype construx/api:1.4.2 --scope AllLayers' },
  { kind: 'stat',    text: ' ✔ Vulnerability DB   [2032-09-14T08:00:00Z]' },
  { kind: 'stat',    text: ' ✔ Loaded image        construx/api:1.4.2' },
  { kind: 'stat',    text: ' ✔ Parsed image        241 packages across 12 layers' },
  { kind: 'blank',   text: '' },
  { kind: 'header',  text: 'NAME              INSTALLED   FIXED-IN    TYPE    VULNERABILITY   SEVERITY' },
  { kind: 'crit',    text: 'openssl           3.1.3       3.1.5       deb     CVE-2024-0727   Critical' },
  { kind: 'high',    text: 'libcurl4          8.4.0       8.6.0       deb     CVE-2024-2398   High' },
  { kind: 'high',    text: 'golang.org/x/net  0.21.0      0.23.0      go-mod  CVE-2024-27304  High' },
  { kind: 'med',     text: 'libgnutls30       3.8.1       3.8.4       deb     CVE-2024-28835  Medium' },
  { kind: 'med',     text: 'libexpat1         2.5.0       2.6.0       deb     CVE-2023-52425  Medium' },
  { kind: 'low',     text: 'zlib1g            1:1.3.dfsg  1:1.3.1     deb     CVE-2023-45853  Low' },
  { kind: 'fixed',   text: 'libc6             2.38-13     (none)      deb     CVE-2024-2961   Negligible' },
  { kind: 'blank',   text: '' },
  { kind: 'stat',    text: '7 vulnerabilities found  (1 critical, 2 high, 2 medium, 1 low, 1 negligible)' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# scan a filesystem path (CI: scan before pushing image)' },
  { kind: 'prompt',  text: 'grype dir:. --output table --fail-on high' },
  { kind: 'stat',    text: ' ✔ Indexed path  ./  (go.mod, package-lock.json, apt packages)' },
  { kind: 'high',    text: 'golang.org/x/crypto  0.18.0  0.21.0  go-mod  CVE-2023-48795  High' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# grype + syft SBOM: generate SBOM first, scan against it' },
  { kind: 'prompt',  text: 'syft construx/api:1.4.2 -o spdx-json > sbom.json && grype sbom:sbom.json' },
  { kind: 'stat',    text: ' ✔ SBOM loaded  421 packages  (spdx-json 2.3)' },
  { kind: 'stat',    text: ' ✔ Matched against Grype DB 2032-09-14  (558,241 known vulns)' },
  { kind: 'crit',    text: 'openssl 3.1.3 → CVE-2024-0727 Critical  fix: upgrade to 3.1.5' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'crit':    return '#f87171';
    case 'high':    return '#fb923c';
    case 'med':     return '#fbbf24';
    case 'low':     return '#67e8f9';
    case 'fixed':   return 'rgba(240,239,255,0.3)';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    case 'header':  return '#a78bfa';
    default:        return 'transparent';
  }
}

export default function GrypePanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [liveVulns, setLiveVulns] = useState(7);
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
            setLiveVulns(Math.floor(5 + Math.random() * 5));
          }, 2400);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 81;
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
          construx@prod-01 — grype · vulnerability scanner · SBOM-aware
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#f87171' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveVulns} vulns` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          grype · syft SBOM · CVE lookup · --fail-on high · CI gate
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>grype 0.79 ·</span>
          <span style={{ color: '#f87171' }}>{liveVulns} vulns found</span>
          <span style={{ color: '#fb923c' }}>1 critical · 2 high</span>
          <span style={{ color: '#4ade80' }}>241 packages scanned</span>
          <span style={{ color: '#a78bfa' }}>SBOM-aware · syft</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          grype · syft SBOM · CVE database · --fail-on high · 558k known vulns
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#f87171' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● scanning' : 'loading'}
        </span>
      </div>
    </div>
  );
}
