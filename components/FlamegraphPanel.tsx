'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'frame-hot' | 'frame-mid' | 'frame-cold' | 'stat' | 'warn' | 'ok' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',    text: '# Flamegraph: perf record → stack collapse → flamegraph.pl SVG' },
  { kind: 'prompt',     text: 'perf record -F 999 -g -p $(pgrep construx-api) -- sleep 30' },
  { kind: 'stat',       text: '[ perf record: Woken up 1 times to write data ]' },
  { kind: 'stat',       text: '[ perf record: Captured and wrote 14.832 MB perf.data (38,241 samples) ]' },
  { kind: 'blank',      text: '' },
  { kind: 'prompt',     text: 'perf script | stackcollapse-perf.pl | flamegraph.pl > flame.svg' },
  { kind: 'ok',         text: 'wrote flame.svg  (2.1 MiB, 38241 samples, 1847 frames)' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# Text flamegraph via inferno-flamegraph — sorted by self time' },
  { kind: 'prompt',     text: 'perf script | inferno-collapse-perf | inferno-flamegraph --textmode' },
  { kind: 'frame-hot',  text: '████████████ runtime.gcBgMarkWorker  (31.4%)  ← GC mark phase, not app code' },
  { kind: 'frame-hot',  text: '████████     construx/db.(*Pool).query  (19.8%)  ← hot path: db round-trips' },
  { kind: 'frame-mid',  text: '██████       encoding/json.Marshal  (14.2%)  ← JSON alloc in hot loop' },
  { kind: 'frame-mid',  text: '████         net/http.(*conn).readRequest  (9.7%)' },
  { kind: 'frame-cold', text: '███          construx/cache.(*LRU).Get  (7.1%)' },
  { kind: 'frame-cold', text: '██           runtime.mallocgc  (5.3%)  ← allocator pressure' },
  { kind: 'frame-cold', text: '█            construx/orders.(*Handler).ServeHTTP  (3.1%)' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# Differential flamegraph: before vs after — show regressions' },
  { kind: 'prompt',     text: 'difffolded.pl before.folded after.folded | flamegraph.pl > diff.svg' },
  { kind: 'warn',       text: 'REGRESSED: encoding/json.Marshal  +8.1%  (commit c3d4e5f introduced struct tags)' },
  { kind: 'ok',         text: 'IMPROVED:  construx/db.(*Pool).query  -4.2%  (connection pool sizing fixed)' },
  { kind: 'blank',      text: '' },
  { kind: 'comment',    text: '# Off-CPU flamegraph — where is time spent waiting (locks, I/O, sleep)' },
  { kind: 'prompt',     text: 'offcputime-bpfcc -df -p $(pgrep construx-api) 30 | flamegraph.pl > offcpu.svg' },
  { kind: 'frame-hot',  text: '████████████ futex_wait  (44.1%)  ← mutex contention in connection pool' },
  { kind: 'frame-mid',  text: '██████       tcp_recvmsg  (18.7%)  ← waiting on postgres responses' },
  { kind: 'frame-cold', text: '████         epoll_wait  (12.3%)  ← idle event loop wait (expected)' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':    return 'rgba(240,239,255,0.22)';
    case 'prompt':     return 'rgba(240,239,255,0.6)';
    case 'frame-hot':  return '#f87171';
    case 'frame-mid':  return '#fbbf24';
    case 'frame-cold': return '#67e8f9';
    case 'stat':       return 'rgba(240,239,255,0.45)';
    case 'warn':       return '#f87171';
    case 'ok':         return '#4ade80';
    default:           return 'transparent';
  }
}

export default function FlamegraphPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveSamples, setLiveSamples] = useState(38241);
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
            setLiveSamples(35000 + Math.floor(Math.random() * 6000));
          }, 2200);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 81;
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
          construx@dev — flamegraph · perf record → stack collapse → SVG
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveSamples.toLocaleString()} samples` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@dev# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          perf record · flamegraph.pl · off-cpu analysis · differential
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>perf 6.8 ·</span>
          <span style={{ color: '#f87171' }}>GC + db hot (51%)</span>
          <span style={{ color: '#fbbf24' }}>json alloc (14%)</span>
          <span style={{ color: '#4ade80' }}>{liveSamples.toLocaleString()} samples</span>
          <span style={{ color: '#67e8f9' }}>off-cpu: futex contention</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          perf 6.8 · flamegraph.pl · inferno · offcputime-bpfcc · difffolded
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● profiled' : 'loading'}
        </span>
      </div>
    </div>
  );
}
