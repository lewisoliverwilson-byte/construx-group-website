'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'flow' | 'policy' | 'drop' | 'service' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# hubble: cilium network observability — flows, drops, service map, policy verdicts' },
  { kind: 'prompt',   text: 'hubble observe --namespace construx-prod --last 8 --output json-compact' },
  { kind: 'blank',    text: '' },
  { kind: 'flow',     text: '  FORWARDED  orders-api → payments-api:8080  TCP  SYN  policy: allow' },
  { kind: 'flow',     text: '  FORWARDED  frontend → orders-api:8080  HTTP GET /api/v1/orders  200 OK' },
  { kind: 'drop',     text: '  DROPPED    unknown-pod → orders-api:8080  policy: deny  reason: no-matching-policy' },
  { kind: 'flow',     text: '  FORWARDED  orders-api → postgres:5432  TCP  ESTABLISHED  bytes: 1.2KB' },
  { kind: 'drop',     text: '  DROPPED    analytics-scraper → payments-api:8080  reason: egress-deny-all' },
  { kind: 'flow',     text: '  FORWARDED  otelcol → orders-api:9090  HTTP GET /metrics  200 OK' },
  { kind: 'blank',    text: '' },
  { kind: 'prompt',   text: 'hubble observe --verdict DROPPED --namespace construx-prod --since 1h | wc -l' },
  { kind: 'blank',    text: '' },
  { kind: 'policy',   text: '  14 drops in 1h  — 12 policy-deny  2 dns-error  0 auth-required' },
  { kind: 'service',  text: '  service-map: orders-api ← [frontend, gateway, cron-scheduler]' },
  { kind: 'service',  text: '  service-map: payments-api ← [orders-api]  isolated: true' },
  { kind: 'metric',   text: '  flows/s: {LIVE}k  forwarded: 99.7%  dropped: 0.3%  latency-p99: 3ms' },
  { kind: 'stat',     text: '  hubble v1.15.3  cilium v1.16.2  ebpf-flows: ring-buf 4096  tls: enabled' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'flow':     return '#4ade80';
    case 'drop':     return '#f87171';
    case 'policy':   return '#fbbf24';
    case 'service':  return '#67e8f9';
    case 'metric':   return 'rgba(240,239,255,0.5)';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function HubblePanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [flowsK,    setFlowsK]    = useState(42);
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
            setFlowsK((c) => Math.max(20, Math.floor(c + (Math.random() - 0.4) * 10)));
          }, 2000);
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
          construx@hubble — network flows · policy verdicts · drops · service map
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${flowsK}k flows/s` : 'observing…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@hubble# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          hubble · flows · drops · policy · service-map · ebpf · cilium
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => {
          const text = l.kind === 'metric'
            ? l.text.replace('{LIVE}', String(flowsK))
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Hubble v1.15.3 ·</span>
          <span style={{ color: '#4ade80' }}>{flowsK}k flows/s</span>
          <span style={{ color: '#f87171' }}>14 drops/h</span>
          <span style={{ color: '#67e8f9' }}>service-map</span>
          <span style={{ color: '#fbbf24' }}>policy-audit</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          hubble · cilium · ebpf · flows · drops · policy · service-graph
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● observing' : 'attaching'}
        </span>
      </div>
    </div>
  );
}
