'use client';

import { useEffect, useRef, useState } from 'react';

const TARGETS = [
  { job: 'kubernetes-pods', active: 284, healthy: 284, up: 284, scrapeInterval: '15s', lastScrape: '8s ago', status: 'up' },
  { job: 'node-exporter', active: 8, healthy: 8, up: 8, scrapeInterval: '15s', lastScrape: '4s ago', status: 'up' },
  { job: 'kube-state-metrics', active: 1, healthy: 1, up: 1, scrapeInterval: '30s', lastScrape: '12s ago', status: 'up' },
  { job: 'cadvisor', active: 8, healthy: 8, up: 8, scrapeInterval: '15s', lastScrape: '7s ago', status: 'up' },
];

const ALERTS = [
  { name: 'HighMemoryUsage', expr: 'container_memory_usage_bytes > 0.85', severity: 'warning', state: 'inactive', for: '5m' },
  { name: 'PodCrashLooping', expr: 'kube_pod_container_status_restarts_total > 5', severity: 'critical', state: 'inactive', for: '15m' },
  { name: 'DiskSpaceLow', expr: 'node_filesystem_avail_bytes < 0.1', severity: 'warning', state: 'pending', for: '30m' },
  { name: 'APIHighLatency', expr: 'http_request_duration_p99 > 2', severity: 'critical', state: 'inactive', for: '2m' },
];

const ALERT_STATE_COLOR: Record<string, string> = {
  firing: '#f87171',
  pending: '#fbbf24',
  inactive: '#4ade80',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function PrometheusPanel() {
  const [visible, setVisible] = useState(false);
  const [targetRows, setTargetRows] = useState(0);
  const [alertRows, setAlertRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const samplesIngested = useCounter(284000, 2400, 400);
  const activeSeriesTotal = useCounter(480000, 480, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setTargetRows((x) => Math.min(x + 1, TARGETS.length)), 160);
    const a = setInterval(() => setAlertRows((x) => Math.min(x + 1, ALERTS.length)), 140);
    return () => { clearInterval(t); clearInterval(a); };
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
          prometheus -- metrics & alerting -- targets / rules / tsdb
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {(activeSeriesTotal / 1000).toFixed(0)}k series
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>promtool@prometheus</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>promtool check rules /etc/prometheus/rules/*.yaml && curl -s localhost:9090/api/v1/targets | jq</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'samples / sec', value: (samplesIngested / 1000).toFixed(0) + 'k', color: '#f97316' },
          { label: 'active series', value: (activeSeriesTotal / 1000).toFixed(0) + 'k', color: '#67e8f9' },
          { label: 'targets', value: TARGETS.reduce((a, t) => a + t.active, 0).toString(), color: '#4ade80' },
          { label: 'alerts', value: ALERTS.length.toString(), color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Scrape Targets */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // scrape targets
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {TARGETS.slice(0, targetRows).map((t) => (
            <div key={t.job} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 28px 28px 36px 48px 28px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.job}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{t.active}a</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{t.healthy}h</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{t.up}u</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{t.scrapeInterval}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{t.lastScrape}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{t.status}</span>
            </div>
          ))}
        </div>

        {/* Alerts */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // alert rules
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ALERTS.slice(0, alertRows).map((alert, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 44px 44px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.expr}</span>
              <span style={{ color: alert.severity === 'critical' ? '#f87171' : '#fbbf24', fontSize: 7, textAlign: 'center' }}>{alert.severity}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{alert.for}</span>
              <span style={{ color: ALERT_STATE_COLOR[alert.state] ?? 'rgba(255,255,255,0.3)', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{alert.state}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          prometheus v2.53 - apache-2.0 - systems & service monitoring
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {(samplesIngested / 1000).toFixed(0)}k samples/s - {(activeSeriesTotal / 1000).toFixed(0)}k series
        </span>
      </div>
    </div>
  );
}
