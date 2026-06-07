'use client';

import { useEffect, useRef, useState } from 'react';

const MODELS = [
  { name: 'construx/scan-classifier-v3', task: 'text-classification', downloads: 4820, likes: 84, size: '440MB' },
  { name: 'construx/listing-embedder-v2', task: 'feature-extraction', downloads: 2840, likes: 48, size: '220MB' },
  { name: 'construx/intent-detector-v1', task: 'text-classification', downloads: 1200, likes: 28, size: '110MB' },
  { name: 'construx/doc-summarizer', task: 'summarization', downloads: 840, likes: 14, size: '660MB' },
];

const INFERENCES = [
  { model: 'scan-classifier-v3', input: '"New 3-bed semi in Hackney with garden..."', latency: '42ms', tokens: 128, result: 'residential' },
  { model: 'listing-embedder-v2', input: '"Spacious studio flat near tube station"', latency: '18ms', tokens: 64, result: '[0.42, -0.18, ...]' },
  { model: 'intent-detector-v1', input: '"How much is this property worth?"', latency: '12ms', tokens: 48, result: 'valuation_query' },
  { model: 'doc-summarizer', input: '"Full planning application document..."', latency: '280ms', tokens: 512, result: '3-bed extension...' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function HuggingFacePanel() {
  const [visible, setVisible] = useState(false);
  const [mRows, setMRows] = useState(0);
  const [iRows, setIRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inferenceReqs = useCounter(2840, 12, 700);
  const totalDownloads = useCounter(9702, 8, 1400);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const m = setInterval(() => setMRows((x) => Math.min(x + 1, MODELS.length)), 160);
    const i = setInterval(() => setIRows((x) => Math.min(x + 1, INFERENCES.length)), 140);
    return () => { clearInterval(m); clearInterval(i); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(251,191,36,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(251,191,36,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(251,191,36,0.08)', background: 'rgba(251,191,36,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(251,191,36,0.4)' }}>
          huggingface hub -- model registry -- inference / fine-tunes / datasets
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {inferenceReqs.toLocaleString()} req/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#fbbf24', fontWeight: 600 }}>hf@construx</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>huggingface-cli download construx/scan-classifier-v3 && python -c "from transformers import pipeline; p = pipeline('text-classification', model='construx/scan-classifier-v3')"</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'inference req/s', value: inferenceReqs.toLocaleString(), color: '#fbbf24' },
          { label: 'total downloads', value: totalDownloads.toLocaleString(), color: '#4ade80' },
          { label: 'models', value: MODELS.length.toString(), color: '#a78bfa' },
          { label: 'total likes', value: MODELS.reduce((a, m) => a + m.likes, 0).toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Models */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // model hub
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {MODELS.slice(0, mRows).map((m) => (
            <div key={m.name} style={{ display: 'grid', gridTemplateColumns: '1fr 72px 44px 24px 40px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#fbbf24', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{m.task}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{m.downloads.toLocaleString()}</span>
              <span className="tabular-nums" style={{ color: '#f87171', fontSize: 7, textAlign: 'right' }}>{m.likes}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{m.size}</span>
            </div>
          ))}
        </div>

        {/* Inferences */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent inferences
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {INFERENCES.slice(0, iRows).map((inf) => (
            <div key={inf.model + inf.input} style={{ display: 'grid', gridTemplateColumns: '72px 1fr 36px 32px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#fbbf24', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inf.model}</span>
              <span style={{ color: 'rgba(240,239,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inf.input}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{inf.latency}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{inf.tokens}t</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(251,191,36,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          huggingface hub - apache-2.0 - ml model registry
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {MODELS.length} models - {inferenceReqs.toLocaleString()} req/s
        </span>
      </div>
    </div>
  );
}
