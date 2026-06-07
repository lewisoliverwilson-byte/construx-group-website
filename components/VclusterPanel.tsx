'use client';

import { useEffect, useRef, useState } from 'react';

const VCLUSTERS = [
  { name: 'dev-team-alpha', distro: 'k3s', host: 'prod-cluster', ns: 'vcluster-alpha', version: '0.19.4', nodes: 3, ready: true },
  { name: 'staging-ci', distro: 'k0s', host: 'prod-cluster', ns: 'vcluster-staging', version: '0.19.4', nodes: 2, ready: true },
  { name: 'preview-pr-1142', distro: 'k3s', host: 'prod-cluster', ns: 'vcluster-pr-1142', version: '0.19.4', nodes: 1, ready: false },
  { name: 'security-sandbox', distro: 'eks', host: 'eks-cluster-eu', ns: 'vcluster-sec', version: '0.19.3', nodes: 2, ready: true },
];

const SYNC_RESOURCES = [
  { resource: 'Pods', count: 47, synced: 47 },
  { resource: 'Services', count: 18, synced: 18 },
  { resource: 'ConfigMaps', count: 84, synced: 83 },
  { resource: 'Secrets', count: 32, synced: 32 },
  { resource: 'PVCs', count: 12, synced: 11 },
  { resource: 'Ingresses', count: 6, synced: 6 },
];

function useCounter(base: number, delta: number, ms = 2000) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta)), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function VclusterPanel() {
  const [visible, setVisible] = useState(false);
  const [vcRows, setVcRows] = useState(0);
  const [syncRows, setSyncRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const apiCalls = useCounter(48200, 120, 900);
  const syncEvents = useCounter(1240, 3, 1200);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const v = setInterval(() => setVcRows((x) => Math.min(x + 1, VCLUSTERS.length)), 160);
    const s = setInterval(() => setSyncRows((x) => Math.min(x + 1, SYNC_RESOURCES.length)), 130);
    return () => { clearInterval(v); clearInterval(s); };
  }, [visible]);

  const readyCount = VCLUSTERS.filter((v) => v.ready).length;

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
          vcluster -- virtual kubernetes clusters
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {readyCount}/{VCLUSTERS.length} ready
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>platform@loft</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>vcluster list && vcluster connect dev-team-alpha --namespace vcluster-alpha</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'vclusters', value: VCLUSTERS.length.toString(), color: '#a78bfa' },
          { label: 'api calls/m', value: (apiCalls / 1000).toFixed(1) + 'k', color: '#67e8f9' },
          { label: 'sync events', value: syncEvents.toLocaleString(), color: '#fbbf24' },
          { label: 'synced pods', value: '47', color: '#4ade80' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* vcluster list */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // virtual cluster instances
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {VCLUSTERS.slice(0, vcRows).map((vc) => (
            <div key={vc.name} style={{ display: 'grid', gridTemplateColumns: '1fr 36px 60px 52px 28px 40px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vc.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 8, textAlign: 'center', padding: '1px 4px', background: 'rgba(103,232,249,0.1)', borderRadius: 2 }}>{vc.distro}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vc.host}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>v{vc.version}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, textAlign: 'right' }}>{vc.nodes}n</span>
              <span style={{ color: vc.ready ? '#4ade80' : '#fbbf24', fontSize: 8, fontWeight: 700, textAlign: 'right' }}>{vc.ready ? 'READY' : 'SYNC'}</span>
            </div>
          ))}
        </div>

        {/* Sync status */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // resource sync status (dev-team-alpha)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
          {SYNC_RESOURCES.slice(0, syncRows).map((res) => {
            const pct = Math.round((res.synced / res.count) * 100);
            const color = pct === 100 ? '#4ade80' : '#fbbf24';
            return (
              <div key={res.resource} style={{ padding: '6px 8px', background: `${color}06`, border: `1px solid ${color}18`, borderRadius: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 8, color: 'rgba(240,239,255,0.5)' }}>{res.resource}</span>
                  <span className="tabular-nums" style={{ fontSize: 8, color }}>{res.synced}/{res.count}</span>
                </div>
                <div style={{ width: '100%', height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 1, transition: 'width 1s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          vcluster v0.19.4 - loft - k3s/k0s/eks
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {apiCalls.toLocaleString()} api calls - {syncEvents} sync events
        </span>
      </div>
    </div>
  );
}
