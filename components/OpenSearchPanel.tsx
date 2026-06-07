'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'health' | 'index' | 'query' | 'result' | 'agg' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# opensearch: distributed search — inverted index, query dsl, vector' },
  { kind: 'prompt',  text: 'curl https://opensearch.construx.internal/_cluster/health' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# cluster: green  6 nodes  4 data  84 shards  0 unassigned' },
  { kind: 'health',  text: '  status:green  nodes:6  pri:42  rep:42  unassigned:0' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# indices: 4 active  total: 71.4GB  148M docs' },
  { kind: 'index',   text: '  construx-logs-2033-10    green  48.2M docs  18.4GB  3s/1r' },
  { kind: 'index',   text: '  construx-logs-2033-09    green  142.8M docs 41.2GB  3s/0r' },
  { kind: 'index',   text: '  construx-docs            green  284k docs   1.8GB   1s/1r' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# query: bool filter + full-text BM25' },
  { kind: 'query',   text: '  {bool:{must:{match:{msg:"payment declined"}},filter:{term:{level:"error"}}}}' },
  { kind: 'result',  text: '  hits:142  took:18ms  shards-queried:3/3' },
  { kind: 'blank',   text: '' },
  { kind: 'agg',     text: '  errors_by_service: payments:84  api:31  worker:12  auth:9' },
  { kind: 'metric',  text: '  query p99: 42ms  indexing: 8421 docs/s  cache-hit: 94.2%' },
  { kind: 'stat',    text: '  6 nodes  84 shards  bm25  opensearch 2.15' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'health':  return '#4ade80';
    case 'index':   return '#67e8f9';
    case 'query':   return '#a78bfa';
    case 'result':  return '#fbbf24';
    case 'agg':     return '#fbbf24';
    case 'metric':  return 'rgba(240,239,255,0.5)';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    default:        return 'transparent';
  }
}

export default function OpenSearchPanel() {
  const [revealed,      setRevealed]      = useState(0);
  const [liveQueryTime, setLiveQueryTime] = useState(18);
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
            setLiveQueryTime(12 + Math.floor(Math.random() * 24));
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
          construx@search — opensearch · inverted-index · query-dsl · vector · hybrid
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveQueryTime}ms` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@search# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          opensearch · query-dsl · bm25 · aggregations · ilm · sharding
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>OpenSearch 2.15 ·</span>
          <span style={{ color: '#4ade80' }}>cluster green</span>
          <span style={{ color: '#67e8f9' }}>148M docs</span>
          <span style={{ color: '#a78bfa' }}>bm25+vector</span>
          <span style={{ color: '#fbbf24' }}>{liveQueryTime}ms p99</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          opensearch · inverted-index · bm25 · knn · query-dsl · ilm
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● green' : 'loading'}
        </span>
      </div>
    </div>
  );
}
