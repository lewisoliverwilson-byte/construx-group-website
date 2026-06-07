'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'table' | 'query' | 'result' | 'segment' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# apache pinot: realtime olap — kafka ingestion, star-tree, upsert, hybrid' },
  { kind: 'prompt',   text: 'curl -s http://pinot-broker:8099/query/sql -d query="SELECT * FROM system.tables"' },
  { kind: 'blank',    text: '' },
  { kind: 'table',    text: '  orders_realtime    REALTIME  segments: 48   rows: 89.4M   size: 12.1GB' },
  { kind: 'table',    text: '  events_hybrid      HYBRID    segments: 312  rows: 4.2B    size: 187GB' },
  { kind: 'table',    text: '  user_sessions      OFFLINE   segments: 24   rows: 142M    size: 8.7GB' },
  { kind: 'blank',    text: '' },
  { kind: 'prompt',   text: 'curl -s http://pinot-broker:8099/query/sql -d query="..."' },
  { kind: 'blank',    text: '' },
  { kind: 'query',    text: '  SELECT tenantId, COUNT(*), SUM(totalPence)/100.0 as revenue' },
  { kind: 'query',    text: '  FROM orders_realtime WHERE ts > ago(\'PT1H\') GROUP BY tenantId' },
  { kind: 'result',   text: '  → 1847 rows  query: 12ms  scanned: {LIVE}M rows  server: broker-0' },
  { kind: 'segment',  text: '  realtime-seg: ll_segment_0.orders_realtime_0  lag: 842 msgs' },
  { kind: 'metric',   text: '  ingest-rps: 24k/s  queries/s: 312  p99-latency: 18ms  servers: 6' },
  { kind: 'stat',     text: '  pinot v1.2.0  broker: 2  server: 6  controller: 1  minion: 2  zk: 3' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'table':    return '#4ade80';
    case 'query':    return '#a78bfa';
    case 'result':   return '#67e8f9';
    case 'segment':  return '#fbbf24';
    case 'metric':   return 'rgba(240,239,255,0.5)';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function PinotPanel() {
  const [revealed,     setRevealed]     = useState(0);
  const [scannedRows,  setScannedRows]  = useState(8);
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
            setScannedRows((c) => Math.floor(c + (Math.random() - 0.3) * 2));
          }, 3000);
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
          construx@pinot — realtime · olap · kafka · star-tree · upsert · hybrid
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#67e8f9' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? '12ms p99' : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@pinot# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          pinot · broker · server · controller · realtime · offline · hybrid · upsert
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => {
          const text = l.kind === 'result'
            ? l.text.replace('{LIVE}', String(scannedRows))
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Pinot v1.2.0 ·</span>
          <span style={{ color: '#67e8f9' }}>12ms p99</span>
          <span style={{ color: '#4ade80' }}>24k ingest/s</span>
          <span style={{ color: '#a78bfa' }}>4.2B rows</span>
          <span style={{ color: '#fbbf24' }}>6 servers</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          pinot · realtime · offline · hybrid · star-tree · upsert · kafka
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● serving' : 'loading'}
        </span>
      </div>
    </div>
  );
}
