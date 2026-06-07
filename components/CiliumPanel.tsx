'use client';

import { useEffect, useRef, useState } from 'react';

const ENDPOINTS = [
  { pod: 'construx-api-7f8b4c-xk2p9', identity: 284, policy: 'allow', ingress: 'enforced', egress: 'enforced', status: 'ready' },
  { pod: 'construx-worker-6d9c2a-mn4q8', identity: 285, policy: 'allow', ingress: 'enforced', egress: 'enforced', status: 'ready' },
  { pod: 'construx-db-5e7f1b-rw3l6', identity: 286, policy: 'deny', ingress: 'enforced', egress: 'disabled', status: 'ready' },
  { pod: 'construx-cache-4b8d9a-jt7m2', identity: 287, policy: 'allow', ingress: 'enforced', egress: 'enforced', status: 'ready' },
];

const NETWORK_POLICIES = [
  { name: 'allow-api-ingress', kind: 'CiliumNetworkPolicy', rules: 2, endpoints: 4, flows: 284000, drops: 12 },
  { name: 'restrict-db-egress', kind: 'CiliumNetworkPolicy', rules: 1, endpoints: 1, flows: 48400, drops: 840 },
  { name: 'allow-monitoring', kind: 'NetworkPolicy', rules: 3, endpoints: 8, flows: 120000, drops: 0 },
  { name: 'deny-all-default', kind: 'CiliumClusterwideNetworkPolicy', rules: 1, endpoints: 24, flows: 8400, drops: 8400 },
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
  const [epRows, setEpRows] = useState(0);
  const [polRows, setPolRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const flowsPerSec = useCounter(28400, 480, 400);
  const dropsTotal = useCounter(9252, 4, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const e = setInterval(() => setEpRows((x) => Math.min(x + 1, ENDPOINTS.length)), 160);
    const p = setInterval(() => setPolRows((x) => Math.min(x + 1, NETWORK_POLICIES.length)), 140);
    return () => { clearInterval(e); clearInterval(p); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(59,130,246,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(59,130,246,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(59,130,246,0.08)', background: 'rgba(59,130,246,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(59,130,246,0.4)' }}>
          cilium -- ebpf networking -- endpoints / policy / hubble
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {flowsPerSec.toLocaleString()} flows/s
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#3b82f6', fontWeight: 600 }}>cilium@k8s</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>cilium status --brief && hubble observe --follow --last 100 --type drop</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'flows/s', value: flowsPerSec.toLocaleString(), color: '#3b82f6' },
          { label: 'drops', value: dropsTotal.toLocaleString(), color: '#f87171' },
          { label: 'endpoints', value: ENDPOINTS.length.toString(), color: '#4ade80' },
          { label: 'policies', value: NETWORK_POLICIES.length.toString(), color: '#a78bfa' },
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
          {ENDPOINTS.slice(0, epRows).map((ep) => (
            <div key={ep.pod} style={{ display: 'grid', gridTemplateColumns: '1fr 32px 40px 52px 52px 40px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#3b82f6', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ep.pod}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{ep.identity}</span>
              <span style={{ color: ep.policy === 'allow' ? '#4ade80' : '#f87171', fontSize: 7, textAlign: 'center' }}>{ep.policy}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{ep.ingress}</span>
              <span style={{ color: '#fbbf24', fontSize: 7, textAlign: 'center' }}>{ep.egress}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{ep.status}</span>
            </div>
          ))}
        </div>

        {/* Network Policies */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // network policies
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NETWORK_POLICIES.slice(0, polRows).map((pol) => (
            <div key={pol.name} style={{ display: 'grid', gridTemplateColumns: '1fr 24px 24px 52px 36px', alignItems: 'center', gap: 8, padding: '4px 8px', background: pol.drops > 0 ? 'rgba(248,113,113,0.04)' : 'rgba(59,130,246,0.04)', border: `1px solid ${pol.drops > 0 ? 'rgba(248,113,113,0.1)' : 'rgba(59,130,246,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pol.name}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{pol.rules}r</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{pol.endpoints}e</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{(pol.flows / 1000).toFixed(0)}k</span>
              <span className="tabular-nums" style={{ color: pol.drops > 0 ? '#f87171' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'right' }}>{pol.drops}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(59,130,246,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          cilium v1.15 - apache-2.0 - cncf ebpf networking
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {flowsPerSec.toLocaleString()} flows/s - {dropsTotal.toLocaleString()} drops
        </span>
      </div>
    </div>
  );
}
