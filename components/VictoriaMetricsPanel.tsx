'use client';

import { useEffect, useRef, useState } from 'react';

const TENANTS = [
  { name: 'construx-prod', series: 284000, datapoints: 28400000, ingestRate: 840, queryRate: 120, retention: '1y' },
  { name: 'construx-staging', series: 48000, datapoints: 4800000, ingestRate: 120, queryRate: 24, retention: '30d' },
  { name: 'construx-infra', series: 12000, datapoints: 1200000, ingestRate: 48, queryRate: 8, retention: '90d' },
];

const QUERIES = [
  { expr: 'rate(http_requests_total[5m])', durationMs: 28, series: 284, steps: 120, status: 'ok' },
  { expr: 'histogram_quantile(0.99, rate(...))', durationMs: 84, series: 840, steps: 300, status: 'ok' },
  { expr: 'avg by(namespace)(kube_pod_info)', durationMs: 184, series: 4800, steps: 60, status: 'ok' },
  { expr: 'sum(rate(go_gc_duration_seconds[1m]))', durationMs: 12, series: 48, steps: 120, status: 'ok' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function VictoriaMetricsPanel() {
  const [visible, setVisible] = useState(false);
  const [tenRows, setTenRows] = useState(0);
  const [qRows, setQRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const ingestPerSec = useCounter(1008, 12, 400);
  const activeSeries = useCounter(344000, 48, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setTenRows((x) => Math.min(x + 1, TENANTS.length)), 160);
    const q = setInterval(() => setQRows((x) => Math.min(x + 1, QUERIES.length)), 140);
    return () => { clearInterval(t); clearInterval(q); };
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
          victoriametrics -- time series -- tenants / metricsql / ingest
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {ingestPerSec.toLocaleString()} dp/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>vmctl@cluster</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>vmctl verify-block --storageDataPath /vm-data/construx-prod && curl localhost:8481/api/v1/status/tsdb</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'ingest dp/s', value: ingestPerSec.toLocaleString(), color: '#4ade80' },
          { label: 'active series', value: (activeSeries / 1000).toFixed(0) + 'k', color: '#67e8f9' },
          { label: 'tenants', value: TENANTS.length.toString(), color: '#a78bfa' },
          { label: 'query time', value: Math.round(QUERIES.reduce((a, q) => a + q.durationMs, 0) / QUERIES.length) + 'ms', color: '#fbbf24' },
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
          {TENANTS.slice(0, tenRows).map((ten) => (
            <div key={ten.name} style={{ display: 'grid', gridTemplateColumns: '80px 48px 56px 36px 36px 32px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600 }}>{ten.name}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{(ten.series / 1000).toFixed(0)}k</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{(ten.datapoints / 1000000).toFixed(1)}M</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{ten.ingestRate}/s</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{ten.queryRate}/s</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{ten.retention}</span>
            </div>
          ))}
        </div>

        {/* Queries */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent metricsql queries
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {QUERIES.slice(0, qRows).map((q, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 36px 28px 28px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.expr}</span>
              <span className="tabular-nums" style={{ color: q.durationMs > 100 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{q.durationMs}ms</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{q.series}s</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{q.steps}p</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{q.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          victoriametrics v1.101 - apache-2.0 - fast time series db
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {ingestPerSec.toLocaleString()} dp/s - {(activeSeries / 1000).toFixed(0)}k series
        </span>
      </div>
    </div>
  );
}
