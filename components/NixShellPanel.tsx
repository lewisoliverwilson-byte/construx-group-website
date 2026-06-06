'use client';

import { useState, useEffect, useRef } from 'react';

interface NixPkg {
  attr:    string;
  pname:   string;
  version: string;
  store:   string;
  kind:    'build' | 'dev' | 'shell';
}

interface NixEnv {
  key:   string;
  value: string;
}

interface HookLine {
  text:    string;
  color:   string;
}

const PKGS: NixPkg[] = [
  { attr: 'nodejs_22',        pname: 'nodejs',        version: '22.11.0', store: '/nix/store/aqz3j1b', kind: 'build' },
  { attr: 'bun',              pname: 'bun',            version: '1.1.38',  store: '/nix/store/9xkm2np', kind: 'build' },
  { attr: 'postgresql_16',    pname: 'postgresql',     version: '16.4',    store: '/nix/store/4p7rw0f', kind: 'build' },
  { attr: 'redis',            pname: 'redis',          version: '7.4.1',   store: '/nix/store/8nzq6sv', kind: 'build' },
  { attr: 'openssl',          pname: 'openssl',        version: '3.3.2',   store: '/nix/store/c1ld5xr', kind: 'build' },
  { attr: 'pkg-config',       pname: 'pkg-config',     version: '0.29.2',  store: '/nix/store/7gh4mwp', kind: 'dev'   },
  { attr: 'turbo',            pname: 'turbo',          version: '2.3.3',   store: '/nix/store/3fxqt9n', kind: 'dev'   },
  { attr: 'biome',            pname: 'biome',          version: '1.9.4',   store: '/nix/store/6rsy8dn', kind: 'dev'   },
  { attr: 'just',             pname: 'just',           version: '1.36.0',  store: '/nix/store/2vn0lhc', kind: 'dev'   },
  { attr: 'curl',             pname: 'curl',           version: '8.10.1',  store: '/nix/store/m9wdkq3', kind: 'shell' },
  { attr: 'jq',               pname: 'jq',             version: '1.7.1',   store: '/nix/store/k4bxrpz', kind: 'shell' },
  { attr: 'ripgrep',          pname: 'ripgrep',        version: '14.1.1',  store: '/nix/store/p1cjnh8', kind: 'shell' },
];

const ENV_VARS: NixEnv[] = [
  { key: 'NODE_ENV',          value: 'development'                         },
  { key: 'DATABASE_URL',      value: 'postgresql://localhost:5432/construx' },
  { key: 'REDIS_URL',         value: 'redis://localhost:6379'              },
  { key: 'PKG_CONFIG_PATH',   value: '/nix/store/c1ld5xr-openssl-3.3.2/lib/pkgconfig' },
  { key: 'SHELL',             value: '/run/current-system/sw/bin/zsh'      },
];

const HOOK_LINES: HookLine[] = [
  { text: '✓ node v22.11.0 (nodejs_22)',             color: '#4ade80'              },
  { text: '✓ bun 1.1.38',                            color: '#4ade80'              },
  { text: '✓ postgres (postgresql_16) ready',         color: '#4ade80'              },
  { text: '✓ redis-server ready',                     color: '#4ade80'              },
  { text: '→ Starting dev services...',               color: 'rgba(96,165,250,0.8)' },
  { text: '  [postgres] listening on port 5432',      color: 'rgba(240,239,255,0.3)'},
  { text: '  [redis]    listening on port 6379',      color: 'rgba(240,239,255,0.3)'},
  { text: '✓ construx dev environment ready',         color: '#fbbf24'              },
];

const TOTAL = PKGS.length + ENV_VARS.length + HOOK_LINES.length;

function kindColor(kind: NixPkg['kind']): string {
  if (kind === 'build') return '#60a5fa';
  if (kind === 'dev')   return '#a78bfa';
  return '#4ade80';
}

