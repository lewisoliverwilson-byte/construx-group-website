'use client';

import { useEffect, useRef, useState } from 'react';

const INPUTS = [
  { name: 'tail-app-logs', plugin: 'tail', path: '/var/log/pods/**/*.log', records: 48200 },
  { name: 'syslog-udp', plugin: 'syslog', port: '5140/UDP', records: 8400 },
  { name: 'k8s-events', plugin: 'kubernetes_events', ns: 'all', records: 1240 },
  { name: 'docker-json', plugin: 'docker', containers: 48, records: 28400 },
];

const OUTPUTS = [
  { name: 'out-loki', plugin: 'loki', endpoint: 'loki:3100', records: 82400, errors: 0 },
  { name: 'out-s3-archive', plugin: 's3', bucket: 'construx-logs', records: 84200, errors: 0 },
  { name: 'out-opensearch', plugin: 'opensearch', host: 'opensearch:9200', records: 42100, errors: 2 },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function FluentBitPanel() {
  const [visible, setVisible] = useState(false);
  const [inRows, setInRows] = useState(0);
  const [outRows, setOutRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const recRate = useCounter(4820, 40, 600);
  const byteRate = useCounter(128400, 200, 700);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const i = setInterval(() => setInRows((x) => Math.min(x + 1, INPUTS.length)), 160);
    const o = setInterval(() => setOutRows((x) => Math.min(x + 1, OUTPUTS.length)), 160);
    return () => { clearInterval(i); clearInterval(o); };
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
          fluent bit -- log processor -- loki / s3 / opensearch
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {recRate.toLocaleString()} rec/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>flb@collector</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>fluent-bit -c /etc/fluent-bit/fluent-bit.yaml --log-level=info</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'records/s', value: recRate.toLocaleString(), color: '#67e8f9' },
          { label: 'KB/s', value: (byteRate / 1024).toFixed(0), color: '#4ade80' },
          { label: 'inputs', value: INPUTS.length.toString(), color: '#a78bfa' },
          { label: 'outputs', value: OUTPUTS.length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Inputs */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // inputs
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {INPUTS.slice(0, inRows).map((inp) => (
            <div key={inp.name} style={{ display: 'grid', gridTemplateColumns: '100px 64px 1fr 64px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 9, fontWeight: 600 }}>{inp.name}</span>
              <span style={{ color: '#a78bfa', fontSize: 8 }}>{inp.plugin}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{'path' in inp ? inp.path : 'port' in inp ? inp.port : `ns:${'ns' in inp ? inp.ns : ''}` }</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 8, textAlign: 'right' }}>{inp.records.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Outputs */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // outputs
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {OUTPUTS.slice(0, outRows).map((out) => (
            <div key={out.name} style={{ display: 'grid', gridTemplateColumns: '88px 64px 1fr 56px 36px', alignItems: 'center', gap: 8, padding: '5px 8px', background: out.errors > 0 ? 'rgba(248,113,113,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${out.errors > 0 ? 'rgba(248,113,113,0.12)' : 'rgba(74,222,128,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 9, fontWeight: 600 }}>{out.name}</span>
              <span style={{ color: '#fbbf24', fontSize: 8 }}>{out.plugin}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{out.endpoint}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 8, textAlign: 'right' }}>{out.records.toLocaleString()}</span>
              <span className="tabular-nums" style={{ color: out.errors > 0 ? '#f87171' : '#4ade80', fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{out.errors > 0 ? out.errors : '✓'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          fluent bit v3.1 - apache 2.0 - cncf graduated
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {recRate.toLocaleString()} rec/s - {(byteRate / 1024).toFixed(0)} KB/s
        </span>
      </div>
    </div>
  );
}
