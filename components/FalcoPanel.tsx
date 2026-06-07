'use client';

import { useEffect, useRef, useState } from 'react';

const RULES = [
  { name: 'Terminal shell in container', priority: 'WARNING', condition: 'spawned_process and container', enabled: true, tags: 'container,shell', hits: 28 },
  { name: 'Write below etc', priority: 'WARNING', condition: 'write and etc_dir', enabled: true, tags: 'filesystem,mitre_execution', hits: 0 },
  { name: 'Outbound connection to C2', priority: 'CRITICAL', condition: 'outbound and blacklisted_ip', enabled: true, tags: 'network,mitre_command', hits: 0 },
  { name: 'Sensitive file opened', priority: 'ERROR', condition: 'open and sensitive_file', enabled: true, tags: 'filesystem,secrets', hits: 4 },
];

const ALERTS = [
  { rule: 'Terminal shell in container', priority: 'WARNING', container: 'construx-api', pod: 'api-7f8d9b-xk2m4', user: 'root', proc: '/bin/sh', dt: '8m ago' },
  { rule: 'Terminal shell in container', priority: 'WARNING', container: 'construx-api', pod: 'api-7f8d9b-xk2m4', user: 'root', proc: '/bin/bash', dt: '2h ago' },
  { rule: 'Sensitive file opened', priority: 'ERROR', container: 'construx-worker', pod: 'worker-5c6d7e-pn3x1', user: 'app', proc: 'python3', dt: '3h ago' },
  { rule: 'Sensitive file opened', priority: 'ERROR', container: 'construx-worker', pod: 'worker-5c6d7e-pn3x1', user: 'app', proc: 'python3', dt: '5h ago' },
];

const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: '#f87171',
  ERROR: '#fbbf24',
  WARNING: '#67e8f9',
  NOTICE: '#4ade80',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function FalcoPanel() {
  const [visible, setVisible] = useState(false);
  const [ruleRows, setRuleRows] = useState(0);
  const [alertRows, setAlertRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const eventsEvaluated = useCounter(284000, 2400, 400);
  const alertsTotal = useCounter(32, 1, 3600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setRuleRows((x) => Math.min(x + 1, RULES.length)), 160);
    const a = setInterval(() => setAlertRows((x) => Math.min(x + 1, ALERTS.length)), 140);
    return () => { clearInterval(r); clearInterval(a); };
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
          falco -- runtime security -- rules / syscall-events / alerts
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {alertsTotal} alerts
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#fbbf24', fontWeight: 600 }}>falco@node</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>falco --list && falcoctl rule list && journalctl -u falco --since "1h ago"</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'events / sec', value: (eventsEvaluated / 1000).toFixed(0) + 'k', color: '#fbbf24' },
          { label: 'alerts total', value: alertsTotal.toString(), color: '#f87171' },
          { label: 'rules', value: RULES.length.toString(), color: '#4ade80' },
          { label: 'rule hits', value: RULES.reduce((a, r) => a + r.hits, 0).toString(), color: '#67e8f9' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Rules */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // security rules
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {RULES.slice(0, ruleRows).map((rule, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 1fr 24px 24px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#fbbf24', fontSize: 7, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rule.name}</span>
              <span style={{ color: PRIORITY_COLOR[rule.priority] ?? '#4ade80', fontSize: 7 }}>{rule.priority}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rule.tags}</span>
              <span className="tabular-nums" style={{ color: rule.hits > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{rule.hits}</span>
              <span style={{ color: rule.enabled ? '#4ade80' : 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{rule.enabled ? 'on' : 'off'}</span>
            </div>
          ))}
        </div>

        {/* Alerts */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent alerts
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ALERTS.slice(0, alertRows).map((alert, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 1fr 40px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.rule}</span>
              <span style={{ color: PRIORITY_COLOR[alert.priority] ?? '#4ade80', fontSize: 7 }}>{alert.priority}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.container}/{alert.user}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.proc}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{alert.dt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(251,191,36,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          falco v0.38 - apache-2.0 - cloud-native runtime security
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {(eventsEvaluated / 1000).toFixed(0)}k events/s - {alertsTotal} alerts
        </span>
      </div>
    </div>
  );
}
