'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'build-ok' | 'sync' | 'deploy-ok' | 'log' | 'watch' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',   text: '# skaffold: inner-loop Kubernetes dev — watch, build, deploy, stream logs' },
  { kind: 'prompt',    text: 'skaffold dev --profile dev' },
  { kind: 'stat',      text: 'Listing files to watch... Generating tags...' },
  { kind: 'build-ok',  text: '✔  [1.2s] Building image construx/api:d3f9a12' },
  { kind: 'deploy-ok', text: '✔  [8.4s] kubectl apply → Deployment/construx-api configured' },
  { kind: 'deploy-ok', text: '✔  [0.3s] Deployments stabilized' },
  { kind: 'watch',     text: '   Press Ctrl+C to exit' },
  { kind: 'blank',     text: '' },
  { kind: 'log',       text: '[construx-api] 09:00:01 INFO  server listening on :8080' },
  { kind: 'log',       text: '[construx-api] 09:00:04 INFO  GET /orders 200 2.1ms' },
  { kind: 'log',       text: '[construx-api] 09:00:07 WARN  slow query 482ms table=orders' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# edit static file → file sync (no rebuild, ~100ms)' },
  { kind: 'sync',      text: 'Syncing 1 files for construx/api:d3f9a12' },
  { kind: 'sync',      text: '  web/static/styles.css → /app/static/styles.css' },
  { kind: 'watch',     text: 'Watching for changes...' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# edit Go source → rebuild and redeploy' },
  { kind: 'build-ok',  text: '✔  [2.8s] Building image construx/api:e4a1b23' },
  { kind: 'deploy-ok', text: '✔  [9.1s] kubectl rollout → 2/2 pods ready' },
  { kind: 'log',       text: '[construx-api] 09:01:14 INFO  server listening on :8080' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# skaffold run: build, deploy, exit (CI mode)' },
  { kind: 'prompt',    text: 'skaffold run --profile staging --file-output=images.json' },
  { kind: 'build-ok',  text: '✔  [4.2s] pushed registry.construx.io/construx/api:v1.8.3' },
  { kind: 'deploy-ok', text: '✔  Deploy complete. Wrote build artifacts to images.json' },
  { kind: 'stat',      text: 'Helm release construx-api v1.8.3 → construx-staging' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':   return 'rgba(240,239,255,0.22)';
    case 'prompt':    return 'rgba(240,239,255,0.6)';
    case 'build-ok':  return '#4ade80';
    case 'sync':      return '#67e8f9';
    case 'deploy-ok': return '#a78bfa';
    case 'log':       return 'rgba(240,239,255,0.5)';
    case 'watch':     return '#fbbf24';
    case 'stat':      return 'rgba(240,239,255,0.45)';
    default:          return 'transparent';
  }
}

export default function SkaffoldPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveCycleMs, setLiveCycleMs] = useState(8400);
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
            setLiveCycleMs(Math.floor(7000 + Math.random() * 3000));
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
          construx@dev-01 — skaffold · kubernetes inner-loop dev
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveCycleMs}ms` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@dev-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          skaffold dev · build · deploy · sync · profiles · logs
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Skaffold v2 ·</span>
          <span style={{ color: '#4ade80' }}>build ok</span>
          <span style={{ color: '#67e8f9' }}>file sync</span>
          <span style={{ color: '#a78bfa' }}>deployed</span>
          <span style={{ color: '#fbbf24' }}>{liveCycleMs}ms cycle</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          skaffold · kubernetes · docker · helm · file-sync · profiles · CI
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● watching' : 'loading'}
        </span>
      </div>
    </div>
  );
}
