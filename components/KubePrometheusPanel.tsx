'use client';

import { useEffect, useRef, useState } from 'react';

const DASHBOARDS = [
  { name: 'Kubernetes / Cluster Overview', uid: 'k8s-cluster', panels: 24, datasource: 'prometheus', tags: 'kubernetes,cluster', status: 'active' },
  { name: 'Kubernetes / Pod Resources', uid: 'k8s-pods', panels: 18, datasource: 'prometheus', tags: 'kubernetes,pods', status: 'active' },
  { name: 'Node Exporter / Full', uid: 'node-exporter', panels: 32, datasource: 'prometheus', tags: 'node,hardware', status: 'active' },
  { name: 'ConstruX / API Latency', uid: 'construx-api', panels: 16, datasource: 'prometheus', tags: 'construx,api', status: 'active' },
];

const SERVICE_MONITORS = [
  { name: 'construx-api', namespace: 'prod', selector: 'app=construx-api', endpoints: 2, interval: '15s', status: 'active' },
  { name: 'construx-worker', namespace: 'prod', selector: 'app=construx-worker', endpoints: 3, interval: '30s', status: 'active' },
  { name: 'pg-exporter', namespace: 'db', selector: 'app=postgres-exporter', endpoints: 2, interval: '15s', status: 'active' },
  { name: 'redis-exporter', namespace: 'cache', selector: 'app=redis-exporter', endpoints: 1, interval: '15s', status: 'active' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function KubePrometheusPanel() {
  const [visible, setVisible] = useState(false);
  const [dashRows, setDashRows] = useState(0);
  const [smRows, setSmRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const dashboardViews = useCounter(2840, 12, 700);
  const alertsFired = useCounter(284, 1, 1200);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const d = setInterval(() => setDashRows((x) => Math.min(x + 1, DASHBOARDS.length)), 160);
    const s = setInterval(() => setSmRows((x) => Math.min(x + 1, SERVICE_MONITORS.length)), 140);
    return () => { clearInterval(d); clearInterval(s); };
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
          kube-prometheus -- full monitoring stack -- dashboards / servicemonitors / rules
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {DASHBOARDS.length} dashboards
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>kubectl@monitoring</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>kubectl get servicemonitor -n monitoring && kubectl get prometheusrule -n monitoring</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'dash views', value: dashboardViews.toLocaleString(), color: '#f97316' },
          { label: 'alerts fired', value: alertsFired.toLocaleString(), color: '#4ade80' },
          { label: 'dashboards', value: DASHBOARDS.length.toString(), color: '#a78bfa' },
          { label: 'servicemonitors', value: SERVICE_MONITORS.length.toString(), color: '#67e8f9' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Dashboards */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // grafana dashboards
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {DASHBOARDS.slice(0, dashRows).map((dash) => (
            <div key={dash.uid} style={{ display: 'grid', gridTemplateColumns: '1fr 64px 24px 1fr 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 7, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dash.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{dash.uid}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{dash.panels}p</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dash.tags}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{dash.status}</span>
            </div>
          ))}
        </div>

        {/* Service Monitors */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // service monitors
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SERVICE_MONITORS.slice(0, smRows).map((sm) => (
            <div key={sm.name} style={{ display: 'grid', gridTemplateColumns: '80px 48px 1fr 20px 36px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sm.name}</span>
              <span style={{ color: '#a78bfa', fontSize: 7 }}>{sm.namespace}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sm.selector}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{sm.endpoints}</span>
              <span style={{ color: '#fbbf24', fontSize: 7, textAlign: 'center' }}>{sm.interval}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{sm.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          kube-prometheus-stack v61 - apache-2.0 - full monitoring stack
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {dashboardViews.toLocaleString()} views - {alertsFired.toLocaleString()} alerts fired
        </span>
      </div>
    </div>
  );
}
