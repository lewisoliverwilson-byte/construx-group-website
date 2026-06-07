'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'row' | 'result' | 'ddl' | 'mv' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# clickhouse: columnar analytics — billions of rows in milliseconds' },
  { kind: 'prompt',  text: 'clickhouse-client --host clickhouse.analytics.svc' },
  { kind: 'ddl',     text: '  ENGINE = MergeTree() PARTITION BY toYYYYMM(occurred_at)' },
  { kind: 'ddl',     text: '  ORDER BY (event_type, user_id, occurred_at)  -- sort key = index' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# aggregate 10B rows by event type — columnar scan' },
  { kind: 'prompt',  text: 'SELECT event_type, count(), countDistinct(user_id) FROM events WHERE occurred_at > now() - INTERVAL 7 DAY GROUP BY event_type ORDER BY 2 DESC' },
  { kind: 'row',     text: '  page_view  1,847,239,012  2,847,192  (127ms)' },
  { kind: 'row',     text: '  checkout      41,829,402    8,192,847  (127ms)' },
  { kind: 'row',     text: '  purchase      12,847,192    7,847,019  (127ms)' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# materialized view: pre-aggregate hourly on INSERT' },
  { kind: 'mv',      text: '  events → events_hourly_mv → events_hourly_agg' },
  { kind: 'mv',      text: '  query on agg: 5ms  (vs 2s on raw 10B rows)' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# funnel analysis: page_view → checkout → purchase' },
  { kind: 'prompt',  text: 'SELECT countIf(has_checkout)/countIf(has_page_view)*100 AS pct FROM (...)' },
  { kind: 'result',  text: '  page→checkout: 2.3%  checkout→purchase: 30.7%' },
  { kind: 'stat',    text: '  6 shards  2 replicas each  Kafka sink: 142k rows/s' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'row':     return '#4ade80';
    case 'result':  return '#67e8f9';
    case 'ddl':     return '#a78bfa';
    case 'mv':      return '#fbbf24';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    default:        return 'transparent';
  }
}

export default function ClickHousePanel() {
  const [revealed,     setRevealed]     = useState(0);
  const [liveRowsS,    setLiveRowsS]    = useState(142);
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
            setLiveRowsS(130 + Math.floor(Math.random() * 25));
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
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 81;
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
          construx@analytics — clickhouse · columnar · olap · mergetree
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveRowsS}k rows/s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@analytics# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          clickhouse · mergetree · materialized-views · funnel · olap
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>ClickHouse 24.5 ·</span>
          <span style={{ color: '#4ade80' }}>{liveRowsS}k rows/s</span>
          <span style={{ color: '#a78bfa' }}>MergeTree</span>
          <span style={{ color: '#fbbf24' }}>mat. views</span>
          <span style={{ color: '#67e8f9' }}>10B row scans</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          clickhouse · mergetree · funnel · olap · materialized-views
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● querying' : 'loading'}
        </span>
      </div>
    </div>
  );
}
