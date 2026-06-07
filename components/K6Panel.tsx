'use client';

import { useEffect, useRef, useState } from 'react';

const SCENARIOS = [
  { name: 'ramping-vus', executor: 'ramping-vus', vus: 500, iterations: 284200, duration: '10m', status: 'passed' },
  { name: 'constant-arrival', executor: 'constant-arrival-rate', vus: 200, iterations: 48000, duration: '5m', status: 'passed' },
  { name: 'spike-test', executor: 'ramping-arrival-rate', vus: 2000, iterations: 120400, duration: '3m', status: 'failed' },
  { name: 'soak-test', executor: 'constant-vus', vus: 50, iterations: 840200, duration: '60m', status: 'passed' },
];

const THRESHOLDS = [
  { metric: 'http_req_duration', condition: 'p(95)<200', value: 184, passed: true },
  { metric: 'http_req_failed', condition: 'rate<0.01', value: 0.004, passed: true },
  { metric: 'http_req_duration', condition: 'p(99)<500', value: 2400, passed: false },
  { metric: 'iterations', condition: 'count>100000', value: 1292800, passed: true },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function K6Panel() {
  const [visible, setVisible] = useState(false);
  const [scRows, setScRows] = useState(0);
  const [thRows, setThRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const vus = useCounter(500, 8, 600);
  const rps = useCounter(2840, 48, 400);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setScRows((x) => Math.min(x + 1, SCENARIOS.length)), 160);
    const t = setInterval(() => setThRows((x) => Math.min(x + 1, THRESHOLDS.length)), 140);
    return () => { clearInterval(s); clearInterval(t); };
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
          k6 -- performance testing -- scenarios / thresholds / executors
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {rps.toLocaleString()} req/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>k6@perf</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>k6 run --vus 500 --duration 10m --out influxdb=http://localhost:8086/k6 construx-load.js</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'req/s', value: rps.toLocaleString(), color: '#4ade80' },
          { label: 'vus', value: vus.toLocaleString(), color: '#a78bfa' },
          { label: 'scenarios', value: SCENARIOS.length.toString(), color: '#67e8f9' },
          { label: 'failed thresh', value: THRESHOLDS.filter(t => !t.passed).length.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Scenarios */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // scenarios
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {SCENARIOS.slice(0, scRows).map((sc) => (
            <div key={sc.name} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 32px 52px 36px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: sc.status === 'failed' ? 'rgba(248,113,113,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${sc.status === 'failed' ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600 }}>{sc.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sc.executor}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{sc.vus}u</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{(sc.iterations / 1000).toFixed(0)}k</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{sc.duration}</span>
              <span style={{ color: sc.status === 'passed' ? '#4ade80' : '#f87171', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{sc.status}</span>
            </div>
          ))}
        </div>

        {/* Thresholds */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // thresholds
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {THRESHOLDS.slice(0, thRows).map((th, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 56px 40px', alignItems: 'center', gap: 8, padding: '4px 8px', background: th.passed ? 'rgba(74,222,128,0.04)' : 'rgba(248,113,113,0.04)', border: `1px solid ${th.passed ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{th.metric}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{th.condition}</span>
              <span className="tabular-nums" style={{ color: th.passed ? '#4ade80' : '#f87171', fontSize: 7, textAlign: 'right' }}>{th.value}</span>
              <span style={{ color: th.passed ? '#4ade80' : '#f87171', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{th.passed ? 'PASS' : 'FAIL'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          k6 v0.51 - agpl-3.0 - grafana performance testing
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {rps.toLocaleString()} req/s - {vus.toLocaleString()} vus
        </span>
      </div>
    </div>
  );
}
