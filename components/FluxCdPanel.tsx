'use client';

import { useState, useEffect, useRef } from 'react';

type ReadyStatus = 'True' | 'False' | 'Unknown';

interface FluxResource {
  kind:      string;
  name:      string;
  namespace: string;
  ready:     ReadyStatus;
  message:   string;
  revision:  string;
  age:       string;
  isLive?:   boolean;
}

const RESOURCES: FluxResource[] = [
  { kind: 'GitRepository',    name: 'construx-infra',    namespace: 'flux-system', ready: 'True',    message: 'stored artifact for revision main@sha1:a3f2b1c', revision: 'main@sha1:a3f2b1c', age: '2m' },
  { kind: 'GitRepository',    name: 'construx-apps',     namespace: 'flux-system', ready: 'True',    message: 'stored artifact for revision main@sha1:9d4e5f6', revision: 'main@sha1:9d4e5f6', age: '1m' },
  { kind: 'OCIRepository',    name: 'podinfo',           namespace: 'flux-system', ready: 'True',    message: 'stored artifact for digest sha256:b4c9d3e2',     revision: 'sha256:b4c9d3e2',    age: '5m' },
  { kind: 'HelmRepository',   name: 'bitnami',           namespace: 'flux-system', ready: 'True',    message: 'stored artifact for revision 1720192800',        revision: '2024-07-05',         age: '12m' },
  { kind: 'HelmRepository',   name: 'cert-manager',      namespace: 'flux-system', ready: 'True',    message: 'stored artifact',                                revision: '2024-07-01',         age: '4h' },
  { kind: 'Kustomization',    name: 'infrastructure',    namespace: 'flux-system', ready: 'True',    message: 'Applied revision: main@sha1:a3f2b1c',            revision: 'main@sha1:a3f2b1c', age: '2m' },
  { kind: 'Kustomization',    name: 'apps',              namespace: 'flux-system', ready: 'True',    message: 'Applied revision: main@sha1:9d4e5f6',            revision: 'main@sha1:9d4e5f6', age: '1m', isLive: true },
  { kind: 'Kustomization',    name: 'monitoring',        namespace: 'flux-system', ready: 'True',    message: 'Applied revision: main@sha1:a3f2b1c',            revision: 'main@sha1:a3f2b1c', age: '2m' },
  { kind: 'HelmRelease',      name: 'cert-manager',      namespace: 'cert-manager', ready: 'True',   message: 'Helm upgrade succeeded for release cert-manager/cert-manager.v1.15.0', revision: 'v1.15.0', age: '6h' },
  { kind: 'HelmRelease',      name: 'ingress-nginx',     namespace: 'ingress-nginx', ready: 'True',  message: 'Helm install succeeded for release ingress-nginx/ingress-nginx.v1.10.1', revision: 'v1.10.1', age: '6h' },
  { kind: 'HelmRelease',      name: 'prometheus-stack',  namespace: 'monitoring', ready: 'True',     message: 'Helm upgrade succeeded for release monitoring/kube-prometheus-stack.v61.1.0', revision: 'v61.1.0', age: '3h' },
  { kind: 'HelmRelease',      name: 'loki-stack',        namespace: 'monitoring', ready: 'Unknown',  message: 'reconciliation in progress', revision: 'v2.10.2', age: '8s', isLive: true },
  { kind: 'ImageRepository',  name: 'construx-website',  namespace: 'flux-system', ready: 'True',    message: 'successful scan: found 12 tags',                 revision: '2031-03-15T09:14:01Z', age: '45s' },
  { kind: 'ImagePolicy',      name: 'construx-website',  namespace: 'flux-system', ready: 'True',    message: 'Latest image tag for ghcr.io/construx/website: sha-a3f2b1c', revision: 'sha-a3f2b1c', age: '45s' },
];

const TOTAL = RESOURCES.length;

function readyColor(r: ReadyStatus): string {
  if (r === 'True')    return '#4ade80';
  if (r === 'False')   return '#f87171';
  return '#fbbf24';
}

function readyLabel(r: ReadyStatus): string {
  if (r === 'True')    return 'True';
  if (r === 'False')   return 'False';
  return 'Unknown';
}

