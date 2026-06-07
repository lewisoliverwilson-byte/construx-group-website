'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'header' | 'scaler' | 'trigger' | 'lag' | 'event' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# keda: event-driven autoscaling — scale to zero on kafka, prometheus, redis' },
  { kind: 'prompt',   text: 'keda-ctl get scaledobjects -n construx-prod' },
  { kind: 'header',   text: '  NAME                    TRIGGERS      MIN  MAX  CURRENT  READY' },
  { kind: 'scaler',   text: '  construx-api-scaler     kafka,prom    0    20   8        True' },
  { kind: 'scaler',   text: '  benthos-processor       kafka         0    10   3        True' },
  { kind: 'scaler',   text: '  worker-scaler           redis,cron    1    50   12       True' },
  { kind: 'scaler',   text: '  email-sender            rabbitmq      0    5    0        True   ← scaled to zero' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# kafka trigger: scale construx-api-scaler on consumer group lag' },
  { kind: 'trigger',  text: '  topic: construx.events  group: benthos-event-processor  lagThreshold: 1000' },
  { kind: 'lag',      text: '  current lag: 4,218 messages  →  8 replicas active  (cooldown: 30s)' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# prometheus trigger: scale on http_requests_per_second' },
  { kind: 'trigger',  text: '  query: sum(rate(http_requests_total[1m]))  threshold: 50' },
  { kind: 'lag',      text: '  current rps: 412  →  8 replicas  serverAddress: thanos.monitoring.svc' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# scale-to-zero: email-sender — 0 messages in queue, 0 replicas running' },
  { kind: 'trigger',  text: '  queueLength: 0  replicas: 0  (cold start on next message: ~2.1s)' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# live scaling events' },
  { kind: 'event',    text: '  09:14:22Z  construx-api-scaler   3→8   kafka lag spike' },
  { kind: 'event',    text: '  09:14:45Z  benthos-processor     2→3   lag stabilising' },
  { kind: 'event',    text: '  09:15:12Z  worker-scaler        10→12   redis queue depth' },
  { kind: 'stat',     text: '  4 scaledobjects  3 active  1 zero  pollingInterval: 15s' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'header':   return 'rgba(240,239,255,0.35)';
    case 'scaler':   return '#4ade80';
    case 'trigger':  return '#67e8f9';
    case 'lag':      return '#fbbf24';
    case 'event':    return '#a78bfa';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function KedaPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveReplicas, setLiveReplicas] = useState(23);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);
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
            setLiveReplicas(20 + Math.floor(Math.random() * 8));
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
          construx@k8s — keda · event-driven · autoscale · scale-to-zero
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveReplicas} replicas` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@k8s# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          keda · kafka-scaler · prometheus-trigger · scale-to-zero · scaledobject
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>KEDA 2.14 ·</span>
          <span style={{ color: '#4ade80' }}>{liveReplicas} replicas</span>
          <span style={{ color: '#67e8f9' }}>kafka trigger</span>
          <span style={{ color: '#fbbf24' }}>lag-based</span>
          <span style={{ color: '#a78bfa' }}>scale-to-zero</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          keda · scaledobject · kafka · prometheus · redis · scale-to-zero
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● scaling' : 'loading'}
        </span>
      </div>
    </div>
  );
}
