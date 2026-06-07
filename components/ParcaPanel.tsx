'use client';

import { useEffect, useRef, useState } from 'react';

const PROFILES = [
  { target: 'construx-api', type: 'cpu', samples: 284000, duration: '10s', topFunc: 'runtime.gcBgMarkWorker', hotPct: 12.4, status: 'active' },
  { target: 'construx-api', type: 'heap', samples: 48400, duration: '10s', topFunc: 'encoding/json.Marshal', hotPct: 8.4, status: 'active' },
  { target: 'construx-worker', type: 'cpu', samples: 120000, duration: '10s', topFunc: 'github.com/construx/ml.Infer', hotPct: 28.4, status: 'active' },
  { target: 'construx-ui', type: 'cpu', samples: 8400, duration: '10s', topFunc: 'react-dom.reconcile', hotPct: 4.8, status: 'active' },
];

const FLAMEGRAPH_NODES = [
  { func: 'runtime.gcBgMarkWorker', selfPct: 12.4, cumPct: 12.4, samples: 35216, loc: 'runtime/mgc.go:1234' },
  { func: 'net/http.(*conn).serve', selfPct: 0.8, cumPct: 58.4, samples: 2272, loc: 'net/http/server.go:2009' },
  { func: 'encoding/json.Marshal', selfPct: 8.4, cumPct: 8.4, samples: 23856, loc: 'encoding/json/encode.go:158' },
  { func: 'database/sql.(*DB).QueryContext', selfPct: 4.2, cumPct: 28.4, samples: 11928, loc: 'database/sql/sql.go:1765' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function ParcaPanel() {
  const [visible, setVisible] = useState(false);
  const [profRows, setProfRows] = useState(0);
  const [fgRows, setFgRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const samplesPerSec = useCounter(28400, 240, 400);
  const totalSamples = useCounter(460800, 1200, 500);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const p = setInterval(() => setProfRows((x) => Math.min(x + 1, PROFILES.length)), 160);
    const f = setInterval(() => setFgRows((x) => Math.min(x + 1, FLAMEGRAPH_NODES.length)), 140);
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
          parca -- continuous profiling -- cpu / heap / flamegraph
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {samplesPerSec.toLocaleString()} samples/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>parca@profiler</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>parca --config-path=/etc/parca/parca.yaml --storage-active-memory=536870912 --cors-allowed-origins="*"</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'samples/s', value: samplesPerSec.toLocaleString(), color: '#f97316' },
          { label: 'total samples', value: (totalSamples / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'targets', value: [...new Set(PROFILES.map(p => p.target))].length.toString(), color: '#a78bfa' },
          { label: 'profile types', value: [...new Set(PROFILES.map(p => p.type))].length.toString(), color: '#67e8f9' },
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
          {PROFILES.slice(0, profRows).map((prof, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '72px 36px 44px 28px 1fr 36px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prof.target}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{prof.type}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{(prof.samples / 1000).toFixed(0)}k</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{prof.duration}</span>
              <span style={{ color: 'rgba(240,239,255,0.3)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prof.topFunc}</span>
              <span className="tabular-nums" style={{ color: prof.hotPct > 20 ? '#f87171' : '#fbbf24', fontSize: 7, textAlign: 'right' }}>{prof.hotPct}%</span>
            </div>
          ))}
        </div>

        {/* Flamegraph */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // flamegraph hotspots
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {FLAMEGRAPH_NODES.slice(0, fgRows).map((node, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 32px 36px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.func}</span>
              <span className="tabular-nums" style={{ color: '#f97316', fontSize: 7, textAlign: 'right' }}>{node.selfPct}%</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{node.cumPct}%c</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{(node.samples / 1000).toFixed(0)}k</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          parca v0.19 - apache-2.0 - polar signals continuous profiling
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {samplesPerSec.toLocaleString()} samples/s - {(totalSamples / 1000).toFixed(0)}k total
        </span>
      </div>
    </div>
  );
}
