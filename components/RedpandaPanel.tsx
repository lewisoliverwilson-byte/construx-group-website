'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'topic' | 'produce' | 'consume' | 'lag' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# redpanda: kafka-compatible streaming — no JVM, no ZooKeeper' },
  { kind: 'prompt',  text: 'rpk cluster info' },
  { kind: 'stat',    text: '  cluster: construx-prod  brokers: 3  raft: healthy' },
  { kind: 'stat',    text: '  version: 24.1.2  uptime: 14d 7h 32m  leader: broker-1' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# topic metadata and partition distribution' },
  { kind: 'prompt',  text: 'rpk topic describe construx.events --print-partitions' },
  { kind: 'topic',   text: '  PARTITION  LEADER  REPLICAS    HW-OFFSET' },
  { kind: 'topic',   text: '  0          1       [1, 2, 3]   18472' },
  { kind: 'topic',   text: '  4          2       [2, 3, 1]   19103' },
  { kind: 'topic',   text: '  8          3       [3, 1, 2]   21847' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# produce and consume — rpk replaces kafka-console scripts' },
  { kind: 'prompt',  text: 'echo \'{"event":"checkout","user":12345}\' | rpk topic produce construx.events' },
  { kind: 'produce', text: '  offset: 18473  partition: 4  bytes: 42' },
  { kind: 'prompt',  text: 'rpk topic consume construx.events --num 1' },
  { kind: 'consume', text: '  {"event":"checkout","user":12345}  key=user:12345  ts=2033-03-14T09:01:00Z' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# consumer group lag — is processing keeping up?' },
  { kind: 'prompt',  text: 'rpk group describe construx-checkout-processor' },
  { kind: 'lag',     text: '  construx.events p0  committed: 18471  latest: 18473  lag: 2' },
  { kind: 'lag',     text: '  construx.events p4  committed: 19101  latest: 19103  lag: 2' },
  { kind: 'stat',    text: '  throughput: 142k msgs/s  p99 write latency: 3ms' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'topic':   return '#67e8f9';
    case 'produce': return '#4ade80';
    case 'consume': return '#a78bfa';
    case 'lag':     return '#fbbf24';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    default:        return 'transparent';
  }
}

export default function RedpandaPanel() {
  const [revealed,     setRevealed]     = useState(0);
  const [liveThroughput, setLiveThroughput] = useState(142);
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
            setLiveThroughput(130 + Math.floor(Math.random() * 25));
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
          construx@prod-eu — redpanda · kafka · rpk · streaming
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveThroughput}k msg/s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-eu# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          redpanda · rpk · topics · consumer-groups · lag · raft
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Redpanda 24.1 ·</span>
          <span style={{ color: '#4ade80' }}>{liveThroughput}k msgs/s</span>
          <span style={{ color: '#67e8f9' }}>3 brokers</span>
          <span style={{ color: '#fbbf24' }}>lag 2</span>
          <span style={{ color: '#a78bfa' }}>p99 3ms</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          redpanda · kafka · rpk · raft · seastar · schema-registry
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● streaming' : 'loading'}
        </span>
      </div>
    </div>
  );
}
