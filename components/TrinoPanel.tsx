'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'catalog' | 'query' | 'plan' | 'result' | 'worker' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# trino: distributed sql federation — iceberg + postgres + kafka' },
  { kind: 'prompt',  text: 'trino --server trino.construx.internal --catalog iceberg --schema analytics' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# catalogs: iceberg (s3), postgres (live), kafka (streaming)' },
  { kind: 'catalog', text: '  iceberg     → s3://construx-lakehouse/   parquet/zstd' },
  { kind: 'catalog', text: '  postgres    → postgres.construx.internal  pg 17.1' },
  { kind: 'catalog', text: '  kafka       → kafka.construx.internal:9092' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# federated join: iceberg orders_daily × live postgres tenants' },
  { kind: 'query',   text: '  SELECT t.name, o.revenue_gbp FROM iceberg.analytics.orders_daily o' },
  { kind: 'query',   text: '    JOIN postgres.public.tenants t ON o.tenant_id = t.id' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# distributed plan: 4 stages, 8 workers, predicate pushdown' },
  { kind: 'plan',    text: '  stage[0] scan iceberg/orders_daily  filter: order_date>=2033-08' },
  { kind: 'plan',    text: '  stage[1] remote exchange   stage[2] scan postgres/tenants' },
  { kind: 'plan',    text: '  stage[3] hash join + gather  →  coordinator' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# workers: 3 nodes active' },
  { kind: 'worker',  text: '  trino-worker-0  ACTIVE  8 tasks  cpu:62%  mem:7.2GB/10GB' },
  { kind: 'metric',  text: '  query elapsed: 1.84s  rows-processed: 284k  input: 42MB' },
  { kind: 'stat',    text: '  3 workers  50 concurrent  coordinator+3  trino 453' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'catalog': return '#4ade80';
    case 'query':   return '#67e8f9';
    case 'plan':    return '#a78bfa';
    case 'result':  return '#fbbf24';
    case 'worker':  return '#fbbf24';
    case 'metric':  return 'rgba(240,239,255,0.5)';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    default:        return 'transparent';
  }
}

export default function TrinoPanel() {
  const [revealed,   setRevealed]   = useState(0);
  const [liveElapsed, setLiveElapsed] = useState(1.84);
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
            setLiveElapsed(parseFloat((1.2 + Math.random() * 1.5).toFixed(2)));
          }, 2600);
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
          construx@query — trino · federated-sql · iceberg · postgres · kafka
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveElapsed}s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@query# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          trino · federated-sql · iceberg · postgres · kafka · pushdown · cbo
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Trino 453 ·</span>
          <span style={{ color: '#4ade80' }}>{liveElapsed}s query</span>
          <span style={{ color: '#67e8f9' }}>federated join</span>
          <span style={{ color: '#a78bfa' }}>4 stages</span>
          <span style={{ color: '#fbbf24' }}>pushdown</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          trino · distributed-sql · iceberg · postgres · kafka · presto
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● active' : 'loading'}
        </span>
      </div>
    </div>
  );
}
