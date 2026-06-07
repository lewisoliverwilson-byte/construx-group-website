'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'schema' | 'query' | 'row' | 'node' | 'explain' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# cockroachdb: distributed sql — serializable isolation, raft replication' },
  { kind: 'prompt',  text: 'cockroach sql --url "postgresql://construx@cockroach.storage.svc:26257/construx"' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# cluster: 3 nodes, eu-west datacenter, survive zone failure' },
  { kind: 'node',    text: '  node-1  cockroach-0:26257  284 GB / 500 GB  region=eu-west,zone=a  UN' },
  { kind: 'node',    text: '  node-2  cockroach-1:26257  291 GB / 500 GB  region=eu-west,zone=b  UN' },
  { kind: 'node',    text: '  node-3  cockroach-2:26257  278 GB / 500 GB  region=eu-west,zone=c  UN' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# serializable isolation — every tx sees consistent snapshot' },
  { kind: 'schema',  text: '  PRIMARY KEY (id UUID DEFAULT gen_random_uuid())' },
  { kind: 'schema',  text: '  SURVIVE ZONE FAILURE  — LOCALITY REGIONAL BY ROW' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# query plan: all local (no cross-region latency)' },
  { kind: 'prompt',  text: 'EXPLAIN SELECT * FROM orders WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 10;' },
  { kind: 'explain', text: '  index scan  idx_orders_user_status  estimated rows: 10  cost: 12.4' },
  { kind: 'explain', text: '  distributed: false  locality: eu-west,zone=a  1.4ms' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# follower read: stale but local — no quorum needed' },
  { kind: 'row',     text: '  AS OF SYSTEM TIME follower_read_timestamp()  →  0.3ms  (local replica)' },
  { kind: 'stat',    text: '  3 nodes  raft quorum: 2/3  p99 write: 8ms  p99 read: 1.4ms' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'schema':  return '#a78bfa';
    case 'query':   return 'rgba(240,239,255,0.55)';
    case 'row':     return '#4ade80';
    case 'node':    return '#fbbf24';
    case 'explain': return '#67e8f9';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    default:        return 'transparent';
  }
}

export default function CockroachDbPanel() {
  const [revealed, setRevealed] = useState(0);
  const [liveP99,  setLiveP99]  = useState(8);
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
            setLiveP99(6 + Math.floor(Math.random() * 5));
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
          construx@storage — cockroachdb · distributed-sql · raft · serializable
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#fbbf24' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `p99 ${liveP99}ms` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@storage# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          cockroachdb · raft · serializable · geo-partition · follower-read
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>CockroachDB v23.2 ·</span>
          <span style={{ color: '#fbbf24' }}>p99 write {liveP99}ms</span>
          <span style={{ color: '#a78bfa' }}>serializable</span>
          <span style={{ color: '#67e8f9' }}>follower reads</span>
          <span style={{ color: '#4ade80' }}>3-node Raft</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          cockroachdb · distributed-sql · raft · geo-partition · mvcc
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#fbbf24' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● quorum' : 'loading'}
        </span>
      </div>
    </div>
  );
}
