'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'component' | 'ok' | 'metric' | 'log' | 'trace' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',   text: '# grafana alloy: unified observability pipeline — metrics, logs, traces' },
  { kind: 'prompt',    text: 'alloy run --config.path=/etc/alloy/config.alloy' },
  { kind: 'ok',        text: '  level=info component=prometheus.scrape  targets=342' },
  { kind: 'ok',        text: '  level=info component=loki.write          receivers=1' },
  { kind: 'ok',        text: '  level=info component=otelcol.exporter    endpoint=tempo:4317' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# alloy component health — river pipeline status' },
  { kind: 'prompt',    text: 'curl -s http://alloy:12345/api/v0/web/components | jq .[].health' },
  { kind: 'component', text: '  prometheus.scrape.default       healthy  342 targets' },
  { kind: 'component', text: '  prometheus.remote_write.vm      healthy  284k samples/s' },
  { kind: 'component', text: '  loki.source.kubernetes.pods     healthy  12 pod log streams' },
  { kind: 'component', text: '  loki.write.default              healthy  1.4 MB/s' },
  { kind: 'component', text: '  otelcol.receiver.otlp.default   healthy  port 4317 open' },
  { kind: 'component', text: '  otelcol.exporter.otlp.tempo     healthy  batch 512 spans/s' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# live flow — metrics scraped and forwarded' },
  { kind: 'metric',    text: '  prometheus → victoriametrics  284000 samples/s  lag 0ms' },
  { kind: 'log',       text: '  loki.source → loki.write      1.4 MB/s  streams: 12' },
  { kind: 'trace',     text: '  otelcol → tempo               512 spans/s  p99 4ms' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# tail sampling: keep all errors + 1% of success spans' },
  { kind: 'prompt',    text: 'alloy fmt /etc/alloy/config.alloy | grep policy' },
  { kind: 'stat',      text: '  policy error_traces: status_code=ERROR → keep' },
  { kind: 'stat',      text: '  policy random_sample: probabilistic 1%   → sample' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':   return 'rgba(240,239,255,0.22)';
    case 'prompt':    return 'rgba(240,239,255,0.6)';
    case 'ok':        return '#4ade80';
    case 'component': return '#67e8f9';
    case 'metric':    return '#a78bfa';
    case 'log':       return '#fbbf24';
    case 'trace':     return '#fb923c';
    case 'stat':      return 'rgba(240,239,255,0.45)';
    default:          return 'transparent';
  }
}

export default function GrafanaAlloyPanel() {
  const [revealed,      setRevealed]      = useState(0);
  const [liveSamplesPs, setLiveSamplesPs] = useState(284000);
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
            setLiveSamplesPs(270000 + Math.floor(Math.random() * 25000));
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
          construx@prod-eu — grafana alloy · metrics · logs · traces
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#a78bfa' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveSamplesPs.toLocaleString()}/s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-eu# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          alloy · river · prometheus · loki · otelcol · tail-sampling
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Alloy v1.4 ·</span>
          <span style={{ color: '#a78bfa' }}>{liveSamplesPs.toLocaleString()} metrics/s</span>
          <span style={{ color: '#fbbf24' }}>1.4 MB/s logs</span>
          <span style={{ color: '#fb923c' }}>512 spans/s</span>
          <span style={{ color: '#67e8f9' }}>river pipeline</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          alloy · river · prometheus · loki · otelcol · tempo · metrics
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● streaming' : 'loading'}
        </span>
      </div>
    </div>
  );
}
