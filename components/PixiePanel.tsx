'use client';

import { useEffect, useRef, useState } from 'react';

const SCRIPTS = [
  { name: 'http_data.pxl', desc: 'HTTP request latency & error rate', status: 'running' },
  { name: 'db_query_stats.pxl', desc: 'Postgres query performance', status: 'running' },
  { name: 'network_stats.pxl', desc: 'Pod-to-pod network traffic', status: 'running' },
  { name: 'jvm_stats.pxl', desc: 'JVM heap & GC metrics', status: 'idle' },
];

const SERVICES = [
  { name: 'api-gateway', rps: 1240, p50: 12, p99: 84, errPct: 0.4 },
  { name: 'auth-service', rps: 480, p50: 8, p99: 42, errPct: 0.1 },
  { name: 'worker', rps: 230, p50: 34, p99: 210, errPct: 1.2 },
  { name: 'postgres', rps: 890, p50: 3, p99: 22, errPct: 0.0 },
  { name: 'redis-cache', rps: 3400, p50: 1, p99: 6, errPct: 0.0 },
];

const FLAMEGRAPH = [
  { fn: 'handleRequest', width: 92, depth: 0, color: '#a78bfa' },
  { fn: 'parseBody', width: 48, depth: 1, color: '#67e8f9' },
  { fn: 'authMiddleware', width: 40, depth: 1, color: '#fbbf24' },
  { fn: 'dbQuery', width: 28, depth: 2, color: '#f87171' },
  { fn: 'marshal', width: 18, depth: 2, color: '#67e8f9' },
  { fn: 'serialize', width: 10, depth: 3, color: '#4ade80' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

function LatBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 1s ease' }} />
    </div>
  );
}

export default function PixiePanel() {
  const [visible, setVisible] = useState(false);
  const [rows, setRows] = useState(0);
  const [frameRows, setFrameRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalRps = useCounter(6240, 40, 800);
  const spansTotal = useCounter(14_820_000, 6240, 800);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setRows((x) => Math.min(x + 1, SERVICES.length)), 150);
    const f = setInterval(() => setFrameRows((x) => Math.min(x + 1, FLAMEGRAPH.length)), 120);
    return () => { clearInterval(r); clearInterval(f); };
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
          pixie -- ebpf auto-telemetry -- no instrumentation
        </span>
        <span
          style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 5px rgba(74,222,128,0.6)', display: 'inline-block' }}
        />
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>px@vizier</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>px run px/http_data -- -start_time -5m --namespace=prod</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'total rps', value: totalRps.toLocaleString(), color: '#4ade80' },
          { label: 'spans captured', value: (spansTotal / 1_000_000).toFixed(1) + 'M', color: '#a78bfa' },
          { label: 'pxl scripts', value: SCRIPTS.filter((s) => s.status === 'running').length.toString(), color: '#67e8f9' },
          { label: 'services', value: SERVICES.length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Service table */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // http service topology
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {SERVICES.slice(0, rows).map((svc) => (
            <div key={svc.name} style={{ display: 'grid', gridTemplateColumns: '90px 56px 40px 44px 1fr 40px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{svc.name}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 9, textAlign: 'right' }}>{svc.rps.toLocaleString()} rps</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 8, textAlign: 'right' }}>{svc.p50}ms</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{svc.p99}ms</span>
              <LatBar pct={Math.min(100, (svc.p99 / 250) * 100)} color={svc.p99 > 150 ? '#f87171' : svc.p99 > 60 ? '#fbbf24' : '#4ade80'} />
              <span className="tabular-nums" style={{ color: svc.errPct > 0.5 ? '#f87171' : 'rgba(255,255,255,0.3)', fontSize: 8, textAlign: 'right' }}>{svc.errPct}%</span>
            </div>
          ))}
        </div>

        {/* Flamegraph */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // cpu flamegraph -- api-gateway (sampled)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 4 }}>
          {FLAMEGRAPH.slice(0, frameRows).map((frame, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: frame.depth * 12 }}>
              <div
                style={{
                  height: 14,
                  width: `${frame.width}%`,
                  background: `${frame.color}22`,
                  border: `1px solid ${frame.color}44`,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 6,
                  overflow: 'hidden',
                  transition: 'width 0.8s ease',
                }}
              >
                <span style={{ fontSize: 7, color: frame.color, whiteSpace: 'nowrap' }}>{frame.fn} ({frame.width}%)</span>
              </div>
            </div>
          ))}
        </div>

        {/* PxL scripts */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6, marginTop: 10 }}>
          // active pxl scripts
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {SCRIPTS.map((s) => (
            <div key={s.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', background: s.status === 'running' ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${s.status === 'running' ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 2 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.status === 'running' ? '#4ade80' : 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
              <span style={{ fontSize: 8, color: s.status === 'running' ? 'rgba(240,239,255,0.65)' : 'rgba(255,255,255,0.25)' }}>{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          pixie v0.12.5 - ebpf - cncf sandbox
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalRps.toLocaleString()} rps across {SERVICES.length} services
        </span>
      </div>
    </div>
  );
}
