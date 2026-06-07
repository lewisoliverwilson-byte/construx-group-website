'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'connector' | 'event' | 'insert' | 'update' | 'delete' | 'lag' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',   text: '# debezium: wal-based CDC — postgres → kafka change event stream' },
  { kind: 'prompt',    text: 'curl -s :8083/connectors/construx-postgres-cdc/status | jq .connector' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# connector health: reading WAL at lsn 0/4E3A2F80' },
  { kind: 'connector', text: '  name: construx-postgres-cdc  state: RUNNING  task-0: RUNNING' },
  { kind: 'connector', text: '  plugin: pgoutput  slot: debezium_construx  lag: 128kB' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# change event stream: construx.cdc.public.orders (last 5 events)' },
  { kind: 'insert',    text: '  c  orders  id:ord-7f2a  tenant:10001  status:pending   £42.50' },
  { kind: 'update',    text: '  u  orders  id:ord-6b1c  tenant:10002  pending→confirmed  (before/after)' },
  { kind: 'update',    text: '  u  orders  id:ord-5e9d  tenant:10001  confirmed→shipped' },
  { kind: 'delete',    text: '  d  orders  id:ord-4a8b  tenant:10003  (tombstone queued)' },
  { kind: 'insert',    text: '  c  orders  id:ord-8g3h  tenant:10002  status:pending   £18.99' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# consumer group lag: search-indexer and webhook-dispatcher' },
  { kind: 'lag',       text: '  construx-search-indexer    partition:0  lag:2   offset:48293' },
  { kind: 'lag',       text: '  construx-webhook-dispatch  partition:0  lag:0   offset:48295' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# replication slot: postgres WAL retention' },
  { kind: 'event',     text: '  pg_replication_slots  debezium_construx  active:t  wal-lag:128kB' },
  { kind: 'stat',      text: '  4 tables captured  48.3k events/hr  lsn-lag: 0ms  delivery: at-least-once' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':   return 'rgba(240,239,255,0.22)';
    case 'prompt':    return 'rgba(240,239,255,0.6)';
    case 'connector': return '#4ade80';
    case 'insert':    return '#67e8f9';
    case 'update':    return '#fbbf24';
    case 'delete':    return '#f87171';
    case 'lag':       return '#a78bfa';
    case 'event':     return 'rgba(240,239,255,0.5)';
    case 'stat':      return 'rgba(240,239,255,0.45)';
    default:          return 'transparent';
  }
}

export default function DebeziumPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveEvents,  setLiveEvents]  = useState(48.3);
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
            setLiveEvents(parseFloat((46 + Math.random() * 5).toFixed(1)));
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
          construx@data — debezium · cdc · wal · kafka-connect · change-events
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveEvents}k/hr` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@data# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          debezium · wal-cdc · postgres · kafka-connect · pgoutput · change-stream
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Debezium 2.7 ·</span>
          <span style={{ color: '#4ade80' }}>{liveEvents}k events/hr</span>
          <span style={{ color: '#67e8f9' }}>inserts captured</span>
          <span style={{ color: '#fbbf24' }}>updates captured</span>
          <span style={{ color: '#f87171' }}>deletes captured</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          debezium · kafka-connect · pgoutput · wal · cdc · change-data-capture
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● streaming' : 'loading'}
        </span>
      </div>
    </div>
  );
}
