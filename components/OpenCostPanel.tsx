'use client';

import { useEffect, useRef, useState } from 'react';

const NAMESPACES = [
  { name: 'prod', cpu: '$42.18', mem: '$18.40', storage: '$8.20', total: '$68.78', efficiency: 74 },
  { name: 'staging', cpu: '$12.40', mem: '$6.80', storage: '$2.10', total: '$21.30', efficiency: 52 },
  { name: 'monitoring', cpu: '$8.20', mem: '$14.60', storage: '$1.80', total: '$24.60', efficiency: 88 },
  { name: 'data', cpu: '$28.40', mem: '$42.10', storage: '$22.40', total: '$92.90', efficiency: 91 },
  { name: 'dev', cpu: '$4.20', mem: '$3.10', storage: '$0.80', total: '$8.10', efficiency: 31 },
];

const WORKLOADS = [
  { name: 'api-gateway', ns: 'prod', daily: '$4.28', wasted: '$1.10', eff: 74 },
  { name: 'spark-driver', ns: 'data', daily: '$12.40', wasted: '$0.90', eff: 93 },
  { name: 'prometheus', ns: 'monitoring', daily: '$3.20', wasted: '$0.38', eff: 88 },
  { name: 'worker-pool', ns: 'prod', daily: '$8.40', wasted: '$2.80', eff: 67 },
  { name: 'dev-env-1', ns: 'dev', daily: '$2.10', wasted: '$1.44', eff: 31 },
];

function useCounter(base: number, delta: number, ms = 3000) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => parseFloat((x + (Math.random() * delta)).toFixed(2))), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

function EffBar({ pct }: { pct: number }) {
  const color = pct >= 85 ? '#4ade80' : pct >= 60 ? '#fbbf24' : '#f87171';
  return (
    <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 1.2s ease' }} />
    </div>
  );
}

export default function OpenCostPanel() {
  const [visible, setVisible] = useState(false);
  const [nsRows, setNsRows] = useState(0);
  const [wlRows, setWlRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const dailyCost = useCounter(215.68, 0.02, 5000);
  const monthCost = useCounter(6470.40, 0.5, 5000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const n = setInterval(() => setNsRows((x) => Math.min(x + 1, NAMESPACES.length)), 160);
    const w = setInterval(() => setWlRows((x) => Math.min(x + 1, WORKLOADS.length)), 150);
    return () => { clearInterval(n); clearInterval(w); };
  }, [visible]);

  const avgEff = Math.round(NAMESPACES.reduce((sum, n) => sum + n.efficiency, 0) / NAMESPACES.length);

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(249,115,22,0.08)', background: 'rgba(249,115,22,0.025)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(249,115,22,0.4)' }}>
          opencost -- kubernetes cost allocation -- cncf
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          eff {avgEff}%
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>cost@cluster</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>kubectl cost namespace --show-cpu --show-memory --show-efficiency --window 24h</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'daily cost', value: '$' + dailyCost.toFixed(2), color: '#f97316' },
          { label: 'monthly est.', value: '$' + monthCost.toFixed(0), color: '#fbbf24' },
          { label: 'namespaces', value: NAMESPACES.length.toString(), color: '#67e8f9' },
          { label: 'efficiency', value: avgEff + '%', color: avgEff >= 80 ? '#4ade80' : '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Namespace costs */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // namespace cost breakdown (daily)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {NAMESPACES.slice(0, nsRows).map((ns) => {
            const eff = ns.efficiency;
            const color = eff >= 85 ? '#4ade80' : eff >= 60 ? '#fbbf24' : '#f87171';
            return (
              <div key={ns.name} style={{ display: 'grid', gridTemplateColumns: '70px 52px 52px 52px 56px 1fr 28px', alignItems: 'center', gap: 6, padding: '5px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
                <span style={{ color: '#f97316', fontSize: 9, fontWeight: 600 }}>{ns.name}</span>
                <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 8, textAlign: 'right' }}>{ns.cpu}</span>
                <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 8, textAlign: 'right' }}>{ns.mem}</span>
                <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 8, textAlign: 'right' }}>{ns.storage}</span>
                <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 9, fontWeight: 700, textAlign: 'right' }}>{ns.total}</span>
                <EffBar pct={eff} />
                <span className="tabular-nums" style={{ color, fontSize: 8, textAlign: 'right' }}>{eff}%</span>
              </div>
            );
          })}
        </div>

        {/* Workload breakdown */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // top workloads by cost
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {WORKLOADS.slice(0, wlRows).map((wl) => (
            <div key={wl.name} style={{ display: 'grid', gridTemplateColumns: '100px 60px 52px 52px 1fr 28px', alignItems: 'center', gap: 6, padding: '4px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.7)', fontSize: 9 }}>{wl.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 8 }}>{wl.ns}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 9, fontWeight: 700 }}>{wl.daily}/d</span>
              <span className="tabular-nums" style={{ color: '#f87171', fontSize: 8 }}>-{wl.wasted}</span>
              <EffBar pct={wl.eff} />
              <span className="tabular-nums" style={{ color: wl.eff >= 85 ? '#4ade80' : wl.eff >= 60 ? '#fbbf24' : '#f87171', fontSize: 8, textAlign: 'right' }}>{wl.eff}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          opencost v1.11 - cncf - cloud billing api
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          ${dailyCost.toFixed(2)}/day - ${monthCost.toFixed(0)}/mo est.
        </span>
      </div>
    </div>
  );
}
