'use client';

import { useEffect, useRef, useState } from 'react';

const TOPICS = [
  { name: 'persistent://construx/prod/listings', partitions: 8, producers: 4, consumers: 12, msgRate: 2840, backlog: 0, status: 'active' },
  { name: 'persistent://construx/prod/events', partitions: 4, producers: 8, consumers: 6, msgRate: 1200, backlog: 0, status: 'active' },
  { name: 'persistent://construx/prod/metrics', partitions: 2, producers: 16, consumers: 2, msgRate: 4840, backlog: 0, status: 'active' },
  { name: 'persistent://construx/dead-letter/listings', partitions: 1, producers: 0, consumers: 1, msgRate: 4, backlog: 28, status: 'active' },
];

const SUBSCRIPTIONS = [
  { topic: 'listings', name: 'enrichment-worker', type: 'Shared', consumers: 4, backlog: 0, unacked: 0, status: 'active' },
  { topic: 'listings', name: 'search-indexer', type: 'Exclusive', consumers: 1, backlog: 0, unacked: 0, status: 'active' },
  { topic: 'events', name: 'analytics-consumer', type: 'Key_Shared', consumers: 3, backlog: 0, unacked: 2, status: 'active' },
  { topic: 'metrics', name: 'metrics-aggregator', type: 'Exclusive', consumers: 1, backlog: 0, unacked: 0, status: 'active' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function PulsarPanel() {
  const [visible, setVisible] = useState(false);
  const [topicRows, setTopicRows] = useState(0);
  const [subRows, setSubRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const msgsPerSec = useCounter(8884, 120, 400);
  const totalMsgs = useCounter(28400000, 24000, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setTopicRows((x) => Math.min(x + 1, TOPICS.length)), 160);
    const s = setInterval(() => setSubRows((x) => Math.min(x + 1, SUBSCRIPTIONS.length)), 140);
    return () => { clearInterval(t); clearInterval(s); };
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
          apache pulsar -- multi-tenant messaging -- topics / subscriptions / geo-replication
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {msgsPerSec.toLocaleString()} msg/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>pulsar@broker</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>pulsar-admin topics list construx/prod && pulsar-admin topics stats persistent://construx/prod/listings</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'msg / sec', value: msgsPerSec.toLocaleString(), color: '#67e8f9' },
          { label: 'total msgs', value: (totalMsgs / 1000000).toFixed(1) + 'M', color: '#4ade80' },
          { label: 'topics', value: TOPICS.length.toString(), color: '#a78bfa' },
          { label: 'subscriptions', value: SUBSCRIPTIONS.length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Topics */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // topics
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {TOPICS.slice(0, topicRows).map((t) => (
            <div key={t.name} style={{ display: 'grid', gridTemplateColumns: '1fr 20px 20px 20px 52px 24px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 7, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name.split('/').pop()}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{t.partitions}p</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{t.producers}w</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'center' }}>{t.consumers}r</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{t.msgRate}/s</span>
              <span className="tabular-nums" style={{ color: t.backlog > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{t.backlog}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{t.status}</span>
            </div>
          ))}
        </div>

        {/* Subscriptions */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // subscriptions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SUBSCRIPTIONS.slice(0, subRows).map((sub, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '48px 1fr 60px 20px 24px 24px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.topic}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.name}</span>
              <span style={{ color: '#a78bfa', fontSize: 7 }}>{sub.type}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{sub.consumers}</span>
              <span className="tabular-nums" style={{ color: sub.backlog > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{sub.backlog}</span>
              <span className="tabular-nums" style={{ color: sub.unacked > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{sub.unacked}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{sub.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          apache pulsar v3.3 - apache-2.0 - cloud-native messaging & streaming
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {msgsPerSec.toLocaleString()} msg/s - {(totalMsgs / 1000000).toFixed(1)}M total
        </span>
      </div>
    </div>
  );
}
