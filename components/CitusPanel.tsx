'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'worker' | 'shard' | 'query' | 'colocate' | 'rebal' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# citus: distributed postgresql — shard by tenant_id, full pg api' },
  { kind: 'prompt',   text: 'psql -h coordinator.construx.internal -c "SELECT * FROM citus_get_active_worker_nodes()"' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# 4 worker nodes — 32 shards distributed across cluster' },
  { kind: 'worker',   text: '  worker-1.construx.internal:5432  healthy  8 shards  1.4T used' },
  { kind: 'worker',   text: '  worker-2.construx.internal:5432  healthy  8 shards  1.2T used' },
  { kind: 'worker',   text: '  worker-3.construx.internal:5432  healthy  8 shards  1.5T used' },
  { kind: 'worker',   text: '  worker-4.construx.internal:5432  healthy  8 shards  1.1T used' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# distributed table: orders sharded by tenant_id (hash)' },
  { kind: 'shard',    text: '  orders  dist_col: tenant_id  shards: 32  coloc: products' },
  { kind: 'query',    text: '  WHERE tenant_id=10001 → task_count:1  (single shard, fast)' },
  { kind: 'query',    text: '  SELECT count(*) FROM orders → task_count:32  (parallel scatter)' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# co-location: orders × products for same tenant → one worker join' },
  { kind: 'colocate', text: '  orders INNER JOIN products ON tenant_id → local join, no network' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# shard rebalance after adding worker-5' },
  { kind: 'rebal',    text: '  citus_rebalance_start()  moving 6 shards → 6/32 shards migrating' },
  { kind: 'metric',   text: '  p99: 4.1ms  cross-shard: 18ms  single-tenant: 1.2ms' },
  { kind: 'stat',     text: '  4 workers  32 shards  284M rows  pg 17.1  citus 12.1' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'worker':   return '#4ade80';
    case 'shard':    return '#a78bfa';
    case 'query':    return '#67e8f9';
    case 'colocate': return '#fbbf24';
    case 'rebal':    return 'rgba(240,239,255,0.55)';
    case 'metric':   return 'rgba(240,239,255,0.5)';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function CitusPanel() {
  const [revealed, setRevealed] = useState(0);
  const [liveP99,  setLiveP99]  = useState(4.1);
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
            setLiveP99(parseFloat((3.5 + Math.random() * 1.5).toFixed(1)));
          }, 2350);
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
          construx@storage — citus · distributed-pg · sharding · co-location
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveP99}ms p99` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@storage# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          citus · distributed-postgresql · sharding · co-location · scatter-gather
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Citus 12.1 ·</span>
          <span style={{ color: '#4ade80' }}>{liveP99}ms p99</span>
          <span style={{ color: '#a78bfa' }}>32 shards</span>
          <span style={{ color: '#67e8f9' }}>parallel scatter</span>
          <span style={{ color: '#fbbf24' }}>co-located joins</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          citus · distributed-postgresql · sharding · co-location · coordinator
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● healthy' : 'loading'}
        </span>
      </div>
    </div>
  );
}
