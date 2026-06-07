'use client';

import { useEffect, useRef, useState } from 'react';

const ENDPOINTS = [
  { id: '1284', pod: 'api-server-7d9f4', namespace: 'prod', identity: 'construx/api', state: 'ready', policy: 'enforced' },
  { id: '2048', pod: 'worker-6b8c2', namespace: 'prod', identity: 'construx/worker', state: 'ready', policy: 'enforced' },
  { id: '3102', pod: 'postgres-0', namespace: 'prod', identity: 'construx/db', state: 'ready', policy: 'enforced' },
  { id: '4210', pod: 'redis-0', namespace: 'prod', identity: 'construx/cache', state: 'ready', policy: 'audit' },
];

const FLOWS = [
  { src: 'api-server', dst: 'postgres-0', port: 5432, verdict: 'FORWARDED', proto: 'TCP' },
  { src: 'worker', dst: 'redis-0', port: 6379, verdict: 'FORWARDED', proto: 'TCP' },
  { src: 'internet', dst: 'api-server', port: 443, verdict: 'FORWARDED', proto: 'TCP' },
  { src: 'scanner-pod', dst: 'postgres-0', port: 5432, verdict: 'DROPPED', proto: 'TCP' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function CiliumPanel() {
  const [visible, setVisible] = useState(false);
  const [eRows, setERows] = useState(0);
  const [fRows, setFRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const flowsPerSec = useCounter(84200, 240, 400);
  const droppedTotal = useCounter(284, 2, 1800);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const e = setInterval(() => setERows((x) => Math.min(x + 1, ENDPOINTS.length)), 160);
    const f = setInterval(() => setFRows((x) => Math.min(x + 1, FLOWS.length)), 140);
    return () => { clearInterval(e); clearInterval(f); };
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
          cilium -- ebpf networking -- network policy / hubble flows
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {flowsPerSec.toLocaleString()} flows/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>cilium@ebpf</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>cilium status && hubble observe --namespace prod --last 50</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'flows/s', value: flowsPerSec.toLocaleString(), color: '#4ade80' },
          { label: 'endpoints', value: ENDPOINTS.length.toString(), color: '#67e8f9' },
          { label: 'enforced', value: ENDPOINTS.filter(e => e.policy === 'enforced').length.toString(), color: '#a78bfa' },
          { label: 'dropped', value: droppedTotal.toLocaleString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Endpoints */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // endpoints
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {ENDPOINTS.slice(0, eRows).map((ep) => (
            <div key={ep.id} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 80px 40px 52px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{ep.id}</span>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ep.pod}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ep.identity}</span>
              <span style={{ color: ep.state === 'ready' ? '#4ade80' : '#f87171', fontSize: 7, fontWeight: 700, textAlign: 'center' }}>{ep.state}</span>
              <span style={{ color: ep.policy === 'enforced' ? '#a78bfa' : '#fbbf24', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{ep.policy}</span>
            </div>
          ))}
        </div>

        {/* Flows */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // hubble flows
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {FLOWS.slice(0, fRows).map((fl, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 36px 32px 52px', alignItems: 'center', gap: 8, padding: '4px 8px', background: fl.verdict === 'DROPPED' ? 'rgba(248,113,113,0.04)' : 'rgba(74,222,128,0.04)', border: `1px solid ${fl.verdict === 'DROPPED' ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fl.src}</span>
              <span style={{ color: 'rgba(240,239,255,0.25)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fl.dst}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{fl.port}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{fl.proto}</span>
              <span style={{ color: fl.verdict === 'DROPPED' ? '#f87171' : '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{fl.verdict}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          cilium v1.15 - apache 2.0 - ebpf / cncf graduated
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {ENDPOINTS.length} endpoints - {flowsPerSec.toLocaleString()} flows/s
        </span>
      </div>
    </div>
  );
}
