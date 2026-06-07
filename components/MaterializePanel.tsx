'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'sql' | 'row' | 'diff' | 'view' | 'sink' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# materialize: streaming sql — incrementally maintained views over kafka' },
  { kind: 'prompt',  text: 'psql -h materialize.streaming.svc -p 6875 -U materialize' },
  { kind: 'blank',   text: '' },
  { kind: 'sql',     text: 'CREATE MATERIALIZED VIEW mv_checkout_conversion AS' },
  { kind: 'sql',     text: '  SELECT campaign_id, round(100*checkouts/page_views,2) AS cvr' },
  { kind: 'sql',     text: '  FROM construx_events GROUP BY 1;' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# SUBSCRIBE: live stream of view diffs as kafka events arrive' },
  { kind: 'prompt',  text: 'SUBSCRIBE mv_checkout_conversion WITH (SNAPSHOT = true)' },
  { kind: 'diff',    text: '  ts:1713000001  +1  campaign-abc-123  cvr: 2.31%' },
  { kind: 'diff',    text: '  ts:1713000001  +1  campaign-def-456  cvr: 4.87%' },
  { kind: 'diff',    text: '  ts:1713000002  +1  campaign-ghi-789  cvr: 1.94%' },
  { kind: 'diff',    text: '  ts:1713000004  -1  campaign-abc-123  cvr: 2.31%  ← retracted' },
  { kind: 'diff',    text: '  ts:1713000004  +1  campaign-abc-123  cvr: 2.48%  ← updated' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# materialized views — always fresh, indexed, sub-millisecond' },
  { kind: 'view',    text: '  mv_checkout_conversion   8,291 rows   18 MB   differential-dataflow' },
  { kind: 'view',    text: '  mv_orders_enriched     142,819 rows  204 MB   kafka×2 join' },
  { kind: 'view',    text: '  mv_rolling_revenue          12 rows  <1 MB    5-min window' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# sink: write view results back to kafka for downstream consumers' },
  { kind: 'sink',    text: '  high_value_orders_sink → construx.alerts.high-value-orders' },
  { kind: 'stat',    text: '  lag: 0ms  throughput: 4.2k events/s  views: 3  sinks: 1' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'sql':     return '#a78bfa';
    case 'row':     return '#4ade80';
    case 'diff':    return '#67e8f9';
    case 'view':    return '#4ade80';
    case 'sink':    return '#fbbf24';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    default:        return 'transparent';
  }
}

export default function MaterializePanel() {
  const [revealed,      setRevealed]      = useState(0);
  const [liveEventsPs,  setLiveEventsPs]  = useState(4.2);
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
            setLiveEventsPs(parseFloat((3.8 + Math.random() * 0.8).toFixed(1)));
          }, 2150);
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
          construx@streaming — materialize · sql · differential-dataflow · kafka
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#67e8f9' : 'rgba(240,239,255,0.2)' }}>
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
          materialize · streaming-sql · subscribe · incremental · kafka-source
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Materialize v0.97 ·</span>
          <span style={{ color: '#67e8f9' }}>{liveEventsPs}k events/s</span>
          <span style={{ color: '#a78bfa' }}>streaming SQL</span>
          <span style={{ color: '#4ade80' }}>3 mat. views</span>
          <span style={{ color: '#fbbf24' }}>kafka sink</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          materialize · subscribe · differential-dataflow · kafka · incremental
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#67e8f9' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● streaming' : 'loading'}
        </span>
      </div>
    </div>
  );
}
