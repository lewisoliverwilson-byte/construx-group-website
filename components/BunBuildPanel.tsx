'use client';

import { useState, useEffect, useRef } from 'react';

interface Chunk {
  name:     string;
  kind:     'entry' | 'chunk' | 'asset';
  rawKB:    number;
  gzipKB:   number;
  ms:       number;
  imports:  number;
}

interface Shaken {
  module:   string;
  removed:  number;
  kept:     number;
}

const CHUNKS: Chunk[] = [
  { name: 'index.js',                kind: 'entry',  rawKB: 42.8,  gzipKB: 14.1, ms: 218,  imports: 94  },
  { name: 'dashboard.js',            kind: 'entry',  rawKB: 67.3,  gzipKB: 21.4, ms: 304,  imports: 142 },
  { name: 'chunk-react-dom.js',      kind: 'chunk',  rawKB: 131.4, gzipKB: 41.8, ms: 91,   imports: 1   },
  { name: 'chunk-vendors.js',        kind: 'chunk',  rawKB: 88.2,  gzipKB: 28.3, ms: 113,  imports: 23  },
  { name: 'chunk-ui-components.js',  kind: 'chunk',  rawKB: 34.1,  gzipKB: 11.2, ms: 67,   imports: 38  },
  { name: 'chunk-date-fns.js',       kind: 'chunk',  rawKB: 19.7,  gzipKB: 7.3,  ms: 44,   imports: 6   },
  { name: 'chunk-zod.js',            kind: 'chunk',  rawKB: 12.3,  gzipKB: 4.8,  ms: 31,   imports: 4   },
  { name: 'styles.css',              kind: 'asset',  rawKB: 8.6,   gzipKB: 2.1,  ms: 22,   imports: 0   },
  { name: 'chunk-utils.js',          kind: 'chunk',  rawKB: 6.4,   gzipKB: 2.6,  ms: 19,   imports: 11  },
  { name: 'favicon.ico',             kind: 'asset',  rawKB: 1.1,   gzipKB: 0.9,  ms: 4,    imports: 0   },
];

const SHAKEN: Shaken[] = [
  { module: 'lodash',      removed: 312, kept: 4  },
  { module: 'date-fns',    removed: 203, kept: 12 },
  { module: '@radix-ui',   removed: 87,  kept: 31 },
  { module: 'lucide-react',removed: 671, kept: 18 },
  { module: 'zod',         removed: 9,   kept: 61 },
  { module: '@construx/ui',removed: 14,  kept: 43 },
];

const TOTAL = CHUNKS.length + SHAKEN.length + 1;

function kindColor(kind: Chunk['kind']): string {
  if (kind === 'entry') return '#f97316';
  if (kind === 'chunk') return '#60a5fa';
  return '#a78bfa';
}

function sizeColor(kb: number): string {
  if (kb > 100) return '#f87171';
  if (kb > 40)  return '#fbbf24';
  return '#4ade80';
}

function msColor(ms: number): string {
  if (ms > 200) return '#f87171';
  if (ms > 80)  return '#fbbf24';
  return 'rgba(240,239,255,0.35)';
}

const totalRaw  = CHUNKS.reduce((s, c) => s + c.rawKB,  0);
const totalGzip = CHUNKS.reduce((s, c) => s + c.gzipKB, 0);
const totalMs   = Math.max(...CHUNKS.map((c) => c.ms));
const totalRemoved = SHAKEN.reduce((s, sh) => s + sh.removed, 0);

