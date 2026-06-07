'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'ok' | 'route' | 'mtls' | 'policy' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# istio: envoy sidecar mesh — mtls, traffic management, observability' },
  { kind: 'prompt',  text: 'istioctl proxy-status' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# sidecar injection: envoy proxy in every pod — transparent interception' },
  { kind: 'ok',      text: '  construx-api-7d9f4b     SYNCED  Healthy  istiod  172.0.5.2' },
  { kind: 'ok',      text: '  construx-worker-9f4b    SYNCED  Healthy  istiod  172.0.5.3' },
  { kind: 'ok',      text: '  construx-payments-b2c3  SYNCED  Healthy  istiod  172.0.5.4' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# virtualservice: 90% stable / 10% canary traffic split' },
  { kind: 'route',   text: '  construx-api  →  construx-api-stable  weight:90' },
  { kind: 'route',   text: '  construx-api  →  construx-api-canary  weight:10  (X-Canary: skip)' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# peer authentication: strict mtls — all pod-to-pod traffic encrypted' },
  { kind: 'mtls',    text: '  construx-prod  PeerAuthentication  STRICT  mTLS enforced' },
  { kind: 'mtls',    text: '  construx-api → postgres  MUTUAL_TLS  cert: spiffe://construx.io/...' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# authorization policy: zero-trust — deny-all except explicit allows' },
  { kind: 'policy',  text: '  ALLOW  construx-api → postgres:5432   (SA: construx-api only)' },
  { kind: 'policy',  text: '  DENY   *           → postgres:5432   (all other principals)' },
  { kind: 'metric',  text: '  p99 latency added by sidecar: 0.3ms  success rate: 99.97%' },
  { kind: 'stat',    text: '  3 services  6 pods  envoy sidecar overhead: ~50MB/pod' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'ok':      return '#4ade80';
    case 'route':   return '#a78bfa';
    case 'mtls':    return '#67e8f9';
    case 'policy':  return '#fbbf24';
    case 'metric':  return 'rgba(240,239,255,0.5)';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    default:        return 'transparent';
  }
}

export default function IstioPanel() {
  const [revealed,     setRevealed]     = useState(0);
  const [liveSuccess,  setLiveSuccess]  = useState(99.97);
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
            setLiveSuccess(parseFloat((99.9 + Math.random() * 0.1).toFixed(2)));
          }, 2200);
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
          construx@mesh — istio · envoy · mtls · virtualservice · authpolicy
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveSuccess}% success` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@mesh# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          istio · envoy · strict-mtls · virtualservice · destinationrule · authorizationpolicy
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Istio 1.23 ·</span>
          <span style={{ color: '#4ade80' }}>{liveSuccess}% success</span>
          <span style={{ color: '#67e8f9' }}>strict mTLS</span>
          <span style={{ color: '#a78bfa' }}>90/10 canary</span>
          <span style={{ color: '#fbbf24' }}>zero-trust</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          istio · envoy · mtls · virtualservice · authorizationpolicy · istiod
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● synced' : 'loading'}
        </span>
      </div>
    </div>
  );
}
