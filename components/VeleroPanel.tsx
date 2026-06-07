'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'backup-ok' | 'backup-warn' | 'backup-err' | 'restore' | 'schedule' | 'volume' | 'metric' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',     text: '# Velero — Kubernetes backup, snapshot, and disaster recovery' },
  { kind: 'prompt',      text: 'velero backup get' },
  { kind: 'backup-ok',   text: 'NAME                          STATUS      ERRORS  WARNINGS  CREATED                EXPIRES  STORAGE' },
  { kind: 'backup-ok',   text: 'construx-daily-20320325-0200  Completed   0       0         2032-03-25 02:00:23Z   9d       s3://construx-backups/velero' },
  { kind: 'backup-ok',   text: 'construx-daily-20320324-0200  Completed   0       0         2032-03-24 02:00:21Z   8d       s3://construx-backups/velero' },
  { kind: 'backup-warn', text: 'construx-daily-20320323-0200  PartiallyFailed 0 2  2032-03-23 02:00:19Z   7d       s3://construx-backups/velero' },
  { kind: 'backup-ok',   text: 'construx-on-demand-20320320   Completed   0       0         2032-03-20 10:14:05Z   4d       s3://construx-backups/velero' },
  { kind: 'blank',       text: '' },
  { kind: 'comment',     text: '# Scheduled backups — daily + weekly retention' },
  { kind: 'prompt',      text: 'velero schedule get' },
  { kind: 'schedule',    text: 'NAME             STATUS   CREATED               SCHEDULE    BACKUP TTL  LAST BACKUP' },
  { kind: 'schedule',    text: 'construx-daily   Enabled  2032-01-15 09:00:00Z  0 2 * * *   240h        2032-03-25 02:00:23Z' },
  { kind: 'schedule',    text: 'construx-weekly  Enabled  2032-01-15 09:00:00Z  0 3 * * 0   2160h       2032-03-17 03:00:14Z' },
  { kind: 'blank',       text: '' },
  { kind: 'comment',     text: '# Volume snapshot status — PostgreSQL PVC snapshots' },
  { kind: 'prompt',      text: 'velero backup describe construx-daily-20320325-0200 --details | grep -A 5 Volumes' },
  { kind: 'volume',      text: '  Persistent Volumes:' },
  { kind: 'volume',      text: '    postgres-data-postgres-0:   Snapshot completed  snap-0a1b2c3d4e (us-east-1)' },
  { kind: 'volume',      text: '    postgres-wal-postgres-0:    Snapshot completed  snap-0f9e8d7c6b (us-east-1)' },
  { kind: 'volume',      text: '    redis-data-redis-0:         Snapshot completed  snap-0b3c4d5e6f (us-east-1)' },
  { kind: 'blank',       text: '' },
  { kind: 'comment',     text: '# Restore to staging namespace — DR test' },
  { kind: 'prompt',      text: 'velero restore create --from-backup construx-daily-20320325-0200 --namespace-mappings construx:construx-dr-test' },
  { kind: 'restore',     text: 'Restore request "construx-daily-20320325-0200-20320325155001" submitted successfully.' },
  { kind: 'restore',     text: 'Run `velero restore describe construx-daily-20320325-0200-20320325155001` or' },
  { kind: 'restore',     text: '    `velero restore logs construx-daily-20320325-0200-20320325155001` for more details.' },
  { kind: 'metric',      text: 'velero_backup_success_total{schedule="construx-daily"}  24' },
  { kind: 'metric',      text: 'velero_backup_duration_seconds{p99}                     187.3' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':     return 'rgba(240,239,255,0.22)';
    case 'prompt':      return 'rgba(240,239,255,0.6)';
    case 'backup-ok':   return '#4ade80';
    case 'backup-warn': return '#fbbf24';
    case 'backup-err':  return '#f87171';
    case 'restore':     return '#67e8f9';
    case 'schedule':    return '#a78bfa';
    case 'volume':      return '#fb923c';
    case 'metric':      return 'rgba(240,239,255,0.45)';
    default:            return 'transparent';
  }
}

export default function VeleroPanel() {
  const [revealed,      setRevealed]      = useState(0);
  const [liveBackupAge, setLiveBackupAge] = useState('23h 12m');
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
          let mins = 752;
          timerRef.current = setInterval(() => {
            mins++;
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            setLiveBackupAge(`${h}h ${String(m).padStart(2, '0')}m`);
          }, 2000);
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
          construx@prod-01 — velero · K8s backup · volume snapshots · S3
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `last ${liveBackupAge} ago` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@prod-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          velero backup · schedule · volume snapshots · restore
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Velero 1.14 ·</span>
          <span style={{ color: '#4ade80' }}>last backup {liveBackupAge} ago</span>
          <span style={{ color: '#fbbf24' }}>1 partial</span>
          <span style={{ color: '#a78bfa' }}>2 schedules active</span>
          <span style={{ color: '#fb923c' }}>3 PVC snapshots</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          Velero 1.14.1 · AWS CSI snapshots · S3 object storage · 10d retention
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● protected' : 'loading'}
        </span>
      </div>
    </div>
  );
}
