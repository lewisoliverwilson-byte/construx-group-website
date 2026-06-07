'use client';

import { useEffect, useRef, useState } from 'react';

const SCALED_OBJECTS = [
  { name: 'api-deployment', namespace: 'prod', min: 2, max: 20, current: 8, trigger: 'prometheus', metric: 'rps=840' },
  { name: 'worker-deployment', namespace: 'prod', min: 1, max: 10, current: 4, trigger: 'rabbitmq', metric: 'depth=124' },
  { name: 'ml-inference', namespace: 'prod', min: 0, max: 8, current: 3, trigger: 'kafka', metric: 'lag=28' },
  { name: 'report-job', namespace: 'prod', min: 0, max: 4, current: 0, trigger: 'cron', metric: '0 */6 * * *' },
];

const EVENTS = [
  { object: 'api-deployment', event: 'ScaleUp', from: 6, to: 8, reason: 'rps exceeded threshold', ts: '2m ago' },
  { object: 'ml-inference', event: 'ScaleDown', from: 4, to: 3, reason: 'kafka lag reduced', ts: '8m ago' },
  { object: 'worker-deployment', event: 'ScaleUp', from: 2, to: 4, reason: 'queue depth spike', ts: '14m ago' },
  { object: 'report-job', event: 'ScaleDown', from: 2, to: 0, reason: 'cron window closed', ts: '32m ago' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function KedaPanel() {
  const [visible, setVisible] = useState(false);
  const [sRows, setSRows] = useState(0);
  const [eRows, setERows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const scaleOps = useCounter(2840, 3, 1200);
  const totalReplicas = SCALED_OBJECTS.reduce((a, o) => a + o.current, 0);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setSRows((x) => Math.min(x + 1, SCALED_OBJECTS.length)), 160);
    const e = setInterval(() => setERows((x) => Math.min(x + 1, EVENTS.length)), 140);
    return () => { clearInterval(s); clearInterval(e); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(167,139,250,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(167,139,250,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(167,139,250,0.08)', background: 'rgba(167,139,250,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(167,139,250,0.4)' }}>
          keda -- kubernetes event-driven autoscaler -- cncf
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {scaleOps.toLocaleString()} scale ops
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>keda@autoscaler</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>kubectl get scaledobjects -n prod && kubectl describe scaledobject api-deployment</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'scale ops', value: scaleOps.toLocaleString(), color: '#a78bfa' },
          { label: 'total replicas', value: totalReplicas.toString(), color: '#4ade80' },
          { label: 'scaled objects', value: SCALED_OBJECTS.length.toString(), color: '#67e8f9' },
          { label: 'idle (0)', value: SCALED_OBJECTS.filter(o => o.current === 0).length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Scaled objects */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // scaled objects
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {SCALED_OBJECTS.slice(0, sRows).map((o) => (
            <div key={o.name} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 48px 24px 24px 24px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.trigger}</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.metric}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 8, textAlign: 'center' }}>{o.min}</span>
              <span className="tabular-nums" style={{ color: o.current > 0 ? '#4ade80' : 'rgba(255,255,255,0.2)', fontSize: 8, fontWeight: 700, textAlign: 'center' }}>{o.current}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 8, textAlign: 'center' }}>{o.max}</span>
            </div>
          ))}
        </div>

        {/* Scale events */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // scale events
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {EVENTS.slice(0, eRows).map((ev) => (
            <div key={ev.object + ev.ts} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 24px 24px 1fr 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: ev.event === 'ScaleUp' ? 'rgba(74,222,128,0.04)' : 'rgba(251,191,36,0.04)', border: `1px solid ${ev.event === 'ScaleUp' ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: ev.event === 'ScaleUp' ? '#4ade80' : '#fbbf24', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.object}</span>
              <span style={{ color: ev.event === 'ScaleUp' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700 }}>{ev.event}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 8, textAlign: 'center' }}>{ev.from}</span>
              <span className="tabular-nums" style={{ color: ev.event === 'ScaleUp' ? '#4ade80' : '#fbbf24', fontSize: 8, fontWeight: 700, textAlign: 'center' }}>{ev.to}</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.reason}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{ev.ts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          keda v2.14 - apache 2.0 - cncf graduated
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalReplicas} replicas - {SCALED_OBJECTS.length} scaled objects
        </span>
      </div>
    </div>
  );
}
