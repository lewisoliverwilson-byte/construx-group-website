'use client';

import { useEffect, useRef, useState } from 'react';

const TENANTS = [
  { id: 'construx-prod', series: 284000, ingestion: '48 K/s', queryRate: 820, storage: '12 GB', limits: 'OK' },
  { id: 'construx-staging', series: 42000, ingestion: '8 K/s', queryRate: 120, storage: '2.1 GB', limits: 'OK' },
  { id: 'construx-perf', series: 180000, ingestion: '28 K/s', queryRate: 480, storage: '8.4 GB', limits: 'WARN' },
];

const COMPONENTS = [
  { name: 'distributor', replicas: 3, cpu: '0.8', mem: '420 MB', status: 'healthy' },
  { name: 'ingester', replicas: 6, cpu: '2.4', mem: '2.8 GB', status: 'healthy' },
  { name: 'querier', replicas: 4, cpu: '1.2', mem: '1.1 GB', status: 'healthy' },
  { name: 'compactor', replicas: 1, cpu: '0.4', mem: '640 MB', status: 'healthy' },
  { name: 'store-gateway', replicas: 2, cpu: '0.6', mem: '1.8 GB', status: 'healthy' },
];

const STATUS_COLOR: Record<string, string> = { healthy: '#4ade80', degraded: '#fbbf24', down: '#f87171' };

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function CortexPanel() {
  const [visible, setVisible] = useState(false);
  const [tenRows, setTenRows] = useState(0);
  const [compRows, setCompRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalSeries = useCounter(506000, 200, 800);
  const queryRate = useCounter(1420, 8, 700);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setTenRows((x) => Math.min(x + 1, TENANTS.length)), 160);
    const c = setInterval(() => setCompRows((x) => Math.min(x + 1, COMPONENTS.length)), 150);
    return () => { clearInterval(t); clearInterval(c); };
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
          cortex -- multi-tenant prometheus -- s3 long-term
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalSeries.toLocaleString()} series
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>cortex@metrics</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>cortex-cli ring -ring=ingester && cortex-cli tenant-stats</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'total series', value: totalSeries.toLocaleString(), color: '#f97316' },
          { label: 'queries/s', value: queryRate.toLocaleString(), color: '#4ade80' },
          { label: 'tenants', value: TENANTS.length.toString(), color: '#67e8f9' },
          { label: 'components', value: COMPONENTS.length.toString(), color: '#a78bfa' },
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
          {TENANTS.slice(0, tenRows).map((t) => (
            <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '96px 60px 52px 48px 52px 36px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 9, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.id}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 8 }}>{t.series.toLocaleString()}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 8 }}>{t.ingestion}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 8, textAlign: 'right' }}>{t.queryRate}/s</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{t.storage}</span>
              <span style={{ color: t.limits === 'OK' ? '#4ade80' : '#fbbf24', fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{t.limits}</span>
            </div>
          ))}
        </div>

        {/* Components */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // components
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {COMPONENTS.slice(0, compRows).map((c) => (
            <div key={c.name} style={{ display: 'grid', gridTemplateColumns: '80px 28px 40px 64px 56px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.03)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600 }}>{c.name}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 8, textAlign: 'center' }}>{c.replicas}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{c.cpu} cpu</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 8, textAlign: 'right' }}>{c.mem}</span>
              <span style={{ color: STATUS_COLOR[c.status], fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{c.status.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          cortex v1.18 - apache 2.0 - cncf incubating
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalSeries.toLocaleString()} series - {queryRate.toLocaleString()} q/s
        </span>
      </div>
    </div>
  );
}
