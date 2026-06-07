'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'job-ok' | 'job-fail' | 'step-ok' | 'step-run' | 'step-skip' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# act: run GitHub Actions workflows locally using Docker' },
  { kind: 'prompt',   text: 'act push --job test --platform ubuntu-latest=catthehacker/ubuntu:act-22.04' },
  { kind: 'stat',     text: '[ci/test] 🚀 Start image=catthehacker/ubuntu:act-22.04' },
  { kind: 'stat',     text: '[ci/test] 🐳 docker pull catthehacker/ubuntu:act-22.04' },
  { kind: 'blank',    text: '' },
  { kind: 'step-run', text: '[ci/test] ⭐ Run Set up job' },
  { kind: 'step-ok',  text: '[ci/test] ✅ Success - Set up job' },
  { kind: 'step-run', text: '[ci/test] ⭐ Run actions/checkout@v4' },
  { kind: 'step-ok',  text: '[ci/test] ✅ Success - actions/checkout@v4' },
  { kind: 'step-run', text: '[ci/test] ⭐ Run actions/setup-go@v5 with go-version-file: go.mod' },
  { kind: 'step-ok',  text: '[ci/test] ✅ Success - actions/setup-go@v5' },
  { kind: 'step-run', text: '[ci/test] ⭐ Run Install dependencies' },
  { kind: 'step-ok',  text: '[ci/test] ✅ Success - Install dependencies  (12.4s)' },
  { kind: 'step-run', text: '[ci/test] ⭐ Run go test ./...' },
  { kind: 'stat',     text: '  ok  github.com/construx/api/internal/orders    0.841s' },
  { kind: 'stat',     text: '  ok  github.com/construx/api/internal/customers 1.204s' },
  { kind: 'stat',     text: '  ok  github.com/construx/api/internal/auth      0.312s' },
  { kind: 'step-ok',  text: '[ci/test] ✅ Success - go test ./...  (34.2s)' },
  { kind: 'blank',    text: '' },
  { kind: 'job-ok',   text: '[ci/test] 🏁 Job succeeded  (total: 52.7s)' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# list workflows and jobs — dry-run to see what would run' },
  { kind: 'prompt',   text: 'act push --list' },
  { kind: 'stat',     text: 'Stage  Job ID   Job name         Workflow name   Workflow file' },
  { kind: 'stat',     text: '  0    test     Unit tests       CI              .github/workflows/ci.yml' },
  { kind: 'stat',     text: '  0    lint     golangci-lint    CI              .github/workflows/ci.yml' },
  { kind: 'stat',     text: '  1    release  GoReleaser       Release         .github/workflows/release.yml' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':   return 'rgba(240,239,255,0.22)';
    case 'prompt':    return 'rgba(240,239,255,0.6)';
    case 'job-ok':    return '#4ade80';
    case 'job-fail':  return '#f87171';
    case 'step-ok':   return '#4ade80';
    case 'step-run':  return '#67e8f9';
    case 'step-skip': return '#a78bfa';
    case 'stat':      return 'rgba(240,239,255,0.45)';
    default:          return 'transparent';
  }
}

export default function ActPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveDurSec,  setLiveDurSec]  = useState(52.7);
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
            setLiveDurSec(Math.round((44 + Math.random() * 18) * 10) / 10);
          }, 2100);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 79;
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
          construx@prod-01 — act · GitHub Actions workflows running locally
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveDurSec}s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          act push · --job · --list · local Docker · no CI round-trip
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>act 0.2.61 ·</span>
          <span style={{ color: '#4ade80' }}>job succeeded · {liveDurSec}s</span>
          <span style={{ color: '#67e8f9' }}>3 steps passed</span>
          <span style={{ color: '#a78bfa' }}>Docker · ubuntu:act-22.04</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          act · local GitHub Actions · Docker runner · no CI push required
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● passed' : 'loading'}
        </span>
      </div>
    </div>
  );
}
