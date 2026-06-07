'use client';

import { useEffect, useRef, useState } from 'react';

const MEMBERS = [
  { name: 'pg-prod-01', role: 'Leader', state: 'running', lag: 0, tl: 8, host: '10.0.1.10:5432' },
  { name: 'pg-prod-02', role: 'Replica', state: 'streaming', lag: 0, tl: 8, host: '10.0.1.11:5432' },
  { name: 'pg-prod-03', role: 'Replica', state: 'streaming', lag: 2, tl: 8, host: '10.0.1.12:5432' },
];

const EVENTS = [
  { time: '2s ago', member: 'pg-prod-01', action: 'promoted', details: 'became leader on timeline 8' },
  { time: '2m ago', member: 'pg-prod-02', action: 'connected', details: 'streaming replication started, lag=0' },
  { time: '4m ago', member: 'pg-prod-03', action: 'connected', details: 'streaming replication started, lag=2' },
  { time: '6m ago', member: 'pg-prod-01', action: 'initialized', details: 'bootstrap completed, dcs=etcd' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function PatroniPanel() {
  const [visible, setVisible] = useState(false);
  const [memberRows, setMemberRows] = useState(0);
  const [eventRows, setEventRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const txnPerSec = useCounter(2840, 48, 500);
  const failoversTotal = useCounter(8, 1, 14400);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const m = setInterval(() => setMemberRows((x) => Math.min(x + 1, MEMBERS.length)), 160);
    const e = setInterval(() => setEventRows((x) => Math.min(x + 1, EVENTS.length)), 140);
    return () => { clearInterval(m); clearInterval(e); };
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
          patroni -- ha postgresql -- leader / replicas / failover
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {txnPerSec.toLocaleString()} txn/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>patronictl@pg</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>patronictl -c /etc/patroni/config.yml list && patronictl topology construx-ha</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'txn/s', value: txnPerSec.toLocaleString(), color: '#a78bfa' },
          { label: 'failovers', value: failoversTotal.toLocaleString(), color: '#f87171' },
          { label: 'members', value: MEMBERS.length.toString(), color: '#4ade80' },
          { label: 'timeline', value: MEMBERS[0].tl.toString(), color: '#67e8f9' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Members */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // cluster members
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {MEMBERS.slice(0, memberRows).map((m) => (
            <div key={m.name} style={{ display: 'grid', gridTemplateColumns: '80px 52px 64px 24px 20px 1fr', alignItems: 'center', gap: 8, padding: '5px 8px', background: m.role === 'Leader' ? 'rgba(167,139,250,0.06)' : 'rgba(167,139,250,0.04)', border: `1px solid ${m.role === 'Leader' ? 'rgba(167,139,250,0.2)' : 'rgba(167,139,250,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600 }}>{m.name}</span>
              <span style={{ color: m.role === 'Leader' ? '#fbbf24' : '#67e8f9', fontSize: 7, fontWeight: 700 }}>{m.role}</span>
              <span style={{ color: '#4ade80', fontSize: 7 }}>{m.state}</span>
              <span className="tabular-nums" style={{ color: m.lag > 0 ? '#f87171' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{m.lag}s</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>t{m.tl}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{m.host}</span>
            </div>
          ))}
        </div>

        {/* Events */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // cluster events
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {EVENTS.slice(0, eventRows).map((ev, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '44px 64px 56px 1fr', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{ev.time}</span>
              <span style={{ color: '#a78bfa', fontSize: 7 }}>{ev.member}</span>
              <span style={{ color: '#fbbf24', fontSize: 7 }}>{ev.action}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.details}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          patroni v3.3 - mit - ha solution for postgresql
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {txnPerSec.toLocaleString()} txn/s - {failoversTotal.toLocaleString()} failovers
        </span>
      </div>
    </div>
  );
}
