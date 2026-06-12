'use client';

import { useEffect, useRef, useState } from 'react';

const STREAMS = [
  { name: 'LISTINGS', subjects: 'listings.>', msgs: 284000, bytes: '1.8GB', consumers: 4, retention: 'limits', status: 'ok' },
  { name: 'EVENTS', subjects: 'events.>', msgs: 48400, bytes: '284MB', consumers: 6, retention: 'workqueue', status: 'ok' },
  { name: 'ALERTS', subjects: 'alerts.>', msgs: 2840, bytes: '12MB', consumers: 2, retention: 'interest', status: 'ok' },
  { name: 'AUDIT', subjects: 'audit.>', msgs: 840000, bytes: '4.2GB', consumers: 1, retention: 'limits', status: 'ok' },
];

const CONSUMERS = [
  { name: 'listing-enricher', stream: 'LISTINGS', pending: 284, ackFloor: 283716, pull: true, ackPolicy: 'explicit', status: 'active' },
  { name: 'search-indexer', stream: 'LISTINGS', pending: 0, ackFloor: 284000, pull: true, ackPolicy: 'explicit', status: 'active' },
  { name: 'alert-forwarder', stream: 'ALERTS', pending: 2, ackFloor: 2838, pull: false, ackPolicy: 'none', status: 'active' },
  { name: 'audit-archiver', stream: 'AUDIT', pending: 48, ackFloor: 839952, pull: true, ackPolicy: 'explicit', status: 'active' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function NATSPanel() {
  const [visible, setVisible] = useState(false);
  const [streamRows, setStreamRows] = useState(0);
  const [consumerRows, setConsumerRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const msgsPerSec = useCounter(28400, 480, 400);
  const totalMsgs = useCounter(1175240, 1200, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setStreamRows((x) => Math.min(x + 1, STREAMS.length)), 160);
    const c = setInterval(() => setConsumerRows((x) => Math.min(x + 1, CONSUMERS.length)), 140);
    return () => { clearInterval(s); clearInterval(c); };
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
          nats -- jetstream messaging -- streams / consumers / subjects
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {msgsPerSec.toLocaleString()} msg/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>nats@server</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>nats stream ls && nats consumer ls LISTINGS --all</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'msg / sec', value: msgsPerSec.toLocaleString(), color: '#67e8f9' },
          { label: 'total msgs', value: (totalMsgs / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'streams', value: STREAMS.length.toString(), color: '#a78bfa' },
          { label: 'consumers', value: CONSUMERS.length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Streams */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // jetstream streams
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {STREAMS.slice(0, streamRows).map((s) => (
            <div key={s.name} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 52px 40px 20px 56px 28px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600 }}>{s.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.subjects}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{s.msgs.toLocaleString()}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{s.bytes}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'center' }}>{s.consumers}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{s.retention}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{s.status}</span>
            </div>
          ))}
        </div>

        {/* Consumers */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // consumers
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {CONSUMERS.slice(0, consumerRows).map((con) => (
            <div key={con.name} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 52px 52px 28px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{con.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{con.stream}</span>
              <span className="tabular-nums" style={{ color: con.pending > 0 ? '#fbbf24' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{con.pending}p</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{con.ackPolicy}</span>
              <span style={{ color: con.pull ? '#4ade80' : '#a78bfa', fontSize: 7, textAlign: 'center' }}>{con.pull ? 'pull' : 'push'}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{con.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          nats v2.10 - apache-2.0 - connective technology for adaptive systems
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {msgsPerSec.toLocaleString()} msg/s - {(totalMsgs / 1000).toFixed(0)}k total
        </span>
      </div>
    </div>
  );
}
