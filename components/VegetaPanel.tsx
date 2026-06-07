'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'ok' | 'slow' | 'error' | 'hist' | 'stat' | 'label' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# vegeta: HTTP load testing at constant rate — attack → encode → report' },
  { kind: 'prompt',   text: "echo 'GET https://api.construx.io/v1/health' | vegeta attack -rate=500 -duration=30s | vegeta report" },
  { kind: 'blank',    text: '' },
  { kind: 'label',    text: 'Requests      [total, rate, throughput]   15000, 500.0/s, 499.1/s' },
  { kind: 'ok',       text: 'Duration      [total, attack, wait]       30.018s, 30.000s, 17.832ms' },
  { kind: 'ok',       text: 'Latencies     [min, mean, 50, 90, 95, 99, max]' },
  { kind: 'ok',       text: '              1.2ms  18.4ms  12.1ms  38.7ms  54.2ms  142.3ms  384.1ms' },
  { kind: 'ok',       text: 'Bytes In      [total, mean]              1,350,000, 90.00' },
  { kind: 'ok',       text: 'Bytes Out     [total, mean]              0, 0.00' },
  { kind: 'ok',       text: 'Success       [ratio]                    99.84%' },
  { kind: 'slow',     text: 'Status Codes  [code:count]               200:14976  429:18  503:6' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# histogram: latency distribution buckets' },
  { kind: 'prompt',   text: 'cat results.bin | vegeta report -type=hist[0,10ms,50ms,100ms,500ms,1s]' },
  { kind: 'hist',     text: 'Bucket           #      %        Histogram' },
  { kind: 'ok',       text: '[0,   10ms]    3841  25.61%  ████████████████' },
  { kind: 'ok',       text: '[10ms, 50ms]   8923  59.49%  ████████████████████████████████████████' },
  { kind: 'slow',     text: '[50ms,100ms]   1894  12.63%  ████████' },
  { kind: 'slow',     text: '[100ms,500ms]   318   2.12%  █' },
  { kind: 'error',    text: '[500ms,  1s]     24   0.16%  ' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# ramp: jq + vegeta to sweep rate from 100 to 1000 RPS' },
  { kind: 'prompt',   text: "for rate in 100 200 400 600 800 1000; do echo \"rate=$rate\"; done | vegeta attack -rate={rate}" },
  { kind: 'stat',     text: '  100 RPS  →  p99:  14.2ms  success: 100.00%' },
  { kind: 'stat',     text: '  200 RPS  →  p99:  18.7ms  success: 100.00%' },
  { kind: 'stat',     text: '  400 RPS  →  p99:  38.4ms  success:  99.98%' },
  { kind: 'stat',     text: '  600 RPS  →  p99:  94.1ms  success:  99.81%' },
  { kind: 'stat',     text: '  800 RPS  →  p99: 241.3ms  success:  98.42%  ← degradation starts' },
  { kind: 'error',    text: ' 1000 RPS  →  p99: 984.2ms  success:  91.17%  ← SLO breach' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'ok':      return '#4ade80';
    case 'slow':    return '#fbbf24';
    case 'error':   return '#f87171';
    case 'hist':    return '#67e8f9';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    case 'label':   return '#a78bfa';
    default:        return 'transparent';
  }
}

export default function VegetaPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [liveP99,   setLiveP99]   = useState(142.3);
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
            setLiveP99(Math.round((118 + Math.random() * 52) * 10) / 10);
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
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 78;
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
          construx@prod-01 — vegeta · HTTP load testing at constant rate
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#fbbf24' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `p99 ${liveP99} ms` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          vegeta attack · report · histogram · rate sweep · SLO tracking
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>vegeta 12.11 ·</span>
          <span style={{ color: '#4ade80' }}>500 RPS · 99.84% success</span>
          <span style={{ color: '#fbbf24' }}>p99 {liveP99} ms</span>
          <span style={{ color: '#f87171' }}>SLO break ≥ 800 RPS</span>
          <span style={{ color: '#a78bfa' }}>15k requests · 30s</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          vegeta · attack → encode → report · histogram · rate sweep · p99 SLO
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● done' : 'loading'}
        </span>
      </div>
    </div>
  );
}
