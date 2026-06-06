'use client';

import { useState, useEffect, useRef } from 'react';

interface Filesystem {
  device:  string;
  type:    string;
  size:    string;
  used:    string;
  avail:   string;
  usePct:  number;
  mount:   string;
  accent:  string;
}

const FILESYSTEMS: Filesystem[] = [
  { device: '/dev/nvme0n1p1', type: 'ext4',    size: '500G', used: '182G', avail: '293G', usePct: 38, mount: '/',                      accent: '#4ade80' },
  { device: '/dev/nvme0n2p1', type: 'ext4',    size: '2.0T', used: '891G', avail: '1.1T', usePct: 45, mount: '/var/lib/postgres',       accent: '#7dd3fc' },
  { device: '/dev/sda1',      type: 'ext4',    size: '1.0T', used: '612G', avail: '359G', usePct: 63, mount: '/var/log',                 accent: '#fbbf24' },
  { device: 'tmpfs',          type: 'tmpfs',   size: '32G',  used: '4.2G', avail: '28G',  usePct: 13, mount: '/dev/shm',                 accent: '#a78bfa' },
  { device: 's3fs',           type: 'fuse.s3', size: '∞',   used: '94G',  avail: '∞',    usePct: 0,  mount: '/mnt/construx-backups',    accent: '#F97316' },
  { device: 'overlay',        type: 'overlay', size: '500G', used: '28G',  avail: '446G', usePct: 6,  mount: '/var/lib/docker/overlay2', accent: '#4ade80' },
];

function usageColor(pct: number): string {
  if (pct < 50) return '#4ade80';
  if (pct < 75) return '#fbbf24';
  if (pct < 90) return '#F97316';
  return '#f87171';
}

export default function DiskUsagePanel() {
  const [revealed, setRevealed] = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > FILESYSTEMS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 85);
    return () => clearTimeout(id);
  }, [revealed]);

  const visibleFs = FILESYSTEMS.slice(0, revealed);
  const totalUsedGB = FILESYSTEMS.filter((f) => f.type !== 'fuse.s3').reduce((s, f) => {
    const n = parseFloat(f.used.replace('G', ''));
    return s + (isNaN(n) ? 0 : n);
  }, 0);

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
          construx@sys — disk usage
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: 'rgba(240,239,255,0.2)' }}>
          {totalUsedGB.toFixed(0)}GB used
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          df -h --output=source,fstype,size,used,avail,pcent,target
        </span>
      </div>

      {/* Column headers */}
      <div
        className="px-4 py-1 flex items-center select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.025)' }}
      >
        {[
          { label: 'Filesystem', width: '148px' },
          { label: 'Type',       width: '68px'  },
          { label: 'Size',       width: '48px'  },
          { label: 'Used',       width: '48px'  },
          { label: 'Avail',      width: '48px'  },
          { label: 'Use%',       width: '80px'  },
          { label: 'Mounted on', width: 'auto'  },
        ].map((col) => (
          <span
            key={col.label}
            className="text-[8px] uppercase tracking-wider"
            style={{ color: 'rgba(255,255,255,0.2)', minWidth: col.width, flexShrink: 0 }}
          >
            {col.label}
          </span>
        ))}
      </div>

      {/* Filesystem rows */}
      <div className="px-4 py-2 space-y-1.5">
        {visibleFs.map((fs, i) => {
          const color = usageColor(fs.usePct);
          return (
            <div key={i}>
              {/* Data row */}
              <div className="flex items-center text-[8px] tabular-nums mb-0.5">
                <span style={{ color: fs.accent + '90', minWidth: '148px', flexShrink: 0 }}>
                  {fs.device}
                </span>
                <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '68px', flexShrink: 0 }}>
                  {fs.type}
                </span>
                <span style={{ color: 'rgba(240,239,255,0.4)', minWidth: '48px', flexShrink: 0 }}>
                  {fs.size}
                </span>
                <span style={{ color: 'rgba(240,239,255,0.4)', minWidth: '48px', flexShrink: 0 }}>
                  {fs.used}
                </span>
                <span style={{ color: 'rgba(240,239,255,0.4)', minWidth: '48px', flexShrink: 0 }}>
                  {fs.avail}
                </span>
                {/* Usage bar + pct */}
                <div className="flex items-center gap-1.5 min-w-[80px] flex-shrink-0">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)', maxWidth: '50px' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${fs.usePct}%`, background: color, opacity: 0.8, transition: 'width 0.4s ease' }}
                    />
                  </div>
                  <span style={{ color, minWidth: '28px' }}>
                    {fs.usePct > 0 ? `${fs.usePct}%` : '--'}
                  </span>
                </div>
                <span className="truncate" style={{ color: fs.accent ?? 'rgba(240,239,255,0.5)' }}>
                  {fs.mount}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          {FILESYSTEMS.length} filesystems · s3fs backed by aws s3
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          ext4 / fuse / tmpfs
        </span>
      </div>
    </div>
  );
}
