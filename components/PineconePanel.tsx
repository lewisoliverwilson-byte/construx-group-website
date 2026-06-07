'use client';

import { useEffect, useRef, useState } from 'react';

const INDEXES = [
  { name: 'construx-listings', dimension: 1536, metric: 'cosine', vectors: 284000, namespaces: 4, replicas: 2, status: 'ready' },
  { name: 'construx-users', dimension: 768, metric: 'dotproduct', vectors: 48400, namespaces: 1, replicas: 1, status: 'ready' },
  { name: 'construx-docs', dimension: 1536, metric: 'cosine', vectors: 84000, namespaces: 2, replicas: 1, status: 'ready' },
  { name: 'construx-images', dimension: 512, metric: 'euclidean', vectors: 184000, namespaces: 3, replicas: 2, status: 'ready' },
];

const QUERIES = [
  { index: 'construx-listings', topK: 10, latency: 28, filters: 2, namespace: 'prod', results: 10, status: 'ok' },
  { index: 'construx-users', topK: 5, latency: 12, filters: 1, namespace: 'default', results: 5, status: 'ok' },
  { index: 'construx-docs', topK: 20, latency: 48, filters: 0, namespace: 'prod', results: 18, status: 'ok' },
  { index: 'construx-images', topK: 10, latency: 24, filters: 3, namespace: 'thumbnails', results: 10, status: 'ok' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function PineconePanel() {
  const [visible, setVisible] = useState(false);
  const [indexRows, setIndexRows] = useState(0);
  const [queryRows, setQueryRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const queriesPerSec = useCounter(2840, 12, 600);
  const vectorsTotal = useCounter(600400, 240, 700);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const ix = setInterval(() => setIndexRows((x) => Math.min(x + 1, INDEXES.length)), 160);
    const q = setInterval(() => setQueryRows((x) => Math.min(x + 1, QUERIES.length)), 140);
    return () => { clearInterval(ix); clearInterval(q); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(167,139,250,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(167,139,250,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(167,139,250,0.08)', background: 'rgba(167,139,250,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(167,139,250,0.4)' }}>
          pinecone -- vector database -- indexes / embeddings / similarity search
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {queriesPerSec.toLocaleString()} queries/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>pinecone@vectors</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>pinecone index list && pinecone query --index construx-listings --top-k 10 --vector $EMBED</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'queries / sec', value: queriesPerSec.toLocaleString(), color: '#a78bfa' },
          { label: 'total vectors', value: (vectorsTotal / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'indexes', value: INDEXES.length.toString(), color: '#67e8f9' },
          { label: 'namespaces', value: INDEXES.reduce((a, i) => a + i.namespaces, 0).toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Indexes */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // indexes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {INDEXES.slice(0, indexRows).map((ix) => (
            <div key={ix.name} style={{ display: 'grid', gridTemplateColumns: '1fr 28px 52px 48px 20px 20px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ix.name}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{ix.dimension}d</span>
              <span style={{ color: '#fbbf24', fontSize: 7 }}>{ix.metric}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{(ix.vectors / 1000).toFixed(0)}k</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{ix.namespaces}ns</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{ix.replicas}r</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{ix.status}</span>
            </div>
          ))}
        </div>

        {/* Queries */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // similarity queries
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {QUERIES.slice(0, queryRows).map((q, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 20px 32px 20px 48px 24px 24px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.index}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{q.topK}k</span>
              <span className="tabular-nums" style={{ color: q.latency > 40 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{q.latency}ms</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{q.filters}f</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{q.namespace}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{q.results}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{q.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          pinecone v3 - proprietary - vector database built for scale
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {queriesPerSec.toLocaleString()} q/s - {(vectorsTotal / 1000).toFixed(0)}k vectors
        </span>
      </div>
    </div>
  );
}
