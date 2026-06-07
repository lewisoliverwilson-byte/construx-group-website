'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'step' | 'running' | 'task' | 'result' | 'chain' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# tekton pipelines: cloud-native ci/cd — tasks, pipelineruns, chains, triggers' },
  { kind: 'prompt',   text: 'tkn pipelinerun describe construx-build-deploy-k9x2p -n tekton-pipelines' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# Pipeline:  construx-build-deploy  Status: Running  Duration: {LIVE}s' },
  { kind: 'step',     text: '  ✔ clone              succeeded    12s   git:main@a4f92c3' },
  { kind: 'step',     text: '  ✔ kaniko-build        succeeded    94s   orders-api:a4f92c3 → registry' },
  { kind: 'running',  text: '  ⚙ trivy-scan          running      21s   scanning CVEs…' },
  { kind: 'task',     text: '  ○ deploy-argocd       pending      awaiting: trivy-scan' },
  { kind: 'blank',    text: '' },
  { kind: 'prompt',   text: 'tkn taskrun logs construx-build-deploy-k9x2p-trivy-scan-pod' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# [trivy-scan] scanning registry.construx.internal/orders-api:a4f92c3' },
  { kind: 'result',   text: '  [trivy-scan] Total: 3 (HIGH: 3, CRITICAL: 0)  status: pass  exit: 0' },
  { kind: 'blank',    text: '' },
  { kind: 'chain',    text: '  chains: attestation signed  cosign:verified  rekor:logged  sha256:d7e9f2a' },
  { kind: 'blank',    text: '' },
  { kind: 'metric',   text: '  pipelineruns-today: 8  succeeded: 7  running: 1  p50-build: 112s' },
  { kind: 'stat',     text: '  tekton v0.65.0  chains v0.22.0  triggers v0.27.0  4 tasks' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'step':     return '#4ade80';
    case 'running':  return '#fbbf24';
    case 'task':     return '#a78bfa';
    case 'result':   return '#67e8f9';
    case 'chain':    return '#a78bfa';
    case 'metric':   return 'rgba(240,239,255,0.5)';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function TektonPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [liveDur,   setLiveDur]   = useState(127);
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
            setLiveDur((d) => d + 1 + Math.floor(Math.random() * 2));
          }, 1800);
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
          construx@ci — tekton · pipelines · tasks · chains · triggers · attestation
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#fbbf24' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveDur}s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@ci# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          tekton · tasks · pipelines · triggers · chains · cosign · rekor
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => {
          const text = l.kind === 'comment'
            ? l.text.replace('{LIVE}', String(liveDur))
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Tekton v0.65 ·</span>
          <span style={{ color: '#4ade80' }}>2 tasks succeeded</span>
          <span style={{ color: '#fbbf24' }}>1 running</span>
          <span style={{ color: '#a78bfa' }}>cosign attested</span>
          <span style={{ color: '#67e8f9' }}>{liveDur}s elapsed</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          tekton · tasks · pipelines · chains · triggers · cosign · sbom
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#fbbf24' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● running' : 'loading'}
        </span>
      </div>
    </div>
  );
}
