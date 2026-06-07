'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'kafka' | 'topic' | 'consumer' | 'operator' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# strimzi: kafka on kubernetes — operator, tls, cruise control, mirror maker' },
  { kind: 'prompt',   text: 'kubectl get kafka -n kafka' },
  { kind: 'blank',    text: '' },
  { kind: 'kafka',    text: '  construx-kafka  3.8.0  brokers: 3/3 ready  zooless: true  status: Ready' },
  { kind: 'blank',    text: '' },
  { kind: 'prompt',   text: 'kubectl get kafkatopics -n kafka --sort-by=.spec.partitions' },
  { kind: 'blank',    text: '' },
  { kind: 'topic',    text: '  orders.created      partitions: 24  replicas: 3  retention: 7d' },
  { kind: 'topic',    text: '  payments.events     partitions: 12  replicas: 3  retention: 30d' },
  { kind: 'topic',    text: '  analytics.pageview  partitions: 48  replicas: 2  retention: 1d' },
  { kind: 'blank',    text: '' },
  { kind: 'consumer', text: '  orders-consumer  lag: 842  committed: 2034-04-22T08:14:11Z  state: Stable' },
  { kind: 'operator', text: '  cruise-control: rebalance complete  moved: 3 partitions  30s ago' },
  { kind: 'metric',   text: '  messages/s: {LIVE}k  bytes/s: 124MB  active-producers: 18  lag-max: 842' },
  { kind: 'stat',     text: '  strimzi v0.42.0  kafka 3.8.0  zooless KRaft  tls: mTLS  irsa: enabled' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'kafka':    return '#4ade80';
    case 'topic':    return '#67e8f9';
    case 'consumer': return '#fbbf24';
    case 'operator': return '#a78bfa';
    case 'metric':   return 'rgba(240,239,255,0.5)';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function StrimziPanel() {
  const [revealed,   setRevealed]   = useState(0);
  const [msgRateK,   setMsgRateK]   = useState(84);
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
            setMsgRateK((c) => Math.max(40, Math.floor(c + (Math.random() - 0.4) * 12)));
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
          construx@strimzi — kafka · topics · mTLS · cruise-control · kraft · irsa
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${msgRateK}k/s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@strimzi# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          strimzi · kafka · topic · consumer-group · cruise-control · tls · mirror-maker
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => {
          const text = l.kind === 'metric'
            ? l.text.replace('{LIVE}', String(msgRateK))
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Strimzi v0.42.0 ·</span>
          <span style={{ color: '#4ade80' }}>{msgRateK}k msg/s</span>
          <span style={{ color: '#67e8f9' }}>3 brokers</span>
          <span style={{ color: '#a78bfa' }}>KRaft</span>
          <span style={{ color: '#fbbf24' }}>mTLS</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          strimzi · kafka · topics · cruise-control · tls · kraft · mirror-maker
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● ready' : 'loading'}
        </span>
      </div>
    </div>
  );
}
