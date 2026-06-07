'use client';

import { useEffect, useRef, useState } from 'react';

const STREAMS = [
  { name: 'k8s_events', type: 'logs', records: 284200, size: '1.2 GB', compression: '12x', retention: '30d' },
  { name: 'metrics_default', type: 'metrics', records: 1842000, size: '4.8 GB', compression: '18x', retention: '90d' },
  { name: 'app_traces', type: 'traces', records: 84000, size: '640 MB', compression: '8x', retention: '7d' },
];

const QUERIES = [
  { query: 'k8s_events | match(str.contains(log, "error"))', stream: 'k8s_events', hits: 284, latency: '12ms', cached: true },
  { query: 'avg(http_request_duration_seconds) by (service)', stream: 'metrics_default', hits: 48, latency: '8ms', cached: false },
  { query: 'app_traces | where duration > 500ms', stream: 'app_traces', hits: 12, latency: '6ms', cached: true },
  { query: 'k8s_events | match(str.contains(log, "oom"))', stream: 'k8s_events', hits: 2, latency: '9ms', cached: false },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function OpenObservePanel() {
  const [visible, setVisible] = useState(false);
  const [sRows, setSRows] = useState(0);
  const [qRows, setQRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const ingestRate = useCounter(42000, 280, 500);
  const totalRecords = STREAMS.reduce((a, s) => a + s.records, 0);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setSRows((x) => Math.min(x + 1, STREAMS.length)), 160);
    const q = setInterval(() => setQRows((x) => Math.min(x + 1, QUERIES.length)), 140);
    return () => { clearInterval(s); clearInterval(q); };
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
          openobserve -- logs / metrics / traces -- rust native
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {ingestRate.toLocaleString()} records/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>o2@observe</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>curl -H "Authorization: Basic $O2_AUTH" "http://o2:5080/api/default/streams" | jq</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'records/s', value: ingestRate.toLocaleString(), color: '#f97316' },
          { label: 'total records', value: (totalRecords / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'streams', value: STREAMS.length.toString(), color: '#a78bfa' },
          { label: 'cache hits', value: QUERIES.filter(q => q.cached).length.toString(), color: '#67e8f9' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Streams */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // streams
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {STREAMS.slice(0, sRows).map((s) => (
            <div key={s.name} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 64px 28px 28px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600 }}>{s.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{s.type}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 8, textAlign: 'right' }}>{s.size}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{s.compression}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{s.retention}</span>
            </div>
          ))}
        </div>

        {/* Queries */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent queries
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {QUERIES.slice(0, qRows).map((q) => (
            <div key={q.query} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 24px 28px', alignItems: 'center', gap: 8, padding: '4px 8px', background: q.cached ? 'rgba(74,222,128,0.04)' : 'rgba(249,115,22,0.04)', border: `1px solid ${q.cached ? 'rgba(74,222,128,0.08)' : 'rgba(249,115,22,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.3)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.query}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 8, textAlign: 'right' }}>{q.hits}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{q.latency}</span>
              <span style={{ color: q.cached ? '#4ade80' : 'rgba(255,255,255,0.15)', fontSize: 7, fontWeight: q.cached ? 700 : 400, textAlign: 'right' }}>{q.cached ? 'hit' : 'miss'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          openobserve v0.10 - agpl-3.0 - rust native o11y
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {STREAMS.length} streams - {ingestRate.toLocaleString()} rec/s
        </span>
      </div>
    </div>
  );
}
