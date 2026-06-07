'use client';

import { useEffect, useRef, useState } from 'react';

const STORES = [
  { component: 'sidecar', endpoint: 'thanos-sidecar-01:10901', type: 'sidecar', minTime: 'now-2h', maxTime: 'now', labelSets: 284, status: 'up' },
  { component: 'store-gw', endpoint: 'thanos-store:10901', type: 'store', minTime: '2024-01-01', maxTime: 'now-2h', labelSets: 4840, status: 'up' },
  { component: 'ruler', endpoint: 'thanos-ruler:10901', type: 'rule', minTime: 'now-6h', maxTime: 'now', labelSets: 48, status: 'up' },
  { component: 'compact', endpoint: 'thanos-compact:10902', type: 'compactor', minTime: 'n/a', maxTime: 'n/a', labelSets: 0, status: 'up' },
];

const QUERIES = [
  { query: 'rate(http_requests_total{job="construx-api"}[5m])', duration: '48ms', series: 12, dedup: true, status: 'ok' },
  { query: 'sum(container_memory_usage_bytes) by (namespace)', duration: '124ms', series: 8, dedup: true, status: 'ok' },
  { query: 'histogram_quantile(0.99, rate(request_duration_seconds_bucket[1m]))', duration: '84ms', series: 24, dedup: false, status: 'ok' },
  { query: 'ALERTS{alertstate="firing"}', duration: '28ms', series: 3, dedup: true, status: 'ok' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function ThanosPanel() {
  const [visible, setVisible] = useState(false);
  const [storeRows, setStoreRows] = useState(0);
  const [queryRows, setQueryRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const samplesQueried = useCounter(284000, 2400, 400);
  const blocksCompacted = useCounter(2840, 4, 800);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setStoreRows((x) => Math.min(x + 1, STORES.length)), 160);
    const q = setInterval(() => setQueryRows((x) => Math.min(x + 1, QUERIES.length)), 140);
    return () => { clearInterval(s); clearInterval(q); };
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
          thanos -- ha prometheus -- stores / querier / compaction
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {(samplesQueried / 1000).toFixed(0)}k samples/q
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#fbbf24', fontWeight: 600 }}>thanos@querier</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>thanos query --store thanos-sidecar-01:10901 --store thanos-store:10901 --query.replica-label replica</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'samples / query', value: (samplesQueried / 1000).toFixed(0) + 'k', color: '#fbbf24' },
          { label: 'blocks compacted', value: blocksCompacted.toLocaleString(), color: '#4ade80' },
          { label: 'stores', value: STORES.length.toString(), color: '#67e8f9' },
          { label: 'all up', value: STORES.filter(s => s.status === 'up').length.toString(), color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Stores */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // store nodes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {STORES.slice(0, storeRows).map((s) => (
            <div key={s.component} style={{ display: 'grid', gridTemplateColumns: '64px 1fr 48px 48px 28px 28px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#fbbf24', fontSize: 8, fontWeight: 600 }}>{s.component}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.endpoint}</span>
              <span style={{ color: '#a78bfa', fontSize: 7 }}>{s.type}</span>
              <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.minTime}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{s.labelSets}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{s.status}</span>
            </div>
          ))}
        </div>

        {/* Queries */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent queries
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {QUERIES.slice(0, queryRows).map((q, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 24px 36px 24px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.query}</span>
              <span className="tabular-nums" style={{ color: Number(q.duration.replace('ms','')) > 100 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{q.duration}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{q.series}s</span>
              <span style={{ color: q.dedup ? '#4ade80' : 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{q.dedup ? 'dedup' : 'raw'}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{q.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(251,191,36,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          thanos v0.36 - apache-2.0 - highly available prometheus with long-term storage
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {(samplesQueried / 1000).toFixed(0)}k samples - {blocksCompacted.toLocaleString()} blocks
        </span>
      </div>
    </div>
  );
}
