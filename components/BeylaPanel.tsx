'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'service' | 'span' | 'metric' | 'ebpf' | 'route' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# grafana beyla: ebpf auto-instrumentation — zero code changes, instant RED metrics' },
  { kind: 'prompt',   text: 'kubectl get pods -n beyla -l app.kubernetes.io/name=beyla' },
  { kind: 'blank',    text: '' },
  { kind: 'ebpf',     text: '  beyla-ds-8nxzp   2/2  Running  node: node-01  ebpf: attached  uprobes: 14' },
  { kind: 'ebpf',     text: '  beyla-ds-qrtmk   2/2  Running  node: node-02  ebpf: attached  uprobes: 14' },
  { kind: 'ebpf',     text: '  beyla-ds-vwplj   2/2  Running  node: node-03  ebpf: attached  uprobes: 14' },
  { kind: 'blank',    text: '' },
  { kind: 'prompt',   text: 'kubectl logs -n beyla beyla-ds-8nxzp -c beyla | tail -8' },
  { kind: 'blank',    text: '' },
  { kind: 'service',  text: '  [discover] orders-api  pid: 4821  lang: go  runtime: go1.23.4  http: true' },
  { kind: 'service',  text: '  [discover] payments-api  pid: 6302  lang: go  runtime: go1.23.4  grpc: true' },
  { kind: 'service',  text: '  [discover] frontend  pid: 7101  lang: node  runtime: v22.3.0  http: true' },
  { kind: 'blank',    text: '' },
  { kind: 'span',     text: '  [trace] GET /api/v1/orders  svc: orders-api  dur: 4.2ms  status: 200  span-id: a3f7' },
  { kind: 'span',     text: '  [trace] POST /payments  svc: payments-api  dur: 18.6ms  status: 200  span-id: b8c1' },
  { kind: 'route',    text: '  [metric] http.server.request.duration{svc="orders-api",route="/api/v1/orders"} p50=4ms p99=34ms' },
  { kind: 'metric',   text: '  [metric] http.server.requests.total{status="2xx"}: {LIVE}/s  errors: 0' },
  { kind: 'stat',     text: '  beyla v1.8.3  otel-exporter: tempo:4317  prom: :9090  ebpf-mode: kernel-4.18+' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'ebpf':     return '#4ade80';
    case 'service':  return '#67e8f9';
    case 'span':     return '#a78bfa';
    case 'route':    return '#fbbf24';
    case 'metric':   return 'rgba(240,239,255,0.5)';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function BeylaPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [reqRps,    setReqRps]    = useState(847);
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
            setReqRps((c) => Math.max(500, Math.floor(c + (Math.random() - 0.4) * 80)));
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
          construx@beyla — ebpf · auto-instrument · RED metrics · otel · traces
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${reqRps}/s` : 'attaching…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@beyla# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          beyla · ebpf · uprobes · RED · otel-exporter · trace · service-graph
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => {
          const text = l.kind === 'metric'
            ? l.text.replace('{LIVE}', String(reqRps))
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Beyla v1.8.3 ·</span>
          <span style={{ color: '#4ade80' }}>{reqRps} req/s</span>
          <span style={{ color: '#67e8f9' }}>3 services</span>
          <span style={{ color: '#a78bfa' }}>eBPF</span>
          <span style={{ color: '#fbbf24' }}>zero-code</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          beyla · ebpf · auto-instrument · RED · otel · traces · service-graph
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● instrumented' : 'attaching'}
        </span>
      </div>
    </div>
  );
}
