'use client';

import { useState, useEffect, useRef } from 'react';

interface Release {
  name:       string;
  namespace:  string;
  revision:   number;
  updated:    string;
  status:     'deployed' | 'failed' | 'pending-upgrade' | 'superseded';
  chart:      string;
  appVersion: string;
  accent:     string;
}

const RELEASES: Release[] = [
  { name: 'construx-api',     namespace: 'production',  revision: 47, updated: '2029-12-14 09:02:11', status: 'deployed',        chart: 'construx-api-3.12.0',    appVersion: '2029.12.14-abc1234', accent: '#F97316' },
  { name: 'construx-worker',  namespace: 'production',  revision: 31, updated: '2029-12-14 09:02:44', status: 'deployed',        chart: 'construx-worker-2.8.1',  appVersion: '2029.12.14-abc1234', accent: '#F97316' },
  { name: 'nginx-ingress',    namespace: 'ingress',     revision: 12, updated: '2029-11-28 14:20:05', status: 'deployed',        chart: 'ingress-nginx-4.11.2',   appVersion: '1.11.3',             accent: '#4ade80' },
  { name: 'cert-manager',     namespace: 'cert-manager',revision:  8, updated: '2029-10-15 11:44:38', status: 'deployed',        chart: 'cert-manager-1.16.1',    appVersion: '1.16.1',             accent: '#67e8f9' },
  { name: 'prometheus-stack', namespace: 'monitoring',  revision: 19, updated: '2029-12-01 08:30:00', status: 'deployed',        chart: 'kube-prometheus-stack-65.8.1', appVersion: '0.77.2',        accent: '#fbbf24' },
  { name: 'scoutr-api',       namespace: 'scoutr',      revision: 22, updated: '2029-12-13 16:55:12', status: 'deployed',        chart: 'scoutr-api-1.4.0',       appVersion: '2029.12.13-def5678', accent: '#a78bfa' },
  { name: 'hyve-ctx',         namespace: 'hyve',        revision: 15, updated: '2029-12-12 11:30:08', status: 'deployed',        chart: 'hyve-ctx-2.1.3',         appVersion: '2029.12.12-ghi9012', accent: '#a78bfa' },
  { name: 'redis',            namespace: 'production',  revision:  5, updated: '2029-09-22 09:10:45', status: 'deployed',        chart: 'redis-20.2.1',           appVersion: '7.4.1',              accent: '#f87171' },
  { name: 'marqet-scraper',   namespace: 'marqet',      revision:  3, updated: '2029-12-10 22:01:19', status: 'pending-upgrade', chart: 'marqet-scraper-0.9.2',   appVersion: '2029.12.10-jkl3456', accent: '#67e8f9' },
];

function statusColor(status: Release['status']) {
  if (status === 'deployed')        return '#4ade80';
  if (status === 'failed')          return '#f87171';
  if (status === 'pending-upgrade') return '#fbbf24';
  return 'rgba(240,239,255,0.3)';
}

export default function HelmChartPanel() {
  const [revealed, setRevealed] = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > RELEASES.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 78);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone      = revealed > RELEASES.length;
  const deployedCount = RELEASES.filter((r) => r.status === 'deployed').length;
  const pendingCount  = RELEASES.filter((r) => r.status === 'pending-upgrade').length;

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
          construx@sys — helm releases
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.6)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${deployedCount}/${RELEASES.length} deployed` : 'listing…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          helm list --all-namespaces --output table
        </span>
      </div>

      {/* Column headers */}
      <div
        className="flex items-center gap-3 px-4 py-1 text-[7px] uppercase tracking-widest select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
      >
        <span style={{ minWidth: '116px', flexShrink: 0 }}>NAME</span>
        <span style={{ minWidth: '96px', flexShrink: 0 }}>NAMESPACE</span>
        <span style={{ minWidth: '32px', flexShrink: 0, textAlign: 'right' }}>REV</span>
        <span style={{ minWidth: '88px', flexShrink: 0, paddingLeft: '8px' }}>STATUS</span>
        <span>CHART</span>
      </div>

      {/* Release rows */}
      <div className="px-4 py-2 space-y-1.5">
        {RELEASES.slice(0, revealed).map((r, i) => (
          <div key={i} className="flex items-center gap-3 text-[8px] tabular-nums">
            <span style={{ color: r.accent, minWidth: '116px', flexShrink: 0, fontWeight: 600 }}>
              {r.name}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '96px', flexShrink: 0 }}>
              {r.namespace}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.45)', minWidth: '32px', flexShrink: 0, textAlign: 'right' }}>
              {r.revision}
            </span>
            <span style={{ color: statusColor(r.status), minWidth: '88px', flexShrink: 0, paddingLeft: '8px', fontWeight: r.status !== 'deployed' ? 700 : 400 }}>
              {r.status}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.25)' }}>
              {r.chart}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          {RELEASES.length} releases · {deployedCount} deployed{pendingCount > 0 ? ` · ${pendingCount} pending` : ''} · helm 3.16
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          gke · k8s 1.31
        </span>
      </div>
    </div>
  );
}
