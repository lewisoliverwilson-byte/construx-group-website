'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'schema' | 'check' | 'expand' | 'write' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# spicedb: zanzibar-style authz — schema, check, expand, watch, zed cli' },
  { kind: 'prompt',   text: 'zed relationship read document:quarterly-report' },
  { kind: 'blank',    text: '' },
  { kind: 'schema',   text: '  document:quarterly-report  viewer  user:alice' },
  { kind: 'schema',   text: '  document:quarterly-report  viewer  group:finance#member' },
  { kind: 'schema',   text: '  document:quarterly-report  editor  user:bob' },
  { kind: 'schema',   text: '  document:quarterly-report  owner   user:carol' },
  { kind: 'blank',    text: '' },
  { kind: 'prompt',   text: 'zed permission check document:quarterly-report viewer user:alice' },
  { kind: 'check',    text: '  PERMISSIONSHIP_HAS_PERMISSION  (direct: viewer)' },
  { kind: 'blank',    text: '' },
  { kind: 'prompt',   text: 'zed permission expand document:quarterly-report viewer' },
  { kind: 'expand',   text: '  union: alice, bob (editor→viewer), carol (owner→editor→viewer)' },
  { kind: 'expand',   text: '       + finance group members (group:finance#member)' },
  { kind: 'write',    text: '  write: document:construx-roadmap#viewer@user:dana  zookie: 1f3c7e' },
  { kind: 'metric',   text: '  check-rps: {LIVE}/s  p99: 1.2ms  schema-version: 14  relations: 2.1M' },
  { kind: 'stat',     text: '  spicedb v1.33.0  crdb backend  newenemy-protection: enabled  tls: mTLS' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'schema':   return '#4ade80';
    case 'check':    return '#67e8f9';
    case 'expand':   return '#a78bfa';
    case 'write':    return '#fbbf24';
    case 'metric':   return 'rgba(240,239,255,0.5)';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function SpiceDbPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [checkRps,  setCheckRps]  = useState(4200);
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
            setCheckRps((c) => Math.floor(c + (Math.random() - 0.4) * 200));
          }, 2500);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 80;
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
          construx@spicedb — schema · check · expand · watch · zanzibar · authz
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#67e8f9' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${checkRps.toLocaleString()}/s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@spicedb# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          spicedb · zed · schema · check · expand · watch · zookie · crdb
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => {
          const text = l.kind === 'metric'
            ? l.text.replace('{LIVE}', checkRps.toLocaleString())
            : l.text;
          return (
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
                  {text}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Metadata */}
      {allDone && (
        <div
          className="flex items-center gap-4 flex-wrap px-4 py-1.5 text-[7.5px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>SpiceDB v1.33.0 ·</span>
          <span style={{ color: '#67e8f9' }}>{checkRps.toLocaleString()} checks/s</span>
          <span style={{ color: '#4ade80' }}>2.1M relations</span>
          <span style={{ color: '#a78bfa' }}>schema v14</span>
          <span style={{ color: '#fbbf24' }}>CockroachDB backend</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          spicedb · zanzibar · check · expand · watch · schema · authz
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#67e8f9' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● authorised' : 'loading'}
        </span>
      </div>
    </div>
  );
}
