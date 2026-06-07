'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'policy' | 'exec' | 'connect' | 'file' | 'kill' | 'alert' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# tetragon: ebpf runtime security — kernel-level observe and enforce' },
  { kind: 'prompt',   text: 'tetra getevents --namespace construx-prod --output compact' },
  { kind: 'exec',     text: '  09:14:22Z  🚀 exec     construx-api  /usr/bin/node server.js' },
  { kind: 'connect',  text: '  09:14:22Z  🌐 connect  construx-api  tcp 10.0.5.2 → 10.0.10.4:5432' },
  { kind: 'file',     text: '  09:14:23Z  📁 open     construx-api  /tmp/upload-3b8f.tmp  (O_RDWR)' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# tracing policy: protect-etc-passwd — enforcing (action: Sigkill)' },
  { kind: 'policy',   text: '  kprobe: security_file_open → match prefix /etc/shadow → Sigkill' },
  { kind: 'exec',     text: '  09:14:55Z  🚀 exec     construx-api  /bin/sh -c cat /etc/shadow' },
  { kind: 'kill',     text: '  09:14:55Z  💥 kill     construx-api  SIGKILL  policy: protect-etc-passwd' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# privilege escalation attempt detected and blocked' },
  { kind: 'policy',   text: '  kprobe: sys_setuid → match arg=0 (root) → Sigkill' },
  { kind: 'alert',    text: '  09:15:02Z  🔑 setuid   construx-api  uid 1000→0  PRIV-ESCALATION' },
  { kind: 'kill',     text: '  09:15:02Z  💥 kill     construx-api  SIGKILL  policy: detect-setuid' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# network observability — egress connections from construx-prod' },
  { kind: 'connect',  text: '  09:15:10Z  🌐 connect  construx-api  10.0.5.2 → 10.0.10.4:5432  (pg)' },
  { kind: 'connect',  text: '  09:15:11Z  🌐 connect  construx-api  10.0.5.2 → 10.0.8.2:6379   (dragonfly)' },
  { kind: 'connect',  text: '  09:15:12Z  🌐 connect  construx-api  10.0.5.2 → 10.0.12.1:9092  (redpanda)' },
  { kind: 'stat',     text: '  4 tracingpolicies  3 enforcing  1 audit  events: 12/s' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'policy':   return '#a78bfa';
    case 'exec':     return '#4ade80';
    case 'connect':  return '#67e8f9';
    case 'file':     return '#fbbf24';
    case 'kill':     return '#f87171';
    case 'alert':    return '#fb923c';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function TetragonPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveEvents,  setLiveEvents]  = useState(12);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);
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
            setLiveEvents(9 + Math.floor(Math.random() * 7));
          }, 2300);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 82;
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
          construx@security — tetragon · ebpf · runtime · enforcement
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#f87171' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveEvents} events/s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@security# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          tetragon · tracingpolicy · kprobe · sigkill · lsm · ebpf-enforce
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Tetragon 1.2 ·</span>
          <span style={{ color: '#f87171' }}>{liveEvents} events/s</span>
          <span style={{ color: '#a78bfa' }}>4 policies</span>
          <span style={{ color: '#4ade80' }}>process lifecycle</span>
          <span style={{ color: '#67e8f9' }}>network observe</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          tetragon · ebpf · tracingpolicy · sigkill · kprobe · runtime-security
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#f87171' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● enforcing' : 'loading'}
        </span>
      </div>
    </div>
  );
}
