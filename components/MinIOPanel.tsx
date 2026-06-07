'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'node' | 'bucket' | 'repl' | 'policy' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# minio: s3-compatible object storage — erasure-coded, multi-site' },
  { kind: 'prompt',  text: 'mc admin info minio-prod' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# server pool: 4 nodes, 16 drives  EC:8/8 (8 data + 8 parity)' },
  { kind: 'node',    text: '  minio-0  ONLINE  drives:4  used:2.4TB/8TB  uptime:62d' },
  { kind: 'node',    text: '  minio-1  ONLINE  drives:4  used:2.3TB/8TB  uptime:62d' },
  { kind: 'node',    text: '  minio-2  ONLINE  drives:4  used:2.4TB/8TB  uptime:62d' },
  { kind: 'node',    text: '  minio-3  ONLINE  drives:4  used:2.3TB/8TB  uptime:62d' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# buckets: 4 active  total: 9.4TB  objects: 18.4M' },
  { kind: 'bucket',  text: '  construx-lakehouse       6.1TB   12.2M objs  versioning:on' },
  { kind: 'bucket',  text: '  construx-thanos-prod      1.8TB    4.8M objs  versioning:off' },
  { kind: 'bucket',  text: '  construx-backups          1.2TB    1.1M objs  lifecycle:90d' },
  { kind: 'bucket',  text: '  construx-artifacts        318GB    289k objs  public:false' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# replication: eu-west-2 → us-east-1 (active-passive)' },
  { kind: 'repl',    text: '  replication lag: 1.4s   backlog: 0 objects   status: synced' },
  { kind: 'metric',  text: '  throughput: 1.84 GB/s read  0.62 GB/s write   conns:142' },
  { kind: 'stat',    text: '  4 nodes  16 drives  EC:8/8  minio RELEASE.2033-08-25' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'node':    return '#4ade80';
    case 'bucket':  return '#67e8f9';
    case 'repl':    return '#a78bfa';
    case 'policy':  return '#fbbf24';
    case 'metric':  return 'rgba(240,239,255,0.5)';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    default:        return 'transparent';
  }
}

export default function MinIOPanel() {
  const [revealed,       setRevealed]       = useState(0);
  const [liveThroughput, setLiveThroughput] = useState(1.84);
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
            setLiveThroughput(parseFloat((1.2 + Math.random() * 1.6).toFixed(2)));
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
          construx@storage — minio · s3-compatible · erasure-coded · multi-site
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveThroughput} GB/s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@storage# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          minio · mc · erasure-code · versioning · replication · lifecycle
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>MinIO RELEASE.2033-08-25 ·</span>
          <span style={{ color: '#4ade80' }}>4 nodes healthy</span>
          <span style={{ color: '#67e8f9' }}>9.4TB data</span>
          <span style={{ color: '#a78bfa' }}>replicated</span>
          <span style={{ color: '#fbbf24' }}>{liveThroughput} GB/s</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          minio · s3-api · erasure-code · versioning · multi-site
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● healthy' : 'loading'}
        </span>
      </div>
    </div>
  );
}
