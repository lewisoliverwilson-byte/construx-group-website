'use client';

import { useState, useEffect, useRef } from 'react';

interface CrateRow {
  step:     string;
  crate:    string;
  version:  string;
  features: string;
  ms:       number;
  isNew:    boolean;
}

const CRATES: CrateRow[] = [
  { step: 'Compiling', crate: 'proc-macro2',    version: '1.0.86',  features: '',                   ms:  840, isNew: false },
  { step: 'Compiling', crate: 'unicode-ident',  version: '1.0.13',  features: '',                   ms:  120, isNew: false },
  { step: 'Compiling', crate: 'quote',          version: '1.0.37',  features: '',                   ms:  234, isNew: false },
  { step: 'Compiling', crate: 'syn',            version: '2.0.77',  features: 'full,derive',         ms: 2841, isNew: false },
  { step: 'Compiling', crate: 'serde_derive',   version: '1.0.210', features: '',                   ms: 1920, isNew: false },
  { step: 'Compiling', crate: 'serde',          version: '1.0.210', features: 'derive',              ms:  380, isNew: false },
  { step: 'Compiling', crate: 'tokio-macros',   version: '2.4.0',   features: '',                   ms:  640, isNew: false },
  { step: 'Compiling', crate: 'tokio',          version: '1.40.0',  features: 'full',               ms: 4210, isNew: false },
  { step: 'Compiling', crate: 'hyper',          version: '1.4.1',   features: 'http1,http2,server',  ms: 2180, isNew: false },
  { step: 'Compiling', crate: 'axum',           version: '0.7.7',   features: '',                   ms: 3440, isNew: false },
  { step: 'Compiling', crate: 'tower',          version: '0.5.1',   features: 'full',               ms: 1870, isNew: false },
  { step: 'Compiling', crate: 'sqlx',           version: '0.8.2',   features: 'postgres,runtime-tokio', ms: 5920, isNew: false },
  { step: 'Compiling', crate: 'construx-api',   version: '0.1.0',   features: '',                   ms: 1240, isNew: true  },
  { step: 'Finished',  crate: 'release',        version: '',        features: '',                   ms:    0, isNew: false },
];

const BINARY = [
  { label: 'Binary',      value: 'target/release/construx-api' },
  { label: 'Size',        value: '22.4 MB' },
  { label: 'Stripped',    value: '8.1 MB' },
  { label: 'Build time',  value: '28.4s' },
  { label: 'Opt level',   value: '3' },
];

const TOTAL = CRATES.length + BINARY.length;

function msColor(ms: number): string {
  if (ms >= 4000) return '#f87171';
  if (ms >= 2000) return '#fbbf24';
  if (ms >= 1000) return '#fb923c';
  return 'rgba(240,239,255,0.3)';
}

function stepColor(step: string): string {
  if (step === 'Finished') return '#4ade80';
  return '#60a5fa';
}

export default function CargoPanel() {
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
    const id = setTimeout(() => setRevealed((r) => r + 1), 80);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone      = revealed > TOTAL;
  const shownCrates  = CRATES.slice(0, Math.max(0, Math.min(CRATES.length, revealed)));
  const shownBinary  = BINARY.slice(0, Math.max(0, Math.min(BINARY.length, revealed - CRATES.length)));

  const totalMs = CRATES.reduce((s, c) => s + c.ms, 0);

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
          construx@sys — cargo build --release
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? '28.4s' : 'compiling…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          cargo build --release --timings
        </span>
      </div>

      {/* Column headers */}
      {shownCrates.length > 0 && (
        <div
          className="flex items-center px-4 py-0.5 text-[6.5px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ minWidth: '68px',  flexShrink: 0 }}>Step</span>
          <span style={{ minWidth: '128px', flexShrink: 0 }}>Crate</span>
          <span style={{ minWidth: '64px',  flexShrink: 0 }}>Version</span>
          <span style={{ minWidth: '40px',  flexShrink: 0, textAlign: 'right' }}>ms</span>
          <span style={{ paddingLeft: '12px' }}>Features</span>
        </div>
      )}

      {/* Crate rows */}
      <div className="px-4 py-1.5 space-y-0.5">
        {shownCrates.map((c, i) => (
          <div
            key={i}
            className="flex items-center text-[7.5px] leading-[1.7]"
            style={{
              borderLeft: c.isNew ? '2px solid rgba(249,115,22,0.5)' : '2px solid transparent',
              paddingLeft: '4px',
            }}
          >
            <span style={{ color: stepColor(c.step), minWidth: '68px', flexShrink: 0, fontWeight: 700 }}>{c.step}</span>
            <span style={{ color: c.isNew ? 'rgba(249,115,22,0.85)' : 'rgba(240,239,255,0.5)', minWidth: '128px', flexShrink: 0, fontWeight: c.isNew ? 700 : 400 }}>{c.crate}</span>
            <span style={{ color: 'rgba(240,239,255,0.22)', minWidth: '64px', flexShrink: 0 }}>{c.version}</span>
            <span style={{ color: msColor(c.ms), minWidth: '40px', flexShrink: 0, textAlign: 'right' }}>
              {c.ms > 0 ? c.ms : ''}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.18)', paddingLeft: '12px', fontSize: '7px' }}>{c.features}</span>
          </div>
        ))}
      </div>

      {/* Binary info */}
      {shownBinary.length > 0 && (
        <div className="px-4 py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex flex-wrap gap-x-5 gap-y-0.5 text-[7.5px]">
            {shownBinary.map((b, i) => (
              <span key={i}>
                <span style={{ color: 'rgba(240,239,255,0.22)' }}>{b.label}: </span>
                <span style={{ color: i === 0 ? '#60a5fa' : i === 3 ? '#fbbf24' : '#4ade80' }}>{b.value}</span>
              </span>
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
          <span style={{ color: '#4ade80' }}>{CRATES.length - 1} crates compiled</span>
          <span>{(totalMs / 1000).toFixed(1)}s total (parallel)</span>
          <span className="ml-auto">rustc 1.82.0 · opt-level=3 · LTO=thin</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          cargo 1.82.0 · rustc 1.82.0-stable · linux/amd64
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● release build' : 'loading'}
        </span>
      </div>
    </div>
  );
}
