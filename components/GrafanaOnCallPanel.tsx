'use client';

import { useEffect, useRef, useState } from 'react';

const ESCALATIONS = [
  { name: 'construx-pagerduty-critical', steps: 4, responders: 3, notify: 'lewis@construxgroup.io', channel: '#alerts-critical', status: 'active' },
  { name: 'construx-infra-oncall', steps: 3, responders: 2, notify: 'infra-team@construxgroup.io', channel: '#alerts-infra', status: 'active' },
  { name: 'construx-staging-low', steps: 2, responders: 1, notify: 'lewis@construxgroup.io', channel: '#alerts-staging', status: 'active' },
  { name: 'construx-db-failover', steps: 5, responders: 3, notify: 'dba@construxgroup.io', channel: '#alerts-database', status: 'active' },
];

const ALERTS = [
  { title: 'API p99 latency > 2s', severity: 'critical', escalation: 'construx-pagerduty-critical', state: 'firing', duration: '4m12s' },
  { title: 'Disk usage > 90% on pg-prod-01', severity: 'warning', escalation: 'construx-db-failover', state: 'acknowledged', duration: '12m' },
  { title: 'Replica lag > 10s on pg-prod-03', severity: 'warning', escalation: 'construx-db-failover', state: 'resolved', duration: '28m' },
  { title: 'Deployment rollout failed staging', severity: 'info', escalation: 'construx-staging-low', state: 'resolved', duration: '2h' },
];

const STATE_COLOR: Record<string, string> = {
  firing: '#f87171',
  acknowledged: '#fbbf24',
  resolved: '#4ade80',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function GrafanaOnCallPanel() {
  const [visible, setVisible] = useState(false);
  const [escRows, setEscRows] = useState(0);
  const [alertRows, setAlertRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const alertsTotal = useCounter(2840, 4, 800);
  const incidentsResolved = useCounter(284, 1, 1200);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const e = setInterval(() => setEscRows((x) => Math.min(x + 1, ESCALATIONS.length)), 160);
    const a = setInterval(() => setAlertRows((x) => Math.min(x + 1, ALERTS.length)), 140);
    return () => { clearInterval(e); clearInterval(a); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(74,222,128,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(74,222,128,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(74,222,128,0.08)', background: 'rgba(74,222,128,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(74,222,128,0.4)' }}>
          grafana oncall -- incident mgmt -- escalations / alerts / oncall
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {ALERTS.filter(a => a.state === 'firing').length} firing
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>oncall@grafana</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>grafana-oncall-cli alerts list --status firing && oncall escalation test --policy construx-pagerduty-critical</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'alerts total', value: alertsTotal.toLocaleString(), color: '#4ade80' },
          { label: 'resolved', value: incidentsResolved.toLocaleString(), color: '#67e8f9' },
          { label: 'escalations', value: ESCALATIONS.length.toString(), color: '#a78bfa' },
          { label: 'firing', value: ALERTS.filter(a => a.state === 'firing').length.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Escalation chains */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // escalation chains
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {ESCALATIONS.slice(0, escRows).map((esc) => (
            <div key={esc.name} style={{ display: 'grid', gridTemplateColumns: '1fr 20px 20px 1fr 52px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{esc.name}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{esc.steps}s</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{esc.responders}r</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{esc.channel}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{esc.status}</span>
            </div>
          ))}
        </div>

        {/* Alerts */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent alerts
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ALERTS.slice(0, alertRows).map((alert, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 60px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: alert.state === 'firing' ? 'rgba(248,113,113,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${alert.state === 'firing' ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.title}</span>
              <span style={{ color: alert.severity === 'critical' ? '#f87171' : alert.severity === 'warning' ? '#fbbf24' : '#67e8f9', fontSize: 7, textAlign: 'center' }}>{alert.severity}</span>
              <span style={{ color: STATE_COLOR[alert.state] ?? 'rgba(255,255,255,0.3)', fontSize: 7, fontWeight: 700, textAlign: 'center' }}>{alert.state}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{alert.duration}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          grafana oncall v1.9 - agpl-3.0 - incident management
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {alertsTotal.toLocaleString()} alerts - {incidentsResolved.toLocaleString()} resolved
        </span>
      </div>
    </div>
  );
}
