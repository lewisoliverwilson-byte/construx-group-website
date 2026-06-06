'use client';

import { useState, useEffect, useRef } from 'react';

interface EnvEntry {
  key:   string;
  value: string;
  cat:   'system' | 'path' | 'dev' | 'cloud' | 'app' | 'shell';
}

const ENTRIES: EnvEntry[] = [
  { key: 'COLORTERM',        value: 'truecolor',                                          cat: 'shell' },
  { key: 'EDITOR',           value: 'nvim',                                               cat: 'shell' },
  { key: 'GIT_AUTHOR_EMAIL', value: 'lewis@construxgroup.io',                             cat: 'dev' },
  { key: 'GIT_AUTHOR_NAME',  value: 'Lewis Wilson',                                       cat: 'dev' },
  { key: 'GOPATH',           value: '/home/lewis/go',                                     cat: 'dev' },
  { key: 'HOME',             value: '/home/lewis',                                        cat: 'system' },
  { key: 'LANG',             value: 'en_GB.UTF-8',                                        cat: 'system' },
  { key: 'NEXT_PUBLIC_APP_URL', value: 'https://construxgroup.io',                        cat: 'app' },
  { key: 'NODE_ENV',         value: 'development',                                        cat: 'dev' },
  { key: 'NODE_OPTIONS',     value: '--enable-source-maps --max-old-space-size=4096',     cat: 'dev' },
  { key: 'NPM_CONFIG_FUND',  value: '0',                                                  cat: 'dev' },
  { key: 'NVM_DIR',          value: '/home/lewis/.nvm',                                   cat: 'dev' },
  { key: 'PATH',             value: '/home/lewis/.bun/bin:/home/lewis/.cargo/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin', cat: 'path' },
  { key: 'PNPM_HOME',        value: '/home/lewis/.local/share/pnpm',                     cat: 'dev' },
  { key: 'SHELL',            value: '/bin/zsh',                                           cat: 'shell' },
  { key: 'SSH_AUTH_SOCK',    value: '/run/user/1000/keyring/ssh',                         cat: 'system' },
  { key: 'TERM',             value: 'xterm-256color',                                     cat: 'shell' },
  { key: 'TERM_PROGRAM',     value: 'tmux',                                               cat: 'shell' },
  { key: 'TZ',               value: 'Europe/London',                                      cat: 'system' },
  { key: 'USER',             value: 'lewis',                                              cat: 'system' },
  { key: 'VISUAL',           value: 'nvim',                                               cat: 'shell' },
  { key: 'XDG_CONFIG_HOME',  value: '/home/lewis/.config',                                cat: 'system' },
];

function keyColor(cat: EnvEntry['cat']): string {
  if (cat === 'path')   return '#f97316';
  if (cat === 'dev')    return '#4ade80';
  if (cat === 'cloud')  return '#a78bfa';
  if (cat === 'app')    return '#67e8f9';
  if (cat === 'shell')  return '#fbbf24';
  return '#60a5fa';
}

function valColor(cat: EnvEntry['cat']): string {
  if (cat === 'path')   return 'rgba(249,115,22,0.6)';
  if (cat === 'dev')    return 'rgba(74,222,128,0.7)';
  if (cat === 'cloud')  return 'rgba(167,139,250,0.7)';
  if (cat === 'app')    return 'rgba(103,232,249,0.7)';
  if (cat === 'shell')  return 'rgba(251,191,36,0.7)';
  return 'rgba(96,165,250,0.7)';
}

export default function EnvPanel() {
  const [revealed, setRevealed] = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > ENTRIES.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 78);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone  = revealed > ENTRIES.length;
  const displayed = ENTRIES.slice(0, allDone ? ENTRIES.length : revealed);

  const catCounts: Record<string, number> = {};
  for (const e of displayed) catCounts[e.cat] = (catCounts[e.cat] ?? 0) + 1;

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
          construx@sys — printenv | sort
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${ENTRIES.length} vars` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          printenv | sort | grep -v SECRET
        </span>
      </div>

      {/* Env entries */}
      <div className="px-4 py-2 space-y-0.5">
        {displayed.map((entry, i) => (
          <div key={i} className="flex items-start text-[8px] leading-[1.6]">
            <span style={{ color: keyColor(entry.cat), flexShrink: 0, fontWeight: 700, minWidth: '200px' }}>
              {entry.key}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.2)', flexShrink: 0 }}>=</span>
            <span
              style={{
                color:      valColor(entry.cat),
                overflow:   'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth:   '340px',
                marginLeft: '2px',
              }}
            >
              {entry.value}
            </span>
          </div>
        ))}
      </div>

      {/* Category legend */}
      {allDone && (
        <div
          className="flex flex-wrap items-center gap-3 px-4 py-1.5 select-none"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
        >
          {(Object.entries(catCounts) as [string, number][]).map(([cat, n]) => (
            <span key={cat} className="flex items-center gap-1 text-[8px]">
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: keyColor(cat as EnvEntry['cat']) }} />
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>{cat} ({n})</span>
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          {ENTRIES.length} variables · zsh 5.9 · linux 6.8.4 · secrets redacted
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● done' : 'loading'}
        </span>
      </div>
    </div>
  );
}
