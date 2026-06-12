'use client';

import { useEffect, useRef, useState } from 'react';

const KUSTOMIZATIONS = [
  { name: 'construx-infra', path: 'clusters/prod/infra', revision: 'main@sha1:a1b2c3d', interval: '10m', ready: true, age: '4d' },
  { name: 'construx-apps', path: 'clusters/prod/apps', revision: 'main@sha1:e5f6a7b', interval: '5m', ready: true, age: '4d' },
  { name: 'construx-monitoring', path: 'clusters/prod/monitoring', revision: 'main@sha1:c9d0e1f', interval: '10m', ready: true, age: '3d' },
  { name: 'construx-staging', path: 'clusters/staging', revision: 'main@sha1:8f4b2a1', interval: '2m', ready: true, age: '2d' },
];

const HELM_RELEASES = [
  { name: 'cert-manager', chart: 'cert-manager/cert-manager', version: 'v1.15.2', namespace: 'cert-manager', status: 'deployed', revision: 4 },
  { name: 'traefik', chart: 'traefik/traefik', version: 'v30.1.0', namespace: 'traefik', status: 'deployed', revision: 12 },
  { name: 'kube-prometheus-stack', chart: 'prometheus-community/kube-prometheus-stack', version: '61.7.2', namespace: 'monitoring', status: 'deployed', revision: 8 },
  { name: 'loki-stack', chart: 'grafana/loki-stack', version: '2.10.2', namespace: 'monitoring', status: 'deployed', revision: 3 },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function FluxCDPanel() {
  const [visible, setVisible] = useState(false);
  const [kustRows, setKustRows] = useState(0);
  const [helmRows, setHelmRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const reconcilesTotal = useCounter(2840, 4, 800);
  const helmReleasesTotal = useCounter(28, 1, 3600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const k = setInterval(() => setKustRows((x) => Math.min(x + 1, KUSTOMIZATIONS.length)), 160);
    const h = setInterval(() => setHelmRows((x) => Math.min(x + 1, HELM_RELEASES.length)), 140);
    return () => { clearInterval(k); clearInterval(h); };
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
          fluxcd -- gitops toolkit -- kustomizations / helm / sources
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {reconcilesTotal.toLocaleString()} reconciles
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>flux@cluster</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>flux get kustomizations --all-namespaces && flux get helmreleases --all-namespaces</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'reconciles', value: reconcilesTotal.toLocaleString(), color: '#a78bfa' },
          { label: 'helm releases', value: helmReleasesTotal.toString(), color: '#67e8f9' },
          { label: 'kustomizations', value: KUSTOMIZATIONS.length.toString(), color: '#4ade80' },
          { label: 'ready', value: KUSTOMIZATIONS.filter(k => k.ready).length.toString(), color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Kustomizations */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // kustomizations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {KUSTOMIZATIONS.slice(0, kustRows).map((k) => (
            <div key={k.name} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 36px 28px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.path}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.revision}</span>
              <span style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{k.interval}</span>
              <span style={{ color: k.ready ? '#4ade80' : '#f87171', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{k.ready ? 'ok' : 'err'}</span>
            </div>
          ))}
        </div>

        {/* Helm Releases */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // helm releases
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {HELM_RELEASES.slice(0, helmRows).map((hr) => (
            <div key={hr.name} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 56px 80px 20px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hr.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hr.chart}</span>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{hr.version}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hr.namespace}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 7, textAlign: 'center' }}>r{hr.revision}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{hr.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          fluxcd v2.3 - apache-2.0 - gitops toolkit for kubernetes
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {reconcilesTotal.toLocaleString()} reconciles - {helmReleasesTotal} helm
        </span>
      </div>
    </div>
  );
}
