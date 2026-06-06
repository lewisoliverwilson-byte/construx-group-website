'use client';

import { useState, useEffect } from 'react';

const ROWS = [
  { key: 'OS',       value: 'macOS Sequoia 15.4.1 arm64' },
  { key: 'Host',     value: 'MacBook Pro (M3 Pro, Nov 2023)' },
  { key: 'Kernel',   value: 'Darwin 24.4.0' },
  { key: 'Shell',    value: 'zsh 5.9' },
  { key: 'CPU',      value: 'Apple M3 Pro (11-core)' },
  { key: 'GPU',      value: 'Apple M3 Pro (18-core)' },
  { key: 'Memory',   value: '18.0 GiB' },
  { key: 'Disk',     value: '494G / 1.0T (SSD)' },
  { key: 'Node',     value: 'v22.14.0 (LTS)' },
  { key: 'npm',      value: '10.9.2' },
  { key: 'Git',      value: '2.48.1' },
  { key: 'Editor',   value: 'VS Code 1.99.1' },
  { key: 'Terminal', value: 'iTerm2 3.5.12' },
  { key: 'Uptime',   value: '12 days, 4 hrs' },
];

const PALETTE = [
  '#FF5F57', '#FFBD2E', '#28C840', '#007AFF',
  '#5AC8FA', '#AF52DE', '#FF2D55', '#FF9500',
];

export default function NeofetchPanel() {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (revealed >= ROWS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 80);
    return () => clearTimeout(id);
  }, [revealed]);

  return (
    <div
      className="overflow-hidden font-mono"
      style={{
        background: 'rgba(1,1,10,0.97)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '3px',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.6)',
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
          construx@sys — system info
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.45)' }}>
          neofetch
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>neofetch --config none</span>
      </div>

      {/* Body */}
      <div className="flex gap-0">
        {/* ASCII logo */}
        <div
          className="px-5 py-4 flex-shrink-0 select-none"
          style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}
        >
          {[
            '  ██████╗██╗  ██╗',
            ' ██╔════╝╚██╗██╔╝',
            ' ██║      ╚███╔╝ ',
            ' ██║      ██╔██╗ ',
            ' ╚██████╗██╔╝ ██╗',
            '  ╚═════╝╚═╝  ╚═╝',
          ].map((line, i) => (
            <div
              key={i}
              className="text-[8px] leading-[1.4] tracking-tight"
              style={{
                color: 'rgba(249,115,22,0.7)',
                opacity: revealed > 0 ? 1 : 0,
                transition: 'opacity 0.3s ease',
                transitionDelay: `${i * 50}ms`,
              }}
            >
              {line}
            </div>
          ))}
          <div
            className="mt-3 flex gap-1 flex-wrap"
            style={{ opacity: revealed >= ROWS.length ? 1 : 0, transition: 'opacity 0.5s ease' }}
          >
            {PALETTE.map((c) => (
              <span
                key={c}
                className="inline-block w-3 h-3 rounded-sm"
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {/* Info rows */}
        <div className="flex-1 px-5 py-4 space-y-1">
          <div className="mb-2">
            <span className="text-[9px]" style={{ color: 'rgba(249,115,22,0.85)' }}>construx</span>
            <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>@</span>
            <span className="text-[9px]" style={{ color: 'rgba(249,115,22,0.85)' }}>sys</span>
          </div>
          <div
            className="text-[8px] mb-3"
            style={{ color: 'rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}
          >
            {'─'.repeat(28)}
          </div>
          {ROWS.map((row, i) => (
            <div
              key={row.key}
              className="flex items-center text-[8px]"
              style={{
                opacity: i < revealed ? 1 : 0,
                transform: i < revealed ? 'translateX(0)' : 'translateX(-4px)',
                transition: 'opacity 0.18s ease, transform 0.18s ease',
              }}
            >
              <span
                className="uppercase tracking-widest"
                style={{ color: 'rgba(249,115,22,0.75)', minWidth: '72px' }}
              >
                {row.key}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.12)' }}>: </span>
              <span style={{ color: 'rgba(240,239,255,0.55)' }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          dev machine · macOS
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.4)' }}>
          {ROWS.length} fields
        </span>
      </div>
    </div>
  );
}
