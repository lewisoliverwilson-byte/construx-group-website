'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'node-new' | 'node-rm' | 'claim' | 'event' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# karpenter: node autoscaler — provisions nodes by workload shape' },
  { kind: 'prompt',   text: 'kubectl get nodeclaims -w' },
  { kind: 'stat',     text: 'NAME                       TYPE          CAPACITY   ZONE         NODE' },
  { kind: 'claim',    text: '  construx-general-7f9b2c  m6i.2xlarge   spot       eu-west-1a   ip-10-0-1-15' },
  { kind: 'claim',    text: '  construx-general-8k3n4p  c6i.xlarge    on-demand  eu-west-1b   ip-10-0-2-22' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# pod pending → Karpenter selects cheapest fitting instance' },
  { kind: 'event',    text: '  found best instance type: m7i.2xlarge ($0.0192/hr spot)' },
  { kind: 'node-new', text: '  provisioned: construx-general-9m2r4s  m7i.2xlarge  eu-west-1a' },
  { kind: 'stat',     text: '  pod/api-7f9b-xk2m9  Running  (42s total, 5s startup)' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# consolidation: merge underutilized nodes' },
  { kind: 'event',    text: '  consolidation: 3 nodes → 2 nodes saves $0.38/hr' },
  { kind: 'node-rm',  text: '  drained: construx-general-3p1q8x  (moved 4 pods to existing nodes)' },
  { kind: 'node-rm',  text: '  terminated: construx-general-3p1q8x  (node removed)' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# spot interruption: 2-minute notice handled automatically' },
  { kind: 'event',    text: '  spot interruption notice: construx-general-7f9b2c  m6i.2xlarge' },
  { kind: 'node-new', text: '  replacement provisioned: construx-general-5v3k1z  m7i.2xlarge' },
  { kind: 'node-rm',  text: '  graceful drain: 3 pods migrated (12s)' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# metrics: cost and performance' },
  { kind: 'metric',   text: '  karpenter_nodes_created_total    24' },
  { kind: 'metric',   text: '  karpenter_nodes_terminated_total 19' },
  { kind: 'metric',   text: '  pod_startup_duration_p99         48s' },
  { kind: 'stat',     text: '  estimated savings vs on-demand: 62%  ($284/mo)' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'node-new': return '#4ade80';
    case 'node-rm':  return '#f87171';
    case 'claim':    return '#67e8f9';
    case 'event':    return '#fbbf24';
    case 'metric':   return '#a78bfa';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function KarpenterPanel() {
  const [revealed,   setRevealed]   = useState(0);
  const [liveSaving, setLiveSaving] = useState(62);
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
            setLiveSaving(Math.floor(55 + Math.random() * 15));
          }, 2300);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 79;
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
          construx@prod-eu — karpenter · node autoscaler
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveSaving}% saved` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-eu# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          karpenter · NodePool · spot · consolidation · drift · AMI rotation
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Karpenter v1.0 ·</span>
          <span style={{ color: '#4ade80' }}>nodes provisioned</span>
          <span style={{ color: '#67e8f9' }}>spot + on-demand</span>
          <span style={{ color: '#fbbf24' }}>consolidation active</span>
          <span style={{ color: '#a78bfa' }}>{liveSaving}% savings</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          karpenter · AWS · spot · NodePool · consolidation · drift · EKS
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● scaling' : 'loading'}
        </span>
      </div>
    </div>
  );
}
