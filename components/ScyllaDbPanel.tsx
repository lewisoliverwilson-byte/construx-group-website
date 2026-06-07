'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'schema' | 'query' | 'row' | 'latency' | 'shard' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# scylladb: cassandra-compatible wide-column store rewritten in c++' },
  { kind: 'prompt',  text: 'cqlsh scylla.storage.svc 9042 --execute "USE construx;"' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# shard-per-core: no locking, no GC pauses — each cpu core owns its data' },
  { kind: 'shard',   text: '  node-01: 16 shards  284 GB  replicas: 3  dc: eu-west' },
  { kind: 'shard',   text: '  node-02: 16 shards  291 GB  replicas: 3  dc: eu-west' },
  { kind: 'shard',   text: '  node-03: 16 shards  278 GB  replicas: 3  dc: eu-west' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# schema: wide-column time-series — partition by user, cluster by time' },
  { kind: 'schema',  text: '  PRIMARY KEY (user_id, occurred_at, event_type)' },
  { kind: 'schema',  text: '  compaction = TimeWindowCompactionStrategy  window: 1 DAY' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# aggregate 90 days of events — columnar shard scan' },
  { kind: 'prompt',  text: 'SELECT event_type, count(*) FROM user_events WHERE user_id=? AND occurred_at > ?;' },
  { kind: 'row',     text: '  page_view    8,291,472  (4.2ms)' },
  { kind: 'row',     text: '  checkout       142,819  (4.2ms)' },
  { kind: 'row',     text: '  purchase        41,827  (4.2ms)' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# p99 latency: shard-per-core eliminates GC jitter' },
  { kind: 'latency', text: '  read  p50: 0.8ms  p99: 4.2ms  p99.9: 8.1ms' },
  { kind: 'latency', text: '  write p50: 0.4ms  p99: 1.9ms  p99.9: 3.7ms' },
  { kind: 'stat',    text: '  3 nodes  48 shards total  182k ops/s  consistency: LOCAL_QUORUM' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'schema':  return '#a78bfa';
    case 'query':   return 'rgba(240,239,255,0.55)';
    case 'row':     return '#4ade80';
    case 'latency': return '#67e8f9';
    case 'shard':   return '#fbbf24';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    default:        return 'transparent';
  }
}

export default function ScyllaDbPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [liveOps,   setLiveOps]   = useState(182);
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
            setLiveOps(170 + Math.floor(Math.random() * 25));
          }, 2000);
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
          construx@storage — scylladb · wide-column · cassandra · shard-per-core
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveOps}k ops/s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@storage# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          scylladb · cql · twcs · shard-per-core · seastar · no-gc-pause
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>ScyllaDB 6.2 ·</span>
          <span style={{ color: '#4ade80' }}>{liveOps}k ops/s</span>
          <span style={{ color: '#fbbf24' }}>shard-per-core</span>
          <span style={{ color: '#67e8f9' }}>p99 4.2ms</span>
          <span style={{ color: '#a78bfa' }}>TWCS</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          scylladb · cassandra · cql · wide-column · twcs · shard-per-core
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● live' : 'loading'}
        </span>
      </div>
    </div>
  );
}
