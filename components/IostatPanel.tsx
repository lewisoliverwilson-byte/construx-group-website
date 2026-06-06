'use client';

import { useState, useEffect, useRef } from 'react';

interface DiskDevice {
  name:    string;
  tps:     number;
  kbRead:  number;
  kbWrtn:  number;
  rkBs:    number;
  wkBs:    number;
  util:    number;
  accent:  string;
}

const BASE: DiskDevice[] = [
  { name: 'nvme0n1', tps: 124.4, kbRead: 18241892, kbWrtn: 94812044, rkBs: 182.4, wkBs: 421.8, util: 4.2,  accent: '#67e8f9' },
  { name: 'nvme1n1', tps: 284.1, kbRead: 48912044, kbWrtn: 284101882,rkBs: 648.1, wkBs: 1284.2,util: 12.8, accent: '#67e8f9' },
  { name: 'sda',     tps: 8.2,   kbRead: 4120488,  kbWrtn: 12841024, rkBs: 12.4,  wkBs: 84.1,  util: 0.8,  accent: '#fbbf24' },
  { name: 'loop0',   tps: 0.0,   kbRead: 102400,   kbWrtn: 0,        rkBs: 0.0,   wkBs: 0.0,   util: 0.0,  accent: 'rgba(240,239,255,0.2)' },
];

function jitter(v: number, pct = 0.15): number {
  return Math.max(0, v * (1 + (Math.random() - 0.5) * 2 * pct));
}

function fmtKBs(v: number): string {
  if (v >= 1024) return (v / 1024).toFixed(1) + 'MB/s';
  return v.toFixed(1) + 'kB/s';
}

function fmtKB(v: number): string {
  if (v >= 1024 * 1024) return (v / 1024 / 1024).toFixed(1) + 'GB';
  if (v >= 1024) return (v / 1024).toFixed(0) + 'MB';
  return v.toFixed(0) + 'kB';
}

function utilColor(pct: number): string {
  if (pct < 20) return '#4ade80';
  if (pct < 50) return '#fbbf24';
  if (pct < 80) return '#F97316';
  return '#f87171';
}

export default function IostatPanel() {
  const [revealed, setRevealed] = useState(0);
  const [devices,  setDevices]  = useState<DiskDevice[]>(BASE);
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
    if (revealed === 0 || revealed > BASE.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 85);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => {
      setDevices((prev) =>
        prev.map((d) => ({
          ...d,
          tps:    jitter(d.tps, 0.2),
          rkBs:   jitter(d.rkBs, 0.25),
          wkBs:   jitter(d.wkBs, 0.2),
          util:   Math.min(100, jitter(d.util, 0.3)),
          kbRead: d.kbRead + Math.round(d.rkBs * 1),
          kbWrtn: d.kbWrtn + Math.round(d.wkBs * 1),
        })),
      );
    }, 2100);
    return () => clearInterval(id);
  }, []);

  const totalRead  = devices.reduce((s, d) => s + d.rkBs, 0);
  const totalWrite = devices.reduce((s, d) => s + d.wkBs, 0);

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
          construx@sys — disk i/o stats
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: 'rgba(240,239,255,0.2)' }}>
          ↑{fmtKBs(totalWrite)} ↓{fmtKBs(totalRead)}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          iostat -xd 1 | grep -v ^$
        </span>
      </div>

      {/* Column headers */}
      <div
        className="px-4 py-1 flex items-center select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.025)' }}
      >
        {[
          { label: 'DEVICE',     width: '80px'  },
          { label: 'TPS',        width: '64px'  },
          { label: 'kB_READ/s',  width: '96px'  },
          { label: 'kB_WRTN/s',  width: '96px'  },
          { label: 'kB_READ',    width: '88px'  },
          { label: 'kB_WRTN',    width: '88px'  },
          { label: '%UTIL',      width: 'auto'  },
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

      {/* Device rows */}
      <div className="px-4 py-2 space-y-1.5">
        {devices.slice(0, revealed).map((d, i) => {
          const uc = utilColor(d.util);
          return (
            <div key={i} className="flex items-center text-[8px] tabular-nums">
              <span style={{ color: d.accent, minWidth: '80px', flexShrink: 0 }}>{d.name}</span>
              <span style={{ color: 'rgba(240,239,255,0.45)', minWidth: '64px', flexShrink: 0 }}>
                {d.tps.toFixed(1)}
              </span>
              <span style={{ color: '#67e8f9', minWidth: '96px', flexShrink: 0 }}>
                {fmtKBs(d.rkBs)}
              </span>
              <span style={{ color: '#F97316', minWidth: '96px', flexShrink: 0 }}>
                {fmtKBs(d.wkBs)}
              </span>
              <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '88px', flexShrink: 0 }}>
                {fmtKB(d.kbRead)}
              </span>
              <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '88px', flexShrink: 0 }}>
                {fmtKB(d.kbWrtn)}
              </span>
              <div className="flex items-center gap-1.5 flex-1">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)', width: '40px' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${d.util}%`, background: uc, opacity: 0.8, transition: 'width 0.5s ease' }}
                  />
                </div>
                <span style={{ color: uc }}>{d.util.toFixed(1)}%</span>
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
          {BASE.length} devices · live 2s · sysstat 12.7
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          nvme / sata / loop
        </span>
      </div>
    </div>
  );
}
