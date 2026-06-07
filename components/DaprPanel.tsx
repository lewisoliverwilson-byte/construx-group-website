'use client';

import { useEffect, useRef, useState } from 'react';

const COMPONENTS = [
  { name: 'service-invocation', status: 'active', calls: 48200, latency: '4ms', protocol: 'grpc' },
  { name: 'pub/sub', status: 'active', calls: 124800, latency: '2ms', protocol: 'kafka' },
  { name: 'state-store', status: 'active', calls: 28400, latency: '1ms', protocol: 'redis' },
  { name: 'secrets', status: 'active', calls: 4200, latency: '6ms', protocol: 'vault' },
];

const SIDECARS = [
  { app: 'api-service', version: '1.13', port: 3500, calls: 28400, status: 'ready' },
  { app: 'worker-service', version: '1.13', port: 3501, calls: 12800, status: 'ready' },
  { app: 'gateway-service', version: '1.13', port: 3502, calls: 84200, status: 'ready' },
  { app: 'scheduler-service', version: '1.13', port: 3503, calls: 2400, status: 'ready' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function DaprPanel() {
  const [visible, setVisible] = useState(false);
  const [cRows, setCRows] = useState(0);
  const [sRows, setSRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalCalls = useCounter(207600, 84, 700);
  const reqPerSec = useCounter(2840, 22, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const c = setInterval(() => setCRows((x) => Math.min(x + 1, COMPONENTS.length)), 160);
    const s = setInterval(() => setSRows((x) => Math.min(x + 1, SIDECARS.length)), 140);
    return () => { clearInterval(c); clearInterval(s); };
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
          dapr -- distributed app runtime -- cncf graduated
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {reqPerSec.toLocaleString()} req/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>dapr@runtime</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>dapr dashboard --port 8080 && dapr list --kubernetes --namespace prod</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'req/s', value: reqPerSec.toLocaleString(), color: '#a78bfa' },
          { label: 'total calls', value: totalCalls.toLocaleString(), color: '#4ade80' },
          { label: 'components', value: COMPONENTS.length.toString(), color: '#67e8f9' },
          { label: 'sidecars', value: SIDECARS.length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Building blocks */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // building blocks
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {COMPONENTS.slice(0, cRows).map((c) => (
            <div key={c.name} style={{ display: 'grid', gridTemplateColumns: '1fr 48px 40px 36px 36px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.protocol}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{c.latency}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 8, textAlign: 'right' }}>{c.calls.toLocaleString()}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>OK</span>
            </div>
          ))}
        </div>

        {/* Sidecars */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // sidecar instances
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SIDECARS.slice(0, sRows).map((s) => (
            <div key={s.app} style={{ display: 'grid', gridTemplateColumns: '1fr 32px 36px 52px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.app}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{s.version}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>:{s.port}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{s.calls.toLocaleString()}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{s.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          dapr v1.13 - apache 2.0 - cncf graduated
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalCalls.toLocaleString()} calls - {reqPerSec.toLocaleString()} /s
        </span>
      </div>
    </div>
  );
}
