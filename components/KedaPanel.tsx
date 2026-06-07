'use client';

import { useEffect, useRef, useState } from 'react';

const SCALEDOBJECTS = [
  { name: 'construx-api-scaler', workload: 'construx-api', trigger: 'kafka', minReplicas: 2, maxReplicas: 50, currentReplicas: 18, state: 'Active' },
  { name: 'worker-scaler', workload: 'job-worker', trigger: 'rabbitmq', minReplicas: 1, maxReplicas: 20, currentReplicas: 6, state: 'Active' },
  { name: 'ml-inference-scaler', workload: 'ml-inference', trigger: 'prometheus', minReplicas: 0, maxReplicas: 10, currentReplicas: 3, state: 'Active' },
  { name: 'batch-scaler', workload: 'batch-processor', trigger: 'cron', minReplicas: 0, maxReplicas: 5, currentReplicas: 0, state: 'Paused' },
];

const TRIGGERS = [
  { scaler: 'construx-api-scaler', type: 'kafka', metric: 'consumer-lag', value: '2840', threshold: '200', ratio: 14.2 },
  { scaler: 'worker-scaler', type: 'rabbitmq', metric: 'queue-length', value: '840', threshold: '120', ratio: 7.0 },
  { scaler: 'ml-inference-scaler', type: 'prometheus', metric: 'http_requests_queued', value: '3', threshold: '1', ratio: 3.0 },
  { scaler: 'batch-scaler', type: 'cron', metric: 'schedule', value: '0 2 * * *', threshold: '—', ratio: 0 },
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
  const [soRows, setSoRows] = useState(0);
  const [trRows, setTrRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const scaleEvents = useCounter(284, 2, 1400);
  const totalReplicas = useCounter(27, 0, 800);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const so = setInterval(() => setSoRows((x) => Math.min(x + 1, SCALEDOBJECTS.length)), 160);
    const tr = setInterval(() => setTrRows((x) => Math.min(x + 1, TRIGGERS.length)), 140);
    return () => { clearInterval(so); clearInterval(tr); };
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
          keda -- kubernetes event-driven autoscaling -- triggers / scale objects
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {scaleEvents} events
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>keda@autoscale</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>kubectl get scaledobjects -A && kubectl describe scaledobject construx-api-scaler -n prod</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'scale events', value: scaleEvents.toString(), color: '#4ade80' },
          { label: 'total replicas', value: totalReplicas.toString(), color: '#67e8f9' },
          { label: 'scale objects', value: SCALEDOBJECTS.length.toString(), color: '#a78bfa' },
          { label: 'active', value: SCALEDOBJECTS.filter(s => s.state === 'Active').length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* ScaledObjects */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // scaledobjects
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {SCALEDOBJECTS.slice(0, soRows).map((so) => (
            <div key={so.name} style={{ display: 'grid', gridTemplateColumns: '1fr 56px 44px 24px 24px 24px 52px', alignItems: 'center', gap: 8, padding: '5px 8px', background: so.state === 'Paused' ? 'rgba(251,191,36,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${so.state === 'Paused' ? 'rgba(251,191,36,0.1)' : 'rgba(74,222,128,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{so.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{so.trigger}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 8, textAlign: 'center', fontWeight: 700 }}>{so.currentReplicas}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{so.minReplicas}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{so.maxReplicas}</span>
              <span style={{ color: so.state === 'Active' ? '#4ade80' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{so.state}</span>
            </div>
          ))}
        </div>

        {/* Triggers */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // trigger metrics
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TRIGGERS.slice(0, trRows).map((tr) => (
            <div key={tr.scaler} style={{ display: 'grid', gridTemplateColumns: '1fr 48px 48px 40px 40px', alignItems: 'center', gap: 8, padding: '4px 8px', background: tr.ratio > 5 ? 'rgba(248,113,113,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${tr.ratio > 5 ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.scaler}</span>
              <span style={{ color: '#a78bfa', fontSize: 7 }}>{tr.type}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{tr.value}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{tr.threshold}</span>
              <span className="tabular-nums" style={{ color: tr.ratio > 5 ? '#f87171' : '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{tr.ratio > 0 ? `×${tr.ratio.toFixed(1)}` : '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          keda v2.14 - apache-2.0 - k8s event-driven autoscaler
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {SCALEDOBJECTS.length} scalers - {totalReplicas} replicas
        </span>
      </div>
    </div>
  );
}
