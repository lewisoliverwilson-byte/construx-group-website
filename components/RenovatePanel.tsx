'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'dep' | 'pr' | 'update' | 'schedule' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# renovate: automated dependency updates — grouped PRs, schedules, automerge' },
  { kind: 'prompt',   text: 'renovate --dry-run --log-level=debug 2>&1 | grep "update"' },
  { kind: 'blank',    text: '' },
  { kind: 'dep',      text: '  node  next 15.3.3 → 15.4.1  type: patch  automerge: true' },
  { kind: 'dep',      text: '  node  @types/react 19.0.4 → 19.1.0  type: minor  grouped: react' },
  { kind: 'dep',      text: '  go    k8s.io/client-go v0.31.0 → v0.32.1  type: minor  grouped: k8s' },
  { kind: 'dep',      text: '  helm  grafana/loki 6.6.3 → 6.7.0  type: minor  grouped: charts' },
  { kind: 'dep',      text: '  docker  node:22.4-alpine → 22.5-alpine  type: patch  automerge: true' },
  { kind: 'blank',    text: '' },
  { kind: 'prompt',   text: 'gh pr list --label renovate --state open' },
  { kind: 'blank',    text: '' },
  { kind: 'pr',       text: '  #1847  chore(deps): update k8s group  minor  age: 1h  checks: ✔' },
  { kind: 'pr',       text: '  #1846  chore(deps): update react group  minor  age: 2h  checks: ✔' },
  { kind: 'pr',       text: '  #1843  chore(deps): update helm charts  minor  age: 6h  checks: ✔' },
  { kind: 'update',   text: '  automerged: 12 patch PRs this week  next-run: 03:00 UTC' },
  { kind: 'schedule', text: '  schedule: ["before 5am on monday"]  timezone: Europe/London' },
  { kind: 'metric',   text: '  open-prs: {LIVE}  automerged-30d: 91  outdated-deps: 0  vulnerabilities: 0' },
  { kind: 'stat',     text: '  renovate v37.420.4  github-app  repos: 6  datasource: npm/go/helm/docker' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'dep':      return '#4ade80';
    case 'pr':       return '#a78bfa';
    case 'update':   return '#fbbf24';
    case 'schedule': return '#67e8f9';
    case 'metric':   return 'rgba(240,239,255,0.5)';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function RenovatePanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [openPrs,   setOpenPrs]   = useState(3);
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
            setOpenPrs((c) => Math.max(0, c + (Math.random() > 0.85 ? 1 : 0)));
          }, 5000);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 80;
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
          construx@renovate — deps · groups · automerge · schedule · github-app
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${openPrs} open PRs` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@renovate# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          renovate · deps · groups · automerge · schedule · npm · go · helm · docker
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => {
          const text = l.kind === 'metric'
            ? l.text.replace('{LIVE}', String(openPrs))
            : l.text;
          return (
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
                  {text}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Metadata */}
      {allDone && (
        <div
          className="flex items-center gap-4 flex-wrap px-4 py-1.5 text-[7.5px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Renovate v37.420.4 ·</span>
          <span style={{ color: '#a78bfa' }}>{openPrs} open</span>
          <span style={{ color: '#fbbf24' }}>91 automerged</span>
          <span style={{ color: '#4ade80' }}>0 outdated</span>
          <span style={{ color: '#67e8f9' }}>weekly schedule</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          renovate · deps · groups · automerge · schedule · npm · go · helm · docker
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● up to date' : 'loading'}
        </span>
      </div>
    </div>
  );
}