function kindColor(k: string): string {
  if (k === 'GitRepository')   return '#60a5fa';
  if (k === 'OCIRepository')   return '#67e8f9';
  if (k === 'HelmRepository')  return '#a78bfa';
  if (k === 'Kustomization')   return 'rgba(249,115,22,0.75)';
  if (k === 'HelmRelease')     return '#fbbf24';
  if (k.startsWith('Image'))   return '#4ade80';
  return 'rgba(240,239,255,0.4)';
}

export default function FluxCdPanel() {
  const [revealed, setRevealed] = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 83);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone     = revealed > TOTAL;
  const shownRes    = RESOURCES.slice(0, Math.max(0, Math.min(RESOURCES.length, revealed)));

  const notReady    = RESOURCES.filter((r) => r.ready !== 'True').length;
  const reconciling = RESOURCES.filter((r) => r.ready === 'Unknown').length;

  return (
    <div
      ref={ref}
      className="overflow-x-auto font-mono"
      style={{
        background:   'rgba(1,1,10,0.97)',
        border:       '1px solid rgba(255,255,255,0.07)',
        borderRadius: '3px',
        boxShadow:    '0 0 0 1px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.6)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57', boxShadow: '0 0 4px rgba(255,95,87,0.4)' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E', boxShadow: '0 0 4px rgba(255,189,46,0.3)' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840', boxShadow: '0 0 4px rgba(40,200,64,0.3)' }} />
        </div>
        <span
          className="flex-1 text-center text-[9px] uppercase tracking-[0.2em]"
          style={{ color: 'rgba(255,255,255,0.22)' }}
        >
          construx@sys — flux get all --all-namespaces
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${TOTAL} resources` : 'syncing…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          flux get all --all-namespaces --status-selector ready=true
        </span>
      </div>

      {/* Column headers */}
      {shownRes.length > 0 && (
        <div
          className="flex items-center px-4 py-0.5 text-[6.5px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ minWidth: '108px', flexShrink: 0 }}>Kind</span>
          <span style={{ minWidth: '128px', flexShrink: 0 }}>Name</span>
          <span style={{ minWidth: '84px',  flexShrink: 0 }}>Namespace</span>
          <span style={{ minWidth: '56px',  flexShrink: 0 }}>Ready</span>
          <span style={{ minWidth: '32px',  flexShrink: 0 }}>Age</span>
          <span>Message</span>
        </div>
      )}

      {/* Resource rows */}
      <div className="px-4 py-1.5 space-y-0.5">
        {shownRes.map((r, i) => (
          <div
            key={i}
            className="flex items-start text-[7.5px] leading-[1.7]"
            style={{
              borderLeft: r.isLive ? '2px solid rgba(251,191,36,0.5)' : '2px solid transparent',
              paddingLeft: '4px',
            }}
          >
            <span style={{ color: kindColor(r.kind), minWidth: '108px', flexShrink: 0 }}>{r.kind}</span>
            <span style={{ color: 'rgba(240,239,255,0.5)', minWidth: '128px', flexShrink: 0 }}>{r.name}</span>
            <span style={{ color: 'rgba(240,239,255,0.22)', minWidth: '84px', flexShrink: 0 }}>{r.namespace}</span>
            <span style={{ color: readyColor(r.ready), minWidth: '56px', flexShrink: 0, fontWeight: 700 }}>
              {readyLabel(r.ready)}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '32px', flexShrink: 0 }}>{r.age}</span>
            <span style={{ color: r.ready === 'Unknown' ? '#fbbf24' : 'rgba(240,239,255,0.25)' }}>{r.message}</span>
          </div>
        ))}
        {allDone && (
          <div className="text-[8px] mt-0.5" style={{ color: 'rgba(74,222,128,0.3)' }}>▌</div>
        )}
      </div>

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>{TOTAL - notReady} ready</span>
          {reconciling > 0 && <span style={{ color: '#fbbf24' }}>{reconciling} reconciling</span>}
          {notReady - reconciling > 0 && <span style={{ color: '#f87171' }}>{notReady - reconciling} failed</span>}
          <span className="ml-auto">cluster: construx-prod · k3s v1.30.3</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          flux 2.3.0 · gitops · k3s v1.30 · construx-prod
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? `● ${TOTAL} objects` : 'loading'}
        </span>
      </div>
    </div>
  );
}