export default function NixShellPanel() {
  const [revealed, setRevealed]   = useState(0);
  const [elapsed,  setElapsed]    = useState(3241);
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
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 88);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((v) => v + Math.floor(Math.random() * 6) + 1);
    }, 1950);
    return () => clearInterval(id);
  }, []);

  const allDone      = revealed > TOTAL;
  const pkgOffset    = 0;
  const envOffset    = PKGS.length;
  const hookOffset   = PKGS.length + ENV_VARS.length;
  const shownPkgs    = PKGS.slice(0, Math.max(0, Math.min(PKGS.length, revealed - pkgOffset)));
  const shownEnv     = ENV_VARS.slice(0, Math.max(0, Math.min(ENV_VARS.length, revealed - envOffset)));
  const shownHook    = HOOK_LINES.slice(0, Math.max(0, Math.min(HOOK_LINES.length, revealed - hookOffset)));

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
          construx@dev-macbook — nix develop
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${elapsed}s uptime` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@dev-macbook:~/projects/construx-website$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>nix develop</span>
      </div>
      <div
        className="px-4 py-1 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <span className="text-[8px]" style={{ color: 'rgba(240,239,255,0.18)' }}>
          warning: Git tree is dirty — using working directory instead of fetching
        </span>
      </div>

      {/* Packages section */}
      {shownPkgs.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1 select-none" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — PACKAGES ({PKGS.length})
          </div>
          <div className="flex items-center text-[6.5px] uppercase tracking-widest mb-0.5 select-none" style={{ color: 'rgba(240,239,255,0.12)' }}>
            <span style={{ minWidth: '152px', flexShrink: 0 }}>Attribute</span>
            <span style={{ minWidth: '112px', flexShrink: 0 }}>pname</span>
            <span style={{ minWidth: '72px',  flexShrink: 0 }}>Version</span>
            <span style={{ minWidth: '52px',  flexShrink: 0 }}>Kind</span>
            <span>Store path</span>
          </div>
          <div className="space-y-0.5">
            {shownPkgs.map((p, i) => (
              <div
                key={i}
                className="flex items-center text-[7.5px] leading-[1.7]"
                style={{
                  borderLeft: `2px solid ${kindColor(p.kind)}33`,
                  paddingLeft: '4px',
                }}
              >
                <span style={{ color: 'rgba(240,239,255,0.5)', minWidth: '152px', flexShrink: 0 }}>{p.attr}</span>
                <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '112px', flexShrink: 0 }}>{p.pname}</span>
                <span style={{ color: '#60a5fa', minWidth: '72px', flexShrink: 0 }}>{p.version}</span>
                <span style={{ color: kindColor(p.kind), minWidth: '52px', flexShrink: 0, fontSize: '7px' }}>{p.kind}</span>
                <span style={{ color: 'rgba(240,239,255,0.18)', fontSize: '7px' }}>{p.store}…</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Env section */}
      {shownEnv.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1 select-none" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — ENVIRONMENT ({ENV_VARS.length} vars)
          </div>
          <div className="space-y-0.5">
            {shownEnv.map((e, i) => (
              <div
                key={i}
                className="flex items-start text-[7.5px] leading-[1.7]"
                style={{ borderLeft: '2px solid rgba(167,139,250,0.25)', paddingLeft: '4px' }}
              >
                <span style={{ color: '#a78bfa', minWidth: '168px', flexShrink: 0 }}>{e.key}</span>
                <span style={{ color: 'rgba(240,239,255,0.3)' }}>=</span>
                <span style={{ color: '#4ade80', marginLeft: '4px', wordBreak: 'break-all' }}>{e.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shell hook output */}
      {shownHook.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1 select-none" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — SHELL HOOK
          </div>
          <div className="space-y-0.5">
            {shownHook.map((h, i) => (
              <div
                key={i}
                className="text-[7.5px] leading-[1.7]"
                style={{ color: h.color }}
              >
                {h.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#60a5fa' }}>{PKGS.filter(p => p.kind === 'build').length} build inputs</span>
          <span style={{ color: '#a78bfa' }}>{PKGS.filter(p => p.kind === 'dev').length} dev inputs</span>
          <span style={{ color: '#4ade80' }}>{PKGS.filter(p => p.kind === 'shell').length} shell inputs</span>
          <span>{ENV_VARS.length} env vars</span>
          <span className="ml-auto" style={{ color: '#fbbf24' }}>● shell active · {elapsed}s</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          nix 2.25.3 · flake.nix · nixpkgs/nixos-unstable
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? `● ${PKGS.length} packages` : 'loading'}
        </span>
      </div>
    </div>
  );
}
