'use client';

import { useState, useEffect, useRef } from 'react';

interface Package {
  name:    string;
  version: string;
  accent:  string;
  tag?:    string;
}

const PACKAGES: Package[] = [
  { name: 'typescript',           version: '5.6.3',   accent: '#67e8f9',  tag: 'lang'   },
  { name: 'turbo',                version: '2.3.1',   accent: '#F97316',  tag: 'build'  },
  { name: 'wrangler',             version: '3.94.0',  accent: '#F97316',  tag: 'deploy' },
  { name: 'vercel',               version: '39.1.4',  accent: '#a78bfa',  tag: 'deploy' },
  { name: '@anthropic-ai/claude-code', version: '1.3.8', accent: '#fbbf24', tag: 'ai'  },
  { name: 'prisma',               version: '6.1.0',   accent: '#4ade80',  tag: 'db'     },
  { name: 'tsx',                  version: '4.19.2',  accent: '#67e8f9',  tag: 'runtime'},
  { name: '@playwright/test',     version: '1.49.0',  accent: '#a78bfa',  tag: 'test'   },
  { name: 'inngest',              version: '3.27.0',  accent: '#F97316',  tag: 'jobs'   },
  { name: '@antfu/ni',            version: '0.23.4',  accent: '#4ade80',  tag: 'util'   },
  { name: 'npx',                  version: '10.9.1',  accent: 'rgba(240,239,255,0.35)',  tag: 'util' },
  { name: 'npm-check-updates',    version: '17.1.14', accent: '#fbbf24',  tag: 'util'   },
];

function tagColor(tag?: string) {
  if (!tag) return 'rgba(240,239,255,0.2)';
  const map: Record<string, string> = {
    lang:    '#67e8f9',
    build:   '#F97316',
    deploy:  '#a78bfa',
    db:      '#4ade80',
    runtime: '#67e8f9',
    test:    '#a78bfa',
    jobs:    '#F97316',
    util:    'rgba(240,239,255,0.3)',
    ai:      '#fbbf24',
  };
  return map[tag] ?? 'rgba(240,239,255,0.2)';
}

export default function NpmGlobalPanel() {
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
    if (revealed === 0 || revealed > PACKAGES.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 85);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone = revealed > PACKAGES.length;

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
          construx@sys — global packages
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(249,115,22,0.6)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${PACKAGES.length} pkgs` : 'listing…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          npm list -g --depth=0
        </span>
      </div>

      {/* Package list */}
      <div className="px-4 py-2 space-y-1.5">
        {PACKAGES.slice(0, revealed).map((pkg, i) => (
          <div key={i} className="flex items-center gap-3 text-[8px] tabular-nums">
            <span style={{ color: 'rgba(240,239,255,0.25)', flexShrink: 0 }}>├──</span>
            <span style={{ color: pkg.accent, minWidth: '200px', flexShrink: 0, fontWeight: 600 }}>
              {pkg.name}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.4)', minWidth: '72px', flexShrink: 0 }}>
              @{pkg.version}
            </span>
            {pkg.tag && (
              <span
                className="text-[7px] uppercase tracking-widest px-1"
                style={{
                  color:        tagColor(pkg.tag),
                  border:       `1px solid ${tagColor(pkg.tag)}`,
                  opacity:      0.6,
                  borderRadius: '2px',
                  flexShrink:   0,
                }}
              >
                {pkg.tag}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          {PACKAGES.length} packages · node v22.14.0 · npm v10.9.2
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          /usr/local/lib
        </span>
      </div>
    </div>
  );
}
