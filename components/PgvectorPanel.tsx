'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'sql' | 'result-header' | 'result-row' | 'result-ok' | 'result-count' | 'blank';

interface QueryLine {
  kind:  LineKind;
  text:  string;
}

const LINES: QueryLine[] = [
  { kind: 'comment',       text: '-- pgvector: semantic search on order descriptions' },
  { kind: 'sql',           text: "CREATE EXTENSION IF NOT EXISTS vector;" },
  { kind: 'result-ok',     text: 'CREATE EXTENSION' },
  { kind: 'blank',         text: '' },
  { kind: 'comment',       text: '-- Store 1536-dim OpenAI embedding alongside the product row' },
  { kind: 'sql',           text: 'ALTER TABLE products ADD COLUMN embedding vector(1536);' },
  { kind: 'result-ok',     text: 'ALTER TABLE' },
  { kind: 'blank',         text: '' },
  { kind: 'comment',       text: '-- HNSW index: fast approximate nearest-neighbor, no IVF training' },
  { kind: 'sql',           text: "CREATE INDEX products_embedding_idx ON products" },
  { kind: 'sql',           text: "  USING hnsw (embedding vector_cosine_ops)" },
  { kind: 'sql',           text: "  WITH (m = 16, ef_construction = 64);" },
  { kind: 'result-ok',     text: 'CREATE INDEX' },
  { kind: 'blank',         text: '' },
  { kind: 'comment',       text: '-- Semantic search: nearest 5 products to query embedding' },
  { kind: 'sql',           text: 'SELECT id, name, category,' },
  { kind: 'sql',           text: "       1 - (embedding <=> $1) AS similarity" },
  { kind: 'sql',           text: 'FROM products' },
  { kind: 'sql',           text: 'WHERE category = $2' },
  { kind: 'sql',           text: 'ORDER BY embedding <=> $1' },
  { kind: 'sql',           text: 'LIMIT 5;' },
  { kind: 'result-header', text: '   id    │ name                    │ category    │ similarity ' },
  { kind: 'result-header', text: '─────────┼─────────────────────────┼─────────────┼────────────' },
  { kind: 'result-row',    text: ' a3f9b2  │ Wireless Noise-Cancel   │ electronics │   0.9431   ' },
  { kind: 'result-row',    text: ' b4d7e9  │ Over-Ear Studio Headset │ electronics │   0.9287   ' },
  { kind: 'result-row',    text: ' c5e8a3  │ Bluetooth Earbuds Pro   │ electronics │   0.9104   ' },
  { kind: 'result-row',    text: ' d6f2b8  │ USB-C Audio Adapter     │ electronics │   0.8832   ' },
  { kind: 'result-row',    text: ' e7g3c9  │ Portable DAC Amplifier  │ electronics │   0.8651   ' },
  { kind: 'result-count',  text: '(5 rows)' },
  { kind: 'blank',         text: '' },
  { kind: 'comment',       text: '-- Hybrid: combine keyword + vector (RRF fusion)' },
  { kind: 'sql',           text: 'SELECT id, name, RRF(rank_fts, rank_vec) AS score' },
  { kind: 'sql',           text: 'FROM reciprocal_rank_fusion(' },
  { kind: 'sql',           text: "  (SELECT id, ROW_NUMBER() OVER (ORDER BY ts_rank DESC) AS rank_fts" },
  { kind: 'sql',           text: "   FROM products WHERE search_tsv @@ plainto_tsquery('headphones'))," },
  { kind: 'sql',           text: "  (SELECT id, ROW_NUMBER() OVER (ORDER BY embedding <=> $1) AS rank_vec" },
  { kind: 'sql',           text: '   FROM products)' },
  { kind: 'sql',           text: ') ORDER BY score LIMIT 10;' },
];

const TOTAL = LINES.length + 3;

function kindColor(k: LineKind): string {
  switch (k) {
    case 'comment':       return 'rgba(240,239,255,0.22)';
    case 'sql':           return 'rgba(240,239,255,0.6)';
    case 'result-header': return 'rgba(240,239,255,0.25)';
    case 'result-row':    return '#67e8f9';
    case 'result-ok':     return '#4ade80';
    case 'result-count':  return 'rgba(240,239,255,0.3)';
    default:              return 'transparent';
  }
}

export default function PgvectorPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [liveMs,    setLiveMs]    = useState(3.2);
  const [liveRows,  setLiveRows]  = useState(41820);
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
            setLiveMs(Math.round((2.1 + Math.random() * 2.5) * 10) / 10);
            setLiveRows(Math.round(41000 + Math.random() * 2000));
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
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 35 : 80;
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
          construx@prod-01 — psql · pgvector · semantic search
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveMs}ms · ${liveRows.toLocaleString()} vectors` : 'querying…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx=# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          \c construx_production — pgvector 0.8.0
        </span>
      </div>

      {/* Query output */}
      <div className="px-4 pt-2 pb-1">
        {shownLines.map((l, i) => (
          <div
            key={i}
            className="text-[7.5px] leading-[1.8]"
            style={{ color: kindColor(l.kind) }}
          >
            {l.kind === 'blank' ? ' ' : (
              <>
                {l.kind === 'comment' && (
                  <span style={{ color: 'rgba(240,239,255,0.15)', marginRight: '4px' }}></span>
                )}
                {l.text}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Index info */}
      {allDone && (
        <div
          className="flex items-center gap-4 flex-wrap px-4 py-1.5 text-[7.5px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>HNSW index:</span>
          <span style={{ color: '#a78bfa' }}>m=16 · ef=64</span>
          <span style={{ color: '#4ade80' }}>search time: {liveMs}ms</span>
          <span style={{ color: '#fbbf24' }}>recall@10: 97.3%</span>
          <span style={{ color: 'rgba(240,239,255,0.3)' }}>dim: 1536</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          postgresql 16.4 · pgvector 0.8.0 · hnsw · cosine distance
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● index ready' : 'loading'}
        </span>
      </div>
    </div>
  );
}
