'use client';

import { useState, useEffect, useRef } from 'react';

interface TraceRow {
  usec:    string;
  count:   number;
  bar:     number; // 0–40 chars
}

const HIST: TraceRow[] = [
  { usec: '[0, 1)',       count:    4, bar:  1 },
  { usec: '[1, 2)',       count:   18, bar:  2 },
  { usec: '[2, 4)',       count:   91, bar:  5 },
  { usec: '[4, 8)',       count:  342, bar: 12 },
  { usec: '[8, 16)',      count: 1 847, bar: 24 },
  { usec: '[16, 32)',     count: 4 211, bar: 36 },
  { usec: '[32, 64)',     count: 3 804, bar: 34 },
  { usec: '[64, 128)',    count: 1 093, bar: 18 },
  { usec: '[128, 256)',   count:  312, bar: 10 },
  { usec: '[256, 512)',   count:   88, bar:  6 },
  { usec: '[512, 1K)',    count:   22, bar:  3 },
  { usec: '[1K, 2K)',     count:    7, bar:  2 },
  { usec: '[2K, 4K)',     count:    2, bar:  1 },
];

interface ProbeRow {
  probe: string;
  count: number;
  live:  boolean;
}

const PROBES: ProbeRow[] = [
  { probe: 'kprobe:tcp_v4_connect',              count:  2 041, live: false },
  { probe: 'kprobe:tcp_close',                   count:  1 988, live: false },
  { probe: 'tracepoint:syscalls:sys_enter_read', count: 48 812, live: true  },
  { probe: 'tracepoint:syscalls:sys_exit_read',  count: 48 801, live: true  },
  { probe: 'uprobe:/usr/bin/node:uv_fs_open',    count:    914, live: false },
  { probe: 'uprobe:/usr/bin/node:uv_fs_stat',    count:    403, live: false },
  { probe: 'kprobe:do_sys_openat2',              count:  1 317, live: false },
];

function barStr(n: number, color: string): JSX.Element {
  return (
    <span>
      <span style={{ color }}>{'█'.repeat(n)}</span>
      <span style={{ color: 'rgba(255,255,255,0.07)' }}>{'░'.repeat(40 - n)}</span>
    </span>
  );
}

function barColor(bar: number): string {
  if (bar >= 30) return '#f87171';
  if (bar >= 18) return '#fbbf24';
  if (bar >= 8)  return '#4ade80';
  return 'rgba(96,165,250,0.6)';
}

const TOTAL = HIST.length + PROBES.length;

export default function BpftracePanel() {
  const [revealed, setRevealed] = useState(0);
  const [liveCounts, setLiveCounts] = useState<Record<number, number>>({});
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 86);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= TOTAL) return;
    const id = setInterval(() => {
      setLiveCounts((prev) => {
        const next = { ...prev };
        PROBES.forEach((p, i) => {
          if (p.live) next[i] = (prev[i] ?? p.count) + Math.floor(Math.random() * 80);
        });
        return next;
      });
    }, 1900);
    return () => clearInterval(id);
  }, [revealed]);

  const allDone   = revealed > TOTAL;
  const shownHist  = HIST.slice(0, Math.max(0, Math.min(HIST.length, revealed)));
  const shownProbes = PROBES.slice(0, Math.max(0, Math.min(PROBES.length, revealed - HIST.length)));

  const totalEvents = HIST.reduce((s, r) => s + r.count, 0);
  const p50 = HIST[5]; // [16, 32) — rough median

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
          construx@sys — bpftrace latency.bt
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${totalEvents.toLocaleString()} events` : 'tracing…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          sudo bpftrace -e {'\''}kprobe:vfs_read { @usecs = hist(nsecs/1000); }{'\''}
        </span>
      </div>

      {/* Script info */}
      {revealed > 0 && (
        <div className="px-4 py-1 text-[8px] select-none" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}>
          Attaching 1 probe… <span style={{ color: 'rgba(74,222,128,0.5)' }}>OK</span>
          {'  '}pid filter: construx-api · interval: 10s
        </div>
      )}

      {/* Histogram */}
      {shownHist.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — @usecs: vfs_read latency (µs)
          </div>
          {shownHist.map((row, i) => (
            <div key={i} className="flex items-center text-[8px] leading-[1.55] gap-2">
              <span style={{ color: 'rgba(240,239,255,0.35)', minWidth: '80px', flexShrink: 0 }}>
                {row.usec}
              </span>
              <span style={{ color: 'rgba(240,239,255,0.35)', minWidth: '52px', flexShrink: 0, textAlign: 'right' }}>
                {row.count.toLocaleString()}
              </span>
              <span className="ml-1">
                {barStr(row.bar, barColor(row.bar))}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Probe counts */}
      {shownProbes.length > 0 && (
        <div className="px-4 py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — probe hit counts
          </div>
          {shownProbes.map((p, i) => (
            <div key={i} className="flex items-center text-[8px] leading-[1.65] gap-2">
              <span style={{ color: p.live ? '#4ade80' : 'rgba(96,165,250,0.5)', minWidth: '8px', flexShrink: 0 }}>
                {p.live ? '●' : '○'}
              </span>
              <span style={{ color: 'rgba(240,239,255,0.45)', minWidth: '288px', flexShrink: 0 }}>
                {p.probe}
              </span>
              <span style={{ color: p.live ? '#4ade80' : 'rgba(240,239,255,0.3)', fontWeight: 700, tabularNums: true } as React.CSSProperties}>
                {(liveCounts[i] ?? p.count).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Cursor */}
      {allDone && (
        <div className="px-4 text-[8px]" style={{ color: 'rgba(74,222,128,0.3)' }}>▌</div>
      )}

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-4 px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span>{totalEvents.toLocaleString()} samples</span>
          <span>p50 ≈ {p50.usec} µs</span>
          <span>{PROBES.length} probes attached</span>
          <span className="ml-auto" style={{ color: 'rgba(74,222,128,0.4)' }}>kernel 6.8.0-construx</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          bpftrace 0.21.2 · eBPF · kprobe + tracepoint + uprobe
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● attached' : 'loading'}
        </span>
      </div>
    </div>
  );
}
