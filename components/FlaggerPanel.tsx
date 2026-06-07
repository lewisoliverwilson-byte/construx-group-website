'use client';

import { useEffect, useRef, useState } from 'react';

const CANARIES = [
  { name: 'api-server', namespace: 'prod', strategy: 'canary', status: 'Progressing', weight: 40, step: '3/5', metric: 'rps: 284/s' },
  { name: 'worker', namespace: 'prod', strategy: 'bluegreen', status: 'Succeeded', weight: 100, step: '5/5', metric: 'err: 0.0%' },
  { name: 'frontend', namespace: 'staging', strategy: 'a/b', status: 'Waiting', weight: 0, step: '0/3', metric: 'p99: —' },
];

const METRICS = [
  { canary: 'api-server', name: 'request-success-rate', threshold: '99%', current: '99.4%', pass: true },
  { canary: 'api-server', name: 'request-duration', threshold: '500ms', current: '284ms', pass: true },
  { canary: 'worker', name: 'error-rate', threshold: '1%', current: '0.0%', pass: true },
  { canary: 'worker', name: 'queue-depth', threshold: '1000', current: '42', pass: true },
];

const STATUS_COLOR: Record<string, string> = {
  Progressing: '#fbbf24',
  Succeeded: '#4ade80',
  Failed: '#f87171',
  Waiting: 'rgba(255,255,255,0.3)',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function FlaggerPanel() {
  const [visible, setVisible] = useState(false);
  const [cRows, setCRows] = useState(0);
  const [mRows, setMRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const promotions = useCounter(284, 2, 1400);
  const rollbacks = useCounter(12, 0, 60000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const c = setInterval(() => setCRows((x) => Math.min(x + 1, CANARIES.length)), 160);
    const m = setInterval(() => setMRows((x) => Math.min(x + 1, METRICS.length)), 140);
    return () => { clearInterval(c); clearInterval(m); };
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
          flagger -- progressive delivery -- canary / bluegreen / a/b
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {promotions} promotions
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>flagger@delivery</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>kubectl get canaries --all-namespaces && flagger check --canary=api-server.prod</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'promotions', value: promotions.toString(), color: '#4ade80' },
          { label: 'rollbacks', value: rollbacks.toString(), color: '#f87171' },
          { label: 'canaries', value: CANARIES.length.toString(), color: '#a78bfa' },
          { label: 'progressing', value: CANARIES.filter(c => c.status === 'Progressing').length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Canaries */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // canary releases
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {CANARIES.slice(0, cRows).map((c) => (
            <div key={c.name} style={{ display: 'grid', gridTemplateColumns: '1fr 48px 36px 28px 56px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: `${STATUS_COLOR[c.status]}06`, border: `1px solid ${STATUS_COLOR[c.status]}14`, borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600 }}>{c.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{c.strategy}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'center' }}>{c.weight}%</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{c.step}</span>
              <span style={{ color: 'rgba(240,239,255,0.25)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.metric}</span>
              <span style={{ color: STATUS_COLOR[c.status], fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{c.status}</span>
            </div>
          ))}
        </div>

        {/* Metric analysis */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // metric analysis
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {METRICS.slice(0, mRows).map((m, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '56px 1fr 44px 44px 24px', alignItems: 'center', gap: 8, padding: '4px 8px', background: m.pass ? 'rgba(74,222,128,0.04)' : 'rgba(248,113,113,0.04)', border: `1px solid ${m.pass ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.canary}</span>
              <span style={{ color: 'rgba(240,239,255,0.3)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{m.threshold}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 8, textAlign: 'right', fontWeight: 600 }}>{m.current}</span>
              <span style={{ color: m.pass ? '#4ade80' : '#f87171', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{m.pass ? '✓' : '✗'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          flagger v1.36 - apache 2.0 - progressive delivery
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {promotions} promotions - {rollbacks} rollbacks
        </span>
      </div>
    </div>
  );
}
