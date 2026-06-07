'use client';

import { useEffect, useRef, useState } from 'react';

const SCRIPTS = [
  { name: 'px/http_data', description: 'HTTP request/response latency, status codes', runs: 284, results: 28400 },
  { name: 'px/service_stats', description: 'Service-level RED metrics via eBPF', runs: 120, results: 12000 },
  { name: 'px/dns_queries', description: 'DNS resolution latency and failure rate', runs: 48, results: 4800 },
  { name: 'px/db_query_latency', description: 'Postgres/MySQL query time p50/p90/p99', runs: 84, results: 8400 },
];

const SERVICES = [
  { name: 'construx-web', namespace: 'prod', p50: '12ms', p99: '84ms', errRate: '0.02%', rps: 2840 },
  { name: 'construx-api', namespace: 'prod', p50: '28ms', p99: '184ms', errRate: '0.08%', rps: 1240 },
  { name: 'ml-inference', namespace: 'prod', p50: '42ms', p99: '480ms', errRate: '0.14%', rps: 84 },
  { name: 'job-worker', namespace: 'prod', p50: '8ms', p99: '48ms', errRate: '0.00%', rps: 420 },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function PixiePanel() {
  const [visible, setVisible] = useState(false);
  const [scRows, setScRows] = useState(0);
  const [svRows, setSvRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const eventsPerSec = useCounter(28400, 240, 350);
  const bytesPerSec = useCounter(84000, 480, 400);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const sc = setInterval(() => setScRows((x) => Math.min(x + 1, SCRIPTS.length)), 160);
    const sv = setInterval(() => setSvRows((x) => Math.min(x + 1, SERVICES.length)), 140);
    return () => { clearInterval(sc); clearInterval(sv); };
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
          pixie -- ebpf observability -- no-instrumentation / pxl scripts / live
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {eventsPerSec.toLocaleString()} evt/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>px@ebpf</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>px run px/http_data -c construx-prod && px run px/service_stats --start_time=-5m</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'evt/s', value: eventsPerSec.toLocaleString(), color: '#a78bfa' },
          { label: 'bytes/s', value: (bytesPerSec / 1024).toFixed(0) + ' KB/s', color: '#67e8f9' },
          { label: 'scripts', value: SCRIPTS.length.toString(), color: '#4ade80' },
          { label: 'services', value: SERVICES.length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* PxL scripts */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // pxl scripts
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {SCRIPTS.slice(0, scRows).map((sc) => (
            <div key={sc.name} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 32px 48px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600 }}>{sc.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sc.description}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{sc.runs}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{sc.results.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Services */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // service metrics
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SERVICES.slice(0, svRows).map((svc) => (
            <div key={svc.name} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 44px 44px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7 }}>{svc.name}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{svc.p50}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'right' }}>{svc.p99}</span>
              <span className="tabular-nums" style={{ color: parseFloat(svc.errRate) > 0.1 ? '#f87171' : '#4ade80', fontSize: 7, textAlign: 'right' }}>{svc.errRate}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{svc.rps.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          pixie v0.1.6 - apache-2.0 - cncf ebpf observability
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {eventsPerSec.toLocaleString()} evt/s - {SERVICES.length} services
        </span>
      </div>
    </div>
  );
}
