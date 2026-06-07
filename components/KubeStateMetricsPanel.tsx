'use client';

import { useEffect, useRef, useState } from 'react';

const RESOURCE_STATS = [
  { resource: 'Deployments', total: 48, ready: 48, unavailable: 0, updated: 48 },
  { resource: 'StatefulSets', total: 12, ready: 12, unavailable: 0, updated: 12 },
  { resource: 'DaemonSets', total: 8, ready: 8, unavailable: 0, desired: 8 },
  { resource: 'Pods', total: 284, running: 282, pending: 2, failed: 0 },
];

const TOP_METRICS = [
  { metric: 'kube_deployment_status_replicas_unavailable', value: '0', labels: 'namespace=prod,deployment=api', dt: '2s ago', status: 'ok' },
  { metric: 'kube_pod_container_status_restarts_total', value: '3', labels: 'namespace=ci,pod=runner-04', dt: '8s ago', status: 'warn' },
  { metric: 'kube_node_status_condition', value: '1', labels: 'node=k8s-worker-02,condition=Ready', dt: '10s ago', status: 'ok' },
  { metric: 'kube_persistentvolumeclaim_status_phase', value: '1', labels: 'namespace=db,pvc=pg-data-0,phase=Bound', dt: '15s ago', status: 'ok' },
];

const METRIC_STATUS_COLOR: Record<string, string> = {
  ok: '#4ade80',
  warn: '#fbbf24',
  err: '#f87171',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function KubeStateMetricsPanel() {
  const [visible, setVisible] = useState(false);
  const [resourceRows, setResourceRows] = useState(0);
  const [metricRows, setMetricRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const metricsExposed = useCounter(28400, 240, 500);
  const scrapeIntervals = useCounter(2840, 4, 800);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setResourceRows((x) => Math.min(x + 1, RESOURCE_STATS.length)), 160);
    const m = setInterval(() => setMetricRows((x) => Math.min(x + 1, TOP_METRICS.length)), 140);
    return () => { clearInterval(r); clearInterval(m); };
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
          kube-state-metrics -- k8s object metrics -- resources / labels / conditions
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {metricsExposed.toLocaleString()} metrics
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>prom@ksm</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>curl -s localhost:8080/metrics | grep kube_deployment_status_replicas_unavailable</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'metrics exposed', value: metricsExposed.toLocaleString(), color: '#f97316' },
          { label: 'scrape intervals', value: scrapeIntervals.toLocaleString(), color: '#4ade80' },
          { label: 'resource types', value: RESOURCE_STATS.length.toString(), color: '#67e8f9' },
          { label: 'pods running', value: '282', color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Resource Stats */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // resource health
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {RESOURCE_STATS.slice(0, resourceRows).map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 36px 36px 36px 36px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600 }}>{r.resource}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{r.total}t</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>
                {'ready' in r ? `${r.ready}r` : 'running' in r ? `${(r as typeof r & { running: number }).running}r` : `${r.total}r`}
              </span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>
                {'unavailable' in r && (r as typeof r & { unavailable: number }).unavailable > 0 ? `${(r as typeof r & { unavailable: number }).unavailable}!` : '--'}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>
                {'pending' in r ? `${(r as typeof r & { pending: number }).pending}p` : '--'}
              </span>
            </div>
          ))}
        </div>

        {/* Top Metrics */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent metric changes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TOP_METRICS.slice(0, metricRows).map((m, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 28px 36px 28px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.metric}</span>
              <span className="tabular-nums" style={{ color: '#f97316', fontSize: 7, textAlign: 'center' }}>{m.value}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{m.dt}</span>
              <span style={{ color: METRIC_STATUS_COLOR[m.status] ?? 'rgba(255,255,255,0.3)', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{m.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          kube-state-metrics v2.13 - apache-2.0 - k8s object state metrics
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {metricsExposed.toLocaleString()} metrics - {scrapeIntervals.toLocaleString()} scrapes
        </span>
      </div>
    </div>
  );
}
