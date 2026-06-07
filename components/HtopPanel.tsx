'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'header' | 'proc-hot' | 'proc-mid' | 'proc-low' | 'bar-cpu' | 'bar-mem' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',   text: '# btop: real-time process monitor — CPU, memory, I/O, network' },
  { kind: 'prompt',    text: 'btop --utf-force' },
  { kind: 'bar-cpu',   text: 'CPU  ▐███████████████████▌░░░░░░▌  68.4%  8 cores  load: 4.12 3.87 3.91' },
  { kind: 'bar-mem',   text: 'MEM  ▐████████████████░░░░░░░░░░▌  54.2%  13.8/25.6 GiB  swap: 0%' },
  { kind: 'blank',     text: '' },
  { kind: 'header',    text: '  PID   CPU%   MEM%   VIRT     RES      User      Command' },
  { kind: 'proc-hot',  text: ' 1847   38.2    8.4   2.1G   2.2G   construx  construx-api' },
  { kind: 'proc-hot',  text: ' 3241   18.7    4.1   1.4G   1.1G   postgres  postgres: autovacuum' },
  { kind: 'proc-mid',  text: ' 2198    9.4    2.1   512M   547M   construx  construx-worker' },
  { kind: 'proc-mid',  text: ' 4412    7.1    1.8   384M   461M   root      kube-proxy' },
  { kind: 'proc-mid',  text: ' 5523    5.2    1.4   298M   358M   root      kubelet' },
  { kind: 'proc-low',  text: ' 6634    2.3    0.8   192M   212M   root      containerd' },
  { kind: 'proc-low',  text: ' 7745    1.8    0.6   148M   156M   root      cilium-agent' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# ps with custom format — find a process by name' },
  { kind: 'prompt',    text: 'ps aux --sort=-%cpu | awk \'NR==1 || /construx/\'' },
  { kind: 'stat',      text: 'USER     PID   %CPU  %MEM    VSZ    RSS   STAT  COMMAND' },
  { kind: 'proc-hot',  text: 'construx 1847  38.2   8.4  2146312 2240128  Sl  /usr/local/bin/construx-api' },
  { kind: 'proc-mid',  text: 'construx 2198   9.4   2.1   524288  560128  S   /usr/local/bin/construx-worker' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# pidstat: per-process I/O stats (1s interval)' },
  { kind: 'prompt',    text: 'pidstat -d 1 3' },
  { kind: 'stat',      text: 'PID   kB_rd/s   kB_wr/s  Command' },
  { kind: 'proc-hot',  text: '3241    124.8     241.6   postgres (WAL writes dominant)' },
  { kind: 'proc-mid',  text: '1847      8.4      14.2   construx-api' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'header':   return 'rgba(240,239,255,0.4)';
    case 'proc-hot': return '#f87171';
    case 'proc-mid': return '#fbbf24';
    case 'proc-low': return '#67e8f9';
    case 'bar-cpu':  return '#4ade80';
    case 'bar-mem':  return '#a78bfa';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function HtopPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [liveCpu,   setLiveCpu]   = useState(68.4);
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
            setLiveCpu(Math.round((55 + Math.random() * 25) * 10) / 10);
          }, 1900);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 79;
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
          construx@prod-01 — btop · real-time process monitor
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveCpu}% cpu` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          btop · ps aux · pidstat · CPU + MEM + I/O per process
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>btop 1.3 ·</span>
          <span style={{ color: '#4ade80' }}>{liveCpu}% cpu</span>
          <span style={{ color: '#a78bfa' }}>54% mem 13.8 GiB</span>
          <span style={{ color: '#f87171' }}>construx-api top proc</span>
          <span style={{ color: '#fbbf24' }}>postgres WAL I/O</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          btop 1.3 · ps aux · pidstat · sort by CPU · I/O per process
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● monitoring' : 'loading'}
        </span>
      </div>
    </div>
  );
}
