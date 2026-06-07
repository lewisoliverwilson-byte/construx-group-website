'use client';

import { useEffect, useRef, useState } from 'react';

const RUNTIMES = [
  { name: 'api-gateway.wasm', size: '1.2 MB', sdk: 'Rust/wasi-sdk', cpu: '0.8%', mem: '18 MB', status: 'running' },
  { name: 'image-resize.wasm', size: '480 KB', sdk: 'C/wasi-libc', cpu: '2.1%', mem: '8 MB', status: 'running' },
  { name: 'ml-infer.wasm', size: '6.4 MB', sdk: 'Rust+wasi-nn', cpu: '12%', mem: '64 MB', status: 'running' },
  { name: 'auth-plugin.wasm', size: '240 KB', sdk: 'Go/TinyGo', cpu: '0.2%', mem: '4 MB', status: 'running' },
];

const PROPOSALS = [
  { name: 'wasi-nn', stage: 'phase2', desc: 'ML inference API' },
  { name: 'wasi-crypto', stage: 'phase2', desc: 'cryptographic ops' },
  { name: 'wasi-sockets', stage: 'phase1', desc: 'TCP/UDP networking' },
  { name: 'wasi-http', stage: 'phase3', desc: 'outbound requests' },
  { name: 'wasi-threads', stage: 'phase2', desc: 'shared-memory concurrency' },
];

const STAGE_COLOR: Record<string, string> = {
  phase1: '#fbbf24',
  phase2: '#67e8f9',
  phase3: '#4ade80',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function WasmEdgePanel() {
  const [visible, setVisible] = useState(false);
  const [rtRows, setRtRows] = useState(0);
  const [propRows, setPropRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const invocations = useCounter(82400, 48, 700);
  const bytesTranspiled = useCounter(124800, 200, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const r = setInterval(() => setRtRows((x) => Math.min(x + 1, RUNTIMES.length)), 160);
    const p = setInterval(() => setPropRows((x) => Math.min(x + 1, PROPOSALS.length)), 140);
    return () => { clearInterval(r); clearInterval(p); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(103,232,249,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(103,232,249,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(103,232,249,0.08)', background: 'rgba(103,232,249,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(103,232,249,0.4)' }}>
          wasmedge -- wasi runtime -- edge compute
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {invocations.toLocaleString()} invocations
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>wasm@edge</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>wasmedge --dir /:. --env RUST_LOG=info api-gateway.wasm</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'invocations', value: invocations.toLocaleString(), color: '#67e8f9' },
          { label: 'KB transpiled', value: (bytesTranspiled / 1024).toFixed(0), color: '#4ade80' },
          { label: 'modules', value: RUNTIMES.length.toString(), color: '#a78bfa' },
          { label: 'wasi proposals', value: PROPOSALS.length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Modules */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // running wasm modules
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {RUNTIMES.slice(0, rtRows).map((rt) => (
            <div key={rt.name} style={{ display: 'grid', gridTemplateColumns: '1fr 64px 44px 44px 40px 52px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 9, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rt.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 8 }}>{rt.sdk}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{rt.size}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 8, textAlign: 'right' }}>{rt.cpu}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 8, textAlign: 'right' }}>{rt.mem}</span>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 700, textAlign: 'right' }}>RUNNING</span>
            </div>
          ))}
        </div>

        {/* WASI proposals */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // wasi proposals
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {PROPOSALS.slice(0, propRows).map((p) => (
            <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '88px 56px 1fr', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(103,232,249,0.03)', border: '1px solid rgba(103,232,249,0.07)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 9, fontWeight: 600 }}>{p.name}</span>
              <span style={{ color: STAGE_COLOR[p.stage], fontSize: 7, padding: '1px 5px', background: `${STAGE_COLOR[p.stage]}14`, border: `1px solid ${STAGE_COLOR[p.stage]}28`, borderRadius: 2 }}>{p.stage}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8 }}>{p.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          wasmedge v0.14 - cncf - wasm + wasi
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {invocations.toLocaleString()} invocations
        </span>
      </div>
    </div>
  );
}
