'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind =
  | 'prompt'
  | 'comment'
  | 'probe'
  | 'header'
  | 'trace-hit'
  | 'histogram-label'
  | 'histogram-bar'
  | 'histogram-total'
  | 'summary'
  | 'blank';

interface EbpfLine {
  kind:  LineKind;
  text:  string;
  delay?: number;
}

const LINES: EbpfLine[] = [
  { kind: 'prompt',  text: 'construx@prod-01:~# bpftrace -e \'tracepoint:syscalls:sys_enter_read { @reads[comm] = count(); } interval:s:5 { print(@reads); clear(@reads); }\'' },
  { kind: 'comment', text: '# Attaching 2 probes...' },
  { kind: 'blank',   text: '' },
  { kind: 'header',  text: '@reads:' },
  { kind: 'trace-hit', text: 'postgres                  14827' },
  { kind: 'trace-hit', text: 'construx-api               8241' },
  { kind: 'trace-hit', text: 'redis-server               5103' },
  { kind: 'trace-hit', text: 'node                       2887' },
  { kind: 'trace-hit', text: 'caddy                       441' },
  { kind: 'blank',   text: '' },
  { kind: 'prompt',  text: 'construx@prod-01:~# bpftrace -e \'tracepoint:syscalls:sys_enter_read { @start[tid]=nsecs; } tracepoint:syscalls:sys_exit_read { @usecs=hist((nsecs-@start[tid])/1000); } interval:s:10 { exit(); }\'' },
  { kind: 'comment', text: '# Attaching 3 probes... sampling read() latency for 10s' },
  { kind: 'blank',   text: '' },
  { kind: 'histogram-label', text: '@usecs:' },
  { kind: 'histogram-bar',   text: '[0]               4012 |@@@@@@@@@@@@@@@@@@@@@@@@@              |' },
  { kind: 'histogram-bar',   text: '[1]               6883 |@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@|' },
  { kind: 'histogram-bar',   text: '[2, 4)            3741 |@@@@@@@@@@@@@@@@@@@@@@                 |' },
  { kind: 'histogram-bar',   text: '[4, 8)            1822 |@@@@@@@@@@@                            |' },
  { kind: 'histogram-bar',   text: '[8, 16)            447 |@@                                     |' },
  { kind: 'histogram-bar',   text: '[16, 32)           103 |                                       |' },
  { kind: 'histogram-bar',   text: '[32, 64)            28 |                                       |' },
  { kind: 'histogram-bar',   text: '[64, 128)            7 |                                       |' },
  { kind: 'histogram-bar',   text: '[128, 256)           2 |                                       |' },
  { kind: 'blank',   text: '' },
  { kind: 'prompt',  text: 'construx@prod-01:~# bpftrace -e \'kprobe:tcp_connect { $sk=(struct sock*)arg0; printf("%-6d %-18s -> %s:%d\\n", pid, comm, ntop(AF_INET,$sk->__sk_common.skc_daddr),$sk->__sk_common.skc_dport>>8); }\'' },
  { kind: 'comment', text: '# Attaching 1 probe... tracing outbound TCP connections' },
  { kind: 'blank',   text: '' },
  { kind: 'header',  text: 'PID    COMM               DEST' },
  { kind: 'trace-hit', text: '18241  construx-api       10.0.0.5:5432' },
  { kind: 'trace-hit', text: '18241  construx-api       10.0.0.20:6379' },
  { kind: 'trace-hit', text: '18244  node               104.21.8.11:443' },
  { kind: 'trace-hit', text: '18241  construx-api       10.0.0.5:5432' },
  { kind: 'trace-hit', text: '18249  caddy              172.64.80.1:443' },
  { kind: 'trace-hit', text: '18241  construx-api       10.0.0.20:6379' },
  { kind: 'blank',   text: '' },
  { kind: 'summary', text: '3 probes attached · read() p50 < 1µs · p99 32µs · no retransmits observed' },
];

const TOTAL = LINES.length + 2;

function lineColor(kind: LineKind): string {
  switch (kind) {
    case 'prompt':           return 'rgba(240,239,255,0.55)';
    case 'comment':          return 'rgba(240,239,255,0.22)';
    case 'probe':            return '#a78bfa';
    case 'header':           return 'rgba(240,239,255,0.35)';
    case 'trace-hit':        return '#4ade80';
    case 'histogram-label':  return 'rgba(240,239,255,0.35)';
    case 'histogram-bar':    return 'rgba(74,222,128,0.65)';
    case 'histogram-total':  return 'rgba(240,239,255,0.3)';
    case 'summary':          return '#fbbf24';
    default:                 return 'transparent';
  }
}

function promptColor(text: string): { prompt: string; cmd: string } {
  if (text.startsWith('construx@')) {
    const idx = text.indexOf('# ');
    return {
      prompt: text.slice(0, idx + 2),
      cmd:    text.slice(idx + 2),
    };
  }
  return { prompt: '', cmd: text };
}

export default function EbpfTracePanel() {
  const [revealed, setRevealed] = useState(0);
  const [liveHit,  setLiveHit]  = useState(14827);
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
            setLiveHit(Math.floor(13000 + Math.random() * 4000));
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
    const line = LINES[revealed - 1];
    const delay = line?.delay ?? (line?.kind === 'blank' ? 35 : 80);
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
          construx@prod-01 — bpftrace kernel tracing
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.25)' }}>
          {allDone ? `LIVE postgres reads: ${liveHit.toLocaleString()}/5s` : 'attaching probes…'}
        </span>
      </div>

      {/* Content */}
      <div className="px-4 pt-3 pb-2">
        {shownLines.map((line, i) => {
          if (line.kind === 'blank') return <div key={i} className="h-2" />;
          if (line.kind === 'prompt') {
            const { prompt, cmd } = promptColor(line.text);
            return (
              <div key={i} className="text-[7.5px] leading-[1.75] break-all">
                <span style={{ color: 'rgba(74,222,128,0.5)' }}>{prompt}</span>
                <span style={{ color: 'rgba(240,239,255,0.5)' }}>{cmd}</span>
              </div>
            );
          }
          return (
            <div
              key={i}
              className="text-[7.5px] leading-[1.75]"
              style={{ color: lineColor(line.kind) }}
            >
              {line.text}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          linux 6.11.0 · ebpf · bpftrace 0.21.4 · kernel tracing
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● 3 probes active' : 'loading'}
        </span>
      </div>
    </div>
  );
}
