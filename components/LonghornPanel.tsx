'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'volume' | 'replica' | 'backup' | 'snap' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment', text: '# longhorn: distributed block storage — replicated volumes, csi driver' },
  { kind: 'prompt',  text: 'kubectl get volume -n longhorn-system' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# volumes: 3 healthy  total: 350GB  robustness: degraded:0' },
  { kind: 'volume',  text: '  construx-db-data     Attached  Healthy  100Gi  3 replicas' },
  { kind: 'volume',  text: '  construx-redis-data  Attached  Healthy  50Gi   3 replicas' },
  { kind: 'volume',  text: '  construx-loki-data   Attached  Healthy  200Gi  3 replicas' },
  { kind: 'blank',   text: '' },
  { kind: 'comment', text: '# replicas: construx-db-data spread across 3 nodes' },
  { kind: 'replica', text: '  pvc-a1b2…-r-4j9k2p  running  node-01  /dev/sdb  100Gi' },
  { kind: 'replica', text: '  pvc-a1b2…-r-7m3x8q  running  node-02  /dev/sdc  100Gi' },
  { kind: 'replica', text: '  pvc-a1b2…-r-1n5v6w  running  node-03  /dev/sdb  100Gi' },
  { kind: 'blank',   text: '' },
  { kind: 'snap',    text: '  snapshot-20331025-0200  construx-db-data  14d ago  completed' },
  { kind: 'backup',  text: '  backup-20331025-0200   s3://construx-longhorn  completed  0 err' },
  { kind: 'metric',  text: '  iops: 4821 read  1842 write   throughput: 284MB/s read' },
  { kind: 'stat',    text: '  3 nodes  3 volumes  350GB  longhorn 1.7.1  csi driver' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment': return 'rgba(240,239,255,0.22)';
    case 'prompt':  return 'rgba(240,239,255,0.6)';
    case 'volume':  return '#4ade80';
    case 'replica': return '#67e8f9';
    case 'backup':  return '#a78bfa';
    case 'snap':    return '#fbbf24';
    case 'metric':  return 'rgba(240,239,255,0.5)';
    case 'stat':    return 'rgba(240,239,255,0.45)';
    default:        return 'transparent';
  }
}

export default function LonghornPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [liveIops,  setLiveIops]  = useState(4821);
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
            setLiveIops(4200 + Math.floor(Math.random() * 1200));
          }, 2500);
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
          construx@storage — longhorn · distributed-block · replicated-volumes · csi
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveIops.toLocaleString()} iops` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@storage# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          longhorn · replicas · snapshots · backups · csi · block-storage
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
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Longhorn 1.7.1 ·</span>
          <span style={{ color: '#4ade80' }}>3 volumes healthy</span>
          <span style={{ color: '#67e8f9' }}>9 replicas</span>
          <span style={{ color: '#a78bfa' }}>s3 backup ok</span>
          <span style={{ color: '#fbbf24' }}>{liveIops.toLocaleString()} iops</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          longhorn · block-storage · replicas · snapshots · s3-backup
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● healthy' : 'loading'}
        </span>
      </div>
    </div>
  );
}
