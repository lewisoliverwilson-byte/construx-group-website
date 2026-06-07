'use client';

import { useEffect, useRef, useState } from 'react';

const CLUSTERS = [
  { name: 'construx-prod', instances: 3, replicas: 2, storage: '200Gi', version: '16.3', state: 'healthy' },
  { name: 'construx-staging', instances: 1, replicas: 1, storage: '50Gi', version: '16.3', state: 'healthy' },
  { name: 'construx-analytics', instances: 2, replicas: 1, storage: '500Gi', version: '16.3', state: 'healthy' },
];

const METRICS = [
  { cluster: 'construx-prod', metric: 'active_connections', value: '84', limit: '200', util: 42 },
  { cluster: 'construx-prod', metric: 'replication_lag', value: '4ms', limit: '100ms', util: 4 },
  { cluster: 'construx-prod', metric: 'txn_per_sec', value: '2840', limit: '—', util: 0 },
  { cluster: 'construx-analytics', metric: 'query_p99', value: '280ms', limit: '1000ms', util: 28 },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function CrunchyPostgresPanel() {
  const [visible, setVisible] = useState(false);
  const [cRows, setCRows] = useState(0);
  const [mRows, setMRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const txnPerSec = useCounter(2840, 24, 600);
  const connections = useCounter(84, 0, 1200);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const c = setInterval(() => setCRows((x) => Math.min(x + 1, CLUSTERS.length)), 160);
    const m = setInterval(() => setMRows((x) => Math.min(x + 1, METRICS.length)), 140);
    return () => { clearInterval(c); clearInterval(m); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(59,130,246,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(59,130,246,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(59,130,246,0.08)', background: 'rgba(59,130,246,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(59,130,246,0.4)' }}>
          crunchy postgres operator -- ha clusters / pgbackrest / monitoring
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {txnPerSec.toLocaleString()} txn/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#3b82f6', fontWeight: 600 }}>pgo@postgres</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>kubectl get postgresclusters -A && kubectl exec -it construx-prod-0 -- psql -c "SELECT * FROM pg_stat_replication;"</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'txn/s', value: txnPerSec.toLocaleString(), color: '#3b82f6' },
          { label: 'connections', value: connections.toString(), color: '#4ade80' },
          { label: 'clusters', value: CLUSTERS.length.toString(), color: '#a78bfa' },
          { label: 'instances', value: CLUSTERS.reduce((a, c) => a + c.instances, 0).toString(), color: '#67e8f9' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Clusters */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // postgres clusters
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {CLUSTERS.slice(0, cRows).map((cl) => (
            <div key={cl.name} style={{ display: 'grid', gridTemplateColumns: '1fr 24px 24px 48px 36px 52px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#3b82f6', fontSize: 8, fontWeight: 600 }}>{cl.name}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{cl.instances}i</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{cl.replicas}r</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{cl.storage}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>pg{cl.version}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{cl.state}</span>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // live metrics
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {METRICS.slice(0, mRows).map((m, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 72px 52px 52px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: m.util > 30 ? 'rgba(251,191,36,0.04)' : 'rgba(59,130,246,0.04)', border: `1px solid ${m.util > 30 ? 'rgba(251,191,36,0.1)' : 'rgba(59,130,246,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.cluster}</span>
              <span style={{ color: '#a78bfa', fontSize: 7 }}>{m.metric}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right', fontWeight: 700 }}>{m.value}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{m.limit}</span>
              <span className="tabular-nums" style={{ color: m.util > 30 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{m.util > 0 ? `${m.util}%` : '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(59,130,246,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          crunchy postgres operator v5.6 - apache-2.0 - k8s ha postgres
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {CLUSTERS.length} clusters - {txnPerSec.toLocaleString()} txn/s
        </span>
      </div>
    </div>
  );
}
