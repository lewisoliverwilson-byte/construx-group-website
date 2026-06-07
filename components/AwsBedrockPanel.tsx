'use client';

import { useEffect, useRef, useState } from 'react';

const MODELS = [
  { id: 'anthropic.claude-3-5-sonnet', provider: 'Anthropic', inputTokens: 284000, outputTokens: 48400, latency: 840, cost: '$0.84' },
  { id: 'amazon.titan-embed-v2', provider: 'Amazon', inputTokens: 840000, outputTokens: 840000, latency: 84, cost: '$0.08' },
  { id: 'meta.llama3-70b-instruct', provider: 'Meta', inputTokens: 120000, outputTokens: 28400, latency: 2400, cost: '$0.62' },
  { id: 'stability.stable-diffusion-xl', provider: 'Stability', inputTokens: 4800, outputTokens: 4800, latency: 8400, cost: '$0.04' },
];

const GUARDRAILS = [
  { name: 'construx-content-policy', blocked: 12, allowed: 284000, topics: 4, pii: 'mask', status: 'active' },
  { name: 'construx-grounding', blocked: 4, allowed: 120000, topics: 2, pii: 'none', status: 'active' },
  { name: 'construx-moderation', blocked: 28, allowed: 840000, topics: 8, pii: 'block', status: 'active' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function AwsBedrockPanel() {
  const [visible, setVisible] = useState(false);
  const [modelRows, setModelRows] = useState(0);
  const [grRows, setGrRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const invocations = useCounter(284000, 840, 400);
  const tokensPerSec = useCounter(48400, 480, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const m = setInterval(() => setModelRows((x) => Math.min(x + 1, MODELS.length)), 160);
    const g = setInterval(() => setGrRows((x) => Math.min(x + 1, GUARDRAILS.length)), 140);
    return () => { clearInterval(m); clearInterval(g); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(249,115,22,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(249,115,22,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(249,115,22,0.08)', background: 'rgba(249,115,22,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(249,115,22,0.4)' }}>
          aws bedrock -- foundation models -- invocations / guardrails / tokens
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {tokensPerSec.toLocaleString()} tok/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>aws@bedrock</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>aws bedrock list-foundation-models --by-output-modality TEXT && aws bedrock-runtime invoke-model --model-id anthropic.claude-3-5-sonnet</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'invocations', value: (invocations / 1000).toFixed(0) + 'k', color: '#f97316' },
          { label: 'tokens/s', value: tokensPerSec.toLocaleString(), color: '#67e8f9' },
          { label: 'models', value: MODELS.length.toString(), color: '#4ade80' },
          { label: 'guardrails', value: GUARDRAILS.length.toString(), color: '#a78bfa' },
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
          // active models
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {MODELS.slice(0, modelRows).map((m) => (
            <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1fr 48px 48px 48px 40px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.id}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{(m.inputTokens / 1000).toFixed(0)}k</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{(m.outputTokens / 1000).toFixed(0)}k</span>
              <span className="tabular-nums" style={{ color: m.latency > 2000 ? '#fbbf24' : '#67e8f9', fontSize: 7, textAlign: 'right' }}>{m.latency}ms</span>
              <span style={{ color: '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{m.cost}</span>
            </div>
          ))}
        </div>

        {/* Guardrails */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // guardrails
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {GUARDRAILS.slice(0, grRows).map((gr) => (
            <div key={gr.name} style={{ display: 'grid', gridTemplateColumns: '1fr 28px 52px 24px 40px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gr.name}</span>
              <span className="tabular-nums" style={{ color: '#f87171', fontSize: 7, textAlign: 'center' }}>{gr.blocked}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{(gr.allowed / 1000).toFixed(0)}k</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{gr.topics}t</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{gr.pii}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{gr.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          aws bedrock - proprietary - foundation model api
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {(invocations / 1000).toFixed(0)}k invocations - {tokensPerSec.toLocaleString()} tok/s
        </span>
      </div>
    </div>
  );
}
