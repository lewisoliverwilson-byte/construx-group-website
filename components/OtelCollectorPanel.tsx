'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'receiver' | 'processor' | 'exporter' | 'pipeline' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',   text: '# otelcol: receiver → processor → exporter pipeline — traces, metrics, logs' },
  { kind: 'prompt',    text: 'curl -s http://otelcol:8888/metrics | grep otelcol_receiver_accepted' },
  { kind: 'blank',     text: '' },
  { kind: 'receiver',  text: '  receiver: otlp/grpc        accepted: {LIVE_R}/s  refused: 0' },
  { kind: 'receiver',  text: '  receiver: prometheus       scraped: 142 targets  errors: 0' },
  { kind: 'receiver',  text: '  receiver: k8s_events       events: 312/m         errors: 0' },
  { kind: 'blank',     text: '' },
  { kind: 'processor', text: '  processor: batch           send_size: 512        timeout: 200ms' },
  { kind: 'processor', text: '  processor: memory_limiter  heap: 78%  limit: 512Mi  refused: 0' },
  { kind: 'processor', text: '  processor: resource_detection  cloud.provider: aws  k8s.cluster: construx-prod' },
  { kind: 'blank',     text: '' },
  { kind: 'exporter',  text: '  exporter: otlp/tempo       sent: {LIVE_E}/s   failed: 0  queue: 0' },
  { kind: 'exporter',  text: '  exporter: prometheusremotewrite  metrics/s: 8.4k  failed: 0' },
  { kind: 'pipeline',  text: '  pipelines: traces/prod  metrics/prod  logs/prod  (3 active)' },
  { kind: 'metric',    text: '  uptime: 14d  dropped: 0  queue-depth: 0  receivers: 3  exporters: 3' },
  { kind: 'stat',      text: '  otelcol-contrib v0.105.0  daemonset: 12 nodes  memory: 312Mi' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':   return 'rgba(240,239,255,0.22)';
    case 'prompt':    return 'rgba(240,239,255,0.6)';
    case 'receiver':  return '#4ade80';
    case 'processor': return '#fbbf24';
    case 'exporter':  return '#a78bfa';
    case 'pipeline':  return '#67e8f9';
    case 'metric':    return 'rgba(240,239,255,0.5)';
    case 'stat':      return 'rgba(240,239,255,0.45)';
    default:          return 'transparent';
  }
}

export default function OtelCollectorPanel() {
  const [revealed,   setRevealed]   = useState(0);
  const [receiverRps, setReceiverRps] = useState(24000);
  const [exporterRps, setExporterRps] = useState(23800);
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
            setReceiverRps((c) => Math.floor(c + (Math.random() - 0.4) * 800));
            setExporterRps((c) => Math.floor(c + (Math.random() - 0.4) * 780));
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
          construx@otelcol — receiver · processor · exporter · pipeline · contrib
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${(receiverRps / 1000).toFixed(1)}k/s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@otelcol# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          otelcol · receiver · processor · exporter · pipeline · traces · metrics · logs
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => {
          let text = l.text;
          if (l.kind === 'receiver' && text.includes('{LIVE_R}')) {
            text = text.replace('{LIVE_R}', (receiverRps / 1000).toFixed(1) + 'k');
          }
          if (l.kind === 'exporter' && text.includes('{LIVE_E}')) {
            text = text.replace('{LIVE_E}', (exporterRps / 1000).toFixed(1) + 'k');
          }
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>OTel Collector v0.105.0 ·</span>
          <span style={{ color: '#4ade80' }}>{(receiverRps / 1000).toFixed(1)}k received/s</span>
          <span style={{ color: '#a78bfa' }}>{(exporterRps / 1000).toFixed(1)}k exported/s</span>
          <span style={{ color: '#67e8f9' }}>3 pipelines</span>
          <span style={{ color: '#fbbf24' }}>0 dropped</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          otelcol · receiver · processor · exporter · traces · metrics · logs
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● flowing' : 'loading'}
        </span>
      </div>
    </div>
  );
}
