'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'app-healthy' | 'app-degraded' | 'app-unknown' | 'resource-ok' | 'resource-warn' | 'sync-ok' | 'sync-err' | 'diff' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',      text: '# Argo CD application status across all clusters' },
  { kind: 'prompt',       text: 'argocd app list' },
  { kind: 'app-healthy',  text: 'construx-api         Synced   Healthy   construx-prod   2032-03-25  v2.4.1' },
  { kind: 'app-healthy',  text: 'construx-worker      Synced   Healthy   construx-prod   2032-03-25  v1.8.3' },
  { kind: 'app-healthy',  text: 'nats-cluster         Synced   Healthy   construx-prod   2032-03-10  2.10.11' },
  { kind: 'app-healthy',  text: 'postgres-operator    Synced   Healthy   construx-prod   2032-02-28  1.12.2' },
  { kind: 'app-degraded', text: 'construx-analytics   OutOfSync  Degraded  construx-prod   2032-03-24  v0.9.1' },
  { kind: 'app-unknown',  text: 'staging-api          Synced   Healthy   construx-stage  2032-03-25  v2.4.2' },
  { kind: 'blank',        text: '' },
  { kind: 'comment',      text: '# Inspect the degraded application — what changed?' },
  { kind: 'prompt',       text: 'argocd app diff construx-analytics' },
  { kind: 'diff',         text: '===== apps/v1/Deployment construx/construx-analytics =====' },
  { kind: 'diff',         text: '  4,  4   | spec:' },
  { kind: 'diff',         text: '  5,  5   |   replicas: 2' },
  { kind: 'diff',         text: '+  6      |   minReadySeconds: 30' },
  { kind: 'diff',         text: '  7,  6   |   selector:' },
  { kind: 'diff',         text: '  8,  7   |   template:' },
  { kind: 'blank',        text: '' },
  { kind: 'comment',      text: '# Sync the app — apply live state to match git' },
  { kind: 'prompt',       text: 'argocd app sync construx-analytics --prune --force' },
  { kind: 'sync-ok',      text: 'TIMESTAMP           GROUP  KIND        NAMESPACE  NAME                  STATUS  HEALTH' },
  { kind: 'sync-ok',      text: '2032-03-25T14:32:01Z  apps  Deployment  construx   construx-analytics    Synced  Healthy' },
  { kind: 'sync-ok',      text: '2032-03-25T14:32:01Z        Service     construx   construx-analytics    Synced  Healthy' },
  { kind: 'sync-ok',      text: '2032-03-25T14:32:02Z        HPA         construx   construx-analytics    Synced  Healthy' },
  { kind: 'sync-ok',      text: 'Message: successfully synced (all tasks run)' },
  { kind: 'blank',        text: '' },
  { kind: 'comment',      text: '# Resource health for construx-api' },
  { kind: 'prompt',       text: 'argocd app resources construx-api' },
  { kind: 'resource-ok',  text: 'GROUP  KIND           NAMESPACE  NAME                        ORPHANED' },
  { kind: 'resource-ok',  text: 'apps   Deployment     construx   construx-api                ✓ Healthy' },
  { kind: 'resource-ok',  text: '       Service        construx   construx-api-svc             ✓ Healthy' },
  { kind: 'resource-ok',  text: '       HPA            construx   construx-api-hpa             ✓ Healthy' },
  { kind: 'resource-ok',  text: '       ServiceAccount construx   construx-api-sa              ✓ Healthy' },
  { kind: 'resource-warn', text: '       PodDisruptionBudget construx construx-api-pdb       ⚠ Warning' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':       return 'rgba(240,239,255,0.22)';
    case 'prompt':        return 'rgba(240,239,255,0.6)';
    case 'app-healthy':   return '#4ade80';
    case 'app-degraded':  return '#f87171';
    case 'app-unknown':   return '#67e8f9';
    case 'resource-ok':   return '#4ade80';
    case 'resource-warn': return '#fbbf24';
    case 'sync-ok':       return '#4ade80';
    case 'sync-err':      return '#f87171';
    case 'diff':          return '#a78bfa';
    default:              return 'transparent';
  }
}

export default function ArgoCdPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveRevision, setLiveRevision] = useState('a4f8c2d');
  const ref      = useRef<HTMLDivElement>(null);
  const started  = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const revisions = ['a4f8c2d', 'b7e9d1f', 'c3a2e8b', 'd9f4c7a', 'e1b6d3c'];
  const revIdx = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
          timerRef.current = setInterval(() => {
            revIdx.current = (revIdx.current + 1) % revisions.length;
            setLiveRevision(revisions[revIdx.current]);
          }, 2400);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 80;
    const id = setTimeout(() => setRevealed((r) => r + 1), delay);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const allDone    = revealed > TOTAL;
  const shownLines = LINES.slice(0, Math.max(0, revealed - 1));

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
          construx@prod-01 — argocd · GitOps · 6 applications
        </span>
        <span className="text-[8px] tabular-nums font-mono" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `HEAD ${liveRevision}` : 'syncing…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          argocd app list · diff · sync · resources · GitOps
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => (
          <div
            key={i}
            className="text-[7.5px] leading-[1.8]"
            style={{ color: lineColor(l.kind) }}
          >
            {l.kind === 'blank' ? ' ' : (
              <>
                {l.kind === 'prompt' && (
                  <span style={{ color: 'rgba(74,222,128,0.45)', marginRight: '6px' }}>$</span>
                )}
                {l.text}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Metadata */}
      {allDone && (
        <div
          className="flex items-center gap-4 flex-wrap px-4 py-1.5 text-[7.5px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Argo CD v2.11 ·</span>
          <span style={{ color: '#4ade80' }}>5 Synced</span>
          <span style={{ color: '#f87171' }}>1 OutOfSync (remediated)</span>
          <span style={{ color: '#67e8f9' }}>staging: {liveRevision}</span>
          <span style={{ color: '#a78bfa' }}>GitOps: git.construx.io/k8s</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          Argo CD 2.11.3 · 2 clusters · 6 apps · auto-sync enabled
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● synced' : 'loading'}
        </span>
      </div>
    </div>
  );
}
