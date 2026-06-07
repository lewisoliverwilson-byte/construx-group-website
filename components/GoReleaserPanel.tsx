'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'build-ok' | 'build-warn' | 'build-err' | 'publish' | 'artifact' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',    text: '# goreleaser: build, package, and release Go binaries across all platforms' },
  { kind: 'prompt',     text: 'goreleaser release --clean' },
  { kind: 'stat',       text: '  • releasing using goreleaser 2.3.2...' },
  { kind: 'stat',       text: '  • loading config file  .goreleaser.yaml' },
  { kind: 'stat',       text: '  • loading environment variables' },
  { kind: 'blank',      text: '' },
  { kind: 'build-ok',   text: '  ✓ building binary  linux/amd64   construx-api_linux_amd64' },
  { kind: 'build-ok',   text: '  ✓ building binary  linux/arm64   construx-api_linux_arm64' },
  { kind: 'build-ok',   text: '  ✓ building binary  darwin/amd64  construx-api_darwin_amd64' },
  { kind: 'build-ok',   text: '  ✓ building binary  darwin/arm64  construx-api_darwin_arm64' },
  { kind: 'build-ok',   text: '  ✓ building binary  windows/amd64 construx-api_windows_amd64.exe' },
  { kind: 'blank',      text: '' },
  { kind: 'artifact',   text: '  ✓ creating archive  construx-api_linux_amd64.tar.gz    (12.4 MB)' },
  { kind: 'artifact',   text: '  ✓ creating archive  construx-api_linux_arm64.tar.gz    (11.8 MB)' },
  { kind: 'artifact',   text: '  ✓ creating archive  construx-api_darwin_arm64.tar.gz   (11.6 MB)' },
  { kind: 'artifact',   text: '  ✓ creating checksum  checksums.txt  (SHA256)' },
  { kind: 'blank',      text: '' },
  { kind: 'publish',    text: '  ✓ building docker image  construx/api:1.4.2  (linux/amd64 linux/arm64)' },
  { kind: 'publish',    text: '  ✓ pushing docker image   construx/api:1.4.2  → docker.io' },
  { kind: 'publish',    text: '  ✓ pushing docker image   construx/api:latest → docker.io' },
  { kind: 'blank',      text: '' },
  { kind: 'publish',    text: '  ✓ creating GitHub release  v1.4.2' },
  { kind: 'publish',    text: '  ✓ uploading artifacts     5 archives · 1 checksum → GitHub Releases' },
  { kind: 'stat',       text: '  • release succeeded after 1m47s' },
  { kind: 'stat',       text: '  • https://github.com/construx/api/releases/tag/v1.4.2' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':    return 'rgba(240,239,255,0.22)';
    case 'prompt':     return 'rgba(240,239,255,0.6)';
    case 'build-ok':   return '#4ade80';
    case 'build-warn': return '#fbbf24';
    case 'build-err':  return '#f87171';
    case 'publish':    return '#67e8f9';
    case 'artifact':   return '#a78bfa';
    case 'stat':       return 'rgba(240,239,255,0.45)';
    default:           return 'transparent';
  }
}

export default function GoReleaserPanel() {
  const [revealed,     setRevealed]     = useState(0);
  const [liveDuration, setLiveDuration] = useState(107);
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
            setLiveDuration(Math.floor(95 + Math.random() * 30));
          }, 2000);
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
          construx@prod-01 — goreleaser · multi-platform build and release
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveDuration}s build` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          goreleaser release · multi-arch · docker · GitHub Releases · checksums
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>goreleaser 2.3 ·</span>
          <span style={{ color: '#4ade80' }}>{liveDuration}s</span>
          <span style={{ color: '#a78bfa' }}>5 platforms</span>
          <span style={{ color: '#67e8f9' }}>docker multiarch</span>
          <span style={{ color: '#fbbf24' }}>GitHub release v1.4.2</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          goreleaser · multi-arch · docker push · GitHub Releases · SHA256 checksums
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● released' : 'loading'}
        </span>
      </div>
    </div>
  );
}