export default function BunBuildPanel() {
  const [revealed, setRevealed] = useState(0);
  const [buildMs,  setBuildMs]  = useState(totalMs);
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
    const id = setTimeout(() => setRevealed((r) => r + 1), 86);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => {
      setBuildMs((v) => {
        const delta = Math.round((Math.random() - 0.5) * 12);
        return Math.max(280, Math.min(420, v + delta));
      });
    }, 2100);
    return () => clearInterval(id);
  }, []);

  const allDone       = revealed > TOTAL;
  const shownChunks   = CHUNKS.slice(0, Math.max(0, Math.min(CHUNKS.length, revealed)));
  const shakenOffset  = CHUNKS.length;
  const shownShaken   = SHAKEN.slice(0, Math.max(0, Math.min(SHAKEN.length, revealed - shakenOffset)));
  const showSummary   = revealed > CHUNKS.length + SHAKEN.length;

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
          construx@dev-macbook — bun build
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${buildMs}ms` : 'building…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@dev-macbook:~/projects/construx-website$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          bun build ./src/index.tsx --outdir ./dist --minify --sourcemap --splitting
        </span>
      </div>

      {/* Chunks section */}
      {shownChunks.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div
            className="text-[7px] uppercase tracking-widest mb-1 select-none"
            style={{ color: 'rgba(240,239,255,0.16)' }}
          >
            — CHUNKS ({CHUNKS.length})
          </div>
          {/* Column headers */}
          <div
            className="flex items-center text-[6.5px] uppercase tracking-widest mb-0.5 select-none"
            style={{ color: 'rgba(240,239,255,0.12)' }}
          >
            <span style={{ minWidth: '184px', flexShrink: 0 }}>File</span>
            <span style={{ minWidth: '48px',  flexShrink: 0 }}>Kind</span>
            <span style={{ minWidth: '60px',  flexShrink: 0, textAlign: 'right' }}>Raw</span>
            <span style={{ minWidth: '60px',  flexShrink: 0, textAlign: 'right' }}>Gzip</span>
            <span style={{ minWidth: '52px',  flexShrink: 0, textAlign: 'right' }}>Time</span>
            <span style={{ minWidth: '48px',  flexShrink: 0, textAlign: 'right' }}>Imports</span>
          </div>
          <div className="space-y-0.5">
            {shownChunks.map((c, i) => (
              <div
                key={i}
                className="flex items-center text-[7.5px] leading-[1.7]"
                style={{
                  borderLeft: `2px solid ${kindColor(c.kind)}33`,
                  paddingLeft: '4px',
                }}
              >
                <span style={{ color: 'rgba(240,239,255,0.5)', minWidth: '184px', flexShrink: 0 }}>{c.name}</span>
                <span style={{ color: kindColor(c.kind), minWidth: '48px', flexShrink: 0, fontSize: '7px' }}>{c.kind}</span>
                <span style={{ color: sizeColor(c.rawKB), minWidth: '60px', flexShrink: 0, textAlign: 'right' }}>{c.rawKB.toFixed(1)} kB</span>
                <span style={{ color: 'rgba(240,239,255,0.28)', minWidth: '60px', flexShrink: 0, textAlign: 'right' }}>{c.gzipKB.toFixed(1)} kB</span>
                <span style={{ color: msColor(c.ms), minWidth: '52px', flexShrink: 0, textAlign: 'right' }}>{c.ms}ms</span>
                <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '48px', flexShrink: 0, textAlign: 'right' }}>{c.imports}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tree-shaking section */}
      {shownShaken.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div
            className="text-[7px] uppercase tracking-widest mb-1 select-none"
            style={{ color: 'rgba(240,239,255,0.16)' }}
          >
            — TREE-SHAKE ({SHAKEN.length} modules)
          </div>
          <div
            className="flex items-center text-[6.5px] uppercase tracking-widest mb-0.5 select-none"
            style={{ color: 'rgba(240,239,255,0.12)' }}
          >
            <span style={{ minWidth: '160px', flexShrink: 0 }}>Module</span>
            <span style={{ minWidth: '80px',  flexShrink: 0, textAlign: 'right' }}>Removed</span>
            <span style={{ minWidth: '80px',  flexShrink: 0, textAlign: 'right' }}>Kept</span>
            <span>Efficiency</span>
          </div>
          <div className="space-y-0.5">
            {shownShaken.map((sh, i) => {
              const pct = Math.round((sh.removed / (sh.removed + sh.kept)) * 100);
              return (
                <div
                  key={i}
                  className="flex items-center text-[7.5px] leading-[1.7]"
                  style={{
                    borderLeft: '2px solid rgba(74,222,128,0.18)',
                    paddingLeft: '4px',
                  }}
                >
                  <span style={{ color: 'rgba(240,239,255,0.45)', minWidth: '160px', flexShrink: 0 }}>{sh.module}</span>
                  <span style={{ color: '#f87171', minWidth: '80px', flexShrink: 0, textAlign: 'right' }}>−{sh.removed}</span>
                  <span style={{ color: '#4ade80', minWidth: '80px', flexShrink: 0, textAlign: 'right' }}>+{sh.kept}</span>
                  <span style={{ color: pct >= 90 ? '#4ade80' : pct >= 70 ? '#fbbf24' : '#f87171', fontSize: '7px' }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      {showSummary && (
        <div
          className="flex items-center gap-4 flex-wrap px-4 py-1.5 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(240,239,255,0.28)' }}
        >
          <span style={{ color: '#4ade80' }}>{totalRaw.toFixed(1)} kB raw</span>
          <span style={{ color: '#60a5fa' }}>{totalGzip.toFixed(1)} kB gzip</span>
          <span style={{ color: '#f87171' }}>{totalRemoved} exports removed</span>
          <span>{CHUNKS.length} chunks</span>
          <span className="ml-auto" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
            {allDone ? `● done in ${buildMs}ms` : 'building…'}
          </span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          bun 1.1.38 · --minify --sourcemap --splitting · target: browser
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? `● ${CHUNKS.length} outputs` : 'loading'}
        </span>
      </div>
    </div>
  );
}
