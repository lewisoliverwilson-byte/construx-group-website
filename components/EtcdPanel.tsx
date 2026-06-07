'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'member' | 'leader' | 'status' | 'watch' | 'perf' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# etcd: distributed key-value store — raft consensus, kubernetes control plane' },
  { kind: 'prompt',  text: 'etcdctl endpoint status --cluster -w table' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# cluster: 3 members  raft term:42  in-sync' },
  { kind: 'member',  text: '  node-01  10.0.1.10:2379  3.5.15  182MB  term:42  false' },
  { kind: 'leader',  text: '  node-02  10.0.1.11:2379  3.5.15  182MB  term:42  true  ← leader' },
  { kind: 'member',  text: '  node-03  10.0.1.12:2379  3.5.15  182MB  term:42  false' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# raft index: 2841821  applied: 2841821  (no lag)' },
  { kind: 'status',  text: '  db-size: 182MB  quota: 8GB  compaction: 1h  defrag: ok' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# watch: kubernetes api writes — /registry/pods/ stream' },
  { kind: 'watch',   text: '  PUT    /registry/pods/construx-prod/construx-api-7d8f-4k2p9' },
  { kind: 'watch',   text: '  DELETE /registry/pods/construx-prod/construx-api-7d8f-3j1m2' },
  { kind: 'blank',   text: '' },
  { kind: 'perf',    text: '  check-perf: 150 writes/s  p99: 18.4ms  stddev: 2.1ms  PASS' },
  { kind: 'metric',  text: '  leader elections: 2  compactions: 42  proposals-committed: 2.8M' },
  { kind: 'stat',    text: '  3 members  raft-quorum:2  182MB  etcd 3.5.15' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'leader':  return '#fbbf24';
    case 'member':  return '#4ade80';
    case 'status':  return '#67e8f9';
    case 'watch':   return '#a78bfa';
    case 'perf':    return '#4ade80';
    case 'metric':  return 'rgba(240,239,255,0.5)';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    default:        return 'transparent';
  }
}

export default function EtcdPanel() {
  const [revealed,   setRevealed]   = useState(0);
  const [liveIndex,  setLiveIndex]  = useState(2841821);
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
            setLiveIndex((n) => n + 2 + Math.floor(Math.random() * 6));
          }, 1800);
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
          construx@infra — etcd · raft · key-value · kubernetes-control-plane
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#fbbf24' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? liveIndex.toLocaleString() : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@infra# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          etcd · raft · watch-api · compaction · snapshot · control-plane
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>etcd 3.5.15 ·</span>
          <span style={{ color: '#4ade80' }}>3 members healthy</span>
          <span style={{ color: '#fbbf24' }}>node-02 leader</span>
          <span style={{ color: '#67e8f9' }}>182MB</span>
          <span style={{ color: '#a78bfa' }}>idx {liveIndex.toLocaleString()}</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          etcd · raft · watch · compaction · snapshot · control-plane
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● quorum' : 'loading'}
        </span>
      </div>
    </div>
  );
}
