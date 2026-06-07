'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'ready' | 'synced' | 'drift' | 'apply' | 'event' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# crossplane: cloud infrastructure as Kubernetes CRDs' },
  { kind: 'prompt',  text: 'kubectl apply -f rds-instance.yaml' },
  { kind: 'apply',   text: 'instance.rds.aws.upbound.io/construx-prod-postgres created' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# watch provisioning — controller reconciles cloud state' },
  { kind: 'prompt',  text: 'kubectl get instance construx-prod-postgres -w' },
  { kind: 'stat',    text: 'NAME                       READY  SYNCED  EXTERNAL-NAME          AGE' },
  { kind: 'synced',  text: '  construx-prod-postgres   False  True    construx-prod-postgres  45s' },
  { kind: 'ready',   text: '  construx-prod-postgres   True   True    construx-prod-postgres  8m34s' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# drift detection: manual change in AWS console reverted' },
  { kind: 'drift',   text: '  drift: instanceClass=db.t4g.large, desired=db.t4g.medium' },
  { kind: 'synced',  text: '  reverting to db.t4g.medium (git is source of truth)' },
  { kind: 'ready',   text: '  construx-prod-postgres   True   True    synced  9m01s' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# application team: claim a database (no AWS knowledge needed)' },
  { kind: 'prompt',  text: 'kubectl apply -f postgres-claim.yaml' },
  { kind: 'apply',   text: 'postgresdatabase.platform.construx.io/api-database created' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# list all managed cloud resources across all providers' },
  { kind: 'prompt',  text: 'kubectl get managed' },
  { kind: 'ready',   text: '  api-database-rds   READY:True  SYNCED:True  db.t4g.medium' },
  { kind: 'ready',   text: '  construx-logs      READY:True  SYNCED:True  s3  eu-west-1' },
  { kind: 'ready',   text: '  redis-cluster      READY:True  SYNCED:True  elasticache' },
  { kind: 'event',   text: '  reconciliation interval: 60s  providers: aws-rds  aws-s3' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'ready':   return '#4ade80';
    case 'synced':  return '#67e8f9';
    case 'drift':   return '#f87171';
    case 'apply':   return '#a78bfa';
    case 'event':   return '#fbbf24';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    default:        return 'transparent';
  }
}

export default function CrossplanePanel() {
  const [revealed,      setRevealed]      = useState(0);
  const [liveResources, setLiveResources] = useState(3);
  const ref      = useRef<HTMLDivElement>(null);
  const started  = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
          timerRef.current = setInterval(() => {
            setLiveResources(Math.floor(2 + Math.random() * 5));
          }, 2250);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 81;
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
          construx@prod-01 — crossplane · cloud infra as CRDs
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveResources} managed` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          crossplane · CRD · AWS · GCP · drift · composition · GitOps
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Crossplane v1.18 ·</span>
          <span style={{ color: '#4ade80' }}>{liveResources} managed</span>
          <span style={{ color: '#67e8f9' }}>drift corrected</span>
          <span style={{ color: '#a78bfa' }}>Compositions</span>
          <span style={{ color: '#fbbf24' }}>GitOps ready</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          crossplane · CRD · AWS · GCP · Composition · drift · ArgoCD
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● reconciling' : 'loading'}
        </span>
      </div>
    </div>
  );
}
