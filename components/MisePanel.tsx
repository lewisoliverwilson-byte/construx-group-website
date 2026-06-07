'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'tool-ok' | 'tool-install' | 'tool-warn' | 'config' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',      text: '# mise: polyglot dev tool version manager — replaces nvm, pyenv, rbenv, sdkman' },
  { kind: 'prompt',       text: 'mise install' },
  { kind: 'tool-ok',      text: 'mise  node@22.4.0        already installed' },
  { kind: 'tool-install', text: 'mise  python@3.12.4      installing...' },
  { kind: 'tool-ok',      text: 'mise  python@3.12.4      installed  (12.4s)' },
  { kind: 'tool-ok',      text: 'mise  go@1.22.5          already installed' },
  { kind: 'tool-ok',      text: 'mise  bun@1.1.18         already installed' },
  { kind: 'tool-ok',      text: 'mise  rust@1.79.0        already installed' },
  { kind: 'blank',        text: '' },
  { kind: 'comment',      text: '# .mise.toml — project-level tool versions' },
  { kind: 'config',       text: '[tools]' },
  { kind: 'config',       text: 'node    = "22.4.0"' },
  { kind: 'config',       text: 'python  = "3.12.4"' },
  { kind: 'config',       text: 'go      = "1.22.5"' },
  { kind: 'config',       text: 'bun     = "1.1.18"' },
  { kind: 'config',       text: 'rust    = "stable"' },
  { kind: 'blank',        text: '' },
  { kind: 'comment',      text: '# List all installed versions' },
  { kind: 'prompt',       text: 'mise list' },
  { kind: 'tool-ok',      text: 'node     22.4.0   ~/.local/share/mise/installs/node/22.4.0' },
  { kind: 'tool-ok',      text: 'python   3.12.4   ~/.local/share/mise/installs/python/3.12.4' },
  { kind: 'tool-ok',      text: 'go       1.22.5   ~/.local/share/mise/installs/go/1.22.5' },
  { kind: 'tool-ok',      text: 'bun      1.1.18   ~/.local/share/mise/installs/bun/1.1.18' },
  { kind: 'blank',        text: '' },
  { kind: 'comment',      text: '# Check active version in this directory' },
  { kind: 'prompt',       text: 'mise current' },
  { kind: 'stat',         text: 'node    22.4.0   .mise.toml' },
  { kind: 'stat',         text: 'python  3.12.4   .mise.toml' },
  { kind: 'stat',         text: 'bun     1.1.18   .mise.toml' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':      return 'rgba(240,239,255,0.22)';
    case 'prompt':       return 'rgba(240,239,255,0.6)';
    case 'tool-ok':      return '#4ade80';
    case 'tool-install': return '#fbbf24';
    case 'tool-warn':    return '#f87171';
    case 'config':       return '#67e8f9';
    case 'stat':         return '#a78bfa';
    default:             return 'transparent';
  }
}

export default function MisePanel() {
  const [revealed,   setRevealed]   = useState(0);
  const [liveTools,  setLiveTools]  = useState(5);
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
            setLiveTools(4 + Math.floor(Math.random() * 4));
          }, 2300);
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
          construx@dev — mise · polyglot tool version manager
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveTools} tools` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@dev# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          mise · .mise.toml · node / python / go / bun / rust
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>mise 2024.7 ·</span>
          <span style={{ color: '#4ade80' }}>{liveTools} tools active</span>
          <span style={{ color: '#67e8f9' }}>.mise.toml per project</span>
          <span style={{ color: '#a78bfa' }}>no nvm / pyenv / rbenv</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          mise 2024.7 · node · python · go · bun · rust · .mise.toml
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● active' : 'loading'}
        </span>
      </div>
    </div>
  );
}
