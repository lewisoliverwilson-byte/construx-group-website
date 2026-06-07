'use client';

import { useEffect, useRef, useState } from 'react';

const PIPELINES = [
  { name: 'traces-prod', receivers: 'otlp', processors: 'batch,filter', exporters: 'tempo,jaeger', throughput: '28400/s', status: 'running' },
  { name: 'metrics-prod', receivers: 'otlp,prometheus', processors: 'batch,transform', exporters: 'prometheus-rw', throughput: '4840/s', status: 'running' },
  { name: 'logs-prod', receivers: 'otlp,filelog', processors: 'batch,resource', exporters: 'loki', throughput: '12800/s', status: 'running' },
  { name: 'traces-staging', receivers: 'otlp', processors: 'batch', exporters: 'tempo', throughput: '2840/s', status: 'running' },
];

const SPANS = [
  { service: 'api', operation: 'POST /v1/listings', durationMs: 48, traceId: 'a1b2c3d4e5f6', status: 'ok' },
  { service: 'worker', operation: 'enrich-listing', durationMs: 284, traceId: 'b2c3d4e5f6a1', status: 'ok' },
  { service: 'search', operation: 'typesense.index', durationMs: 12, traceId: 'c3d4e5f6a1b2', status: 'ok' },
  { service: 'api', operation: 'GET /v1/search', durationMs: 28, traceId: 'd4e5f6a1b2c3', status: 'ok' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function OpenTelemetryPanel() {
  const [visible, setVisible] = useState(false);
  const [pipelineRows, setPipelineRows] = useState(0);
  const [spanRows, setSpanRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const spansPerSec = useCounter(28400, 480, 400);
  const metricsPerSec = useCounter(4840, 48, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const p = setInterval(() => setPipelineRows((x) => Math.min(x + 1, PIPELINES.length)), 160);
    const s = setInterval(() => setSpanRows((x) => Math.min(x + 1, SPANS.length)), 140);
    return () => { clearInterval(p); clearInterval(s); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(103,232,249,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(103,232,249,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(103,232,249,0.08)', background: 'rgba(103,232,249,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(103,232,249,0.4)' }}>
          opentelemetry -- observability -- traces / metrics / logs
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {spansPerSec.toLocaleString()} spans/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>otelcol@collector</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>otelcol --config /etc/otelcol/config.yaml && otel-cli span submit --name "api.request" --service api</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'spans / sec', value: spansPerSec.toLocaleString(), color: '#67e8f9' },
          { label: 'metrics / sec', value: metricsPerSec.toLocaleString(), color: '#4ade80' },
          { label: 'pipelines', value: PIPELINES.length.toString(), color: '#a78bfa' },
          { label: 'services', value: '8', color: '#fbbf24' },
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
          // collector pipelines
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {PIPELINES.slice(0, pipelineRows).map((p) => (
            <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '80px 52px 1fr 1fr 52px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600 }}>{p.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.receivers}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.processors}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.exporters}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{p.throughput}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{p.status}</span>
            </div>
          ))}
        </div>

        {/* Spans */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent spans
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SPANS.slice(0, spanRows).map((span, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 52px 80px 24px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 7, fontWeight: 600 }}>{span.service}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{span.operation}</span>
              <span className="tabular-nums" style={{ color: span.durationMs > 200 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{span.durationMs}ms</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, fontFamily: 'monospace' }}>{span.traceId}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{span.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          opentelemetry v0.104 - apache-2.0 - vendor-neutral observability
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {spansPerSec.toLocaleString()} spans/s - {metricsPerSec.toLocaleString()} metrics/s
        </span>
      </div>
    </div>
  );
}
