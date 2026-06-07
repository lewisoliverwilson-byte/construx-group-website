'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'allowed' | 'denied' | 'mutated' | 'generated' | 'policy' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',   text: '# kyverno: kubernetes-native policy engine — validate, mutate, generate' },
  { kind: 'prompt',    text: 'kubectl get policyreport -n construx-prod' },
  { kind: 'policy',    text: '  NAME                        PASS  FAIL  WARN' },
  { kind: 'policy',    text: '  cpol-require-limits         47    3     0' },
  { kind: 'policy',    text: '  cpol-disallow-privileged    50    0     0' },
  { kind: 'policy',    text: '  cpol-require-labels         44    6     0' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# admission decisions — live webhook audit log' },
  { kind: 'allowed',   text: '  ✓  ALLOWED   construx-api:Deployment    resource limits present' },
  { kind: 'mutated',   text: '  ↳  MUTATED   construx-api:Pod           injected alloy sidecar' },
  { kind: 'mutated',   text: '  ↳  MUTATED   worker-job:Pod             added team=platform label' },
  { kind: 'denied',    text: '  ✗  DENIED    scratch:Pod                privileged container (enforce)' },
  { kind: 'denied',    text: '  ✗  DENIED    test-deploy:Deployment     missing version label' },
  { kind: 'allowed',   text: '  ✓  ALLOWED   construx-worker:StatefulSet  all policies passed' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# generate: NetworkPolicy created on namespace admission' },
  { kind: 'generated', text: '  ⊕  GENERATED  construx-staging:NetworkPolicy/default-deny-ingress' },
  { kind: 'generated', text: '  ⊕  GENERATED  construx-preview:NetworkPolicy/default-deny-ingress' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# image verification: cosign signature required' },
  { kind: 'allowed',   text: '  ✓  VERIFIED   registry.construx.internal/api:2.18.4  (cosign)' },
  { kind: 'denied',    text: '  ✗  DENIED     docker.io/nginx:latest  unsigned image (enforce)' },
  { kind: 'stat',      text: '  7 clusterpolicies  3 enforce  4 audit  background-scan: 5min' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':   return 'rgba(240,239,255,0.22)';
    case 'prompt':    return 'rgba(240,239,255,0.6)';
    case 'policy':    return 'rgba(240,239,255,0.4)';
    case 'allowed':   return '#4ade80';
    case 'denied':    return '#f87171';
    case 'mutated':   return '#fbbf24';
    case 'generated': return '#67e8f9';
    case 'stat':      return 'rgba(240,239,255,0.45)';
    default:          return 'transparent';
  }
}

export default function KyvernoPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveChecks,  setLiveChecks]  = useState(47);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);
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
            setLiveChecks(42 + Math.floor(Math.random() * 12));
          }, 2050);
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
          construx@k8s — kyverno · validate · mutate · generate · image-verify
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveChecks} pass` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@k8s# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          kyverno · clusterpolicy · admission · cosign · policyreport · background-scan
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Kyverno 1.12 ·</span>
          <span style={{ color: '#4ade80' }}>{liveChecks} passing</span>
          <span style={{ color: '#fbbf24' }}>mutate</span>
          <span style={{ color: '#67e8f9' }}>generate</span>
          <span style={{ color: '#f87171' }}>enforce</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          kyverno · validate · mutate · generate · image-verify · policyreport
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● enforcing' : 'loading'}
        </span>
      </div>
    </div>
  );
}
