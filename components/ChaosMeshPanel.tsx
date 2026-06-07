'use client';

import { useEffect, useRef, useState } from 'react';

const EXPERIMENTS = [
  { name: 'api-pod-kill', kind: 'PodChaos', action: 'pod-kill', target: 'prod/api-gateway', status: 'Running', duration: '5m', start: '2m ago' },
  { name: 'net-loss-worker', kind: 'NetworkChaos', action: 'loss 10%', target: 'prod/worker', status: 'Finished', duration: '10m', start: '18m ago' },
  { name: 'io-delay-db', kind: 'IOChaos', action: 'latency +100ms', target: 'data/postgres', status: 'Paused', duration: '15m', start: '1h ago' },
  { name: 'http-abort-svc', kind: 'HTTPChaos', action: 'abort 5%', target: 'prod/auth-service', status: 'Running', duration: '20m', start: '8m ago' },
  { name: 'cpu-stress-node', kind: 'StressChaos', action: 'cpu 80%', target: 'node-1', status: 'Finished', duration: '5m', start: '45m ago' },
];

const METRICS = [
  { label: 'Steady State Hypothesis', result: 'PASS', color: '#4ade80' },
  { label: 'Error Budget Impact', result: '-0.02%', color: '#fbbf24' },
  { label: 'Mean Recovery Time', result: '14s', color: '#67e8f9' },
  { label: 'Blast Radius', result: 'low', color: '#4ade80' },
];

const KIND_COLOR: Record<string, string> = {
  PodChaos: '#f87171',
  NetworkChaos: '#fbbf24',
  IOChaos: '#a78bfa',
  HTTPChaos: '#67e8f9',
  StressChaos: '#f97316',
};

const STATUS_COLOR: Record<string, string> = {
  Running: '#4ade80',
  Finished: 'rgba(255,255,255,0.3)',
  Paused: '#fbbf24',
  Error: '#f87171',
};

function useCounter(base: number, delta: number, ms = 2000) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta)), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function ChaosMeshPanel() {
  const [visible, setVisible] = useState(false);
  const [expRows, setExpRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const runs = useCounter(284, 1, 4000);
  const injections = useCounter(1840, 4, 2000);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const e = setInterval(() => setExpRows((x) => Math.min(x + 1, EXPERIMENTS.length)), 155);
    const a = setInterval(() => setActiveIdx((x) => (x + 1) % METRICS.length), 1400);
    return () => { clearInterval(e); clearInterval(a); };
  }, [visible]);

  const running = EXPERIMENTS.filter((e) => e.status === 'Running').length;

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(248,113,113,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(248,113,113,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(248,113,113,0.08)', background: 'rgba(248,113,113,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(248,113,113,0.4)' }}>
          chaos mesh -- chaos engineering -- cncf
        </span>
        <span style={{ fontSize: 8, color: running > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontWeight: running > 0 ? 700 : 400 }}>
          {running} running
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f87171', fontWeight: 600 }}>chaos@operator</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>chaosctl experiment list --all-namespaces && chaosctl logs -l chaos</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'experiments', value: EXPERIMENTS.length.toString(), color: '#f87171' },
          { label: 'runs total', value: runs.toString(), color: '#fbbf24' },
          { label: 'injections', value: injections.toLocaleString(), color: '#a78bfa' },
          { label: 'types', value: '5', color: '#67e8f9' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Experiment list */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // active experiments
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {EXPERIMENTS.slice(0, expRows).map((exp) => (
            <div key={exp.name} style={{ display: 'grid', gridTemplateColumns: '120px 80px 1fr 1fr 52px 52px', alignItems: 'center', gap: 8, padding: '5px 8px', background: `${KIND_COLOR[exp.kind] ?? '#fff'}06`, border: `1px solid ${KIND_COLOR[exp.kind] ?? '#fff'}18`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.7)', fontSize: 9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.name}</span>
              <span style={{ color: KIND_COLOR[exp.kind] ?? '#fff', fontSize: 8, fontWeight: 600 }}>{exp.kind}</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.action}</span>
              <span style={{ color: '#67e8f9', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.target}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{exp.duration}</span>
              <span style={{ color: STATUS_COLOR[exp.status], fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{exp.status.toUpperCase()}</span>
            </div>
          ))}
        </div>

        {/* Gameday metrics */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // gameday results
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {METRICS.map((m, i) => (
            <div
              key={m.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '5px 8px',
                background: i === activeIdx ? `${m.color}08` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === activeIdx ? m.color + '28' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 2,
                transition: 'all 0.4s ease',
              }}
            >
              <span style={{ fontSize: 8, color: 'rgba(240,239,255,0.5)' }}>{m.label}</span>
              <span className="tabular-nums" style={{ fontSize: 9, color: m.color, fontWeight: 700 }}>{m.result}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(248,113,113,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          chaos mesh v2.6.3 - cncf - k8s native
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {runs} runs - {injections.toLocaleString()} injections
        </span>
      </div>
    </div>
  );
}
