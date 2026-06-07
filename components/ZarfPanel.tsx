'use client';

import { useEffect, useRef, useState } from 'react';

const PACKAGES = [
  { name: 'construx-core', version: '0.8.4', components: 12, images: 8, status: 'deployed', arch: 'amd64' },
  { name: 'monitoring-stack', version: '2.1.0', components: 6, images: 14, status: 'deployed', arch: 'amd64' },
  { name: 'ingress-nginx', version: '4.10.1', components: 3, images: 2, status: 'deployed', arch: 'amd64' },
  { name: 'cert-manager', version: '1.14.5', components: 4, images: 5, status: 'deployed', arch: 'amd64' },
];

const COMPONENTS = [
  { pkg: 'construx-core', name: 'api-server', type: 'deployments', imported: true, images: 2 },
  { pkg: 'construx-core', name: 'worker', type: 'deployments', imported: true, images: 1 },
  { pkg: 'monitoring-stack', name: 'prometheus', type: 'deployments', imported: true, images: 3 },
  { pkg: 'monitoring-stack', name: 'grafana', type: 'deployments', imported: true, images: 2 },
  { pkg: 'monitoring-stack', name: 'alertmanager', type: 'deployments', imported: true, images: 1 },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function ZarfPanel() {
  const [visible, setVisible] = useState(false);
  const [pRows, setPRows] = useState(0);
  const [cRows, setCRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const registryImages = useCounter(29, 0, 60000);
  const totalImages = PACKAGES.reduce((a, p) => a + p.images, 0);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const p = setInterval(() => setPRows((x) => Math.min(x + 1, PACKAGES.length)), 160);
    const c = setInterval(() => setCRows((x) => Math.min(x + 1, COMPONENTS.length)), 140);
    return () => { clearInterval(p); clearInterval(c); };
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
          zarf -- air-gap k8s packaging -- defense unicorn
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {registryImages} images cached
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>zarf@airgap</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>zarf package list && zarf tools registry catalog --insecure</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'cached images', value: registryImages.toString(), color: '#67e8f9' },
          { label: 'packages', value: PACKAGES.length.toString(), color: '#4ade80' },
          { label: 'components', value: COMPONENTS.length.toString(), color: '#a78bfa' },
          { label: 'total images', value: totalImages.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Packages */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // deployed packages
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {PACKAGES.slice(0, pRows).map((p) => (
            <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 24px 20px 20px 32px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{p.version}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 8, textAlign: 'center' }}>{p.components}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'center' }}>{p.images}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{p.arch}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{p.status}</span>
            </div>
          ))}
        </div>

        {/* Components */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // package components
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {COMPONENTS.slice(0, cRows).map((c) => (
            <div key={c.pkg + c.name} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 48px 20px 20px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.pkg}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.type}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'center' }}>{c.images}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>✓</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          zarf v0.36 - apache 2.0 - defense unicorn
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {PACKAGES.length} packages - {registryImages} images
        </span>
      </div>
    </div>
  );
}
