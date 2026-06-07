'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'job' | 'source' | 'window' | 'sink' | 'checkpoint' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',    text: '# apache flink: stateful stream processing — exactly-once, low latency' },
  { kind: 'prompt',     text: 'flink list --running -m jobmanager.construx.internal:8081' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# running jobs: fraud detector + real-time analytics aggregator' },
  { kind: 'job',        text: '  a4b2c8d9  construx-fraud-detector     RUNNING  since 2033-08-14' },
  { kind: 'job',        text: '  b5c3d9e0  construx-realtime-analytics  RUNNING  since 2033-08-14' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# fraud-detector: kafka source → keyBy(tenant_id) → 60s tumbling window' },
  { kind: 'source',     text: '  source: construx.cdc.public.orders (kafka)  watermark: 5s bounded' },
  { kind: 'window',     text: '  TumblingEventTimeWindows 60s  aggregate: OrderCountAggregate' },
  { kind: 'sink',       text: '  sink: construx.alerts.fraud (kafka)  delivery: EXACTLY_ONCE' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# checkpointing: snapshot state to S3 every 30s' },
  { kind: 'checkpoint', text: '  checkpoint #3821  duration: 1.24s  size: 272MB  state: s3://construx-flink' },
  { kind: 'checkpoint', text: '  tolerance: 3 failures  mode: EXACTLY_ONCE  min-pause: 10s' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# job metrics' },
  { kind: 'metric',     text: '  records-in: 48.3k/s  records-out: 0.2/s (alerts)  lag: 0ms' },
  { kind: 'stat',       text: '  parallelism: 8  taskmanagers: 4  heap: 12GB  checkpoint: OK' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':    return 'rgba(240,239,255,0.22)';
    case 'prompt':     return 'rgba(240,239,255,0.6)';
    case 'job':        return '#4ade80';
    case 'source':     return '#67e8f9';
    case 'window':     return '#a78bfa';
    case 'sink':       return '#fbbf24';
    case 'checkpoint': return 'rgba(240,239,255,0.55)';
    case 'metric':     return 'rgba(240,239,255,0.5)';
    case 'stat':       return 'rgba(240,239,255,0.45)';
    default:           return 'transparent';
  }
}

export default function FlinkPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveRecords, setLiveRecords] = useState(48.3);
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
            setLiveRecords(parseFloat((45 + Math.random() * 7).toFixed(1)));
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
          construx@streaming — flink · stateful · exactly-once · windows · kafka
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveRecords}k/s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@streaming# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          flink · stateful-stream · exactly-once · tumbling-window · checkpoint · kafka
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Flink 1.20 ·</span>
          <span style={{ color: '#4ade80' }}>{liveRecords}k rec/s</span>
          <span style={{ color: '#67e8f9' }}>kafka source</span>
          <span style={{ color: '#a78bfa' }}>60s window</span>
          <span style={{ color: '#fbbf24' }}>exactly-once</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          flink · stateful · exactly-once · jobmanager · taskmanager · checkpoint
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● running' : 'loading'}
        </span>
      </div>
    </div>
  );
}
