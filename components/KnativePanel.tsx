'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'service' | 'revision' | 'traffic' | 'scale' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# knative serving: scale-to-zero serverless on kubernetes' },
  { kind: 'prompt',   text: 'kn service list -n construx-prod' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# services: 2 active, scale-to-zero configured' },
  { kind: 'service',  text: '  construx-api     READY  url: https://api.construx.io     pods:3' },
  { kind: 'service',  text: '  construx-worker  READY  url: https://worker.construx.io  pods:0  (scaled to zero)' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# traffic split: gradual rollout v4→v5' },
  { kind: 'revision', text: '  construx-api-v4   90%   stable  pods:3  latency-p99: 42ms' },
  { kind: 'revision', text: '  construx-api-v5   10%   canary  pods:1  latency-p99: 38ms' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# autoscaler: KPA cold start triggered' },
  { kind: 'scale',    text: '  construx-worker: 0 → 3 pods  cold-start: 2.1s  concurrency:10' },
  { kind: 'traffic',  text: '  queue-proxy requests/s: 84.2  activator: bypassed (warm)' },
  { kind: 'blank',    text: '' },
  { kind: 'metric',   text: '  rps: 847/s  p99: 42ms  cold-starts: 3  scale-downs: 12' },
  { kind: 'stat',     text: '  2 services  4 revisions  kpa autoscaler  knative 1.14' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'service':  return '#4ade80';
    case 'revision': return '#67e8f9';
    case 'traffic':  return '#a78bfa';
    case 'scale':    return '#fbbf24';
    case 'metric':   return 'rgba(240,239,255,0.5)';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function KnativePanel() {
  const [revealed, setRevealed] = useState(0);
  const [liveRps,  setLiveRps]  = useState(847);
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
            setLiveRps(780 + Math.floor(Math.random() * 140));
          }, 2400);
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
          construx@serverless — knative · serving · scale-to-zero · traffic-split
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveRps}/s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@serverless# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          knative · serving · kpa · traffic-split · cold-start · revision
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Knative 1.14 ·</span>
          <span style={{ color: '#4ade80' }}>{liveRps}/s rps</span>
          <span style={{ color: '#67e8f9' }}>90/10 split</span>
          <span style={{ color: '#fbbf24' }}>2.1s cold-start</span>
          <span style={{ color: '#a78bfa' }}>kpa active</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          knative · serving · revisions · traffic · kpa · scale-to-zero
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● serving' : 'loading'}
        </span>
      </div>
    </div>
  );
}
