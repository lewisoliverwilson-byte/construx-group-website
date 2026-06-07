'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'col-header' | 'row-data' | 'row-agg' | 'explain' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',    text: '# DuckDB: analytical SQL on parquet, CSV, JSON — no server required' },
  { kind: 'prompt',     text: 'duckdb construx-analytics.duckdb' },
  { kind: 'comment',    text: '-- Query parquet files directly (no import step)' },
  { kind: 'prompt',     text: "SELECT date_trunc('day', created_at) AS day, COUNT(*) AS orders, SUM(total_cents)/100.0 AS revenue FROM read_parquet('s3://construx-data/orders/*.parquet') GROUP BY 1 ORDER BY 1 DESC LIMIT 5;" },
  { kind: 'col-header', text: '┌────────────┬────────┬──────────┐' },
  { kind: 'col-header', text: '│ day        │ orders │ revenue  │' },
  { kind: 'col-header', text: '├────────────┼────────┼──────────┤' },
  { kind: 'row-data',   text: '│ 2032-06-05 │ 8241   │ 142876.9 │' },
  { kind: 'row-data',   text: '│ 2032-06-04 │ 7994   │ 138421.3 │' },
  { kind: 'row-data',   text: '│ 2032-06-03 │ 8103   │ 140129.8 │' },
  { kind: 'row-data',   text: '│ 2032-06-02 │ 7412   │ 128345.2 │' },
  { kind: 'row-data',   text: '│ 2032-06-01 │ 6891   │ 119204.7 │' },
  { kind: 'col-header', text: '└────────────┴────────┴──────────┘' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '-- Lateral join + unnest: explode JSON arrays inline' },
  { kind: 'prompt',     text: "SELECT o.order_id, item.sku, item.quantity FROM orders o, LATERAL UNNEST(from_json(o.items_json, '[{\"sku\":\"?\",\"quantity\":0}]')) AS item(sku VARCHAR, quantity INT) WHERE item.quantity > 3;" },
  { kind: 'row-data',   text: '│ a3f9b2c1 │ SKU-42 │ 5 │' },
  { kind: 'row-data',   text: '│ b4e8d9f2 │ SKU-17 │ 4 │' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '-- Export to parquet (columnar, compressed)' },
  { kind: 'prompt',     text: "COPY (SELECT * FROM orders WHERE created_at > '2032-06-01') TO 's3://construx-data/export/recent.parquet' (FORMAT PARQUET, COMPRESSION ZSTD);" },
  { kind: 'stat',       text: '38241 rows exported  (1.2 MiB ZSTD, 9.1x compression)' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '-- Explain: vectorised execution plan (no nested loops)' },
  { kind: 'prompt',     text: 'EXPLAIN SELECT customer_id, AVG(total_cents) FROM orders GROUP BY 1;' },
  { kind: 'explain',    text: 'HASH_GROUP_BY → PROJECTION → PARQUET_SCAN (vectorised, batch=2048)' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':    return 'rgba(240,239,255,0.22)';
    case 'prompt':     return 'rgba(240,239,255,0.6)';
    case 'col-header': return '#a78bfa';
    case 'row-data':   return '#67e8f9';
    case 'row-agg':    return '#4ade80';
    case 'explain':    return '#fbbf24';
    case 'stat':       return '#4ade80';
    default:           return 'transparent';
  }
}

export default function DuckdbPanel() {
  const [revealed,   setRevealed]   = useState(0);
  const [liveRows,   setLiveRows]   = useState(38241);
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
            setLiveRows(35000 + Math.floor(Math.random() * 8000));
          }, 2100);
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
          construx@dev — duckdb · analytical SQL on parquet + S3
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveRows.toLocaleString()} rows` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@dev# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          duckdb · parquet · s3 · vectorised · COPY TO · UNNEST
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>duckdb 0.10 ·</span>
          <span style={{ color: '#4ade80' }}>{liveRows.toLocaleString()} rows</span>
          <span style={{ color: '#67e8f9' }}>parquet + s3</span>
          <span style={{ color: '#a78bfa' }}>vectorised execution</span>
          <span style={{ color: '#fbbf24' }}>ZSTD 9.1x</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          duckdb 0.10 · parquet · s3 · vectorised · COPY TO · LATERAL UNNEST
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● queried' : 'loading'}
        </span>
      </div>
    </div>
  );
}
