'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'cluster' | 'machine' | 'deploy' | 'event' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# cluster api: declarative kubernetes cluster lifecycle — provision, upgrade, delete' },
  { kind: 'prompt',   text: 'kubectl get cluster -n capi-clusters -o wide' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# NAME                          PHASE        AGE  K8S-VERSION  INFRA' },
  { kind: 'cluster',  text: '  construx-prod-eu-west-2        Provisioned  14d  v1.31.2      AWSCluster' },
  { kind: 'cluster',  text: '  construx-staging-eu-west-2     Provisioned  21d  v1.31.2      AWSCluster' },
  { kind: 'deploy',   text: '  construx-dev-eu-west-1         Provisioning 2m   v1.32.0      AWSCluster' },
  { kind: 'blank',    text: '' },
  { kind: 'prompt',   text: 'kubectl get machines -n capi-clusters --field-selector metadata.name=construx-prod-eu-west-2' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# MACHINE                              CLUSTER        NODE            PHASE    VERSION' },
  { kind: 'machine',  text: '  construx-prod-eu-west-2-cp-0          prod-eu-west-2  ip-10-0-1-42   Running  v1.31.2' },
  { kind: 'machine',  text: '  construx-prod-eu-west-2-cp-1          prod-eu-west-2  ip-10-0-2-18   Running  v1.31.2' },
  { kind: 'machine',  text: '  construx-prod-eu-west-2-cp-2          prod-eu-west-2  ip-10-0-3-29   Running  v1.31.2' },
  { kind: 'machine',  text: '  construx-prod-eu-west-2-workers-x7f   prod-eu-west-2  ip-10-0-1-77   Running  v1.31.2' },
  { kind: 'blank',    text: '' },
  { kind: 'event',    text: '  event: construx-dev  AWSMachine provisioning  InstanceID: i-0a3c2e4f  ETA ~90s' },
  { kind: 'metric',   text: '  clusters: 3  machines: {LIVE}  upgrades-pending: 1  reconcile-loop: 12s' },
  { kind: 'stat',     text: '  capi v1.8.2  capa v2.5.0  aws-provider  3 clusters  9 control-plane nodes' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'cluster':  return '#4ade80';
    case 'machine':  return '#67e8f9';
    case 'deploy':   return '#fbbf24';
    case 'event':    return '#a78bfa';
    case 'metric':   return 'rgba(240,239,255,0.5)';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function ClusterApiPanel() {
  const [revealed,      setRevealed]      = useState(0);
  const [liveMachines,  setLiveMachines]  = useState(18);
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
            setLiveMachines((m) => m + (Math.random() > 0.6 ? 1 : 0));
          }, 3500);
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
          construx@infra — cluster-api · capi · machines · aws · gitops · lifecycle
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveMachines} machines` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@infra# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          cluster-api · capi · machines · machinedeployment · bootstrap · upgrade
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => {
          const text = l.kind === 'metric'
            ? l.text.replace('{LIVE}', String(liveMachines))
            : l.text;
          return (
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
                  {text}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Metadata */}
      {allDone && (
        <div
          className="flex items-center gap-4 flex-wrap px-4 py-1.5 text-[7.5px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>CAPI v1.8.2 ·</span>
          <span style={{ color: '#4ade80' }}>2 clusters provisioned</span>
          <span style={{ color: '#fbbf24' }}>1 provisioning</span>
          <span style={{ color: '#67e8f9' }}>{liveMachines} machines total</span>
          <span style={{ color: '#a78bfa' }}>gitops-driven</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          capi · machines · bootstrap · controlplane · machinedeployment · aws
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#a78bfa' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● provisioning' : 'loading'}
        </span>
      </div>
    </div>
  );
}
