'use client';

import { useEffect, useRef, useState } from 'react';

const AGENTS = [
  { hostname: 'construx-prod-api-01', os: 'ubuntu-24.04', version: '4.8.0', status: 'active', lastSeen: '2s ago' },
  { hostname: 'construx-prod-db-01', os: 'ubuntu-24.04', version: '4.8.0', status: 'active', lastSeen: '4s ago' },
  { hostname: 'construx-staging-01', os: 'ubuntu-24.04', version: '4.8.0', status: 'active', lastSeen: '8s ago' },
  { hostname: 'construx-k8s-node-01', os: 'flatcar-3975', version: '4.8.0', status: 'active', lastSeen: '12s ago' },
];

const ALERTS = [
  { rule: '5712', level: 5, groups: 'authentication', description: 'SSHD authentication success.', count: 48 },
  { rule: '5551', level: 10, groups: 'authentication,syslog', description: 'Multiple authentication failures.', count: 4 },
  { rule: '80792', level: 3, groups: 'web,accesslog', description: 'Common web attack pattern blocked.', count: 120 },
  { rule: '510', level: 7, groups: 'syscheck', description: 'Host-based anomaly detection: file modified.', count: 2 },
];

const LEVEL_COLOR: Record<number, string> = {
  3: 'rgba(255,255,255,0.3)',
  5: '#4ade80',
  7: '#fbbf24',
  10: '#f87171',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function WazuhPanel() {
  const [visible, setVisible] = useState(false);
  const [agentRows, setAgentRows] = useState(0);
  const [alertRows, setAlertRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalAlerts = useCounter(28400, 48, 500);
  const eventsPerSec = useCounter(2840, 24, 400);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const a = setInterval(() => setAgentRows((x) => Math.min(x + 1, AGENTS.length)), 160);
    const al = setInterval(() => setAlertRows((x) => Math.min(x + 1, ALERTS.length)), 140);
    return () => { clearInterval(a); clearInterval(al); };
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
          wazuh -- siem -- agents / alerts / threat detection
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {eventsPerSec.toLocaleString()} events/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#fbbf24', fontWeight: 600 }}>wazuh@manager</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>wazuh-control status && curl -k -X GET "https://localhost:55000/agents?status=active" -H "Authorization: Bearer $TOKEN"</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'events/s', value: eventsPerSec.toLocaleString(), color: '#fbbf24' },
          { label: 'total alerts', value: (totalAlerts / 1000).toFixed(0) + 'k', color: '#f87171' },
          { label: 'agents', value: AGENTS.length.toString(), color: '#a78bfa' },
          { label: 'critical', value: ALERTS.filter(a => a.level >= 10).length.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Agents */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // active agents
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {AGENTS.slice(0, agentRows).map((agent) => (
            <div key={agent.hostname} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 40px 44px 48px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#fbbf24', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.hostname}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.os}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{agent.version}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'center' }}>{agent.status}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{agent.lastSeen}</span>
            </div>
          ))}
        </div>

        {/* Alerts */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // security alerts
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ALERTS.slice(0, alertRows).map((alert, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 20px 80px 1fr 24px', alignItems: 'center', gap: 8, padding: '4px 8px', background: alert.level >= 10 ? 'rgba(248,113,113,0.04)' : 'rgba(251,191,36,0.04)', border: `1px solid ${alert.level >= 10 ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{alert.rule}</span>
              <span style={{ color: LEVEL_COLOR[alert.level] ?? 'rgba(255,255,255,0.3)', fontSize: 7, fontWeight: 700 }}>{alert.level}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.groups}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.description}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{alert.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(251,191,36,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          wazuh v4.8 - gpl-2.0 - open source siem and xdr
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {eventsPerSec.toLocaleString()} events/s - {(totalAlerts / 1000).toFixed(0)}k alerts
        </span>
      </div>
    </div>
  );
}
