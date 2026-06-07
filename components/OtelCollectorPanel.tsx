'use client';

import { useEffect, useRef, useState } from 'react';

const PIPELINES = [
  { name: 'traces/prod', receivers: ['otlp'], processors: ['batch', 'memory_limiter'], exporters: ['tempo', 'jaeger'], status: 'running' },
  { name: 'metrics/prod', receivers: ['prometheus', 'otlp'], processors: ['batch'], exporters: ['prometheusremotewrite'], status: 'running' },
  { name: 'logs/prod', receivers: ['otlp', 'filelog'], processors: ['batch', 'k8sattributes'], exporters: ['loki'], status: 'running' },
];

const EXPORTERS = [
  { name: 'tempo', type: 'traces', sent: 28400, failed: 0, queue: 0 },
  { name: 'prometheusremotewrite', type: 'metrics', sent: 184200, failed: 2, queue: 12 },
  { name: 'loki', type: 'logs', sent: 42800, failed: 0, queue: 0 },
  { name: 'jaeger', type: 'traces', sent: 8400, failed: 0, queue: 0 },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function OtelCollectorPanel() {
  const [visible, setVisible] = useState(false);
  const [pRows, setPRows] = useState(0);
  const [eRows, setERows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const spansPerSec = useCounter(2840, 42, 600);
  const metricsPerSec = useCounter(18400, 120, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const p = setInterval(() => setPRows((x) => Math.min(x + 1, PIPELINES.length)), 160);
    const e = setInterval(() => setERows((x) => Math.min(x + 1, EXPORTERS.length)), 140);
    return () => { clearInterval(p); clearInterval(e); };
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
          otel collector -- traces / metrics / logs -- vendor-neutral
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {spansPerSec.toLocaleString()} spans/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#fbbf24', fontWeight: 600 }}>otelcol@obs</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>otelcol --config=/etc/otelcol/config.yaml && otelcol components</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'spans/s', value: spansPerSec.toLocaleString(), color: '#fbbf24' },
          { label: 'metrics/s', value: metricsPerSec.toLocaleString(), color: '#67e8f9' },
          { label: 'pipelines', value: PIPELINES.length.toString(), color: '#a78bfa' },
          { label: 'exporters', value: EXPORTERS.length.toString(), color: '#4ade80' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Pipelines */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // pipelines
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {PIPELINES.slice(0, pRows).map((p) => (
            <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '84px 1fr 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#fbbf24', fontSize: 8, fontWeight: 600 }}>{p.name}</span>
              <span style={{ color: 'rgba(240,239,255,0.25)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.receivers.join(',')} → {p.processors.join(',')} → {p.exporters.join(',')}
              </span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{p.status}</span>
            </div>
          ))}
        </div>

        {/* Exporters */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // exporters
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {EXPORTERS.slice(0, eRows).map((ex) => (
            <div key={ex.name} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 64px 28px 28px', alignItems: 'center', gap: 8, padding: '4px 8px', background: ex.failed > 0 ? 'rgba(248,113,113,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${ex.failed > 0 ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: '#fbbf24', fontSize: 8, fontWeight: 600 }}>{ex.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{ex.type}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 8, textAlign: 'right' }}>{ex.sent.toLocaleString()}</span>
              <span className="tabular-nums" style={{ color: ex.failed > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 8, textAlign: 'center', fontWeight: ex.failed > 0 ? 700 : 400 }}>{ex.failed}</span>
              <span className="tabular-nums" style={{ color: ex.queue > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'right' }}>{ex.queue}q</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(251,191,36,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          otel collector v0.100 - apache 2.0 - cncf
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {spansPerSec.toLocaleString()} spans/s - {metricsPerSec.toLocaleString()} metrics/s
        </span>
      </div>
    </div>
  );
}
