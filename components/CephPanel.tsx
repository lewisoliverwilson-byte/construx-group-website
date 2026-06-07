'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'health' | 'osd' | 'pool' | 'crush' | 'metric' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# ceph rados: distributed block, filesystem, and object storage on kubernetes' },
  { kind: 'prompt',   text: 'kubectl exec -n rook-ceph deploy/rook-ceph-tools -- ceph status' },
  { kind: 'blank',    text: '' },
  { kind: 'health',   text: '  cluster: id=a2f3c9d1-8b7e  health: HEALTH_OK' },
  { kind: 'health',   text: '  services: mon 3 daemons quorum  mgr a(active) b(standby)' },
  { kind: 'osd',      text: '  osd: 6 osds  6 up  6 in  BlueStore  nvme  replication:3' },
  { kind: 'blank',    text: '' },
  { kind: 'prompt',   text: 'kubectl exec -n rook-ceph deploy/rook-ceph-tools -- ceph df' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# POOLS                USED       OBJECTS   AVAIL' },
  { kind: 'pool',     text: '  construx-block-pool  4.7 TiB    2,847k    18 TiB' },
  { kind: 'pool',     text: '  construx-cephfs-data 142 GiB       91k    18 TiB' },
  { kind: 'pool',     text: '  .rgw.root            1.2 MiB         8    18 TiB' },
  { kind: 'blank',    text: '' },
  { kind: 'crush',    text: '  crush: 3 hosts  6 osds  root default  failure-domain: host' },
  { kind: 'crush',    text: '  pg: 97 active+clean  0 degraded  0 misplaced  0 recovering' },
  { kind: 'metric',   text: '  iops: {LIVE}/s  throughput: 2.4 GB/s  latency-p99: 1.2ms' },
  { kind: 'stat',     text: '  rook v1.15.3  ceph reef v18.2.4  6 OSD  28 TiB raw  xfs' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'health':   return '#4ade80';
    case 'osd':      return '#67e8f9';
    case 'pool':     return '#a78bfa';
    case 'crush':    return '#fbbf24';
    case 'metric':   return 'rgba(240,239,255,0.5)';
    case 'stat':     return 'rgba(240,239,255,0.45)';
    default:         return 'transparent';
  }
}

export default function CephPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [liveIops,  setLiveIops]  = useState(12400);
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
            setLiveIops((v) => {
              const delta = Math.floor(Math.random() * 1800) - 900;
              return Math.min(22000, Math.max(8000, v + delta));
            });
          }, 2400);
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
  const fmtIops    = liveIops >= 1000
    ? `${(liveIops / 1000).toFixed(1)}k`
    : String(liveIops);

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
          construx@storage — ceph · rook · rbd · cephfs · rgw · crush · bluestore
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${fmtIops} iops` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt bar */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@storage# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          ceph · rook · osd · pool · crush · rbd · cephfs · rgw · bluestore
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => {
          const text = l.kind === 'metric'
            ? l.text.replace('{LIVE}', fmtIops)
            : l.text;
          return (
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
                  {text}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Metadata */}
      {allDone && (
        <div
          className="flex items-center gap-4 flex-wrap px-4 py-1.5 text-[7.5px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>Ceph v18.2.4 ·</span>
          <span style={{ color: '#4ade80' }}>HEALTH_OK</span>
          <span style={{ color: '#67e8f9' }}>6 OSDs up</span>
          <span style={{ color: '#a78bfa' }}>28 TiB raw</span>
          <span style={{ color: '#fbbf24' }}>{fmtIops} iops</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          ceph · rook · rbd · cephfs · rgw · crush · osd · bluestore
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● healthy' : 'loading'}
        </span>
      </div>
    </div>
  );
}
