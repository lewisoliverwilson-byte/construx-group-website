'use client';

import { useState, useEffect, useRef } from 'react';

interface WorkspacePkg {
  name:     string;
  version:  string;
  path:     string;
  deps:     number;
  devDeps:  number;
  isApp:    boolean;
}

interface CatalogEntry {
  name:    string;
  version: string;
  usedBy:  number;
}

const PACKAGES: WorkspacePkg[] = [
  { name: 'website',            version: '0.1.0',  path: 'apps/website',    deps: 18, devDeps: 12, isApp: true  },
  { name: 'dashboard',          version: '0.1.0',  path: 'apps/dashboard',  deps: 14, devDeps: 10, isApp: true  },
  { name: '@construx/ui',       version: '1.4.2',  path: 'packages/ui',     deps: 4,  devDeps: 6,  isApp: false },
  { name: '@construx/db',       version: '1.2.0',  path: 'packages/db',     deps: 3,  devDeps: 2,  isApp: false },
  { name: '@construx/email',    version: '1.1.0',  path: 'packages/email',  deps: 2,  devDeps: 3,  isApp: false },
  { name: '@construx/utils',    version: '1.3.1',  path: 'packages/utils',  deps: 0,  devDeps: 4,  isApp: false },
  { name: '@construx/config',   version: '1.0.0',  path: 'packages/config', deps: 0,  devDeps: 2,  isApp: false },
];

const CATALOG: CatalogEntry[] = [
  { name: 'react',              version: '^19.1.0',  usedBy: 2 },
  { name: 'next',               version: '^15.3.3',  usedBy: 2 },
  { name: 'typescript',         version: '^5.5.4',   usedBy: 7 },
  { name: 'drizzle-orm',        version: '^0.42.0',  usedBy: 2 },
  { name: 'zod',                version: '^4.0.5',   usedBy: 6 },
  { name: 'tailwindcss',        version: '^3.4.17',  usedBy: 2 },
  { name: 'eslint',             version: '^9.17.0',  usedBy: 7 },
  { name: '@react-email/components', version: '^0.0.35', usedBy: 1 },
];

const TOTAL = PACKAGES.length + CATALOG.length;

function typeColor(isApp: boolean): string {
  return isApp ? 'rgba(249,115,22,0.7)' : '#60a5fa';
}

export default function PnpmWorkspacePanel() {
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
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 78);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone    = revealed > TOTAL;
  const shownPkgs  = PACKAGES.slice(0, Math.max(0, Math.min(PACKAGES.length, revealed)));
  const shownCat   = CATALOG.slice(0, Math.max(0, Math.min(CATALOG.length, revealed - PACKAGES.length)));

  const totalDeps  = PACKAGES.reduce((s, p) => s + p.deps + p.devDeps, 0);

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
          construx@sys — pnpm list --recursive
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${PACKAGES.length} packages` : 'resolving…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          pnpm list --recursive --depth=0 --json | jq &apos;.[].name,.version&apos;
        </span>
      </div>

      {/* Workspace packages */}
      {shownPkgs.length > 0 && (
        <div className="px-4 py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — workspace packages
          </div>
          <div
            className="flex items-center text-[6.5px] uppercase tracking-widest mb-0.5"
            style={{ color: 'rgba(240,239,255,0.14)' }}
          >
            <span style={{ minWidth: '144px', flexShrink: 0 }}>Package</span>
            <span style={{ minWidth: '56px',  flexShrink: 0 }}>Version</span>
            <span style={{ minWidth: '32px',  flexShrink: 0 }}>Type</span>
            <span style={{ minWidth: '40px',  flexShrink: 0, textAlign: 'right' }}>Deps</span>
            <span style={{ minWidth: '44px',  flexShrink: 0, textAlign: 'right' }}>devDeps</span>
            <span>Path</span>
          </div>
          <div className="space-y-0.5">
            {shownPkgs.map((p, i) => (
              <div key={i} className="flex items-center text-[7.5px] leading-[1.7]">
                <span style={{ color: typeColor(p.isApp), minWidth: '144px', flexShrink: 0, fontWeight: p.isApp ? 700 : 400 }}>{p.name}</span>
                <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '56px', flexShrink: 0 }}>{p.version}</span>
                <span style={{ color: p.isApp ? 'rgba(249,115,22,0.5)' : 'rgba(96,165,250,0.5)', minWidth: '32px', flexShrink: 0, fontSize: '6.5px' }}>
                  {p.isApp ? 'app' : 'pkg'}
                </span>
                <span style={{ color: '#4ade80', minWidth: '40px', flexShrink: 0, textAlign: 'right' }}>{p.deps}</span>
                <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '44px', flexShrink: 0, textAlign: 'right' }}>{p.devDeps}</span>
                <span style={{ color: 'rgba(240,239,255,0.18)', paddingLeft: '8px' }}>{p.path}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Catalog */}
      {shownCat.length > 0 && (
        <div className="px-4 py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — catalog (pnpm-workspace.yaml)
          </div>
          <div className="space-y-0.5">
            {shownCat.map((c, i) => (
              <div key={i} className="flex items-center text-[7.5px] leading-[1.7]">
                <span style={{ color: 'rgba(240,239,255,0.45)', minWidth: '196px', flexShrink: 0 }}>{c.name}</span>
                <span style={{ color: '#60a5fa', minWidth: '88px', flexShrink: 0 }}>{c.version}</span>
                <span style={{ color: 'rgba(240,239,255,0.2)', fontSize: '7px' }}>used by {c.usedBy} packages</span>
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
          <span style={{ color: 'rgba(249,115,22,0.7)' }}>2 apps</span>
          <span style={{ color: '#60a5fa' }}>5 packages</span>
          <span>{totalDeps} total deps</span>
          <span className="ml-auto">pnpm 9.15 · node 22 · catalog: default</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          pnpm 9.15.4 · workspace · catalog protocol
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? `● ${PACKAGES.length} workspaces` : 'loading'}
        </span>
      </div>
    </div>
  );
}
