'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'run-ok' | 'run-cached' | 'run-fail' | 'push' | 'artifact' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',    text: '# dagger: portable CI pipelines as code — Go, Python, TypeScript' },
  { kind: 'prompt',     text: 'dagger run go run ./ci/main.go' },
  { kind: 'stat',       text: '✔  Dagger Engine v0.14.0 started' },
  { kind: 'run-ok',     text: '✔  [0.3s] source: Host.directory(".") loaded' },
  { kind: 'run-cached', text: '●  [0.0s] go-mod-cache hit (go.sum unchanged)' },
  { kind: 'run-cached', text: '●  [0.0s] go-build-cache hit (no source changes)' },
  { kind: 'run-ok',     text: '✔  [4.2s] go test -race ./... → 3 packages, 0 failures' },
  { kind: 'run-ok',     text: '✔  [2.1s] go build -ldflags "-s -w" -o /out/api ./cmd/api' },
  { kind: 'artifact',   text: '   exported: ./dist/construx-api (12.4 MB)' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# container build + test + push (secrets never logged)' },
  { kind: 'prompt',     text: 'dagger call publish --src . --version v1.8.3' },
  { kind: 'run-ok',     text: '✔  [1.3s] Container.build(Dockerfile)' },
  { kind: 'run-ok',     text: '✔  [0.8s] container-structure-test: 6/6 passed' },
  { kind: 'push',       text: '↑  registry.construx.io/construx/api:v1.8.3' },
  { kind: 'push',       text: '↑  registry.construx.io/construx/api:latest' },
  { kind: 'stat',       text: 'sha256:4a9f2b1c…  (published 2 tags)' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# inspect what ran vs what was cached' },
  { kind: 'prompt',     text: 'dagger run --debug go run ./ci/main.go 2>&1 | tail -8' },
  { kind: 'run-cached', text: '●  [0ms]  FromImage golang:1.23-alpine  (cache)' },
  { kind: 'run-cached', text: '●  [0ms]  MountedCache go-mod-cache     (cache)' },
  { kind: 'run-ok',     text: '✔  [320ms] Exec go test -race ./...      (run)' },
  { kind: 'run-ok',     text: '✔  [190ms] Exec go build ./cmd/api       (run)' },
  { kind: 'stat',       text: 'total: 4 ops  cache: 2  run: 2  (510ms elapsed)' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# list available Dagger module functions' },
  { kind: 'prompt',     text: 'dagger functions' },
  { kind: 'stat',       text: 'build    Build binary from source' },
  { kind: 'stat',       text: 'test     Run tests with race detector' },
  { kind: 'stat',       text: 'lint     golangci-lint with config' },
  { kind: 'stat',       text: 'publish  Build image and push to registry' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':    return 'rgba(240,239,255,0.22)';
    case 'prompt':     return 'rgba(240,239,255,0.6)';
    case 'run-ok':     return '#4ade80';
    case 'run-cached': return '#67e8f9';
    case 'run-fail':   return '#f87171';
    case 'push':       return '#fbbf24';
    case 'artifact':   return '#a78bfa';
    case 'stat':       return 'rgba(240,239,255,0.45)';
    default:           return 'transparent';
  }
}

export default function DaggerPanel() {
  const [revealed,   setRevealed]   = useState(0);
  const [liveDurMs,  setLiveDurMs]  = useState(510);
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
            setLiveDurMs(Math.floor(420 + Math.random() * 180));
          }, 2050);
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
          construx@prod-01 — dagger · pipelines as code
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveDurMs}ms` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          dagger run · build · test · publish · cache · module
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Dagger v0.14.0 ·</span>
          <span style={{ color: '#4ade80' }}>tests pass</span>
          <span style={{ color: '#67e8f9' }}>2 cache hits</span>
          <span style={{ color: '#fbbf24' }}>2 tags pushed</span>
          <span style={{ color: '#a78bfa' }}>{liveDurMs}ms total</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          dagger · BuildKit · pipeline-as-code · Go · content-cache · CI/CD
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● shipped' : 'loading'}
        </span>
      </div>
    </div>
  );
}
