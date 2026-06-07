'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'broker' | 'topic' | 'georep' | 'tier' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# apache pulsar: multi-tenant messaging — geo-replication, tiered storage' },
  { kind: 'prompt',  text: 'bin/pulsar-admin clusters get eu-west-2' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# cluster: 3 brokers  3 bookies  2 geo-clusters' },
  { kind: 'broker',  text: '  broker-0  ACTIVE  8 bundles  cpu:48%  net:420MB/s' },
  { kind: 'broker',  text: '  broker-1  ACTIVE  7 bundles  cpu:44%  net:388MB/s' },
  { kind: 'broker',  text: '  broker-2  ACTIVE  9 bundles  cpu:52%  net:461MB/s' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# topics: construx/events — 3 active partitioned' },
  { kind: 'topic',   text: '  order-placed    12 parts  msgRateIn:8421/s  storageSize:184GB' },
  { kind: 'topic',   text: '  payment-events   6 parts  msgRateIn:2104/s  storageSize: 48GB' },
  { kind: 'topic',   text: '  audit-log        3 parts  msgRateIn: 421/s  storageSize: 18GB' },
  { kind: 'blank',   text: '' },
  { kind: 'georep',  text: '  eu-west-2 → us-east-1   lag: 1.4s  backlog:0  synced' },
  { kind: 'tier',    text: '  tiered-storage: segments >2d offloaded to s3  saved: 840GB' },
  { kind: 'metric',  text: '  total msgRate: 10946/s  throughput: 5.4GB/s  consumers: 84' },
  { kind: 'stat',    text: '  2 clusters  3 brokers  3 bookies  pulsar 3.3.1' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'broker':  return '#4ade80';
    case 'topic':   return '#67e8f9';
    case 'georep':  return '#a78bfa';
    case 'tier':    return '#fbbf24';
    case 'metric':  return 'rgba(240,239,255,0.5)';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    default:        return 'transparent';
  }
}

export default function PulsarPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveMsgRate, setLiveMsgRate] = useState(10946);
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
            setLiveMsgRate(9800 + Math.floor(Math.random() * 2400));
          }, 2100);
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
          construx@messaging — pulsar · multi-tenant · geo-replication · tiered-storage
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#67e8f9' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveMsgRate.toLocaleString()}/s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@messaging# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          pulsar · broker · bookkeeper · geo-replication · tiered-storage
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Pulsar 3.3.1 ·</span>
          <span style={{ color: '#4ade80' }}>3 brokers active</span>
          <span style={{ color: '#67e8f9' }}>{liveMsgRate.toLocaleString()}/s</span>
          <span style={{ color: '#a78bfa' }}>geo-synced</span>
          <span style={{ color: '#fbbf24' }}>s3 offload</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          pulsar · bookkeeper · geo-replication · tiered-storage · functions
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● producing' : 'loading'}
        </span>
      </div>
    </div>
  );
}
