'use client';

import { useEffect, useRef, useState } from 'react';

const PIPELINES = [
  { name: 'traces/jaeger', receiver: 'otlp', processor: 'batch+tail', exporter: 'jaeger', spans: 4820, status: 'active' },
  { name: 'metrics/prometheus', receiver: 'otlp', processor: 'filter+delta', exporter: 'prometheus', points: 12400, status: 'active' },
  { name: 'logs/loki', receiver: 'otlp', processor: 'k8sattrib', exporter: 'loki', lines: 28000, status: 'active' },
];

const SPANS = [
  { op: 'http.server', service: 'api-gateway', dur: '12ms', status: 'OK' },
  { op: 'db.query', service: 'postgres-svc', dur: '3ms', status: 'OK' },
  { op: 'cache.get', service: 'redis-svc', dur: '0.4ms', status: 'OK' },
  { op: 'grpc.unary', service: 'auth-service', dur: '8ms', status: 'OK' },
  { op: 'messaging.send', service: 'nats-pub', dur: '1ms', status: 'OK' },
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
  const [plRows, setPlRows] = useState(0);
  const [spRows, setSpRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalSpans = useCounter(182400, 80, 600);
  const metrics = useCounter(48200, 40, 700);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const p = setInterval(() => setPlRows((x) => Math.min(x + 1, PIPELINES.length)), 160);
    const s = setInterval(() => setSpRows((x) => Math.min(x + 1, SPANS.length)), 140);
    return () => { clearInterval(p); clearInterval(s); };
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
          opentelemetry-collector -- traces / metrics / logs
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalSpans.toLocaleString()} spans/hr
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>otelcol@observe</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>otelcol-contrib --config otelcol.yaml --feature-gates=receiver.otlp.grpc.enhanced</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'spans/hr', value: totalSpans.toLocaleString(), color: '#f97316' },
          { label: 'metric pts', value: metrics.toLocaleString(), color: '#4ade80' },
          { label: 'pipelines', value: PIPELINES.length.toString(), color: '#67e8f9' },
          { label: 'services', value: '24', color: '#a78bfa' },
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
          {PIPELINES.slice(0, plRows).map((pl) => (
            <div key={pl.name} style={{ display: 'grid', gridTemplateColumns: '100px 44px 80px 68px 1fr', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 9, fontWeight: 600 }}>{pl.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 8 }}>{pl.receiver}</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 8 }}>{pl.processor}</span>
              <span style={{ color: '#a78bfa', fontSize: 8 }}>{pl.exporter}</span>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 700, textAlign: 'right' }}>ACTIVE</span>
            </div>
          ))}
        </div>

        {/* Trace spans */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent spans
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SPANS.slice(0, spRows).map((sp) => (
            <div key={sp.op + sp.service} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 36px 32px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.03)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 9, fontWeight: 600 }}>{sp.op}</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sp.service}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{sp.dur}</span>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{sp.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          opentelemetry-collector-contrib v0.102 - cncf
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalSpans.toLocaleString()} spans - {metrics.toLocaleString()} metric pts
        </span>
      </div>
    </div>
  );
}
