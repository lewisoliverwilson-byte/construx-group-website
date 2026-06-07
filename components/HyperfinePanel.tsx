'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'bench-fast' | 'bench-mid' | 'bench-slow' | 'result' | 'summary' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',    text: '# hyperfine: statistical command-line benchmarking — like time with proper statistics' },
  { kind: 'prompt',     text: "hyperfine 'construx-api --dry-run' --warmup 3 --runs 20" },
  { kind: 'stat',       text: 'Benchmark: construx-api --dry-run' },
  { kind: 'stat',       text: '  Warmup runs: 3  ·  Measurement runs: 20' },
  { kind: 'bench-fast', text: '  Time (mean ± σ):   142.3 ms ± 4.8 ms   [User: 118.2 ms, Sys: 24.1 ms]' },
  { kind: 'bench-fast', text: '  Range (min … max): 136.1 ms … 154.7 ms   20 runs' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# compare two implementations — hyperfine runs statistical significance tests' },
  { kind: 'prompt',     text: "hyperfine 'construx-api --engine=v1' 'construx-api --engine=v2' --warmup 5" },
  { kind: 'stat',       text: 'Benchmark 1: construx-api --engine=v1' },
  { kind: 'bench-mid',  text: '  Time (mean ± σ):   183.4 ms ± 7.2 ms   [User: 151.3 ms, Sys: 32.1 ms]' },
  { kind: 'bench-mid',  text: '  Range (min … max): 171.2 ms … 198.6 ms   10 runs' },
  { kind: 'blank',      text: '' },
  { kind: 'stat',       text: 'Benchmark 2: construx-api --engine=v2' },
  { kind: 'bench-fast', text: '  Time (mean ± σ):   142.3 ms ± 4.8 ms   [User: 118.2 ms, Sys: 24.1 ms]' },
  { kind: 'bench-fast', text: '  Range (min … max): 136.1 ms … 154.7 ms   10 runs' },
  { kind: 'blank',      text: '' },
  { kind: 'summary',    text: '  Summary: engine=v2 is 1.29× faster than engine=v1 (p < 0.001)' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# export JSON for CI regression tracking' },
  { kind: 'prompt',     text: "hyperfine 'pg-query --plan' --export-json bench-$(date +%Y%m%d).json --runs 50" },
  { kind: 'result',     text: '  { "mean": 0.0421, "stddev": 0.0018, "min": 0.0389, "max": 0.0498, "times": [...] }' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# parameterised benchmark — sweep input sizes via --parameter-list' },
  { kind: 'prompt',     text: "hyperfine --parameter-list size 1k,10k,100k 'jq . data-{size}.json'" },
  { kind: 'bench-fast', text: "  jq . data-1k.json:    5.4 ms ±  0.3 ms" },
  { kind: 'bench-mid',  text: "  jq . data-10k.json:  41.2 ms ±  1.8 ms" },
  { kind: 'bench-slow', text: "  jq . data-100k.json: 318.7 ms ± 11.4 ms  ← 8.7× median per 10× size" },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':    return 'rgba(240,239,255,0.22)';
    case 'prompt':     return 'rgba(240,239,255,0.6)';
    case 'bench-fast': return '#4ade80';
    case 'bench-mid':  return '#fbbf24';
    case 'bench-slow': return '#f87171';
    case 'result':     return '#67e8f9';
    case 'summary':    return '#a78bfa';
    case 'stat':       return 'rgba(240,239,255,0.45)';
    default:           return 'transparent';
  }
}

export default function HyperfinePanel() {
  const [revealed,   setRevealed]   = useState(0);
  const [liveMeanMs, setLiveMeanMs] = useState(142.3);
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
            setLiveMeanMs(Math.round((134 + Math.random() * 18) * 10) / 10);
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
          construx@prod-01 — hyperfine · statistical command-line benchmark
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveMeanMs} ms mean` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          hyperfine · statistical benchmark · warmup runs · parameter sweep
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>hyperfine 1.18 ·</span>
          <span style={{ color: '#4ade80' }}>{liveMeanMs} ms mean</span>
          <span style={{ color: '#a78bfa' }}>v2 engine 1.29× faster</span>
          <span style={{ color: '#67e8f9' }}>p &lt; 0.001</span>
          <span style={{ color: '#fbbf24' }}>50 runs · JSON export</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          hyperfine · warmup · --parameter-list · --export-json · regression CI
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● done' : 'loading'}
        </span>
      </div>
    </div>
  );
}
