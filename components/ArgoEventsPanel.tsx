'use client';

import { useEffect, useRef, useState } from 'react';

const EVENT_SOURCES = [
  { name: 'github-webhook', type: 'Webhook', events: 48200, active: true, ns: 'argo-events' },
  { name: 'kafka-consumer', type: 'Kafka', events: 124800, active: true, ns: 'argo-events' },
  { name: 'sqs-poller', type: 'SQS', events: 8400, active: true, ns: 'argo-events' },
  { name: 'cron-source', type: 'Calendar', events: 2880, active: true, ns: 'argo-events' },
];

const TRIGGERS = [
  { sensor: 'github-sensor', trigger: 'ArgoWorkflow', dep: 'github-webhook', fired: 284, last: '2m ago', status: 'active' },
  { sensor: 'kafka-sensor', trigger: 'Workflow', dep: 'kafka-consumer', fired: 1842, last: '8s ago', status: 'active' },
  { sensor: 'deploy-sensor', trigger: 'K8sObject', dep: 'sqs-poller', fired: 42, last: '18m ago', status: 'active' },
  { sensor: 'cron-sensor', trigger: 'HTTP', dep: 'cron-source', fired: 12, last: '6h ago', status: 'active' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function ArgoEventsPanel() {
  const [visible, setVisible] = useState(false);
  const [esRows, setEsRows] = useState(0);
  const [tRows, setTRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalEvents = useCounter(184280, 42, 600);
  const triggersPerMin = useCounter(84, 4, 800);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const e = setInterval(() => setEsRows((x) => Math.min(x + 1, EVENT_SOURCES.length)), 160);
    const t = setInterval(() => setTRows((x) => Math.min(x + 1, TRIGGERS.length)), 140);
    return () => { clearInterval(e); clearInterval(t); };
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
          argo events -- event-driven workflows -- k8s
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {triggersPerMin.toLocaleString()} triggers/min
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>argo@events</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>kubectl get eventsources,sensors -n argo-events && argo-events list --all-namespaces</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'triggers/min', value: triggersPerMin.toLocaleString(), color: '#4ade80' },
          { label: 'total events', value: totalEvents.toLocaleString(), color: '#67e8f9' },
          { label: 'sources', value: EVENT_SOURCES.length.toString(), color: '#a78bfa' },
          { label: 'sensors', value: TRIGGERS.length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Event sources */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // event sources
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {EVENT_SOURCES.slice(0, esRows).map((es) => (
            <div key={es.name} style={{ display: 'grid', gridTemplateColumns: '1fr 48px 60px 32px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{es.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, fontWeight: 600 }}>{es.type}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{es.events.toLocaleString()}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>ACTIVE</span>
            </div>
          ))}
        </div>

        {/* Sensors / triggers */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // sensors & triggers
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TRIGGERS.slice(0, tRows).map((t) => (
            <div key={t.sensor} style={{ display: 'grid', gridTemplateColumns: '1fr 64px 52px 36px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.sensor}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.trigger}</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.dep}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 8, textAlign: 'right' }}>{t.fired}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{t.last}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          argo events v1.9 - apache 2.0 - cncf
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalEvents.toLocaleString()} events - {triggersPerMin.toLocaleString()} /min
        </span>
      </div>
    </div>
  );
}
