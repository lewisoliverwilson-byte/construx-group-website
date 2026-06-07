'use client';

import { useEffect, useRef, useState } from 'react';

const PIPELINES = [
  { name: 'traces/construx', receivers: 'otlp', processors: 'batch,memory_limiter', exporters: 'jaeger,debug', spans: 284000, dropped: 0, status: 'running' },
  { name: 'metrics/construx', receivers: 'otlp,prometheus', processors: 'batch', exporters: 'prometheus,debug', datapoints: 840000, dropped: 0, status: 'running' },
  { name: 'logs/construx', receivers: 'otlp,filelog', processors: 'batch,transform', exporters: 'loki,debug', records: 120000, dropped: 4, status: 'running' },
  { name: 'traces/infra', receivers: 'zipkin', processors: 'batch', exporters: 'jaeger', spans: 48400, dropped: 0, status: 'running' },
];

const EXPORTERS = [
  { name: 'jaeger', type: 'trace', sent: 332400, failed: 0, queue: 0, latency: 2.4 },
  { name: 'prometheus', type: 'metric', sent: 840000, failed: 0, queue: 0, latency: 0.8 },
  { name: 'loki', type: 'log', sent: 119996, failed: 4, queue: 128, latency: 8.4 },
  { name: 'debug', type: 'multi', sent: 1292400, failed: 0, queue: 0, latency: 0.1 },
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
  const [pipRows, setPipRows] = useState(0);
  const [expRows, setExpRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const spansPerSec = useCounter(28400, 240, 400);
  const totalExported = useCounter(1292400, 2400, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const p = setInterval(() => setPipRows((x) => Math.min(x + 1, PIPELINES.length)), 160);
    const e = setInterval(() => setExpRows((x) => Math.min(x + 1, EXPORTERS.length)), 140);
    return () => { clearInterval(p); clearInterval(e); };
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
          otel collector -- telemetry pipeline -- traces / metrics / logs
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {spansPerSec.toLocaleString()} spans/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>otelcol@pipeline</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>otelcol-contrib --config=/etc/otelcol/config.yaml --feature-gates=+component.UseLocalHostAsDefaultHost</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'spans/s', value: spansPerSec.toLocaleString(), color: '#a78bfa' },
          { label: 'exported', value: (totalExported / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'pipelines', value: PIPELINES.length.toString(), color: '#67e8f9' },
          { label: 'dropped', value: PIPELINES.reduce((a, p) => a + p.dropped, 0).toString(), color: '#f87171' },
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
          {PIPELINES.slice(0, pipRows).map((pip) => (
            <div key={pip.name} style={{ display: 'grid', gridTemplateColumns: '84px 1fr 28px 28px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: pip.dropped > 0 ? 'rgba(248,113,113,0.04)' : 'rgba(167,139,250,0.04)', border: `1px solid ${pip.dropped > 0 ? 'rgba(248,113,113,0.1)' : 'rgba(167,139,250,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pip.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pip.exporters}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{(('spans' in pip ? pip.spans : pip.datapoints) as number / 1000).toFixed(0)}k</span>
              <span className="tabular-nums" style={{ color: pip.dropped > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{pip.dropped}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{pip.status}</span>
            </div>
          ))}
        </div>

        {/* Exporters */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // exporters
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {EXPORTERS.slice(0, expRows).map((exp) => (
            <div key={exp.name} style={{ display: 'grid', gridTemplateColumns: '48px 40px 52px 24px 24px 40px', alignItems: 'center', gap: 8, padding: '4px 8px', background: exp.failed > 0 ? 'rgba(248,113,113,0.04)' : 'rgba(167,139,250,0.04)', border: `1px solid ${exp.failed > 0 ? 'rgba(248,113,113,0.1)' : 'rgba(167,139,250,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 7, fontWeight: 600 }}>{exp.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{exp.type}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{(exp.sent / 1000).toFixed(0)}k</span>
              <span className="tabular-nums" style={{ color: exp.failed > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{exp.failed}</span>
              <span className="tabular-nums" style={{ color: exp.queue > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{exp.queue}</span>
              <span className="tabular-nums" style={{ color: exp.latency > 5 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{exp.latency}ms</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          otelcol v0.102 - apache-2.0 - opentelemetry collector contrib
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {spansPerSec.toLocaleString()} spans/s - {(totalExported / 1000).toFixed(0)}k exported
        </span>
      </div>
    </div>
  );
}
