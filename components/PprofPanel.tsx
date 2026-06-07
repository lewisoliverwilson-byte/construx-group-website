'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'header' | 'flat-hot' | 'flat-mid' | 'flat-low' | 'heap-hot' | 'heap-mid' | 'goroutine' | 'summary' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',   text: '# Capture 30s CPU profile from live construx-api service' },
  { kind: 'prompt',    text: 'go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30' },
  { kind: 'summary',   text: 'Fetching profile over HTTP from http://localhost:6060/debug/pprof/profile?seconds=30' },
  { kind: 'summary',   text: 'Saved profile in /root/pprof/pprof.construx-api.samples.cpu.001.pb.gz' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# Top functions by CPU (flat = function itself, cum = including callees)' },
  { kind: 'prompt',    text: '(pprof) top15 --cum' },
  { kind: 'header',    text: '      flat  flat%   sum%        cum   cum%' },
  { kind: 'flat-hot',  text: '    420ms  21.00%  21.00%     1980ms  99.00%  construx-api/internal/order.(*Server).CreateOrder' },
  { kind: 'flat-hot',  text: '    380ms  19.00%  40.00%      780ms  39.00%  github.com/jackc/pgx/v5.(*Conn).sendBatchExtendedMode' },
  { kind: 'flat-mid',  text: '    260ms  13.00%  53.00%      420ms  21.00%  encoding/json.Marshal' },
  { kind: 'flat-mid',  text: '    200ms  10.00%  63.00%      200ms  10.00%  runtime.gcBgMarkWorker' },
  { kind: 'flat-mid',  text: '    160ms   8.00%  71.00%      320ms  16.00%  github.com/nats-io/nats.go.(*Conn).publish' },
  { kind: 'flat-low',  text: '     80ms   4.00%  75.00%       80ms   4.00%  crypto/sha256.block' },
  { kind: 'flat-low',  text: '     60ms   3.00%  78.00%      140ms   7.00%  google.golang.org/grpc.(*Server).processUnaryRPC' },
  { kind: 'flat-low',  text: '     40ms   2.00%  80.00%       60ms   3.00%  sync.(*Mutex).Lock' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# Heap profile — memory allocations' },
  { kind: 'prompt',    text: 'go tool pprof http://localhost:6060/debug/pprof/heap' },
  { kind: 'prompt',    text: '(pprof) top10 -inuse_space' },
  { kind: 'header',    text: '      flat  flat%   sum%        cum   cum%' },
  { kind: 'heap-hot',  text: '    18.2MB  34.2%  34.2%     18.2MB  34.2%  construx-api/internal/cache.(*OrderCache).Set' },
  { kind: 'heap-hot',  text: '    12.4MB  23.3%  57.5%     12.4MB  23.3%  github.com/jackc/pgx/v5/pgproto3.(*Backend).Receive' },
  { kind: 'heap-mid',  text: '     8.1MB  15.2%  72.7%      8.1MB  15.2%  encoding/json.(*encodeState).marshal' },
  { kind: 'heap-mid',  text: '     5.3MB  10.0%  82.7%      5.3MB  10.0%  google.golang.org/protobuf/proto.Marshal' },
  { kind: 'heap-mid',  text: '     3.2MB   6.0%  88.7%      3.2MB   6.0%  bytes.(*Buffer).Write' },
  { kind: 'blank',     text: '' },
  { kind: 'comment',   text: '# Goroutine count and trace' },
  { kind: 'prompt',    text: 'go tool pprof http://localhost:6060/debug/pprof/goroutine' },
  { kind: 'prompt',    text: '(pprof) top5' },
  { kind: 'goroutine', text: '       384  goroutine: net/http.(*connReader).readLoop' },
  { kind: 'goroutine', text: '       384  goroutine: net/http.(*response).finishRequest' },
  { kind: 'goroutine', text: '       128  goroutine: google.golang.org/grpc.(*Server).handleRawConn' },
  { kind: 'goroutine', text: '        48  goroutine: construx-api/internal/order.consumeBillingEvents' },
  { kind: 'goroutine', text: '         1  goroutine: main.main' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':   return 'rgba(240,239,255,0.22)';
    case 'prompt':    return 'rgba(240,239,255,0.6)';
    case 'header':    return 'rgba(240,239,255,0.35)';
    case 'flat-hot':  return '#f87171';
    case 'flat-mid':  return '#fbbf24';
    case 'flat-low':  return '#67e8f9';
    case 'heap-hot':  return '#fb923c';
    case 'heap-mid':  return '#fbbf24';
    case 'goroutine': return '#a78bfa';
    case 'summary':   return 'rgba(240,239,255,0.4)';
    default:          return 'transparent';
  }
}

export default function PprofPanel() {
  const [revealed,       setRevealed]       = useState(0);
  const [liveGoroutines, setLiveGoroutines] = useState(946);
  const [liveHeapMb,     setLiveHeapMb]     = useState(53.2);
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
            setLiveGoroutines(940 + Math.floor(Math.random() * 14));
            setLiveHeapMb(Math.round((51 + Math.random() * 5) * 10) / 10);
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
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 83;
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
          construx@prod-01 — go tool pprof · construx-api · cpu+heap
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#f87171' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveHeapMb}MB heap` : 'profiling…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          go tool pprof · cpu profile · heap · goroutines
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>go1.23 ·</span>
          <span style={{ color: '#f87171' }}>top hotspot: CreateOrder 21%</span>
          <span style={{ color: '#fb923c' }}>{liveHeapMb}MB in-use heap</span>
          <span style={{ color: '#a78bfa' }}>{liveGoroutines} goroutines</span>
          <span style={{ color: '#67e8f9' }}>pprof http enabled</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          go tool pprof · runtime/pprof · 30s cpu sample · heap snapshot
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● profiled' : 'loading'}
        </span>
      </div>
    </div>
  );
}
