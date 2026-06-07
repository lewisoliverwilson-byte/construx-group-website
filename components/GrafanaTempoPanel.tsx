'use client';

import { useEffect, useRef, useState } from 'react';

const TRACES = [
  { traceId: '4f8a2e1d', service: 'api-gateway', op: 'POST /v1/infer', dur: '184ms', spans: 8, status: 'OK' },
  { traceId: 'b9c3f714', service: 'auth-service', op: 'validateToken', dur: '12ms', spans: 3, status: 'OK' },
  { traceId: '7e1d4a82', service: 'ml-service', op: 'embed.batch', dur: '2.4s', spans: 14, status: 'OK' },
  { traceId: 'c2a0e531', service: 'postgres-svc', op: 'SELECT vectors', dur: '28ms', spans: 2, status: 'OK' },
  { traceId: '9d5f83bc', service: 'export-worker', op: 'pdf.render', dur: '420ms', spans: 6, status: 'ERROR' },
];

const BACKENDS = [
  { name: 's3-traces', type: 'object-store', backend: 's3', retention: '30d', used: '84 GB' },
  { name: 'local-cache', type: 'cache', backend: 'memcached', retention: '1h', used: '2.1 GB' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function GrafanaTempoPanel() {
  const [visible, setVisible] = useState(false);
  const [trRows, setTrRows] = useState(0);
  const [bkRows, setBkRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const ingestRate = useCounter(4820, 24, 700);
  const totalTraces = useCounter(182400, 100, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setTrRows((x) => Math.min(x + 1, TRACES.length)), 150);
    const b = setInterval(() => setBkRows((x) => Math.min(x + 1, BACKENDS.length)), 170);
    return () => { clearInterval(t); clearInterval(b); };
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
          grafana tempo -- distributed tracing -- s3 backend
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {ingestRate.toLocaleString()} spans/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>tempo@tracing</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>tempo-cli query --query={'"{service.name=\\"api-gateway\\"}"'} --since 15m</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'spans/s', value: ingestRate.toLocaleString(), color: '#f97316' },
          { label: 'traces stored', value: totalTraces.toLocaleString(), color: '#4ade80' },
          { label: 'services', value: '24', color: '#67e8f9' },
          { label: 'p99 latency', value: '2.4s', color: '#a78bfa' },
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
          // recent traces
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {TRACES.slice(0, trRows).map((tr) => (
            <div key={tr.traceId} style={{ display: 'grid', gridTemplateColumns: '56px 80px 1fr 44px 24px 40px', alignItems: 'center', gap: 8, padding: '5px 8px', background: tr.status === 'ERROR' ? 'rgba(248,113,113,0.05)' : 'rgba(249,115,22,0.04)', border: `1px solid ${tr.status === 'ERROR' ? 'rgba(248,113,113,0.15)' : 'rgba(249,115,22,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 8, fontFamily: 'monospace' }}>{tr.traceId}</span>
              <span style={{ color: '#f97316', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.service}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.op}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{tr.dur}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 8, textAlign: 'right' }}>{tr.spans}</span>
              <span style={{ color: tr.status === 'ERROR' ? '#f87171' : '#4ade80', fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{tr.status}</span>
            </div>
          ))}
        </div>

        {/* Backend */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // storage backends
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {BACKENDS.slice(0, bkRows).map((bk) => (
            <div key={bk.name} style={{ display: 'grid', gridTemplateColumns: '80px 64px 56px 48px 1fr', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.03)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600 }}>{bk.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 8 }}>{bk.type}</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 8 }}>{bk.backend}</span>
              <span style={{ color: '#fbbf24', fontSize: 8 }}>{bk.retention}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, textAlign: 'right' }}>{bk.used}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          grafana tempo v2.5 - apache 2.0 - s3 + parquet
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalTraces.toLocaleString()} traces - {ingestRate.toLocaleString()} spans/s
        </span>
      </div>
    </div>
  );
}
