'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'tablet' | 'shard' | 'vschema' | 'query' | 'repl' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# vitess: mysql sharding — vtgate, vttablet, vtctldclient, vschema' },
  { kind: 'prompt',   text: 'vtctldclient --server localhost:15999 GetTablets --keyspace construx' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# tablet topology: primary + replicas across shards' },
  { kind: 'tablet',   text: '  zone1-construx-0000000101  construx  -80  primary  MySQL  SERVING  10.0.2.10:3306' },
  { kind: 'repl',     text: '  zone1-construx-0000000102  construx  -80  replica  MySQL  SERVING  10.0.2.11:3306' },
  { kind: 'tablet',   text: '  zone1-construx-0000000201  construx  80-  primary  MySQL  SERVING  10.0.2.20:3306' },
  { kind: 'repl',     text: '  zone1-construx-0000000202  construx  80-  replica  MySQL  SERVING  10.0.2.21:3306' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# vschema: scatter-gather routing by tenant_id (shard key)' },
  { kind: 'vschema',  text: '  keyspace: construx  sharded: true  vindexes: [hash(tenant_id)]' },
  { kind: 'vschema',  text: '  table: orders  → hash(tenant_id)  shards: [-80] [80-]' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# vtgate: unified mysql endpoint — routes queries to correct shard' },
  { kind: 'query',    text: '  SELECT * FROM orders WHERE tenant_id = 10001  → shard -80  (1 shard)' },
  { kind: 'query',    text: '  SELECT count(*) FROM orders WHERE status = ?  → scatter  (2 shards)' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# resharding: -80/80- → -40/40-80/80-  (online, no downtime)' },
  { kind: 'shard',    text: '  vtctldclient Reshard --workflow reshard2 start  [copying rows...]' },
  { kind: 'shard',    text: '  shard -80  → [-40] [40-80]  rows copied: 48.2M  eta: 12m' },
  { kind: 'metric',   text: '  vtgate qps: 42.3k  p99: 1.2ms  vttablet lag: 0ms  err rate: 0.00%' },
  { kind: 'stat',     text: '  2 shards  4 tablets  48.2M rows  construx/orders  mysql-8.0' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'tablet':   return '#4ade80';
    case 'repl':     return '#67e8f9';
    case 'shard':    return '#a78bfa';
    case 'vschema':  return '#fbbf24';
    case 'query':    return 'rgba(240,239,255,0.55)';
    case 'metric':   return 'rgba(240,239,255,0.5)';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function VitessPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [liveQps,   setLiveQps]   = useState(42.3);
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
            setLiveQps(parseFloat((40 + Math.random() * 5).toFixed(1)));
          }, 2300);
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
          construx@storage — vitess · vtgate · vtctldclient · sharding · mysql
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveQps}k qps` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@storage# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          vitess · vtgate · vtctldclient · vschema · resharding · mysql-sharding
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Vitess 20 ·</span>
          <span style={{ color: '#4ade80' }}>{liveQps}k qps</span>
          <span style={{ color: '#67e8f9' }}>replicas healthy</span>
          <span style={{ color: '#a78bfa' }}>2 shards</span>
          <span style={{ color: '#fbbf24' }}>hash(tenant_id)</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          vitess · vtgate · vtctldclient · vschema · planetscale · mysql
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● serving' : 'loading'}
        </span>
      </div>
    </div>
  );
}
