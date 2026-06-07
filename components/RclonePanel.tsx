'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'transfer' | 'check' | 'summary-ok' | 'summary-warn' | 'stat' | 'prog' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',      text: '# rclone: cloud storage sync across S3, GCS, R2, B2, and 70+ backends' },
  { kind: 'prompt',       text: 'rclone sync ./data r2:construx-backups/data --progress --checksum' },
  { kind: 'prog',         text: 'Transferred:      1.284 GiB / 4.812 GiB, 27%, 42.3 MiB/s, ETA 1m22s' },
  { kind: 'prog',         text: 'Checks:           8,241 / 12,847, 64%' },
  { kind: 'prog',         text: 'Transferred:         82 / 204, 40%' },
  { kind: 'transfer',     text: ' * orders/2032-08.parquet: 98% /234.2M, 41.8M/s, 0s' },
  { kind: 'transfer',     text: ' * customers/shard-4.avro: 71% /128.4M, 38.2M/s, 1s' },
  { kind: 'transfer',     text: ' * events/2032-08-31.json: 44% /512.8M, 36.9M/s, 8s' },
  { kind: 'blank',        text: '' },
  { kind: 'summary-ok',   text: 'Transferred:    4.812 GiB (42.3 MiB/s)  in  1m55s' },
  { kind: 'summary-ok',   text: 'Checks:         12,847  (all checksums verified)' },
  { kind: 'summary-ok',   text: 'Transferred:       204  files' },
  { kind: 'summary-ok',   text: 'Deleted:             0  (--delete-after not set)' },
  { kind: 'blank',        text: '' },
  { kind: 'comment',      text: '# check: diff without syncing — find divergence between remotes' },
  { kind: 'prompt',       text: 'rclone check s3:construx-prod-data r2:construx-backups/data --combined -' },
  { kind: 'check',        text: '= orders/2032-07.parquet (match — same size + checksum)' },
  { kind: 'check',        text: '= customers/shard-0.avro (match)' },
  { kind: 'summary-warn', text: '* orders/2032-08-29.parquet (size differs: S3=241M R2=238M)  ← partial upload?' },
  { kind: 'summary-warn', text: '+ events/2032-09-01.json (only on S3 — not yet synced to R2)' },
  { kind: 'blank',        text: '' },
  { kind: 'comment',      text: '# copy with bandwidth limit and server-side copy between remotes' },
  { kind: 'prompt',       text: 'rclone copy s3:construx-raw/2032/ r2:construx-archive/2032/ --s3-server-side-encryption --bwlimit 100M' },
  { kind: 'stat',         text: 'Using server-side copy (no data downloaded to local machine)' },
  { kind: 'summary-ok',   text: 'Transferred:   12.4 GiB  at 98.4 MiB/s  in  2m9s  (server-side)' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':      return 'rgba(240,239,255,0.22)';
    case 'prompt':       return 'rgba(240,239,255,0.6)';
    case 'transfer':     return '#67e8f9';
    case 'check':        return 'rgba(240,239,255,0.45)';
    case 'summary-ok':   return '#4ade80';
    case 'summary-warn': return '#fbbf24';
    case 'stat':         return '#a78bfa';
    case 'prog':         return 'rgba(240,239,255,0.55)';
    default:             return 'transparent';
  }
}

export default function RclonePanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [liveSpeed, setLiveSpeed] = useState(42.3);
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
            setLiveSpeed(Math.round((34 + Math.random() * 16) * 10) / 10);
          }, 2150);
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
          construx@prod-01 — rclone · cloud storage sync · S3 → R2
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveSpeed} MiB/s` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          rclone sync · check · copy · S3 R2 GCS B2 · checksum · server-side
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>rclone 1.67 ·</span>
          <span style={{ color: '#4ade80' }}>{liveSpeed} MiB/s</span>
          <span style={{ color: '#67e8f9' }}>S3 → R2 server-side</span>
          <span style={{ color: '#fbbf24' }}>checksum verified</span>
          <span style={{ color: '#a78bfa' }}>204 files · 4.8 GiB</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          rclone · sync · check · server-side copy · --checksum · 70+ backends
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● synced' : 'loading'}
        </span>
      </div>
    </div>
  );
}
