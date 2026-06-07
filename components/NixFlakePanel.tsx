'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind =
  | 'prompt'
  | 'comment'
  | 'nix-building'
  | 'nix-fetching'
  | 'nix-done'
  | 'shell-info'
  | 'lock-entry'
  | 'lock-hash'
  | 'pkg-version'
  | 'success'
  | 'blank';

interface NixLine {
  kind:  LineKind;
  text:  string;
  delay?: number;
}

const LINES: NixLine[] = [
  { kind: 'prompt',       text: 'lewis@construx:~/construx-api$ nix develop' },
  { kind: 'nix-fetching', text: 'warning: Git tree \'/home/lewis/construx-api\' is dirty' },
  { kind: 'nix-building', text: 'building \'construx-api-shell\'...' },
  { kind: 'nix-fetching', text: 'fetching path \'/nix/store/0abc...nodejs_22\'... (42.3 MiB)' },
  { kind: 'nix-fetching', text: 'fetching path \'/nix/store/1def...bun-1.1.38\'... (12.1 MiB)' },
  { kind: 'nix-fetching', text: 'fetching path \'/nix/store/2ghi...postgresql_16\'... (18.7 MiB)' },
  { kind: 'nix-fetching', text: 'fetching path \'/nix/store/3jkl...kubectl-1.31.3\'... (9.4 MiB)' },
  { kind: 'nix-fetching', text: 'fetching path \'/nix/store/4mno...terraform-1.10.0\'... (22.1 MiB)' },
  { kind: 'nix-done',     text: 'these 24 paths will be fetched (104.6 MiB)' },
  { kind: 'blank',        text: '' },
  { kind: 'shell-info',   text: 'construx dev environment' },
  { kind: 'shell-info',   text: 'node v22.11.0 | bun 1.1.38 | pg (PostgreSQL) 16.6' },
  { kind: 'blank',        text: '' },
  { kind: 'prompt',       text: 'lewis@construx:~/construx-api [nix]$ nix flake show' },
  { kind: 'nix-building', text: '├── devShells' },
  { kind: 'nix-building', text: '│   ├── aarch64-darwin' },
  { kind: 'nix-building', text: '│   │   └── default: development environment \'nix-shell\'' },
  { kind: 'nix-building', text: '│   └── x86_64-linux' },
  { kind: 'nix-building', text: '│       └── default: development environment \'nix-shell\'' },
  { kind: 'nix-building', text: '└── packages' },
  { kind: 'nix-building', text: '    └── x86_64-linux' },
  { kind: 'nix-building', text: '        └── default: package \'construx-api-1.4.2\'' },
  { kind: 'blank',        text: '' },
  { kind: 'prompt',       text: 'lewis@construx:~/construx-api [nix]$ nix build . --print-out-paths' },
  { kind: 'nix-fetching', text: 'building \'construx-api-1.4.2.drv\'...' },
  { kind: 'nix-done',     text: '/nix/store/a3f9b2c1d4e5f6a7-construx-api-1.4.2' },
  { kind: 'blank',        text: '' },
  { kind: 'prompt',       text: 'lewis@construx:~/construx-api [nix]$ cat flake.lock | jq \'.nodes.nixpkgs.locked.rev\'' },
  { kind: 'lock-hash',    text: '"ae2e6b3d4c1f9a2b7e4d8c3f1a9b2e4d8c3f1a9b"' },
  { kind: 'blank',        text: '' },
  { kind: 'prompt',       text: 'lewis@construx:~/construx-api [nix]$ nix store verify ./result' },
  { kind: 'success',      text: 'all 24 paths in result are valid' },
];

const TOTAL = LINES.length + 2;

function lineColor(kind: LineKind): string {
  switch (kind) {
    case 'nix-building': return 'rgba(240,239,255,0.38)';
    case 'nix-fetching': return 'rgba(240,239,255,0.25)';
    case 'nix-done':     return '#fbbf24';
    case 'shell-info':   return '#4ade80';
    case 'lock-entry':   return 'rgba(240,239,255,0.35)';
    case 'lock-hash':    return '#fbbf24';
    case 'pkg-version':  return '#4ade80';
    case 'success':      return '#4ade80';
    default:             return 'transparent';
  }
}

export default function NixFlakePanel() {
  const [revealed, setRevealed] = useState(0);
  const [buildHash, setBuildHash] = useState('a3f9b2c1d4e5f6a7');
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
            const chars = '0123456789abcdef';
            setBuildHash(Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * 16)]).join(''));
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
    const line = LINES[revealed - 1];
    const delay = line?.delay ?? (line?.kind === 'blank' ? 35 : 78);
    const id = setTimeout(() => setRevealed((r) => r + 1), delay);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed > TOTAL && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setBuildHash('a3f9b2c1d4e5f6a7');
    }
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
          construx@construx-api — nix flakes
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : '#fbbf24' }}>
          {allDone ? `REPRODUCIBLE /nix/store/${buildHash}` : 'building…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@local$ </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          nix develop · nix build · flake-pinned environment
        </span>
      </div>

      {/* Content */}
      <div className="px-4 pt-3 pb-2">
        {shownLines.map((line, i) => {
          if (line.kind === 'blank') return <div key={i} className="h-2" />;
          if (line.kind === 'prompt') {
            const idx = line.text.indexOf('$ ');
            const prompt = line.text.slice(0, idx + 2);
            const cmd    = line.text.slice(idx + 2);
            return (
              <div key={i} className="text-[7.5px] leading-[1.75]">
                <span style={{ color: 'rgba(74,222,128,0.5)' }}>{prompt}</span>
                <span style={{ color: 'rgba(240,239,255,0.55)' }}>{cmd}</span>
              </div>
            );
          }
          return (
            <div key={i} className="text-[7.5px] leading-[1.75]" style={{ color: lineColor(line.kind) }}>
              {line.text}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          nix 2.25.3 · nixpkgs 24.11 · flakes · deterministic builds
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● 24 paths verified' : 'loading'}
        </span>
      </div>
    </div>
  );
}
