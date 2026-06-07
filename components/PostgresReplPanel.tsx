'use client';

import { useState, useEffect, useRef } from 'react';

interface ReplicaRow {
  pid:          number;
  appName:      string;
  clientAddr:   string;
  state:        'streaming' | 'catchup' | 'startup';
  sentLsn:      string;
  writeLsn:     string;
  flushLsn:     string;
  replayLsn:    string;
  writeLag:     string;
  flushLag:     string;
  replayLag:    string;
  syncState:    'async' | 'sync' | 'quorum';
  syncPriority: number;
}

const REPLICAS: ReplicaRow[] = [
  {
    pid: 18241,  appName: 'replica-lon01', clientAddr: '10.0.0.11',
    state: 'streaming', sentLsn: '0/4A2F1E08', writeLsn: '0/4A2F1E08', flushLsn: '0/4A2F1E08', replayLsn: '0/4A2F1E08',
    writeLag: '00:00:00', flushLag: '00:00:00', replayLag: '00:00:00.002',
    syncState: 'sync', syncPriority: 1,
  },
  {
    pid: 18242,  appName: 'replica-fra01', clientAddr: '10.0.0.12',
    state: 'streaming', sentLsn: '0/4A2F1E08', writeLsn: '0/4A2F1D80', flushLsn: '0/4A2F1D80', replayLsn: '0/4A2F1C40',
    writeLag: '00:00:00.012', flushLag: '00:00:00.024', replayLag: '00:00:00.041',
    syncState: 'async', syncPriority: 0,
  },
  {
    pid: 18243,  appName: 'pgbouncer-ro',  clientAddr: '10.0.0.20',
    state: 'streaming', sentLsn: '0/4A2F1E08', writeLsn: '0/4A2F1E08', flushLsn: '0/4A2F1DF0', replayLsn: '0/4A2F1DB0',
    writeLag: '00:00:00', flushLag: '00:00:00.008', replayLag: '00:00:00.019',
    syncState: 'quorum', syncPriority: 1,
  },
];

type WalLine = {
  label: string;
  value: string;
  color?: string;
};

const WAL_LINES: WalLine[] = [
  { label: 'current_lsn',         value: '0/4A2F1E08' },
  { label: 'sent_lsn',            value: '0/4A2F1E08',  color: '#4ade80' },
  { label: 'write_lsn (lon01)',    value: '0/4A2F1E08',  color: '#4ade80' },
  { label: 'flush_lsn (lon01)',    value: '0/4A2F1E08',  color: '#4ade80' },
  { label: 'replay_lsn (lon01)',   value: '0/4A2F1E08',  color: '#4ade80' },
  { label: 'replay_lsn (fra01)',   value: '0/4A2F1C40',  color: '#fbbf24' },
  { label: 'replay_lag (fra01)',   value: '41ms behind',  color: '#fbbf24' },
];

const TOTAL = REPLICAS.length + WAL_LINES.length + 3;

function stateColor(s: ReplicaRow['state']): string {
  if (s === 'streaming') return '#4ade80';
  if (s === 'catchup')   return '#fbbf24';
  return 'rgba(240,239,255,0.4)';
}

function syncColor(s: ReplicaRow['syncState']): string {
  if (s === 'sync' || s === 'quorum') return '#4ade80';
  return 'rgba(240,239,255,0.35)';
}

function lagColor(lag: string): string {
  if (lag === '00:00:00' || lag === '00:00:00.000') return 'rgba(240,239,255,0.3)';
  const ms = parseFloat(lag.split('.')[1] ?? '0');
  if (ms < 50) return '#4ade80';
  if (ms < 100) return '#fbbf24';
  return '#f87171';
}

export default function PostgresReplPanel() {
  const [revealed, setRevealed] = useState(0);
  const [lagMs, setLagMs]       = useState(41);
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
            setLagMs(Math.floor(28 + Math.random() * 40));
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
    const id = setTimeout(() => setRevealed((r) => r + 1), 85);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const allDone      = revealed > TOTAL;
  const shownReplicas = REPLICAS.slice(0, Math.min(REPLICAS.length, Math.max(0, revealed - 1)));
  const walStart      = REPLICAS.length + 2;
  const shownWal      = WAL_LINES.slice(0, Math.max(0, revealed - walStart));

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
          construx@db-primary — postgres replication
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: '#4ade80' }}>
          {allDone ? `LIVE fra01 lag: ${lagMs}ms` : 'querying…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx=# </span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          SELECT * FROM pg_stat_replication;
        </span>
      </div>

      {/* Replica rows */}
      {shownReplicas.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          {/* Column headers */}
          <div
            className="flex items-center text-[6.5px] uppercase tracking-widest mb-0.5"
            style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '2px' }}
          >
            <span style={{ minWidth: '44px',  flexShrink: 0 }}>PID</span>
            <span style={{ minWidth: '120px', flexShrink: 0 }}>App name</span>
            <span style={{ minWidth: '100px', flexShrink: 0 }}>Client addr</span>
            <span style={{ minWidth: '70px',  flexShrink: 0 }}>State</span>
            <span style={{ minWidth: '64px',  flexShrink: 0 }}>Write lag</span>
            <span style={{ minWidth: '64px',  flexShrink: 0 }}>Flush lag</span>
            <span style={{ minWidth: '72px',  flexShrink: 0 }}>Replay lag</span>
            <span>Sync</span>
          </div>
          {shownReplicas.map((r, i) => (
            <div key={i} className="flex items-center text-[7.5px] leading-[1.8]" style={{ borderLeft: `2px solid ${stateColor(r.state)}44`, paddingLeft: '4px' }}>
              <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '44px', flexShrink: 0 }}>{r.pid}</span>
              <span style={{ color: 'rgba(240,239,255,0.55)', minWidth: '120px', flexShrink: 0 }}>{r.appName}</span>
              <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '100px', flexShrink: 0 }}>{r.clientAddr}</span>
              <span style={{ color: stateColor(r.state), minWidth: '70px', flexShrink: 0, fontSize: '7px' }}>{r.state}</span>
              <span style={{ color: lagColor(r.writeLag),  minWidth: '64px', flexShrink: 0 }}>{r.writeLag.split(':')[2]}</span>
              <span style={{ color: lagColor(r.flushLag),  minWidth: '64px', flexShrink: 0 }}>{r.flushLag.split(':')[2]}</span>
              <span style={{ color: lagColor(r.replayLag), minWidth: '72px', flexShrink: 0 }}>{r.replayLag.split(':')[2]}</span>
              <span style={{ color: syncColor(r.syncState), fontSize: '7px' }}>{r.syncState}</span>
            </div>
          ))}
        </div>
      )}

      {/* WAL positions */}
      {shownWal.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.18)' }}>
            WAL positions — pg_current_wal_lsn
          </div>
          {shownWal.map((w, i) => (
            <div key={i} className="flex items-center text-[7.5px] leading-[1.8] gap-4">
              <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '180px', flexShrink: 0 }}>{w.label}</span>
              <span style={{ color: w.color ?? 'rgba(240,239,255,0.45)', fontFamily: 'monospace' }}>{w.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>3 replicas streaming</span>
          <span style={{ color: '#4ade80' }}>lon01: 0ms lag (synchronous)</span>
          <span style={{ color: '#fbbf24' }}>fra01: {lagMs}ms lag (async)</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          postgresql 16.4 · streaming replication · wal level = replica
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● 3 replicas' : 'loading'}
        </span>
      </div>
    </div>
  );
}
