'use client';

import { useEffect, useRef, useState } from 'react';

const SUBJECTS = [
  { subject: 'construx.listings.created', msgs: 284000, bytes: '12.4MB', consumers: 3, pending: 0, status: 'active' },
  { subject: 'construx.search.query', msgs: 120000, bytes: '4.8MB', consumers: 2, pending: 4, status: 'active' },
  { subject: 'construx.checkout.events', msgs: 8400, bytes: '840KB', consumers: 4, pending: 0, status: 'active' },
  { subject: 'construx.media.uploads', msgs: 48200, bytes: '284MB', consumers: 1, pending: 12, status: 'lag' },
];

const STREAMS = [
  { name: 'CONSTRUX_EVENTS', subjects: 4, msgs: 460600, storage: 'file', replicas: 3, retention: '7d' },
  { name: 'CONSTRUX_AUDIT', subjects: 2, msgs: 84000, storage: 'file', replicas: 3, retention: '90d' },
  { name: 'CONSTRUX_EPHEMERAL', subjects: 1, msgs: 12000, storage: 'memory', replicas: 1, retention: '1h' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function NatsPanel() {
  const [visible, setVisible] = useState(false);
  const [subRows, setSubRows] = useState(0);
  const [stRows, setStRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const msgsPerSec = useCounter(28400, 240, 400);
  const totalMsgs = useCounter(460600, 840, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setSubRows((x) => Math.min(x + 1, SUBJECTS.length)), 160);
    const st = setInterval(() => setStRows((x) => Math.min(x + 1, STREAMS.length)), 140);
    return () => { clearInterval(s); clearInterval(st); };
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
          nats -- messaging -- jetstream / subjects / consumers
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {msgsPerSec.toLocaleString()} msg/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>nats@jetstream</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>nats stream ls --all && nats consumer report CONSTRUX_EVENTS --raw</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'msg/s', value: msgsPerSec.toLocaleString(), color: '#67e8f9' },
          { label: 'total msgs', value: (totalMsgs / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'subjects', value: SUBJECTS.length.toString(), color: '#a78bfa' },
          { label: 'streams', value: STREAMS.length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Subjects */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // subjects
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {SUBJECTS.slice(0, subRows).map((sub) => (
            <div key={sub.subject} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 40px 24px 24px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: sub.status === 'lag' ? 'rgba(251,191,36,0.04)' : 'rgba(103,232,249,0.04)', border: `1px solid ${sub.status === 'lag' ? 'rgba(251,191,36,0.1)' : 'rgba(103,232,249,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.subject}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{(sub.msgs / 1000).toFixed(0)}k</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{sub.bytes}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{sub.consumers}</span>
              <span className="tabular-nums" style={{ color: sub.pending > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{sub.pending}</span>
              <span style={{ color: sub.status === 'active' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{sub.status}</span>
            </div>
          ))}
        </div>

        {/* Streams */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // jetstream streams
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {STREAMS.slice(0, stRows).map((stream) => (
            <div key={stream.name} style={{ display: 'grid', gridTemplateColumns: '1fr 24px 48px 40px 24px 32px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stream.name}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{stream.subjects}s</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{(stream.msgs / 1000).toFixed(0)}k</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{stream.storage}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'center' }}>{stream.replicas}r</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 7, textAlign: 'right' }}>{stream.retention}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          nats v2.10 - apache-2.0 - cloud native messaging
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {msgsPerSec.toLocaleString()} msg/s - {(totalMsgs / 1000).toFixed(0)}k total
        </span>
      </div>
    </div>
  );
}
