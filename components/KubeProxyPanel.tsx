'use client';

import { useEffect, useRef, useState } from 'react';

const SERVICES = [
  { name: 'api-gateway', clusterIP: '10.96.80.12', port: '443/TCP', mode: 'iptables', endpoints: 3, rules: 12 },
  { name: 'postgres-svc', clusterIP: '10.96.14.8', port: '5432/TCP', mode: 'iptables', endpoints: 1, rules: 4 },
  { name: 'redis-svc', clusterIP: '10.96.22.4', port: '6379/TCP', mode: 'iptables', endpoints: 3, rules: 12 },
  { name: 'nats-svc', clusterIP: '10.96.40.1', port: '4222/TCP', mode: 'iptables', endpoints: 3, rules: 12 },
  { name: 'prometheus', clusterIP: '10.96.8.100', port: '9090/TCP', mode: 'iptables', endpoints: 1, rules: 4 },
];

const IPTABLES = [
  { chain: 'KUBE-SERVICES', table: 'nat', rules: 48, hits: 82400 },
  { chain: 'KUBE-POSTROUTING', table: 'nat', rules: 4, hits: 4200 },
  { chain: 'KUBE-NODEPORTS', table: 'nat', rules: 8, hits: 1840 },
  { chain: 'KUBE-FORWARD', table: 'filter', rules: 3, hits: 284000 },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function KubeProxyPanel() {
  const [visible, setVisible] = useState(false);
  const [svcRows, setSvcRows] = useState(0);
  const [iRows, setIRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const pktFwd = useCounter(284000, 800, 500);
  const syncLag = useCounter(12, 1, 4000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const s = setInterval(() => setSvcRows((x) => Math.min(x + 1, SERVICES.length)), 150);
    const i = setInterval(() => setIRows((x) => Math.min(x + 1, IPTABLES.length)), 160);
    return () => { clearInterval(s); clearInterval(i); };
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
          kube-proxy -- service routing -- iptables nat rules
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {pktFwd.toLocaleString()} pkts fwd
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>kube-proxy@node</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>iptables -t nat -L KUBE-SERVICES -n --line-numbers | head -20</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'pkts fwd', value: pktFwd.toLocaleString(), color: '#a78bfa' },
          { label: 'sync lag ms', value: syncLag.toLocaleString(), color: '#67e8f9' },
          { label: 'services', value: SERVICES.length.toString(), color: '#4ade80' },
          { label: 'nat rules', value: IPTABLES.reduce((a, b) => a + b.rules, 0).toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Services */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // service routing
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {SERVICES.slice(0, svcRows).map((svc) => (
            <div key={svc.name} style={{ display: 'grid', gridTemplateColumns: '80px 76px 64px 52px 24px 28px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 9, fontWeight: 600 }}>{svc.name}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 8 }}>{svc.clusterIP}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 8 }}>{svc.port}</span>
              <span style={{ color: '#fbbf24', fontSize: 8 }}>{svc.mode}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 8, textAlign: 'right' }}>{svc.endpoints}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 8, textAlign: 'right' }}>{svc.rules}</span>
            </div>
          ))}
        </div>

        {/* iptables chains */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // iptables chains
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {IPTABLES.slice(0, iRows).map((ipt) => (
            <div key={ipt.chain} style={{ padding: '5px 8px', background: 'rgba(103,232,249,0.03)', border: '1px solid rgba(103,232,249,0.08)', borderRadius: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600 }}>{ipt.chain}</span>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>-t {ipt.table}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${Math.min((ipt.hits / 300000) * 100, 100)}%`, background: '#a78bfa', transition: 'width 0.8s ease' }} />
                </div>
                <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 7 }}>{ipt.hits.toLocaleString()} hits</span>
                <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7 }}>{ipt.rules} rules</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          kube-proxy v1.30 - iptables mode - k8s core
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {pktFwd.toLocaleString()} pkts - {syncLag}ms sync
        </span>
      </div>
    </div>
  );
}
