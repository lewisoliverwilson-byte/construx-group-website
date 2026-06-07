'use client';

import { useEffect, useRef, useState } from 'react';

const RULES = [
  { name: 'Terminal shell in container', priority: 'WARNING', source: 'syscall', enabled: true, triggered: 4 },
  { name: 'Detect outbound connections to C2 servers', priority: 'CRITICAL', source: 'syscall', enabled: true, triggered: 0 },
  { name: 'Write below etc', priority: 'ERROR', source: 'syscall', enabled: true, triggered: 1 },
  { name: 'K8s deployment created', priority: 'INFO', source: 'k8s_audit', enabled: true, triggered: 28 },
];

const ALERTS = [
  { rule: 'Terminal shell in container', severity: 'WARNING', pod: 'api-deployment-5f8b-k7xp2', namespace: 'prod', time: '4m ago' },
  { rule: 'Terminal shell in container', severity: 'WARNING', pod: 'worker-set-3-abc1', namespace: 'prod', time: '12m ago' },
  { rule: 'Write below etc', severity: 'ERROR', pod: 'init-container-setup', namespace: 'kube-system', time: '1h ago' },
  { rule: 'K8s deployment created', severity: 'INFO', pod: '—', namespace: 'prod', time: '2h ago' },
];

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: '#f87171',
  ERROR: '#f97316',
  WARNING: '#fbbf24',
  INFO: '#67e8f9',
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
  const [rRows, setRRows] = useState(0);
  const [aRows, setARows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const eventsPerSec = useCounter(2840, 48, 400);
  const alertsTotal = useCounter(33, 0, 1400);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setRRows((x) => Math.min(x + 1, RULES.length)), 160);
    const a = setInterval(() => setARows((x) => Math.min(x + 1, ALERTS.length)), 140);
    return () => { clearInterval(r); clearInterval(a); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(103,232,249,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(103,232,249,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(103,232,249,0.08)', background: 'rgba(103,232,249,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(103,232,249,0.4)' }}>
          falco -- runtime security -- syscall / k8s audit / cncf rules
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {eventsPerSec.toLocaleString()} evt/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>falco@runtime</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>falco --modern-bpf -c /etc/falco/falco.yaml && falcoctl artifact list --type rule</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'evt/s', value: eventsPerSec.toLocaleString(), color: '#67e8f9' },
          { label: 'alerts', value: alertsTotal.toString(), color: '#fbbf24' },
          { label: 'rules', value: RULES.length.toString(), color: '#a78bfa' },
          { label: 'critical', value: ALERTS.filter(a => a.severity === 'CRITICAL').length.toString(), color: '#f87171' },
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
          // active rules
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {RULES.slice(0, rRows).map((rule) => (
            <div key={rule.name} style={{ display: 'grid', gridTemplateColumns: '1fr 56px 52px 32px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rule.name}</span>
              <span style={{ color: SEVERITY_COLOR[rule.priority] ?? '#fbbf24', fontSize: 7 }}>{rule.priority}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{rule.source}</span>
              <span className="tabular-nums" style={{ color: rule.triggered > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'right', fontWeight: rule.triggered > 0 ? 700 : 400 }}>{rule.triggered}</span>
            </div>
          ))}
        </div>

        {/* Alerts */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent alerts
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ALERTS.slice(0, aRows).map((al, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 60px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: al.severity === 'CRITICAL' || al.severity === 'ERROR' ? 'rgba(248,113,113,0.04)' : al.severity === 'WARNING' ? 'rgba(251,191,36,0.04)' : 'rgba(103,232,249,0.04)', border: `1px solid ${al.severity === 'CRITICAL' || al.severity === 'ERROR' ? 'rgba(248,113,113,0.1)' : al.severity === 'WARNING' ? 'rgba(251,191,36,0.1)' : 'rgba(103,232,249,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: SEVERITY_COLOR[al.severity] ?? '#fbbf24', fontSize: 7, fontWeight: 700 }}>{al.severity}</span>
              <span style={{ color: 'rgba(240,239,255,0.3)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{al.pod}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{al.namespace}</span>
              <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'right' }}>{al.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          falco v0.38 - apache-2.0 - cncf runtime security
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {eventsPerSec.toLocaleString()} evt/s - {alertsTotal} alerts
        </span>
      </div>
    </div>
  );
}
