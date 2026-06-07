'use client';

import { useEffect, useRef, useState } from 'react';

const CONNECTORS = [
  { name: 'pg-source-listings', type: 'source', class: 'io.debezium.connector.postgresql.PostgresConnector', tasks: 1, lag: 0, status: 'RUNNING' },
  { name: 'elastic-sink-listings', type: 'sink', class: 'io.confluent.connect.elasticsearch.ElasticsearchSinkConnector', tasks: 2, lag: 0, status: 'RUNNING' },
  { name: 'pg-source-users', type: 'source', class: 'io.debezium.connector.postgresql.PostgresConnector', tasks: 1, lag: 0, status: 'RUNNING' },
  { name: 's3-sink-audit', type: 'sink', class: 'io.confluent.connect.s3.S3SinkConnector', tasks: 1, lag: 284, status: 'RUNNING' },
];

const TASKS = [
  { connector: 'pg-source-listings', taskId: 0, worker: 'connect-worker-01:8083', events: 28400, lag: 0, status: 'RUNNING' },
  { connector: 'elastic-sink-listings', taskId: 0, worker: 'connect-worker-02:8083', events: 14200, lag: 0, status: 'RUNNING' },
  { connector: 'elastic-sink-listings', taskId: 1, worker: 'connect-worker-01:8083', events: 14200, lag: 0, status: 'RUNNING' },
  { connector: 's3-sink-audit', taskId: 0, worker: 'connect-worker-03:8083', events: 8400, lag: 284, status: 'RUNNING' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function KafkaConnectPanel() {
  const [visible, setVisible] = useState(false);
  const [connectorRows, setConnectorRows] = useState(0);
  const [taskRows, setTaskRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const eventsPerSec = useCounter(28400, 480, 400);
  const totalEvents = useCounter(9284000, 4800, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const c = setInterval(() => setConnectorRows((x) => Math.min(x + 1, CONNECTORS.length)), 160);
    const t = setInterval(() => setTaskRows((x) => Math.min(x + 1, TASKS.length)), 140);
    return () => { clearInterval(c); clearInterval(t); };
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
          kafka connect -- data integration -- connectors / cdc / sinks
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {eventsPerSec.toLocaleString()} events/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>kafka@connect</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>curl -s localhost:8083/connectors | jq && curl -s localhost:8083/connectors/pg-source-listings/status | jq</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'events / sec', value: eventsPerSec.toLocaleString(), color: '#f97316' },
          { label: 'total events', value: (totalEvents / 1000000).toFixed(1) + 'M', color: '#4ade80' },
          { label: 'connectors', value: CONNECTORS.length.toString(), color: '#67e8f9' },
          { label: 'tasks', value: TASKS.length.toString(), color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Connectors */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // connectors
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {CONNECTORS.slice(0, connectorRows).map((c) => (
            <div key={c.name} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 20px 24px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
              <span style={{ color: c.type === 'source' ? '#67e8f9' : '#a78bfa', fontSize: 7, textAlign: 'center' }}>{c.type}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{c.tasks}t</span>
              <span className="tabular-nums" style={{ color: c.lag > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{c.lag}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{c.status}</span>
            </div>
          ))}
        </div>

        {/* Tasks */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // tasks
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TASKS.slice(0, taskRows).map((task, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 20px 52px 24px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.connector}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.worker}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{task.taskId}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{task.events.toLocaleString()}</span>
              <span className="tabular-nums" style={{ color: task.lag > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{task.lag}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{task.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          kafka connect v3.7 - apache-2.0 - streaming data integration
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {eventsPerSec.toLocaleString()} events/s - {(totalEvents / 1000000).toFixed(1)}M total
        </span>
      </div>
    </div>
  );
}
