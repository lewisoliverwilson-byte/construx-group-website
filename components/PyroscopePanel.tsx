'use client';

import { useEffect, useRef, useState } from 'react';

const PROFILES = [
  { app: 'api-server', lang: 'go', type: 'cpu', samples: 48200, p99: '12ms', top: 'runtime.gcBgMarkWorker' },
  { app: 'ml-worker', lang: 'python', type: 'cpu', samples: 24800, p99: '84ms', top: 'torch.forward' },
  { app: 'gateway', lang: 'go', type: 'mem', samples: 8400, p99: '4MB', top: 'net/http.ReadRequest' },
  { app: 'indexer', lang: 'go', type: 'cpu', samples: 12000, p99: '28ms', top: 'json.Unmarshal' },
];

const FLAMEGRAPH = [
  { fn: 'main.handleRequest', pct: 68, color: '#f97316' },
  { fn: '  net/http.ServeHTTP', pct: 52, color: '#fbbf24' },
  { fn: '    db.QueryContext', pct: 38, color: '#4ade80' },
  { fn: '      pgx.sendQuery', pct: 24, color: '#67e8f9' },
  { fn: '    json.Marshal', pct: 14, color: '#a78bfa' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function PyroscopePanel() {
  const [visible, setVisible] = useState(false);
  const [pRows, setPRows] = useState(0);
  const [fRows, setFRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const samplesPerSec = useCounter(9400, 84, 600);
  const totalProfiles = useCounter(93400, 40, 900);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const p = setInterval(() => setPRows((x) => Math.min(x + 1, PROFILES.length)), 160);
    const f = setInterval(() => setFRows((x) => Math.min(x + 1, FLAMEGRAPH.length)), 140);
    return () => { clearInterval(p); clearInterval(f); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(249,115,22,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(249,115,22,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(249,115,22,0.08)', background: 'rgba(249,115,22,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(249,115,22,0.4)' }}>
          grafana pyroscope -- continuous profiling -- pprof / ebpf
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {samplesPerSec.toLocaleString()} samples/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>pyroscope@profiler</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>pyroscope query --app api-server --profile-type cpu --from now-1h | flamegraph</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'samples/s', value: samplesPerSec.toLocaleString(), color: '#f97316' },
          { label: 'total profiles', value: totalProfiles.toLocaleString(), color: '#4ade80' },
          { label: 'apps', value: PROFILES.length.toString(), color: '#a78bfa' },
          { label: 'languages', value: [...new Set(PROFILES.map(p => p.lang))].length.toString(), color: '#67e8f9' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Profiles */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // active profiles
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {PROFILES.slice(0, pRows).map((p) => (
            <div key={p.app + p.type} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 28px 36px 1fr', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.app}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{p.lang}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{p.type}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{p.p99}</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.top}</span>
            </div>
          ))}
        </div>

        {/* Flamegraph (ascii-style) */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // flamegraph — api-server cpu (top frames)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {FLAMEGRAPH.slice(0, fRows).map((f) => (
            <div key={f.fn} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 8px', background: `${f.color}06`, border: `1px solid ${f.color}14`, borderRadius: 2 }}>
              <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${f.pct}%`, background: f.color, borderRadius: 1, opacity: 0.7 }} />
              </div>
              <span className="tabular-nums" style={{ color: f.color, fontSize: 8, fontWeight: 700, width: 24, textAlign: 'right', flexShrink: 0 }}>{f.pct}%</span>
              <span style={{ color: 'rgba(240,239,255,0.3)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 2 }}>{f.fn}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          pyroscope v1.6 - agpl-3.0 - grafana labs
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalProfiles.toLocaleString()} profiles - {samplesPerSec.toLocaleString()} /s
        </span>
      </div>
    </div>
  );
}
