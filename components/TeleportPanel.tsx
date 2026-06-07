'use client';

import { useEffect, useRef, useState } from 'react';

const NODES = [
  { host: 'prod-api-01', roles: ['node'], user: 'construx', os: 'linux', sessions: 2, status: 'online' },
  { host: 'prod-db-01', roles: ['node', 'db'], user: 'construx', os: 'linux', sessions: 0, status: 'online' },
  { host: 'prod-k8s-01', roles: ['kube'], user: 'construx', os: 'linux', sessions: 1, status: 'online' },
  { host: 'bastion-01', roles: ['proxy'], user: 'construx', os: 'linux', sessions: 4, status: 'online' },
];

const AUDIT = [
  { event: 'session.start', user: 'lewis', resource: 'prod-api-01', ts: '2m ago', result: 'allow' },
  { event: 'kube.request', user: 'ci-bot', resource: 'prod-k8s-01', ts: '4m ago', result: 'allow' },
  { event: 'db.session.start', user: 'alex', resource: 'prod-db-01', ts: '12m ago', result: 'deny' },
  { event: 'session.start', user: 'lewis', resource: 'bastion-01', ts: '18m ago', result: 'allow' },
  { event: 'login', user: 'unknown', resource: 'bastion-01', ts: '42m ago', result: 'deny' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function TeleportPanel() {
  const [visible, setVisible] = useState(false);
  const [nRows, setNRows] = useState(0);
  const [aRows, setARows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalSessions = useCounter(4820, 4, 1200);
  const deniedAttempts = useCounter(184, 1, 2400);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const n = setInterval(() => setNRows((x) => Math.min(x + 1, NODES.length)), 160);
    const a = setInterval(() => setARows((x) => Math.min(x + 1, AUDIT.length)), 140);
    return () => { clearInterval(n); clearInterval(a); };
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
          teleport -- zero-trust infra access -- ssh / k8s / db
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalSessions.toLocaleString()} sessions
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>tsh@access</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>tsh ls --format=json && tsh ssh construx@prod-api-01</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'total sessions', value: totalSessions.toLocaleString(), color: '#67e8f9' },
          { label: 'nodes', value: NODES.length.toString(), color: '#4ade80' },
          { label: 'active', value: NODES.reduce((a, n) => a + n.sessions, 0).toString(), color: '#fbbf24' },
          { label: 'denied', value: deniedAttempts.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Nodes */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // registered nodes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {NODES.slice(0, nRows).map((n) => (
            <div key={n.host} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 36px 20px 32px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600 }}>{n.host}</span>
              <span style={{ color: '#a78bfa', fontSize: 7 }}>{n.roles.join(', ')}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{n.user}</span>
              <span className="tabular-nums" style={{ color: n.sessions > 0 ? '#fbbf24' : 'rgba(255,255,255,0.2)', fontSize: 8, fontWeight: n.sessions > 0 ? 700 : 400, textAlign: 'center' }}>{n.sessions}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{n.status}</span>
            </div>
          ))}
        </div>

        {/* Audit log */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // audit log
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {AUDIT.slice(0, aRows).map((ev) => (
            <div key={ev.event + ev.ts} style={{ display: 'grid', gridTemplateColumns: '1fr 48px 1fr 32px 28px', alignItems: 'center', gap: 8, padding: '4px 8px', background: ev.result === 'allow' ? 'rgba(74,222,128,0.04)' : 'rgba(248,113,113,0.04)', border: `1px solid ${ev.result === 'allow' ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: ev.result === 'allow' ? '#4ade80' : '#f87171', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.event}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.user}</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.resource}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{ev.ts}</span>
              <span style={{ color: ev.result === 'allow' ? '#4ade80' : '#f87171', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{ev.result === 'allow' ? 'OK' : 'NO'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          teleport v16 - apache 2.0 - gravitational
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalSessions.toLocaleString()} sessions - {deniedAttempts} denied
        </span>
      </div>
    </div>
  );
}
