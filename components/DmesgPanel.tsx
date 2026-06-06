'use client';

import { useEffect, useRef, useState } from 'react';

interface DmesgLine {
  ts: string;
  subsystem: string;
  msg: string;
  level: 'info' | 'warn' | 'ok' | 'notice';
  delay: number;
}

const LINES: DmesgLine[] = [
  { ts: '[    0.000000]', subsystem: 'KERNEL',   msg: 'Initializing cgroup subsys cpuset', level: 'info',   delay: 0 },
  { ts: '[    0.000000]', subsystem: 'KERNEL',   msg: 'Linux version construx-6.12.0-prod (gcc 14.2.0)', level: 'info', delay: 120 },
  { ts: '[    0.012847]', subsystem: 'ACPI',     msg: 'Core revision 20241213; functional level 0x20000', level: 'info',   delay: 260 },
  { ts: '[    0.384201]', subsystem: 'NET',       msg: 'Registered protocol family 2 (IPv4)', level: 'ok',    delay: 400 },
  { ts: '[    0.512039]', subsystem: 'NET',       msg: 'Registered protocol family 10 (IPv6)', level: 'ok',   delay: 520 },
  { ts: '[    1.038471]', subsystem: 'SCOUTR',    msg: 'venture registered — resell-intelligence runtime', level: 'ok',    delay: 680 },
  { ts: '[    1.103882]', subsystem: 'SCOUTR',    msg: 'price-delta daemon started, threshold=2.50%', level: 'notice', delay: 800 },
  { ts: '[    1.244011]', subsystem: 'MARQET',    msg: 'venture registered — ai-configurations marketplace', level: 'ok',    delay: 940 },
  { ts: '[    1.312490]', subsystem: 'MARQET',    msg: 'embedding pipeline online — model=claude-3-opus', level: 'notice', delay: 1060 },
  { ts: '[    1.489021]', subsystem: 'HYVE',      msg: 'venture registered — ai-native workspace runtime', level: 'ok',    delay: 1200 },
  { ts: '[    1.554730]', subsystem: 'HYVE',      msg: 'context-prune daemon started, interval=300s', level: 'notice', delay: 1340 },
  { ts: '[    1.703011]', subsystem: 'PGVECTOR',  msg: 'vector index online, dim=1536, method=hnsw', level: 'ok',    delay: 1480 },
  { ts: '[    1.801293]', subsystem: 'REDIS',     msg: 'cache warm, hit_ratio=0.94, eviction=lru', level: 'ok',    delay: 1600 },
  { ts: '[    1.944820]', subsystem: 'BULLMQ',    msg: '4 workers registered across 3 queues', level: 'notice', delay: 1740 },
  { ts: '[    2.032910]', subsystem: 'CLAUDE',    msg: 'API client initialised — quota OK — p50=312ms', level: 'ok',    delay: 1860 },
  { ts: '[    2.188447]', subsystem: 'AMPLIFY',   msg: 'edge deployed — 17 locations active', level: 'ok',    delay: 2000 },
  { ts: '[    2.301882]', subsystem: 'STRIPE',    msg: 'webhook listener active — sig verification OK', level: 'ok',    delay: 2140 },
  { ts: '[    2.448103]', subsystem: 'NET',       msg: 'db connection pool 8/20 healthy, latency p99=4ms', level: 'ok',    delay: 2280 },
  { ts: '[    2.600000]', subsystem: 'KERNEL',    msg: 'all subsystems nominal — construx runtime ready', level: 'ok',    delay: 2420 },
];

const LEVEL_COLORS = {
  info:   'rgba(240,239,255,0.3)',
  warn:   'rgba(234,179,8,0.75)',
  ok:     'rgba(74,222,128,0.75)',
  notice: 'rgba(103,232,249,0.7)',
};

const SUBSYS_WIDTH = 10;

export default function DmesgPanel() {
  const [revealed, setRevealed] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          setVisible(true);
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    LINES.forEach((line, idx) => {
      const t = setTimeout(() => setRevealed(idx + 1), line.delay);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  const done = revealed >= LINES.length;

  return (
    <div ref={ref} className="mx-auto max-w-5xl px-5">
      <div
        className="overflow-hidden font-mono"
        style={{
          background: 'rgba(0,0,6,0.98)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '3px',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.6), 0 20px 60px rgba(0,0,0,0.7)',
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 select-none"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57', boxShadow: '0 0 4px rgba(255,95,87,0.4)' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E', boxShadow: '0 0 4px rgba(255,189,46,0.3)' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840', boxShadow: '0 0 4px rgba(40,200,64,0.3)' }} />
          </div>
          <span
            className="flex-1 text-center text-[9px] uppercase tracking-[0.2em]"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            construx@sys — dmesg — kernel log
          </span>
          <span className="text-[8px] uppercase tracking-widest" style={{ color: done ? 'rgba(74,222,128,0.6)' : 'rgba(249,115,22,0.6)' }}>
            {done ? 'BOOT OK' : 'BOOTING'}
          </span>
        </div>

        {/* Shell prompt */}
        <div
          className="px-4 py-1.5 select-none"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
        >
          <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
          <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.2)' }}>
            dmesg --color=always --level=info,warn,notice | tail -n {LINES.length}
          </span>
        </div>

        {/* Log lines */}
        <div className="px-4 py-3 space-y-0.5 overflow-x-auto">
          {LINES.slice(0, revealed).map((line, i) => (
            <div
              key={i}
              className="flex items-baseline gap-2 text-[10px] leading-[1.6] whitespace-nowrap"
              style={{ opacity: i < revealed - 1 ? 0.7 : 1, transition: 'opacity 0.4s ease' }}
            >
              <span style={{ color: 'rgba(255,255,255,0.18)', flexShrink: 0 }}>{line.ts}</span>
              <span
                style={{
                  color: LEVEL_COLORS[line.level],
                  minWidth: `${SUBSYS_WIDTH}ch`,
                  flexShrink: 0,
                  fontWeight: 600,
                }}
              >
                {line.subsystem.padEnd(SUBSYS_WIDTH)}
              </span>
              <span style={{ color: LEVEL_COLORS[line.level], opacity: 0.85 }}>{line.msg}</span>
            </div>
          ))}

          {/* Blinking cursor */}
          {!done && (
            <div className="flex items-center gap-2 text-[10px] mt-1">
              <span style={{ color: 'rgba(255,255,255,0.18)' }}>{'[    ...     ]'}</span>
              <span
                className="inline-block w-2 h-3"
                style={{ background: 'rgba(74,222,128,0.7)', animation: 'blink 1s step-end infinite' }}
              />
            </div>
          )}
        </div>

        {/* Status footer */}
        <div
          className="flex items-center justify-between px-4 py-1.5 select-none"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,4,0.5)' }}
        >
          <div className="flex items-center gap-4">
            <span className="text-[8px] uppercase tracking-widest" style={{ color: done ? 'rgba(74,222,128,0.55)' : 'rgba(249,115,22,0.55)' }}>
              {revealed}/{LINES.length} lines
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.1)' }}>kernel 6.12.0-construx</span>
            <span className="text-[8px]" style={{ color: 'rgba(249,115,22,0.3)' }}>construx@sys</span>
          </div>
        </div>
      </div>
    </div>
  );
}
