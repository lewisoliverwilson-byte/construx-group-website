'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'collection' | 'hit' | 'sparse' | 'index' | 'quant' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',    text: '# qdrant: hnsw ann + payload filtering — sub-ms vector search' },
  { kind: 'prompt',     text: 'curl -s :6333/collections/construx_products | jq .result' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# collection: 284k vectors, named dense+sparse (hybrid search)' },
  { kind: 'collection', text: '  name: construx_products  status: green  points: 284,721' },
  { kind: 'collection', text: '  vectors: dense(384-dim cosine) + sparse(bm25)  segments: 4' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# query: top-10 "wireless headphones" for tenant:10001 ≤£50' },
  { kind: 'comment',    text: '#   hybrid: dense cosine + sparse BM25 → RRF re-rank' },
  { kind: 'hit',        text: '  #1  score:0.941  id:prod-8b2f  Sony WH-CH520  £34.99  ✓ stock' },
  { kind: 'hit',        text: '  #2  score:0.928  id:prod-3a7e  JBL Tune 520BT £29.99  ✓ stock' },
  { kind: 'hit',        text: '  #3  score:0.917  id:prod-6c4d  Anker Q20+     £45.00  ✓ stock' },
  { kind: 'sparse',     text: '  p99 latency: 2.3ms  hnsw traversal: 1.1ms  filter: 0.2ms' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# payload indexes: fast filtering without full scan' },
  { kind: 'index',      text: '  tenant_id: keyword  category: keyword  price_pence: integer' },
  { kind: 'quant',      text: '  binary quantization: enabled  memory: 88MB (vs 2.8GB full)  recall: 95%' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# cluster metrics' },
  { kind: 'metric',     text: '  requests: 4.8M total  errors: 0  grpc: 4333  http: 6333' },
  { kind: 'stat',       text: '  1 node  284k points  88MB RAM  hnsw m:16 ef_construct:100' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':    return 'rgba(240,239,255,0.22)';
    case 'prompt':     return 'rgba(240,239,255,0.6)';
    case 'collection': return '#4ade80';
    case 'hit':        return '#67e8f9';
    case 'sparse':     return '#a78bfa';
    case 'index':      return '#fbbf24';
    case 'quant':      return 'rgba(240,239,255,0.55)';
    case 'metric':     return 'rgba(240,239,255,0.5)';
    case 'stat':       return 'rgba(240,239,255,0.45)';
    default:           return 'transparent';
  }
}

export default function QdrantPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [liveP99,   setLiveP99]   = useState(2.3);
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
            setLiveP99(parseFloat((1.8 + Math.random() * 1.2).toFixed(1)));
          }, 2400);
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
          construx@search — qdrant · hnsw · ann · hybrid · payload-filter
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
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@search# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          qdrant · hnsw · ann · cosine · bm25-hybrid · binary-quantization · rrf
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Qdrant 1.11 ·</span>
          <span style={{ color: '#4ade80' }}>{liveP99}ms p99</span>
          <span style={{ color: '#67e8f9' }}>284k vectors</span>
          <span style={{ color: '#a78bfa' }}>hybrid RRF</span>
          <span style={{ color: '#fbbf24' }}>binary quant</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          qdrant · hnsw · ann · cosine · sparse · bm25 · quantization
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● green' : 'loading'}
        </span>
      </div>
    </div>
  );
}
