'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'info' | 'bench' | 'mem' | 'cmd' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# dragonfly: redis-compatible, multi-threaded, 25-80% less memory' },
  { kind: 'prompt',  text: 'redis-cli -h dragonfly:6379 INFO server | grep -E "version|threads|memory"' },
  { kind: 'info',    text: '  redis_version:7.0.0   dragonfly_version:1.19.0' },
  { kind: 'info',    text: '  connected_threads:16  used_memory_human:1.24G' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# throughput benchmark vs single-threaded Redis' },
  { kind: 'prompt',  text: 'redis-benchmark -h dragonfly:6379 -t get,set -n 1000000 -c 100 -q' },
  { kind: 'bench',   text: '  SET: 2847192.00 requests/s  (Redis equiv: ~198k/s)' },
  { kind: 'bench',   text: '  GET: 3012847.00 requests/s  (Redis equiv: ~201k/s)' },
  { kind: 'bench',   text: '  ×15 throughput on the same hardware' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# set/get/zadd — API is 100% Redis-compatible' },
  { kind: 'prompt',  text: 'redis-cli -h dragonfly:6379 SET user:12345:session "abc123" EX 3600' },
  { kind: 'cmd',     text: '  OK  (TTL: 3600s)' },
  { kind: 'prompt',  text: 'redis-cli -h dragonfly:6379 ZADD leaderboard 1200 carol 1000 alice 800 bob' },
  { kind: 'cmd',     text: '  (integer) 3  →  ZREVRANGE top-3: carol 1200 · alice 1000 · bob 800' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# memory efficiency: dashtable vs redis dict' },
  { kind: 'mem',     text: '  1M keys × 100B  →  Redis: 220MB  Dragonfly: 140MB  (36% less)' },
  { kind: 'stat',    text: '  maxmemory: 8GB  policy: allkeys-lru  evictions: 0' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'info':    return '#67e8f9';
    case 'bench':   return '#4ade80';
    case 'mem':     return '#fbbf24';
    case 'cmd':     return '#a78bfa';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    default:        return 'transparent';
  }
}

export default function DragonflyPanel() {
  const [revealed,   setRevealed]   = useState(0);
  const [liveOps,    setLiveOps]    = useState(2847);
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
            setLiveOps(2600 + Math.floor(Math.random() * 400));
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
          construx@prod-eu — dragonfly · redis-compatible · dashtable
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveOps.toLocaleString()}k ops/s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-eu# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          dragonfly · redis · dashtable · multi-thread · benchmark
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Dragonfly 1.19 ·</span>
          <span style={{ color: '#4ade80' }}>{liveOps.toLocaleString()}k ops/s</span>
          <span style={{ color: '#67e8f9' }}>16 threads</span>
          <span style={{ color: '#fbbf24' }}>36% less mem</span>
          <span style={{ color: '#a78bfa' }}>Redis-compat</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          dragonfly · redis · dashtable · lru · fibers · multi-thread
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● serving' : 'loading'}
        </span>
      </div>
    </div>
  );
}
