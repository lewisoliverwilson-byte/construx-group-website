'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'pod-ok' | 'pod-warn' | 'pod-err' | 'log' | 'event' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# k9s: terminal UI for Kubernetes cluster management' },
  { kind: 'prompt',   text: 'k9s --context prod-eu -n construx-prod' },
  { kind: 'stat',     text: '⎈  Context: prod-eu  Namespace: construx-prod  v1.31.2' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# pods view — live resource utilization' },
  { kind: 'pod-ok',   text: '  api-7f9b-xk2m9    2/2  Running   0   14h  cpu:42m  mem:128Mi' },
  { kind: 'pod-ok',   text: '  api-7f9b-n8r4p    2/2  Running   0   14h  cpu:38m  mem:119Mi' },
  { kind: 'pod-ok',   text: '  worker-5dc4-mq7v  1/1  Running   0    2h  cpu:12m  mem:64Mi' },
  { kind: 'pod-warn', text: '  redis-0            1/1  Running   3    7d  cpu: 8m  mem:312Mi' },
  { kind: 'pod-err',  text: '  cron-job-8b2fx     0/1  Error     4   22m  cpu: 0m  mem:  0Mi' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# press l on selected pod → live log stream' },
  { kind: 'log',      text: '2032-11-20T09:00:01Z  INFO  server listening on :8080' },
  { kind: 'log',      text: '2032-11-20T09:00:04Z  INFO  GET /orders 200 2.1ms' },
  { kind: 'log',      text: '2032-11-20T09:00:07Z  WARN  slow query: 482ms  table=orders' },
  { kind: 'log',      text: '2032-11-20T09:00:09Z  INFO  POST /orders 201 8.4ms' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# :events view — debug crash loop' },
  { kind: 'event',    text: '22m  Warning  BackOff    cron-job-8b2fx  Back-off restarting failed container' },
  { kind: 'event',    text: '22m  Warning  Failed     cron-job-8b2fx  Error: exit code 1' },
  { kind: 'event',    text: '14h  Normal   Started    api-7f9b-xk2m9  Started container api' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# press s → exec shell into running container' },
  { kind: 'prompt',   text: '# /bin/sh → api-7f9b-xk2m9:api' },
  { kind: 'stat',     text: '/ $ curl http://localhost:8080/health' },
  { kind: 'pod-ok',   text: '{"status":"ok","db":"connected","redis":"connected"}' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'pod-ok':   return '#4ade80';
    case 'pod-warn': return '#fbbf24';
    case 'pod-err':  return '#f87171';
    case 'log':      return '#67e8f9';
    case 'event':    return '#fb923c';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function K9sPanel() {
  const [revealed,     setRevealed]     = useState(0);
  const [liveRestarts, setLiveRestarts] = useState(3);
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
            setLiveRestarts(Math.floor(1 + Math.random() * 5));
          }, 1950);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 79;
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
          construx@prod-eu — k9s · kubernetes cluster terminal UI
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#fbbf24' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveRestarts} restarts` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-eu# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          k9s · pods · logs · exec · events · port-forward · configmaps
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>k9s v0.32 ·</span>
          <span style={{ color: '#4ade80' }}>3 running</span>
          <span style={{ color: '#fbbf24' }}>{liveRestarts} restarts</span>
          <span style={{ color: '#f87171' }}>1 error</span>
          <span style={{ color: '#67e8f9' }}>live logs</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          k9s · kubectl · kubernetes · pods · logs · exec · events
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● watching' : 'loading'}
        </span>
      </div>
    </div>
  );
}
