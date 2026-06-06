'use client';

import { useState, useEffect, useRef } from 'react';

interface ConfigEntry {
  key:     string;
  value:   string;
  section: string;
}

const BASE_CONFIG: ConfigEntry[] = [
  { section: 'user',   key: 'user.name',               value: 'Lewis Wilson' },
  { section: 'user',   key: 'user.email',              value: 'lewis@construxgroup.io' },
  { section: 'user',   key: 'user.signingkey',         value: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHYm...' },
  { section: 'core',   key: 'core.editor',             value: 'code --wait' },
  { section: 'core',   key: 'core.pager',              value: 'delta' },
  { section: 'core',   key: 'core.whitespace',         value: 'trailing-space,space-before-tab' },
  { section: 'core',   key: 'core.autocrlf',           value: 'input' },
  { section: 'core',   key: 'core.ignorecase',         value: 'false' },
  { section: 'init',   key: 'init.defaultbranch',      value: 'main' },
  { section: 'pull',   key: 'pull.rebase',             value: 'true' },
  { section: 'push',   key: 'push.autosetupremote',    value: 'true' },
  { section: 'push',   key: 'push.default',            value: 'current' },
  { section: 'commit', key: 'commit.gpgsign',          value: 'true' },
  { section: 'commit', key: 'commit.verbose',          value: 'true' },
  { section: 'gpg',    key: 'gpg.format',              value: 'ssh' },
  { section: 'alias',  key: 'alias.st',                value: 'status -sb' },
  { section: 'alias',  key: 'alias.co',                value: 'checkout' },
  { section: 'alias',  key: 'alias.br',                value: 'branch -vv' },
  { section: 'alias',  key: 'alias.lg',                value: "log --oneline --graph --decorate --all -20" },
  { section: 'alias',  key: 'alias.recent',            value: "branch --sort=-committerdate --format='%(refname:short) %(committerdate:relative)'" },
  { section: 'alias',  key: 'alias.unstage',           value: 'restore --staged' },
  { section: 'alias',  key: 'alias.undo',              value: 'reset HEAD~1 --soft' },
  { section: 'alias',  key: 'alias.wip',               value: "commit -am 'WIP: work in progress'" },
  { section: 'alias',  key: 'alias.fixup',             value: 'commit --fixup' },
  { section: 'delta',  key: 'delta.syntax-theme',      value: 'ansi' },
  { section: 'delta',  key: 'delta.line-numbers',      value: 'true' },
  { section: 'delta',  key: 'delta.side-by-side',      value: 'false' },
];

const SECTIONS = ['user', 'core', 'init', 'pull', 'push', 'commit', 'gpg', 'alias', 'delta'];

function sectionColor(s: string): string {
  if (s === 'user')   return '#a78bfa';
  if (s === 'alias')  return '#4ade80';
  if (s === 'core')   return '#67e8f9';
  if (s === 'commit') return '#fbbf24';
  if (s === 'delta')  return '#fb923c';
  return 'rgba(240,239,255,0.4)';
}

function keyColor(s: string): string {
  return sectionColor(s);
}

export default function GitConfigPanel() {
  const [revealed, setRevealed] = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > BASE_CONFIG.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 72);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone  = revealed > BASE_CONFIG.length;
  const displayed = BASE_CONFIG.slice(0, allDone ? BASE_CONFIG.length : revealed);

  const aliasCount = displayed.filter((e) => e.section === 'alias').length;

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
          construx@sys — git config
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${aliasCount} aliases` : 'reading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          git config --list --global --show-scope
        </span>
      </div>

      {/* Entries */}
      <div className="px-4 py-2 space-y-0.5">
        {displayed.map((e, i) => (
          <div key={i} className="flex items-start gap-2 text-[8px]">
            <span
              className="text-[7px] uppercase tracking-widest"
              style={{ color: sectionColor(e.section), minWidth: '44px', flexShrink: 0, paddingTop: '1px', opacity: 0.6 }}
            >
              global
            </span>
            <span style={{ color: keyColor(e.section), minWidth: '168px', flexShrink: 0 }}>
              {e.key}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.55)', lineHeight: 1.4 }}>
              {e.value}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          ~/.gitconfig · {BASE_CONFIG.length} keys · {SECTIONS.length} sections · git 2.48
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● done' : 'reading'}
        </span>
      </div>
    </div>
  );
}
