'use client';

import { useEffect, useRef, useState } from 'react';

const PIPELINES = [
  { name: 'listings-enricher', input: 'kafka', output: 'elasticsearch', throughput: 28400, errors: 0, latency: 8, status: 'running' },
  { name: 'event-fanout', input: 'nats', output: 'kafka+webhook', throughput: 120000, errors: 2, latency: 2, status: 'running' },
  { name: 'log-transformer', input: 'kafka', output: 's3+loki', throughput: 840000, errors: 0, latency: 12, status: 'running' },
  { name: 'media-processor', input: 'sqs', output: 'redis+postgres', throughput: 4800, errors: 0, latency: 48, status: 'paused' },
];

const PROCESSORS = [
  { name: 'bloblang/enrich-listing', type: 'bloblang', pipeline: 'listings-enricher', executions: 284000, errors: 0, avgMs: 0.4 },
  { name: 'http/geocode', type: 'http', pipeline: 'listings-enricher', executions: 28400, errors: 4, avgMs: 84 },
  { name: 'jmespath/extract-fields', type: 'jmespath', pipeline: 'event-fanout', executions: 120000, errors: 0, avgMs: 0.1 },
  { name: 'rate_limit/throttle', type: 'rate_limit', pipeline: 'event-fanout', executions: 120000, errors: 0, avgMs: 0.0 },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function BenthosPanel() {
  const [visible, setVisible] = useState(false);
  const [pipRows, setPipRows] = useState(0);
  const [procRows, setProcRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const msgsPerSec = useCounter(28400, 480, 400);
  const totalProcessed = useCounter(993200, 1200, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const p = setInterval(() => setPipRows((x) => Math.min(x + 1, PIPELINES.length)), 160);
    const pr = setInterval(() => setProcRows((x) => Math.min(x + 1, PROCESSORS.length)), 140);
    return () => { clearInterval(p); clearInterval(pr); };
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
          benthos -- stream processor -- pipelines / bloblang / fanout
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {msgsPerSec.toLocaleString()} msg/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>benthos@stream</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>benthos -c /etc/benthos/listings-enricher.yaml streams && benthos list --all</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'msg/s', value: msgsPerSec.toLocaleString(), color: '#67e8f9' },
          { label: 'processed', value: (totalProcessed / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'pipelines', value: PIPELINES.length.toString(), color: '#a78bfa' },
          { label: 'errors', value: PIPELINES.reduce((a, p) => a + p.errors, 0).toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Pipelines */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // pipelines
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {PIPELINES.slice(0, pipRows).map((pip) => (
            <div key={pip.name} style={{ display: 'grid', gridTemplateColumns: '80px 40px 1fr 48px 24px 28px 48px', alignItems: 'center', gap: 8, padding: '5px 8px', background: pip.status === 'paused' ? 'rgba(251,191,36,0.04)' : pip.errors > 0 ? 'rgba(248,113,113,0.04)' : 'rgba(103,232,249,0.04)', border: `1px solid ${pip.status === 'paused' ? 'rgba(251,191,36,0.1)' : pip.errors > 0 ? 'rgba(248,113,113,0.1)' : 'rgba(103,232,249,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pip.name}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{pip.input}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pip.output}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{(pip.throughput / 1000).toFixed(0)}k</span>
              <span className="tabular-nums" style={{ color: pip.errors > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{pip.errors}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{pip.latency}ms</span>
              <span style={{ color: pip.status === 'running' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{pip.status}</span>
            </div>
          ))}
        </div>

        {/* Processors */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // processors
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {PROCESSORS.slice(0, procRows).map((proc) => (
            <div key={proc.name} style={{ display: 'grid', gridTemplateColumns: '1fr 48px 44px 24px 40px', alignItems: 'center', gap: 8, padding: '4px 8px', background: proc.errors > 0 ? 'rgba(248,113,113,0.04)' : 'rgba(103,232,249,0.04)', border: `1px solid ${proc.errors > 0 ? 'rgba(248,113,113,0.1)' : 'rgba(103,232,249,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proc.name}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{proc.type}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{(proc.executions / 1000).toFixed(0)}k</span>
              <span className="tabular-nums" style={{ color: proc.errors > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{proc.errors}</span>
              <span className="tabular-nums" style={{ color: proc.avgMs > 10 ? '#fbbf24' : '#67e8f9', fontSize: 7, textAlign: 'right' }}>{proc.avgMs}ms</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          benthos v4.27 - mit - redpanda stream processor
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {msgsPerSec.toLocaleString()} msg/s - {(totalProcessed / 1000).toFixed(0)}k total
        </span>
      </div>
    </div>
  );
}
