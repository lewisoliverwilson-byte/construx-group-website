'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'ok' | 'mtls' | 'latency' | 'route' | 'policy' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# linkerd: ultralight service mesh — mTLS, observability, traffic policy' },
  { kind: 'prompt',   text: 'linkerd check' },
  { kind: 'ok',       text: '  ✓  control plane is running in linkerd namespace' },
  { kind: 'ok',       text: '  ✓  control plane components are healthy' },
  { kind: 'ok',       text: '  ✓  heartbeat API token is valid' },
  { kind: 'ok',       text: '  ✓  proxy injection is working' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# meshed pod status — sidecar injected and mTLS active' },
  { kind: 'prompt',   text: 'linkerd viz stat pods -n construx-prod' },
  { kind: 'mtls',     text: '  NAME                    MESHED  SUCCESS   RPS   LATENCY_P99  TLS' },
  { kind: 'mtls',     text: '  construx-api-7d9f-x4k2   1/1     99.8%   142/s    18ms       100%' },
  { kind: 'mtls',     text: '  construx-api-7d9f-m8n3   1/1     99.9%   139/s    16ms       100%' },
  { kind: 'mtls',     text: '  construx-api-7d9f-p2q7   1/1     99.7%   137/s    21ms       100%' },
  { kind: 'mtls',     text: '  postgres-0               1/1    100.0%    18/s     4ms       100%' },
  { kind: 'mtls',     text: '  redis-0                  1/1    100.0%    94/s     1ms       100%' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# per-route latency — inbound traffic to construx-api' },
  { kind: 'prompt',   text: 'linkerd viz routes deploy/construx-api -n construx-prod' },
  { kind: 'route',    text: '  ROUTE                   SUCCESS   RPS  LATENCY_P50  LATENCY_P99' },
  { kind: 'route',    text: '  GET /api/v1/products     99.9%   98/s      9ms          23ms' },
  { kind: 'route',    text: '  POST /api/v1/orders      99.6%   22/s     14ms          41ms' },
  { kind: 'route',    text: '  GET /api/v1/search       99.1%   18/s     31ms          89ms' },
  { kind: 'route',    text: '  [DEFAULT]                99.8%    4/s      7ms          19ms' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# traffic policy: circuit breaker + retry budget' },
  { kind: 'prompt',   text: 'kubectl get httproute,serviceprofile -n construx-prod' },
  { kind: 'policy',   text: '  retryBudget: 20% / 10s   circuit-break: 5xx > 50%' },
  { kind: 'stat',     text: '  mTLS: SPIFFE identities via Linkerd CA  TTL 24h' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'ok':       return '#4ade80';
    case 'mtls':     return '#67e8f9';
    case 'latency':  return '#fbbf24';
    case 'route':    return '#a78bfa';
    case 'policy':   return '#fb923c';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function LinkerdPanel() {
  const [revealed,      setRevealed]      = useState(0);
  const [liveSuccessPs, setLiveSuccessPs] = useState(99.8);
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
            setLiveSuccessPs(+(99.5 + Math.random() * 0.5).toFixed(1));
          }, 2100);
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
          construx@prod-eu — linkerd · service mesh · mTLS · observability
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveSuccessPs}% success` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-eu# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          linkerd · mTLS · proxy · routes · retries · circuit-breaker
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Linkerd 2.16 ·</span>
          <span style={{ color: '#4ade80' }}>{liveSuccessPs}% success</span>
          <span style={{ color: '#67e8f9' }}>100% mTLS</span>
          <span style={{ color: '#a78bfa' }}>per-route metrics</span>
          <span style={{ color: '#fb923c' }}>retry budget</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          linkerd · service-mesh · mTLS · SPIFFE · proxy · routes · retries
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● watching' : 'loading'}
        </span>
      </div>
    </div>
  );
}
