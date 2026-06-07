'use client';

import { useState, useEffect, useRef } from 'react';

interface FioJob {
  name:        string;
  mode:        string;
  blockSize:   string;
  iops:        number;
  bwMBs:       number;
  latAvgUs:    number;
  lat50Us:     number;
  lat95Us:     number;
  lat99Us:     number;
  lat999Us:    number;
}

const JOBS: FioJob[] = [
  { name: 'seq-read',    mode: 'read',        blockSize: '128k', iops: 14_400, bwMBs: 1843, latAvgUs: 68,    lat50Us: 65,    lat95Us: 88,    lat99Us: 104,  lat999Us: 188  },
  { name: 'seq-write',   mode: 'write',       blockSize: '128k', iops: 9_600,  bwMBs: 1228, latAvgUs: 102,   lat50Us: 97,    lat95Us: 139,   lat99Us: 162,  lat999Us: 280  },
  { name: 'rand-read',   mode: 'randread',    blockSize: '4k',   iops: 45_200, bwMBs: 177,  latAvgUs: 88,    lat50Us: 82,    lat95Us: 122,   lat99Us: 145,  lat999Us: 241  },
  { name: 'rand-write',  mode: 'randwrite',   blockSize: '4k',   iops: 37_800, bwMBs: 148,  latAvgUs: 105,   lat50Us: 98,    lat95Us: 148,   lat99Us: 178,  lat999Us: 312  },
  { name: 'rand-rw',     mode: 'randrw',      blockSize: '4k',   iops: 22_400, bwMBs: 88,   latAvgUs: 177,   lat50Us: 165,   lat95Us: 248,   lat99Us: 302,  lat999Us: 490  },
  { name: 'seq-mixed',   mode: 'rw',          blockSize: '64k',  iops: 11_200, bwMBs: 700,  latAvgUs: 141,   lat50Us: 133,   lat95Us: 196,   lat99Us: 234,  lat999Us: 388  },
];

const TOTAL = JOBS.length;

function bwColor(bw: number): string {
  if (bw >= 1500) return '#4ade80';
  if (bw >= 500)  return '#60a5fa';
  if (bw >= 100)  return '#fbbf24';
  return 'rgba(240,239,255,0.4)';
}

function iopsColor(iops: number): string {
  if (iops >= 40_000) return '#4ade80';
  if (iops >= 10_000) return '#60a5fa';
  if (iops >= 1_000)  return '#fbbf24';
  return 'rgba(240,239,255,0.4)';
}

function fmtIops(n: number): string {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function modeColor(m: string): string {
  if (m.includes('rand')) return 'rgba(167,139,250,0.65)';
  if (m === 'read')       return 'rgba(74,222,128,0.65)';
  if (m === 'write')      return 'rgba(251,191,36,0.65)';
  return 'rgba(96,165,250,0.65)';
}

export default function FioPanel() {
  const [revealed, setRevealed] = useState(0);
  const [liveIops, setLiveIops] = useState(0);
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
            setLiveIops(Math.floor(40_000 + Math.random() * 8_000));
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
    const id = setTimeout(() => setRevealed((r) => r + 1), 86);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const allDone  = revealed > TOTAL;
  const shownJobs = JOBS.slice(0, Math.min(JOBS.length, revealed));

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
          construx@vps-fra01 — fio benchmark
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: '#4ade80' }}>
          {allDone ? `LIVE ${fmtIops(liveIops)} IOPS` : 'running…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@vps-fra01:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          fio --name=benchmarks --filename=/dev/nvme0n1 --ioengine=libaio --iodepth=32 --numjobs=4
        </span>
      </div>

      {/* Device info */}
      {shownJobs.length > 0 && (
        <div className="px-4 pt-1.5 pb-0.5 text-[7.5px]" style={{ color: 'rgba(240,239,255,0.22)' }}>
          Device: /dev/nvme0n1 (Samsung 980 Pro 2TB) · fio 3.37 · libaio · iodepth=32 · numjobs=4
        </div>
      )}

      {/* Column headers */}
      {shownJobs.length > 0 && (
        <div
          className="flex items-center px-4 py-0.5 text-[6.5px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ minWidth: '100px', flexShrink: 0 }}>Job</span>
          <span style={{ minWidth: '88px',  flexShrink: 0 }}>Mode</span>
          <span style={{ minWidth: '44px',  flexShrink: 0 }}>BS</span>
          <span style={{ minWidth: '72px',  flexShrink: 0 }}>IOPS</span>
          <span style={{ minWidth: '80px',  flexShrink: 0 }}>BW (MB/s)</span>
          <span style={{ minWidth: '64px',  flexShrink: 0 }}>lat avg</span>
          <span style={{ minWidth: '52px',  flexShrink: 0 }}>p50</span>
          <span style={{ minWidth: '52px',  flexShrink: 0 }}>p95</span>
          <span style={{ minWidth: '52px',  flexShrink: 0 }}>p99</span>
          <span>p99.9</span>
        </div>
      )}

      {/* Rows */}
      <div className="px-4 py-1.5 space-y-0.5">
        {shownJobs.map((job, i) => (
          <div
            key={i}
            className="flex items-center text-[7.5px] leading-[1.7]"
            style={{
              borderLeft: `2px solid ${modeColor(job.mode)}44`,
              paddingLeft: '4px',
            }}
          >
            <span style={{ color: 'rgba(240,239,255,0.5)', minWidth: '100px', flexShrink: 0 }}>{job.name}</span>
            <span style={{ color: modeColor(job.mode), minWidth: '88px', flexShrink: 0, fontSize: '7px' }}>{job.mode}</span>
            <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '44px', flexShrink: 0 }}>{job.blockSize}</span>
            <span style={{ color: iopsColor(job.iops), minWidth: '72px', flexShrink: 0, fontWeight: 600 }}>{fmtIops(job.iops)}</span>
            <span style={{ color: bwColor(job.bwMBs), minWidth: '80px', flexShrink: 0 }}>{job.bwMBs.toLocaleString()}</span>
            <span style={{ color: 'rgba(240,239,255,0.4)', minWidth: '64px', flexShrink: 0 }}>{job.latAvgUs}µs</span>
            <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '52px', flexShrink: 0 }}>{job.lat50Us}µs</span>
            <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '52px', flexShrink: 0 }}>{job.lat95Us}µs</span>
            <span style={{ color: job.lat99Us > 150 ? '#fbbf24' : 'rgba(240,239,255,0.3)', minWidth: '52px', flexShrink: 0 }}>{job.lat99Us}µs</span>
            <span style={{ color: job.lat999Us > 400 ? '#f87171' : 'rgba(240,239,255,0.25)' }}>{job.lat999Us}µs</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>seq read: 1.8 GB/s</span>
          <span style={{ color: '#60a5fa' }}>seq write: 1.2 GB/s</span>
          <span style={{ color: '#4ade80' }}>rand 4K read: 45k IOPS</span>
          <span style={{ color: '#60a5fa' }}>rand 4K write: 38k IOPS</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          fio 3.37 · libaio · nvme0n1 · samsung 980 pro 2tb
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? `● ${TOTAL} jobs` : 'benchmarking'}
        </span>
      </div>
    </div>
  );
}
