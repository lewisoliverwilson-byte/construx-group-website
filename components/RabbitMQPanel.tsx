'use client';

import { useEffect, useRef, useState } from 'react';

const QUEUES = [
  { name: 'task.scan', vhost: 'prod', messages: 284, rate: '42/s', consumers: 8, state: 'running' },
  { name: 'task.notify', vhost: 'prod', messages: 12, rate: '4/s', consumers: 2, state: 'running' },
  { name: 'task.reindex', vhost: 'prod', messages: 1840, rate: '8/s', consumers: 4, state: 'running' },
  { name: 'task.export', vhost: 'staging', messages: 0, rate: '0/s', consumers: 1, state: 'idle' },
];

const EXCHANGES = [
  { name: 'construx.direct', type: 'direct', bindings: 4, vhost: 'prod' },
  { name: 'construx.topic', type: 'topic', bindings: 12, vhost: 'prod' },
  { name: 'construx.fanout', type: 'fanout', bindings: 3, vhost: 'prod' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function RabbitMQPanel() {
  const [visible, setVisible] = useState(false);
  const [qRows, setQRows] = useState(0);
  const [eRows, setERows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const publishRate = useCounter(2840, 28, 600);
  const deliverRate = useCounter(2800, 28, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const q = setInterval(() => setQRows((x) => Math.min(x + 1, QUEUES.length)), 160);
    const e = setInterval(() => setERows((x) => Math.min(x + 1, EXCHANGES.length)), 140);
    return () => { clearInterval(q); clearInterval(e); };
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
          rabbitmq -- amqp message broker -- queues / exchanges / bindings
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {publishRate.toLocaleString()} msg/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>rabbitmq@amqp</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>rabbitmqctl list_queues name messages consumers && rabbitmqctl list_exchanges</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'publish/s', value: publishRate.toLocaleString(), color: '#f97316' },
          { label: 'deliver/s', value: deliverRate.toLocaleString(), color: '#4ade80' },
          { label: 'queues', value: QUEUES.length.toString(), color: '#a78bfa' },
          { label: 'consumers', value: QUEUES.reduce((a, q) => a + q.consumers, 0).toString(), color: '#67e8f9' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Queues */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // queues
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {QUEUES.slice(0, qRows).map((q) => (
            <div key={q.name + q.vhost} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 40px 32px 24px 32px', alignItems: 'center', gap: 8, padding: '5px 8px', background: q.messages > 0 ? 'rgba(249,115,22,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${q.messages > 0 ? 'rgba(249,115,22,0.1)' : 'rgba(74,222,128,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{q.vhost}</span>
              <span className="tabular-nums" style={{ color: q.messages > 500 ? '#f87171' : '#fbbf24', fontSize: 8, textAlign: 'right', fontWeight: q.messages > 500 ? 700 : 400 }}>{q.messages}</span>
              <span style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{q.rate}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 8, textAlign: 'center' }}>{q.consumers}</span>
              <span style={{ color: q.state === 'running' ? '#4ade80' : 'rgba(255,255,255,0.2)', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{q.state}</span>
            </div>
          ))}
        </div>

        {/* Exchanges */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // exchanges
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {EXCHANGES.slice(0, eRows).map((ex) => (
            <div key={ex.name} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 28px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600 }}>{ex.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{ex.type}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 8, textAlign: 'center' }}>{ex.bindings}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{ex.vhost}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          rabbitmq v3.13 - mpl-2.0 - amqp message broker
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {publishRate.toLocaleString()} pub/s - {deliverRate.toLocaleString()} del/s
        </span>
      </div>
    </div>
  );
}
