'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'stream' | 'consumer' | 'lag' | 'kv' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# nats jetstream: persistent streams · consumers · key-value · clustering' },
  { kind: 'prompt',   text: 'nats stream info CONSTRUX_EVENTS' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# CONSTRUX_EVENTS  subjects: construx.events.>  replicas: 3  storage: file' },
  { kind: 'stream',   text: '  Messages: 2,847,391  Bytes: 4.2 GiB  MaxAge: 7d  Discard: old' },
  { kind: 'stream',   text: '  Created: 2033-11-20  Leader: nats-0.construx-infra  Peers: 3/3' },
  { kind: 'stream',   text: '  Consumers: 4  State: active  Cluster: healthy  Raft: quorum' },
  { kind: 'blank',    text: '' },
  { kind: 'prompt',   text: 'nats consumer report CONSTRUX_EVENTS' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# Consumer               Msgs Pending  Ack Pending  Redelivered' },
  { kind: 'consumer', text: '  billing-service              0             0            0   ✔ caught up' },
  { kind: 'lag',      text: '  analytics-service        142,301          12            0   ⚠ lagging' },
  { kind: 'consumer', text: '  audit-logger                  0             0            0   ✔ caught up' },
  { kind: 'lag',      text: '  ml-feature-pipeline        8,891            0            0   ⚙ processing' },
  { kind: 'blank',    text: '' },
  { kind: 'kv',       text: '  KV: construx-config  keys: 847  history: 10  watchers: 14  replicas: 3' },
  { kind: 'metric',   text: '  msg-rate: {LIVE}/s  published-total: 14,392,847  connected-clients: 23' },
  { kind: 'stat',     text: '  nats-server 2.10.14  jetstream  3-node cluster  raft:healthy  uptime: 47d' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'stream':   return '#4ade80';
    case 'consumer': return '#67e8f9';
    case 'lag':      return '#fbbf24';
    case 'kv':       return '#a78bfa';
    case 'metric':   return 'rgba(240,239,255,0.5)';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function NATSJetStreamPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveMsgRate, setLiveMsgRate] = useState(9400);
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
            setLiveMsgRate((r) => {
              const delta = Math.floor(Math.random() * 600) - 300;
              const next = r + delta;
              return Math.min(14000, Math.max(7000, next));
            });
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
  const fmtRate    = liveMsgRate >= 1000
    ? `${(liveMsgRate / 1000).toFixed(1)}k`
    : String(liveMsgRate);

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
          construx@messaging — nats · jetstream · streams · consumers · kv-store
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${fmtRate}/s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@messaging# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          nats · jetstream · streams · consumers · kv · obj-store · cluster
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => {
          const text = l.kind === 'metric'
            ? l.text.replace('{LIVE}', fmtRate)
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>NATS 2.10.14 ·</span>
          <span style={{ color: '#4ade80' }}>2 consumers caught up</span>
          <span style={{ color: '#fbbf24' }}>2 consumers lagging</span>
          <span style={{ color: '#67e8f9' }}>4.2GiB stream</span>
          <span style={{ color: '#a78bfa' }}>{fmtRate} msg/s</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          nats · jetstream · streams · consumers · kv · cluster · raft
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● healthy' : 'loading'}
        </span>
      </div>
    </div>
  );
}
