'use client';

import { useState, useEffect, useRef } from 'react';

interface BrewPackage {
  name: string;
  version: string;
  category: string;
}

const PACKAGES: BrewPackage[] = [
  { name: 'node',          version: '22.14.0',   category: 'runtime' },
  { name: 'pnpm',          version: '10.6.5',    category: 'runtime' },
  { name: 'bun',           version: '1.2.8',     category: 'runtime' },
  { name: 'python@3.12',   version: '3.12.9',    category: 'runtime' },
  { name: 'git',           version: '2.48.1',    category: 'vcs' },
  { name: 'gh',            version: '2.65.0',    category: 'vcs' },
  { name: 'git-lfs',       version: '3.6.1',     category: 'vcs' },
  { name: 'postgresql@16', version: '16.6',      category: 'database' },
  { name: 'redis',         version: '7.4.2',     category: 'database' },
  { name: 'stripe',        version: '1.23.1',    category: 'cli' },
  { name: 'vercel-cli',    version: '40.1.0',    category: 'cli' },
  { name: 'aws-cli',       version: '2.24.1',    category: 'cli' },
  { name: 'httpie',        version: '3.2.4',     category: 'cli' },
  { name: 'jq',            version: '1.7.1',     category: 'cli' },
  { name: 'ripgrep',       version: '14.1.1',    category: 'cli' },
  { name: 'fzf',           version: '0.58.0',    category: 'cli' },
  { name: 'docker',        version: '27.5.1',    category: 'infra' },
  { name: 'kubectl',       version: '1.32.2',    category: 'infra' },
  { name: 'terraform',     version: '1.10.5',    category: 'infra' },
  { name: 'ffmpeg',        version: '7.1.1',     category: 'media' },
  { name: 'imagemagick',   version: '7.1.1',     category: 'media' },
];

const CATEGORY_COLORS: Record<string, string> = {
  runtime:  '#F97316',
  vcs:      '#4ade80',
  database: '#7dd3fc',
  cli:      '#a78bfa',
  infra:    '#67e8f9',
  media:    '#fbbf24',
};

const CATEGORIES = [...new Set(PACKAGES.map((p) => p.category))];

export default function BrewListPanel() {
  const [revealed, setRevealed] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
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
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > PACKAGES.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 55);
    return () => clearTimeout(id);
  }, [revealed]);

  return (
    <div
      ref={ref}
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
          construx@sys — homebrew packages
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.5)' }}>
          {PACKAGES.length} formulae
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          brew list --versions | sort | column -t
        </span>
      </div>

      {/* Package list by category */}
      <div className="px-4 py-3 space-y-4">
        {CATEGORIES.map((category) => {
          const catPackages = PACKAGES.filter((p) => p.category === category);
          const catColor = CATEGORY_COLORS[category] ?? '#ffffff';
          const startIdx = PACKAGES.findIndex((p) => p.category === category);

          return (
            <div key={category}>
              <div
                className="text-[7px] uppercase tracking-[0.2em] mb-1.5"
                style={{ color: `${catColor}80` }}
              >
                # {category}
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
                {catPackages.map((pkg, i) => {
                  const globalIdx = startIdx + i;
                  const visible = globalIdx < revealed;
                  return (
                    <div
                      key={pkg.name}
                      className="flex items-center gap-2 text-[8px]"
                      style={{
                        opacity: visible ? 1 : 0,
                        transition: 'opacity 0.1s ease',
                      }}
                    >
                      <span style={{ color: catColor, minWidth: '130px' }}>
                        {pkg.name}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.2)' }}>
                        {pkg.version}
                      </span>
                    </div>
                  );
                })}
              </div>
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
          macOS · homebrew {CATEGORIES.length} categories
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.4)' }}>
          all up to date
        </span>
      </div>
    </div>
  );
}
