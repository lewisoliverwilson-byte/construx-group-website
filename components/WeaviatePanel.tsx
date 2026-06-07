'use client';

import { useEffect, useRef, useState } from 'react';

const COLLECTIONS = [
  { name: 'Product', objects: 48200, properties: 14, vectorizer: 'text2vec-openai', distance: 'cosine' },
  { name: 'Article', objects: 2840, properties: 8, vectorizer: 'text2vec-cohere', distance: 'cosine' },
  { name: 'UserProfile', objects: 12400, properties: 6, vectorizer: 'text2vec-openai', distance: 'dot' },
  { name: 'Embedding', objects: 84000, properties: 4, vectorizer: 'none', distance: 'cosine' },
];

const QUERIES = [
  { query: 'nearText: "wireless audio"', collection: 'Product', hits: 20, latency: '8ms', certainty: 0.84 },
  { query: 'nearText: "grafana observability"', collection: 'Article', hits: 10, latency: '4ms', certainty: 0.91 },
  { query: 'nearVector: [0.12, -0.84, ...]', collection: 'Embedding', hits: 50, latency: '2ms', certainty: 0.77 },
  { query: 'hybrid: "construx API"', collection: 'Article', hits: 8, latency: '6ms', certainty: 0.88 },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function WeaviatePanel() {
  const [visible, setVisible] = useState(false);
  const [cRows, setCRows] = useState(0);
  const [qRows, setQRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const queriesPerSec = useCounter(840, 14, 700);
  const totalObjects = COLLECTIONS.reduce((a, c) => a + c.objects, 0);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const c = setInterval(() => setCRows((x) => Math.min(x + 1, COLLECTIONS.length)), 160);
    const q = setInterval(() => setQRows((x) => Math.min(x + 1, QUERIES.length)), 140);
    return () => { clearInterval(c); clearInterval(q); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(74,222,128,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(74,222,128,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(74,222,128,0.08)', background: 'rgba(74,222,128,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(74,222,128,0.4)' }}>
          weaviate -- ml-native vector db -- hybrid search / graphql
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {queriesPerSec.toLocaleString()} queries/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>weaviate@vector</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>curl -H "Authorization: Bearer $WV_KEY" "http://weaviate:8080/v1/schema" | jq '.classes[].class'</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'queries/s', value: queriesPerSec.toLocaleString(), color: '#4ade80' },
          { label: 'total objects', value: (totalObjects / 1000).toFixed(0) + 'k', color: '#67e8f9' },
          { label: 'collections', value: COLLECTIONS.length.toString(), color: '#a78bfa' },
          { label: 'vectorizers', value: [...new Set(COLLECTIONS.filter(c => c.vectorizer !== 'none').map(c => c.vectorizer))].length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Collections */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // collections
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {COLLECTIONS.slice(0, cRows).map((c) => (
            <div key={c.name} style={{ display: 'grid', gridTemplateColumns: '60px 52px 24px 1fr 36px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600 }}>{c.name}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 8, textAlign: 'right' }}>{c.objects.toLocaleString()}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 8, textAlign: 'center' }}>{c.properties}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.vectorizer}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{c.distance}</span>
            </div>
          ))}
        </div>

        {/* Queries */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent queries
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {QUERIES.slice(0, qRows).map((q) => (
            <div key={q.query} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 32px 28px 32px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.3)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.query}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.collection}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 8, textAlign: 'right' }}>{q.hits}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{q.latency}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{q.certainty}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          weaviate v1.25 - bsd-3 - ml-native vector db
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {(totalObjects / 1000).toFixed(0)}k objects - {queriesPerSec.toLocaleString()} q/s
        </span>
      </div>
    </div>
  );
}
