'use client';

import { useEffect, useRef, useState } from 'react';

const INTERFACES = [
  { iface: 'eth0', plugin: 'cilium', ip: '10.244.1.12/24', mtu: 1500, rx: '1.2 GB', tx: '480 MB', state: 'UP' },
  { iface: 'cilium_vxlan', plugin: 'cilium', ip: 'VXLAN', mtu: 1450, rx: '840 MB', tx: '760 MB', state: 'UP' },
  { iface: 'lxc4f8a2e', plugin: 'cilium', ip: '10.244.1.28/32', mtu: 1500, rx: '280 MB', tx: '192 MB', state: 'UP' },
  { iface: 'cilium_net', plugin: 'cilium', ip: '10.244.1.1/32', mtu: 1500, rx: '4.1 GB', tx: '3.8 GB', state: 'UP' },
];

const POLICIES = [
  { name: 'allow-ingress-web', kind: 'CiliumNetworkPolicy', from: 'frontend', to: 'api', action: 'ALLOW' },
  { name: 'deny-cross-ns', kind: 'CiliumNetworkPolicy', from: 'staging', to: 'prod', action: 'DENY' },
  { name: 'allow-metrics', kind: 'NetworkPolicy', from: 'prometheus', to: 'all', action: 'ALLOW' },
  { name: 'deny-external-db', kind: 'CiliumNetworkPolicy', from: 'external', to: 'postgres', action: 'DENY' },
];

const ACTION_COLOR: Record<string, string> = { ALLOW: '#4ade80', DENY: '#f87171' };

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function CniPanel() {
  const [visible, setVisible] = useState(false);
  const [ifRows, setIfRows] = useState(0);
  const [polRows, setPolRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const pktsFwd = useCounter(482000, 400, 600);
  const drops = useCounter(42, 1, 3000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const i = setInterval(() => setIfRows((x) => Math.min(x + 1, INTERFACES.length)), 160);
    const p = setInterval(() => setPolRows((x) => Math.min(x + 1, POLICIES.length)), 150);
    return () => { clearInterval(i); clearInterval(p); };
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
          cilium cni -- ebpf networking -- network policy
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {pktsFwd.toLocaleString()} pkts fwd
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>cni@node</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>cilium status --verbose && cilium monitor --type drop --type policy-verdict</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'pkts/s fwd', value: pktsFwd.toLocaleString(), color: '#4ade80' },
          { label: 'policy drops', value: drops.toLocaleString(), color: '#f87171' },
          { label: 'interfaces', value: INTERFACES.length.toString(), color: '#67e8f9' },
          { label: 'policies', value: POLICIES.length.toString(), color: '#a78bfa' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Interfaces */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // network interfaces
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {INTERFACES.slice(0, ifRows).map((iface) => (
            <div key={iface.iface} style={{ display: 'grid', gridTemplateColumns: '72px 44px 88px 36px 56px 56px 28px', alignItems: 'center', gap: 6, padding: '5px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 9, fontWeight: 600 }}>{iface.iface}</span>
              <span style={{ color: '#67e8f9', fontSize: 8 }}>{iface.plugin}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 8 }}>{iface.ip}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{iface.mtu}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, textAlign: 'right' }}>{iface.rx}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, textAlign: 'right' }}>{iface.tx}</span>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 700, textAlign: 'right' }}>UP</span>
            </div>
          ))}
        </div>

        {/* Policies */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // network policies
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {POLICIES.slice(0, polRows).map((pol) => (
            <div key={pol.name} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 60px 60px 40px', alignItems: 'center', gap: 8, padding: '4px 8px', background: `${ACTION_COLOR[pol.action]}06`, border: `1px solid ${ACTION_COLOR[pol.action]}14`, borderRadius: 2 }}>
              <span style={{ color: ACTION_COLOR[pol.action], fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{pol.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pol.kind}</span>
              <span style={{ color: '#67e8f9', fontSize: 8 }}>{pol.from}</span>
              <span style={{ color: '#a78bfa', fontSize: 8 }}>{pol.to}</span>
              <span style={{ color: ACTION_COLOR[pol.action], fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{pol.action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          cilium v1.15 - cncf - ebpf cni + network policy
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {pktsFwd.toLocaleString()} pkts - {drops} drops
        </span>
      </div>
    </div>
  );
}
