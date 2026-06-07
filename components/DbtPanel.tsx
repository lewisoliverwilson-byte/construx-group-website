'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'model' | 'test' | 'pass' | 'fail' | 'source' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# dbt: sql-first data transformation — models, tests, lineage dag' },
  { kind: 'prompt',  text: 'dbt build --target prod' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# dependency order: staging views → incremental marts → table' },
  { kind: 'model',   text: '  1/24  stg_orders           view        CREATE VIEW    0.31s' },
  { kind: 'model',   text: '  2/24  stg_tenants          view        CREATE VIEW    0.28s' },
  { kind: 'model',   text: '  3/24  orders_daily         incremental MERGE          1.82s' },
  { kind: 'model',   text: '  4/24  tenant_summary       table       CREATE TABLE   2.14s' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# schema tests: unique, not_null, accepted_values, relationships' },
  { kind: 'pass',    text: '  PASS  unique_stg_orders_order_id                    0.11s' },
  { kind: 'pass',    text: '  PASS  not_null_stg_orders_tenant_id                 0.09s' },
  { kind: 'pass',    text: '  PASS  accepted_values_stg_orders_status             0.12s' },
  { kind: 'pass',    text: '  PASS  relationships_stg_orders_tenant_id→stg_tenant 0.18s' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# source freshness: raw.orders ingested 0:04:12 ago (warn >6h)' },
  { kind: 'source',  text: '  raw.orders   OK   last loaded: 0:04:12 ago  (warn: 6h)' },
  { kind: 'source',  text: '  raw.tenants  OK   last loaded: 0:08:41 ago  (warn: 6h)' },
  { kind: 'metric',  text: '  24 models  68 tests  0 warnings  0 errors  run: 33.21s' },
  { kind: 'stat',    text: '  PASS=92 WARN=0 ERROR=0 SKIP=0  dbt 1.8.2  snowflake' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'model':   return '#67e8f9';
    case 'pass':    return '#4ade80';
    case 'fail':    return '#f87171';
    case 'source':  return '#a78bfa';
    case 'test':    return '#fbbf24';
    case 'metric':  return 'rgba(240,239,255,0.5)';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    default:        return 'transparent';
  }
}

export default function DbtPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [liveTests, setLiveTests] = useState(68);
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
            setLiveTests(64 + Math.floor(Math.random() * 10));
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
          construx@analytics — dbt · models · tests · lineage · incremental
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveTests} tests` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@analytics# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          dbt · build · models · tests · source-freshness · lineage · incremental
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => (
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
                {l.text}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Metadata */}
      {allDone && (
        <div
          className="flex items-center gap-4 flex-wrap px-4 py-1.5 text-[7.5px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>dbt 1.8.2 ·</span>
          <span style={{ color: '#4ade80' }}>{liveTests} tests pass</span>
          <span style={{ color: '#67e8f9' }}>24 models</span>
          <span style={{ color: '#a78bfa' }}>sources fresh</span>
          <span style={{ color: '#fbbf24' }}>lineage DAG</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          dbt · models · tests · sources · incremental · lineage
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● all pass' : 'loading'}
        </span>
      </div>
    </div>
  );
}
