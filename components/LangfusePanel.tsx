'use client';

import { useEffect, useRef, useState } from 'react';

const TRACES = [
  { name: 'product-scan', model: 'claude-sonnet-4-6', tokens: 2840, latency: '1.2s', cost: '$0.0042', status: 'success' },
  { name: 'listing-gen', model: 'claude-opus-4-8', tokens: 8400, latency: '4.8s', cost: '$0.0252', status: 'success' },
  { name: 'search-rerank', model: 'claude-haiku-4-5', tokens: 420, latency: '0.4s', cost: '$0.0002', status: 'success' },
  { name: 'intent-classify', model: 'claude-sonnet-4-6', tokens: 840, latency: '0.8s', cost: '$0.0012', status: 'error' },
];

const EVALS = [
  { name: 'hallucination', score: 0.96, threshold: 0.90, pass: true, runs: 284 },
  { name: 'toxicity', score: 0.99, threshold: 0.95, pass: true, runs: 284 },
  { name: 'correctness', score: 0.84, threshold: 0.85, pass: false, runs: 120 },
  { name: 'coherence', score: 0.92, threshold: 0.88, pass: true, runs: 284 },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function LangfusePanel() {
  const [visible, setVisible] = useState(false);
  const [tRows, setTRows] = useState(0);
  const [eRows, setERows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const tracesTotal = useCounter(2840, 14, 800);
  const totalTokens = useCounter(284000, 420, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setTRows((x) => Math.min(x + 1, TRACES.length)), 160);
    const e = setInterval(() => setERows((x) => Math.min(x + 1, EVALS.length)), 140);
    return () => { clearInterval(t); clearInterval(e); };
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
          langfuse -- llm observability -- traces / evals / cost
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {tracesTotal.toLocaleString()} traces
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>langfuse@llm</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>langfuse traces list --project construx --limit 10 && langfuse evals run --dataset prod</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'total traces', value: tracesTotal.toLocaleString(), color: '#a78bfa' },
          { label: 'total tokens', value: (totalTokens / 1000).toFixed(0) + 'k', color: '#67e8f9' },
          { label: 'eval pass', value: EVALS.filter(e => e.pass).length + '/' + EVALS.length, color: '#4ade80' },
          { label: 'errors', value: TRACES.filter(t => t.status === 'error').length.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Traces */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // traces
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {TRACES.slice(0, tRows).map((t) => (
            <div key={t.name} style={{ display: 'grid', gridTemplateColumns: '72px 1fr 40px 32px 44px 40px', alignItems: 'center', gap: 8, padding: '5px 8px', background: t.status === 'error' ? 'rgba(248,113,113,0.04)' : 'rgba(167,139,250,0.04)', border: `1px solid ${t.status === 'error' ? 'rgba(248,113,113,0.1)' : 'rgba(167,139,250,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600 }}>{t.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.model}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{t.tokens.toLocaleString()}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{t.latency}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{t.cost}</span>
              <span style={{ color: t.status === 'error' ? '#f87171' : '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{t.status}</span>
            </div>
          ))}
        </div>

        {/* Evals */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // evaluations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {EVALS.slice(0, eRows).map((ev) => (
            <div key={ev.name} style={{ display: 'grid', gridTemplateColumns: '72px 44px 44px 40px 24px', alignItems: 'center', gap: 8, padding: '4px 8px', background: ev.pass ? 'rgba(74,222,128,0.04)' : 'rgba(248,113,113,0.04)', border: `1px solid ${ev.pass ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 8, fontWeight: 600 }}>{ev.name}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 8, textAlign: 'right' }}>{ev.score}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>≥{ev.threshold}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{ev.runs}</span>
              <span style={{ color: ev.pass ? '#4ade80' : '#f87171', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{ev.pass ? '✓' : '✗'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          langfuse v3.0 - mit - llm engineering platform
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {tracesTotal.toLocaleString()} traces - {(totalTokens / 1000).toFixed(0)}k tokens
        </span>
      </div>
    </div>
  );
}
