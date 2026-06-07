'use client';

import { useEffect, useRef, useState } from 'react';

const MODELS = [
  { name: 'llama3.2', size: '2.0GB', params: '3B', quantization: 'Q4_K_M', format: 'gguf', status: 'loaded' },
  { name: 'phi3.5', size: '2.2GB', params: '3.8B', quantization: 'Q4_0', format: 'gguf', status: 'loaded' },
  { name: 'mistral', size: '4.1GB', params: '7B', quantization: 'Q4_K_M', format: 'gguf', status: 'available' },
  { name: 'nomic-embed-text', size: '274MB', params: '137M', quantization: 'F16', format: 'gguf', status: 'loaded' },
];

const GENERATIONS = [
  { prompt: 'Summarise this property listing for SEO', model: 'llama3.2', tokens: 284, promptTokens: 48, latency: 840, status: 'ok' },
  { prompt: 'Embed listing description for similarity', model: 'nomic-embed-text', tokens: 0, promptTokens: 120, latency: 48, status: 'ok' },
  { prompt: 'Extract structured data from HTML', model: 'phi3.5', tokens: 184, promptTokens: 840, latency: 1200, status: 'ok' },
  { prompt: 'Generate property description', model: 'llama3.2', tokens: 384, promptTokens: 28, latency: 960, status: 'ok' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function OllamaPanel() {
  const [visible, setVisible] = useState(false);
  const [modelRows, setModelRows] = useState(0);
  const [genRows, setGenRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const tokensGenerated = useCounter(284000, 480, 400);
  const requestsTotal = useCounter(2840, 12, 700);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const m = setInterval(() => setModelRows((x) => Math.min(x + 1, MODELS.length)), 160);
    const g = setInterval(() => setGenRows((x) => Math.min(x + 1, GENERATIONS.length)), 140);
    return () => { clearInterval(m); clearInterval(g); };
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
          ollama -- local llm -- models / generations / embeddings
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {(tokensGenerated / 1000).toFixed(0)}k tokens
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>ollama@gpu</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>ollama list && ollama run llama3.2 "Summarise this property listing for SEO"</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'tokens gen', value: (tokensGenerated / 1000).toFixed(0) + 'k', color: '#a78bfa' },
          { label: 'requests', value: requestsTotal.toLocaleString(), color: '#67e8f9' },
          { label: 'models', value: MODELS.length.toString(), color: '#4ade80' },
          { label: 'loaded', value: MODELS.filter(m => m.status === 'loaded').length.toString(), color: '#fbbf24' },
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
          // local models
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {MODELS.slice(0, modelRows).map((model) => (
            <div key={model.name} style={{ display: 'grid', gridTemplateColumns: '84px 40px 36px 52px 36px 52px', alignItems: 'center', gap: 8, padding: '5px 8px', background: model.status === 'loaded' ? 'rgba(167,139,250,0.05)' : 'rgba(167,139,250,0.03)', border: `1px solid ${model.status === 'loaded' ? 'rgba(167,139,250,0.15)' : 'rgba(167,139,250,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600 }}>{model.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{model.size}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{model.params}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{model.quantization}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{model.format}</span>
              <span style={{ color: model.status === 'loaded' ? '#4ade80' : 'rgba(255,255,255,0.3)', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{model.status}</span>
            </div>
          ))}
        </div>

        {/* Generations */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent generations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {GENERATIONS.slice(0, genRows).map((gen, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 36px 40px 44px 24px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gen.prompt}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gen.model}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{gen.tokens}t</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{gen.promptTokens}p</span>
              <span className="tabular-nums" style={{ color: gen.latency > 1000 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{gen.latency}ms</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{gen.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          ollama v0.3 - mit - run llms locally
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {requestsTotal.toLocaleString()} reqs - {(tokensGenerated / 1000).toFixed(0)}k tokens
        </span>
      </div>
    </div>
  );
}
