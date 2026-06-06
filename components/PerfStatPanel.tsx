'use client';

import { useState, useEffect, useRef } from 'react';

interface PerfCounter {
  value:    number;
  unit:     string;
  event:    string;
  metric?:  string;
  mval?:    number;
  munit?:   string;
}

const BASE_COUNTERS: PerfCounter[] = [
  { value: 999.71,    unit: 'msec', event: 'task-clock',                metric: 'CPUs utilised',          mval: 1.003, munit: '' },
  { value: 3842,      unit: '',     event: 'context-switches',           metric: 'K/sec',                  mval: 3.843, munit: 'K/sec' },
  { value: 0,         unit: '',     event: 'cpu-migrations',             metric: 'K/sec',                  mval: 0.000, munit: 'K/sec' },
  { value: 25914,     unit: '',     event: 'page-faults',                metric: 'K/sec',                  mval: 25.92, munit: 'K/sec' },
  { value: 3801284817,unit: '',     event: 'cycles',                     metric: 'GHz',                    mval: 3.802, munit: 'GHz' },
  { value: 892441020, unit: '',     event: 'stalled-cycles-frontend',    metric: 'frontend cycles idle',   mval: 23.48, munit: '%' },
  { value: 441882004, unit: '',     event: 'stalled-cycles-backend',     metric: 'backend cycles idle',    mval: 11.63, munit: '%' },
  { value: 8114293441,unit: '',     event: 'instructions',               metric: 'insn per cycle',         mval: 2.14,  munit: '' },
  { value: 1642881002,unit: '',     event: 'branches',                   metric: 'G/sec',                  mval: 1.643, munit: 'G/sec' },
  { value: 14882041,  unit: '',     event: 'branch-misses',              metric: 'of all branches',        mval: 0.91,  munit: '%' },
  { value: 224441823, unit: '',     event: 'cache-references',           metric: 'M/sec',                  mval: 224.5, munit: 'M/sec' },
  { value: 8841203,   unit: '',     event: 'cache-misses',               metric: 'of all cache refs',      mval: 3.94,  munit: '%' },
];

function fmtVal(v: number, event: string): string {
  if (event === 'task-clock') return v.toFixed(2);
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(3) + 'B';
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(3) + 'M';
  if (v >= 1_000)     return v.toLocaleString('en');
  return v.toFixed(0);
}

function eventColor(event: string): string {
  if (event.startsWith('cache'))   return '#f87171';
  if (event.startsWith('branch'))  return '#fbbf24';
  if (event.startsWith('stalled')) return '#fb923c';
  if (event === 'cycles')          return '#a78bfa';
  if (event === 'instructions')    return '#4ade80';
  if (event === 'task-clock')      return '#67e8f9';
  return 'rgba(240,239,255,0.5)';
}

function metricColor(event: string, munit: string): string {
  if (munit === '%' && event.includes('miss')) return '#f87171';
  if (munit === '%') return '#fbbf24';
  if (event === 'instructions') return '#4ade80';
  return 'rgba(240,239,255,0.35)';
}

export default function PerfStatPanel() {
  const [counters, setCounters] = useState<PerfCounter[]>([]);
  const [revealed, setRevealed] = useState(0);
  const [elapsed,  setElapsed]  = useState(1.001);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setCounters(BASE_COUNTERS);
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > BASE_COUNTERS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 80);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= BASE_COUNTERS.length) return;
    const id = setInterval(() => {
      setCounters((prev) =>
        prev.map((c) => {
          const jitter = 1 + (Math.random() - 0.5) * 0.003;
          return { ...c, value: Math.round(c.value * jitter), mval: c.mval ? +(c.mval * jitter).toFixed(2) : undefined };
        }),
      );
      setElapsed((e) => +(e + 1.001).toFixed(3));
    }, 2400);
    return () => clearInterval(id);
  }, [revealed]);

  const allDone  = revealed > BASE_COUNTERS.length;
  const displayed = allDone ? counters : BASE_COUNTERS.slice(0, revealed);

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
          construx@sys — perf stat
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${elapsed.toFixed(3)}s` : 'profiling…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          perf stat -a sleep 1
        </span>
      </div>

      {/* Header */}
      <div className="px-4 pt-2 pb-1">
        <span className="text-[8px]" style={{ color: 'rgba(240,239,255,0.18)' }}>
          Performance counter stats for &apos;system wide&apos;:
        </span>
      </div>

      {/* Counters */}
      <div className="px-4 pb-2 space-y-0.5">
        {displayed.map((c, i) => (
          <div key={i} className="flex items-baseline gap-2 text-[8px]">
            <span
              className="tabular-nums text-right"
              style={{ color: eventColor(c.event), minWidth: '88px', flexShrink: 0 }}
            >
              {fmtVal(c.value, c.event)}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.22)', minWidth: '32px', flexShrink: 0 }}>
              {c.unit}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.55)', minWidth: '200px', flexShrink: 0 }}>
              {c.event}
            </span>
            {c.mval !== undefined && (
              <span style={{ color: metricColor(c.event, c.munit ?? ''), opacity: 0.8 }}>
                {'#  '}{c.mval}{c.munit ? ` ${c.munit}` : ''}{c.metric ? ` ${c.metric}` : ''}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Elapsed */}
      {allDone && (
        <div className="px-4 pt-1 pb-2">
          <span className="text-[8px]" style={{ color: 'rgba(240,239,255,0.22)' }}>
            {elapsed.toFixed(3)} seconds time elapsed
          </span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          12 counters · system-wide · perf 6.8 · kernel 6.8.4
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● live' : 'sampling'}
        </span>
      </div>
    </div>
  );
}
