'use client';

import { useEffect, useRef, useState } from 'react';

const TENANTS = [
  { name: 'construx-prod', traceCount: 28400000, spanCount: 284000000, retentionDays: 14, ingestRatePerSec: 28400, queryRatePerSec: 48, status: 'active' },
  { name: 'construx-staging', traceCount: 2840000, spanCount: 28400000, retentionDays: 7, ingestRatePerSec: 2840, queryRatePerSec: 12, status: 'active' },
  { name: 'construx-dev', traceCount: 284000, spanCount: 2840000, retentionDays: 3, ingestRatePerSec: 284, queryRatePerSec: 4, status: 'active' },
];

const TRACES = [
  { traceId: 'a1b2c3d4e5f6', rootSpan: 'POST /v1/listings', services: 4, duration: 284, spans: 28, status: 'ok' },
  { traceId: 'b2c3d4e5f6a1', rootSpan: 'GET /v1/search?q=flat+london', services: 3, duration: 48, spans: 12, status: 'ok' },
  { traceId: 'c3d4e5f6a1b2', rootSpan: 'enrich-listing job', services: 5, duration: 840, spans: 48, status: 'ok' },
  { traceId: 'd4e5f6a1b2c3', rootSpan: 'POST /v1/users', services: 2, duration: 28, spans: 8, status: 'ok' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function TempoPanel() {
  const [visible, setVisible] = useState(false);
  const [tenantRows, setTenantRows] = useState(0);
  const [traceRows, setTraceRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const spansPerSec = useCounter(28400, 480, 400);
  const tracesTotal = useCounter(31524000, 4800, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setTenantRows((x) => Math.min(x + 1, TENANTS.length)), 160);
    const tr = setInterval(() => setTraceRows((x) => Math.min(x + 1, TRACES.length)), 140);
    return () => { clearInterval(t); clearInterval(tr); };
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
          grafana tempo -- distributed tracing -- traces / spans / tenants
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {spansPerSec.toLocaleString()} spans/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>tempo@tracing</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>curl -s "localhost:3200/api/search?limit=10" | jq && tempo-cli backend list blocks --backend s3</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'spans / sec', value: spansPerSec.toLocaleString(), color: '#f97316' },
          { label: 'traces stored', value: (tracesTotal / 1000000).toFixed(1) + 'M', color: '#4ade80' },
          { label: 'tenants', value: TENANTS.length.toString(), color: '#67e8f9' },
          { label: 'retention', value: '14d', color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Tenants */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // tenants
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {TENANTS.slice(0, tenantRows).map((t) => (
            <div key={t.name} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr 28px 52px 44px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600 }}>{t.name}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{(t.traceCount / 1000000).toFixed(1)}M</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7 }}>{(t.spanCount / 1000000).toFixed(0)}M spans</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{t.retentionDays}d</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{t.ingestRatePerSec}/s</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{t.queryRatePerSec}q/s</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{t.status}</span>
            </div>
          ))}
        </div>

        {/* Recent Traces */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent traces
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TRACES.slice(0, traceRows).map((trace, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 20px 52px 20px 24px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, fontFamily: 'monospace' }}>{trace.traceId}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trace.rootSpan}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{trace.services}s</span>
              <span className="tabular-nums" style={{ color: trace.duration > 500 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{trace.duration}ms</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{trace.spans}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{trace.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          grafana tempo v2.5 - agpl-3.0 - distributed tracing backend
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {spansPerSec.toLocaleString()} spans/s - {(tracesTotal / 1000000).toFixed(1)}M traces
        </span>
      </div>
    </div>
  );
}
