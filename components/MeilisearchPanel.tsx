'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'key' | 'val' | 'hit' | 'facet' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# Meilisearch — typo-tolerant full-text search API' },
  { kind: 'prompt',  text: 'curl -X POST http://localhost:7700/indexes/journal/search -H "Content-Type: application/json"' },
  { kind: 'key',     text: '  -d \'{"q": "grpc protobuf", "limit": 3, "attributesToHighlight": ["title", "excerpt"]}\'' },
  { kind: 'blank',   text: '' },
  { kind: 'val',     text: '{' },
  { kind: 'key',     text: '  "hits": [' },
  { kind: 'hit',     text: '    { "id": "dispatch-881", "title": "gRPC: Protocol Buffers, service definitions, and streaming RPCs",' },
  { kind: 'hit',     text: '      "_rankingScore": 0.9984, "_matchesPosition": {"title": [{"start":0,"length":4}]} },' },
  { kind: 'hit',     text: '    { "id": "dispatch-848", "title": "Thanos: multi-cluster Prometheus aggregation",' },
  { kind: 'hit',     text: '      "_rankingScore": 0.7123 },' },
  { kind: 'hit',     text: '    { "id": "dispatch-836", "title": "Temporal: durable workflow execution engine",' },
  { kind: 'hit',     text: '      "_rankingScore": 0.6891 }' },
  { kind: 'key',     text: '  ],' },
  { kind: 'val',     text: '  "query": "grpc protobuf",' },
  { kind: 'val',     text: '  "processingTimeMs": 2,' },
  { kind: 'val',     text: '  "estimatedTotalHits": 3' },
  { kind: 'key',     text: '}' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# Typo-tolerance demo — "kuberntes" still matches "kubernetes"' },
  { kind: 'prompt',  text: 'curl -s localhost:7700/indexes/journal/search -d \'{"q":"kuberntes cilium"}\' | jq .hits[0].title' },
  { kind: 'hit',     text: '"Cilium: eBPF-native networking and identity-based security for Kubernetes"' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# Index statistics' },
  { kind: 'prompt',  text: 'curl localhost:7700/indexes/journal/stats | jq .' },
  { kind: 'stat',    text: '  "numberOfDocuments": 901,' },
  { kind: 'stat',    text: '  "isIndexing": false,' },
  { kind: 'stat',    text: '  "fieldDistribution": {' },
  { kind: 'stat',    text: '    "title": 901, "excerpt": 901, "tag": 901, "date": 901' },
  { kind: 'stat',    text: '  }' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# Faceted search — filter by tag' },
  { kind: 'prompt',  text: 'curl localhost:7700/indexes/journal/search -d \'{"q":"", "facets":["tag"]}\' | jq .facetDistribution' },
  { kind: 'facet',   text: '{ "tag": { "Build Log": 882, "Strategy": 11, "Product": 5, "Methodology": 3 } }' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'key':     return '#fbbf24';
    case 'val':     return '#4ade80';
    case 'hit':     return '#67e8f9';
    case 'facet':   return '#a78bfa';
    case 'stat':    return '#fb923c';
    default:        return 'transparent';
  }
}

export default function MeilisearchPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveLatMs,   setLiveLatMs]   = useState(2);
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
            setLiveLatMs(1 + Math.floor(Math.random() * 4));
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
          construx@prod-01 — meilisearch · journal index · typo-tolerant search
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveLatMs}ms avg` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          meilisearch v1.9 · 901 documents · typo tolerance · facets
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Meilisearch v1.9 ·</span>
          <span style={{ color: '#4ade80' }}>901 documents</span>
          <span style={{ color: '#67e8f9' }}>{liveLatMs}ms search</span>
          <span style={{ color: '#a78bfa' }}>4 facets</span>
          <span style={{ color: '#fbbf24' }}>typo tolerance: on</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          Meilisearch 1.9.0 · Rust · single binary · HTTPS + API key auth
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● ready' : 'loading'}
        </span>
      </div>
    </div>
  );
}
