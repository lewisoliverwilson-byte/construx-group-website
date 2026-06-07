'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'store' | 'block' | 'query' | 'dedup' | 'retention' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',   text: '# thanos: prometheus long-term storage — s3 backend, global query' },
  { kind: 'prompt',    text: 'thanos query --store=dnssrv+_grpc._tcp.thanos-store.monitoring.svc' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# store gateways: 3 stores online across 2 clusters' },
  { kind: 'store',     text: '  store/eu-west-2a    READY  blocks:1821  time:2031-01→now' },
  { kind: 'store',     text: '  store/eu-west-2b    READY  blocks:1819  time:2031-01→now' },
  { kind: 'store',     text: '  store/us-east-1a    READY  blocks:947   time:2032-06→now' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# compactor: 2h compaction pass — block consolidation' },
  { kind: 'block',     text: '  raw → 2h:   48 blocks → 12 blocks  (75% reduction, 14m ETA)' },
  { kind: 'block',     text: '  2h  → 24h:  in queue  24h → 1h: deferred  s3 size: 1.8TB' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# global query: cross-cluster rate — deduplicated' },
  { kind: 'query',     text: '  rate(http_requests_total{cluster=~".+"}[5m]) by (cluster)' },
  { kind: 'query',     text: '  eu-west-2: 4821/s   us-east-1: 2104/s   global: 6925/s' },
  { kind: 'blank',     text: '' },
  { kind: 'dedup',     text: '  dedup: replica label stripped — 1 series per logical timeseries' },
  { kind: 'retention', text: '  raw:15d  →  5m:90d  →  1h:365d   s3://construx-thanos-prod' },
  { kind: 'metric',    text: '  query elapsed: 0.31s  series-read: 2841  samples: 184k' },
  { kind: 'stat',      text: '  2 clusters  3 stores  s3-backed  thanos 0.36.1' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':   return 'rgba(240,239,255,0.22)';
    case 'prompt':    return 'rgba(240,239,255,0.6)';
    case 'store':     return '#4ade80';
    case 'block':     return '#a78bfa';
    case 'query':     return '#67e8f9';
    case 'dedup':     return '#fbbf24';
    case 'retention': return '#fbbf24';
    case 'metric':    return 'rgba(240,239,255,0.5)';
    case 'stat':      return 'rgba(240,239,255,0.45)';
    default:          return 'transparent';
  }
}

export default function ThanosPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveBlocks,  setLiveBlocks]  = useState(12);
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
            setLiveBlocks(10 + Math.floor(Math.random() * 6));
          }, 2800);
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
          construx@metrics — thanos · prometheus · long-term · s3 · global-query
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#a78bfa' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveBlocks} blocks` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@metrics# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          thanos · store · compactor · query · dedup · s3 · global
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Thanos 0.36.1 ·</span>
          <span style={{ color: '#4ade80' }}>3 stores healthy</span>
          <span style={{ color: '#67e8f9' }}>global query</span>
          <span style={{ color: '#a78bfa' }}>{liveBlocks} compacted</span>
          <span style={{ color: '#fbbf24' }}>dedup on</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          thanos · long-term-storage · s3 · compactor · store-gateway
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#a78bfa' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● compacting' : 'loading'}
        </span>
      </div>
    </div>
  );
}
