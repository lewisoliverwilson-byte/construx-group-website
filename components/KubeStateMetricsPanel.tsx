'use client';

import { useEffect, useRef, useState } from 'react';

const RESOURCES = [
  { kind: 'Deployment', total: 28, ready: 28, unready: 0, metric: 'kube_deployment_status_replicas_ready' },
  { kind: 'StatefulSet', total: 6, ready: 6, unready: 0, metric: 'kube_statefulset_status_replicas_ready' },
  { kind: 'DaemonSet', total: 4, ready: 4, unready: 0, metric: 'kube_daemonset_status_number_ready' },
  { kind: 'Job', total: 12, ready: 11, unready: 1, metric: 'kube_job_status_succeeded' },
  { kind: 'CronJob', total: 8, ready: 8, unready: 0, metric: 'kube_cronjob_next_schedule_time' },
];

const ALERTS = [
  { name: 'KubePodCrashLooping', severity: 'critical', ns: 'prod', target: 'worker-6d4b9f-xs', age: '2m' },
  { name: 'KubeDeploymentReplicasMismatch', severity: 'warning', ns: 'staging', target: 'api-deploy', age: '8m' },
  { name: 'KubePersistentVolumeFillingUp', severity: 'warning', ns: 'monitoring', target: 'prometheus-0', age: '1h' },
];

const SEV_COLOR: Record<string, string> = { critical: '#f87171', warning: '#fbbf24', info: '#67e8f9' };

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta)), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function KubeStateMetricsPanel() {
  const [visible, setVisible] = useState(false);
  const [resRows, setResRows] = useState(0);
  const [alRows, setAlRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const metricSeries = useCounter(2840, 8, 1000);
  const scrapeMs = useCounter(148, 2, 2000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setResRows((x) => Math.min(x + 1, RESOURCES.length)), 160);
    const a = setInterval(() => setAlRows((x) => Math.min(x + 1, ALERTS.length)), 170);
    return () => { clearInterval(r); clearInterval(a); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(167,139,250,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(167,139,250,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(167,139,250,0.08)', background: 'rgba(167,139,250,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(167,139,250,0.4)' }}>
          kube-state-metrics -- k8s object health -- prometheus
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {metricSeries.toLocaleString()} series
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>ksm@cluster</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>curl -s localhost:8080/metrics | grep kube_deployment_status_replicas</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'metric series', value: metricSeries.toLocaleString(), color: '#a78bfa' },
          { label: 'scrape ms', value: scrapeMs.toLocaleString(), color: '#67e8f9' },
          { label: 'resource kinds', value: RESOURCES.length.toString(), color: '#4ade80' },
          { label: 'active alerts', value: ALERTS.length.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Resources */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // resource health
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {RESOURCES.slice(0, resRows).map((res) => (
            <div key={res.kind} style={{ padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ color: '#a78bfa', fontSize: 9, fontWeight: 600 }}>{res.kind}</span>
                <span className="tabular-nums" style={{ color: res.unready > 0 ? '#f87171' : '#4ade80', fontSize: 8, fontWeight: 700 }}>
                  {res.ready}/{res.total}
                </span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(res.ready / res.total) * 100}%`, background: res.unready > 0 ? '#fbbf24' : '#4ade80', borderRadius: 2, transition: 'width 0.8s ease' }} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, marginTop: 2, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{res.metric}</span>
            </div>
          ))}
        </div>

        {/* Alerts */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // firing alerts
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ALERTS.slice(0, alRows).map((al) => (
            <div key={al.name} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 60px 64px 28px', alignItems: 'center', gap: 8, padding: '4px 8px', background: `${SEV_COLOR[al.severity]}08`, border: `1px solid ${SEV_COLOR[al.severity]}18`, borderRadius: 2 }}>
              <span style={{ color: SEV_COLOR[al.severity], fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{al.name}</span>
              <span style={{ color: SEV_COLOR[al.severity], fontSize: 7, padding: '1px 4px', background: `${SEV_COLOR[al.severity]}14`, borderRadius: 2, textAlign: 'center' }}>{al.severity}</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 8 }}>{al.ns}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{al.target}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{al.age}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          kube-state-metrics v2.12 - prometheus community
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {metricSeries.toLocaleString()} series - {scrapeMs}ms scrape
        </span>
      </div>
    </div>
  );
}
