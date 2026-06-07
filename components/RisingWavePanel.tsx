'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'source' | 'view' | 'row' | 'sink' | 'lag' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# risingwave: postgresql-compatible streaming database — incremental sql over kafka' },
  { kind: 'prompt',  text: 'psql -h risingwave.streaming.svc -p 4566 -U risingwave' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# sources: kafka topics mapped as streaming tables' },
  { kind: 'source',  text: '  SOURCE construx_events  ← kafka: construx.events  FORMAT JSON' },
  { kind: 'source',  text: '  SOURCE construx_orders  ← kafka: construx.orders   FORMAT DEBEZIUM AVRO' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# materialized view: always fresh — incremental maintenance on new events' },
  { kind: 'view',    text: '  mv_hourly_events     8,291 rows  18 MB  lag: 0.12s' },
  { kind: 'view',    text: '  mv_orders_enriched 142,819 rows 204 MB  lag: 0.09s (tikv join)' },
  { kind: 'view',    text: '  mv_rolling_revenue      12 rows  <1 MB  lag: 0.11s (5-min window)' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# query materialized view — always fresh, <5ms, standard sql' },
  { kind: 'prompt',  text: 'SELECT event_type, sum(event_count) FROM mv_hourly_events WHERE hour > now()-INTERVAL \'24 hours\' GROUP BY 1;' },
  { kind: 'row',     text: '  page_view   8,291,472  (2.1ms — incremental, not re-scanning kafka)' },
  { kind: 'row',     text: '  checkout      142,819  (2.1ms)' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# sink: write view results to kafka for downstream consumers' },
  { kind: 'sink',    text: '  SINK high_value_orders → construx.alerts.high-value-orders  (JSON)' },
  { kind: 'lag',     text: '  source lag: 0.12s  throughput: 4.2k events/s  state: S3 (cloud-native)' },
  { kind: 'stat',    text: '  2 compute nodes  1 meta  1 frontend  1 compactor  lag: <200ms' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'source':  return '#a78bfa';
    case 'view':    return '#4ade80';
    case 'row':     return '#67e8f9';
    case 'sink':    return '#fbbf24';
    case 'lag':     return 'rgba(240,239,255,0.5)';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    default:        return 'transparent';
  }
}

export default function RisingWavePanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveEventsPs, setLiveEventsPs] = useState(4.2);
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
            setLiveEventsPs(parseFloat((3.8 + Math.random() * 0.9).toFixed(1)));
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
          construx@streaming — risingwave · streaming-sql · kafka · incremental
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveEventsPs}k events/s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@streaming# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          risingwave · postgres-compat · mat-views · kafka-source · cloud-state
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>RisingWave v2.0 ·</span>
          <span style={{ color: '#4ade80' }}>{liveEventsPs}k events/s</span>
          <span style={{ color: '#a78bfa' }}>Kafka source</span>
          <span style={{ color: '#67e8f9' }}>incremental SQL</span>
          <span style={{ color: '#fbbf24' }}>S3 state</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          risingwave · streaming-sql · postgres-wire · kafka · incremental-view
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● streaming' : 'loading'}
        </span>
      </div>
    </div>
  );
}
