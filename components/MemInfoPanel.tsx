'use client';

import { useState, useEffect, useRef } from 'react';

interface MemEntry {
  key:     string;
  val:     number;
  unit:    string;
  cat:     'total' | 'free' | 'cache' | 'swap' | 'misc';
}

const BASE: MemEntry[] = [
  { key: 'MemTotal',        val: 16777216, unit: 'kB', cat: 'total' },
  { key: 'MemFree',         val:  1048576, unit: 'kB', cat: 'free'  },
  { key: 'MemAvailable',    val:  9437184, unit: 'kB', cat: 'free'  },
  { key: 'Buffers',         val:   524288, unit: 'kB', cat: 'cache' },
  { key: 'Cached',          val:  5242880, unit: 'kB', cat: 'cache' },
  { key: 'SwapCached',      val:        0, unit: 'kB', cat: 'swap'  },
  { key: 'Active',          val:  6291456, unit: 'kB', cat: 'misc'  },
  { key: 'Inactive',        val:  2097152, unit: 'kB', cat: 'misc'  },
  { key: 'Active(anon)',     val:  3670016, unit: 'kB', cat: 'misc'  },
  { key: 'Inactive(anon)',   val:   131072, unit: 'kB', cat: 'misc'  },
  { key: 'Active(file)',     val:  2621440, unit: 'kB', cat: 'cache' },
  { key: 'Inactive(file)',   val:  1966080, unit: 'kB', cat: 'cache' },
  { key: 'SwapTotal',       val:  2097152, unit: 'kB', cat: 'swap'  },
  { key: 'SwapFree',        val:  2097152, unit: 'kB', cat: 'swap'  },
  { key: 'Dirty',           val:     4096, unit: 'kB', cat: 'misc'  },
  { key: 'Writeback',       val:        0, unit: 'kB', cat: 'misc'  },
  { key: 'AnonPages',       val:  3801088, unit: 'kB', cat: 'misc'  },
  { key: 'Mapped',          val:   786432, unit: 'kB', cat: 'misc'  },
  { key: 'Shmem',           val:    32768, unit: 'kB', cat: 'misc'  },
  { key: 'Slab',            val:   393216, unit: 'kB', cat: 'cache' },
  { key: 'VmallocTotal',    val: 134217728, unit: 'kB', cat: 'misc' },
  { key: 'VmallocUsed',     val:    73728, unit: 'kB', cat: 'misc'  },
  { key: 'HugePages_Total', val:        0, unit: '',   cat: 'misc'  },
  { key: 'HugePages_Free',  val:        0, unit: '',   cat: 'misc'  },
];

function fmtKb(kb: number): string {
  if (kb === 0) return '        0';
  if (kb >= 1_048_576) return `${(kb / 1_048_576).toFixed(1)} GiB`.padStart(9);
  if (kb >= 1_024)     return `${(kb /     1_024).toFixed(0)} MiB`.padStart(9);
  return `${kb} kB`.padStart(9);
}

function catColor(cat: MemEntry['cat']): string {
  if (cat === 'total') return '#f97316';
  if (cat === 'free')  return '#4ade80';
  if (cat === 'cache') return '#67e8f9';
  if (cat === 'swap')  return '#fbbf24';
  return 'rgba(240,239,255,0.35)';
}

export default function MemInfoPanel() {
  const [revealed, setRevealed]   = useState(0);
  const [jittered, setJittered]   = useState<number[]>(BASE.map((e) => e.val));
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > BASE.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 70);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= BASE.length) return;
    const id = setInterval(() => {
      setJittered(BASE.map((e, i) => {
        if (e.cat === 'total' || e.cat === 'swap') return e.val;
        const delta = Math.floor((Math.random() - 0.45) * e.val * 0.04);
        return Math.max(0, e.val + delta);
      }));
    }, 2400);
    return () => clearInterval(id);
  }, [revealed]);

  const allDone   = revealed > BASE.length;
  const displayed = BASE.slice(0, allDone ? BASE.length : revealed);

  const totalKb = BASE[0].val;
  const freeKb  = jittered[2] ?? BASE[2].val;  // MemAvailable
  const usedPct = (((totalKb - freeKb) / totalKb) * 100).toFixed(1);

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
          construx@sys — /proc/meminfo
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${usedPct}% used` : 'reading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          cat /proc/meminfo
        </span>
      </div>

      {/* Mem rows */}
      <div className="px-4 py-2 space-y-0.5">
        {displayed.map((entry, i) => (
          <div key={i} className="flex items-center text-[8px] leading-[1.65]">
            <span style={{ color: catColor(entry.cat), minWidth: '164px', flexShrink: 0 }}>
              {entry.key}:
            </span>
            <span style={{ color: 'rgba(240,239,255,0.6)', minWidth: '88px', flexShrink: 0, textAlign: 'right', paddingRight: '8px' }}>
              {(jittered[i] ?? entry.val).toLocaleString()}
            </span>
            {entry.unit && (
              <span style={{ color: 'rgba(240,239,255,0.2)', flexShrink: 0, marginRight: '12px' }}>
                {entry.unit}
              </span>
            )}
            {entry.unit === 'kB' && (
              <span style={{ color: catColor(entry.cat), opacity: 0.6, flexShrink: 0 }}>
                ({fmtKb(jittered[i] ?? entry.val).trim()})
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Bar */}
      {allDone && (
        <div className="px-4 pb-2">
          <div className="text-[8px] mb-1" style={{ color: 'rgba(240,239,255,0.2)' }}>
            memory usage: {usedPct}%
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${usedPct}%`, height: '100%', background: parseFloat(usedPct) > 80 ? '#f87171' : '#4ade80', borderRadius: '2px', transition: 'width 0.4s' }} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          {BASE.length} fields · linux 6.8.4 · 16 GiB total
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● live' : 'loading'}
        </span>
      </div>
    </div>
  );
}
