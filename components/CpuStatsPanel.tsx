'use client';

import { useState, useEffect, useRef } from 'react';

interface CoreStats {
  id:       number;
  usage:    number;
  freq:     number;
  baseFreq: number;
}

const BASE_CORES: CoreStats[] = [
  { id: 0, usage: 12.4, freq: 3612, baseFreq: 3600 },
  { id: 1, usage: 28.7, freq: 3841, baseFreq: 3600 },
  { id: 2, usage: 4.1,  freq: 3511, baseFreq: 3600 },
  { id: 3, usage: 51.3, freq: 4124, baseFreq: 3600 },
  { id: 4, usage: 6.8,  freq: 3590, baseFreq: 3600 },
  { id: 5, usage: 38.2, freq: 3987, baseFreq: 3600 },
  { id: 6, usage: 2.1,  freq: 3502, baseFreq: 3600 },
  { id: 7, usage: 18.9, freq: 3728, baseFreq: 3600 },
];

interface MemoryStats {
  total:    number;  // GB
  used:     number;
  cached:   number;
  buffers:  number;
  free:     number;
}

const BASE_MEMORY: MemoryStats = {
  total:   64,
  used:    18.4,
  cached:  12.8,
  buffers: 2.1,
  free:    30.7,
};

function usageColor(pct: number): string {
  if (pct < 30)  return '#4ade80';
  if (pct < 60)  return '#fbbf24';
  if (pct < 80)  return '#F97316';
  return '#f87171';
}

function UsageBar({ pct, color, width = 80 }: { pct: number; color: string; width?: number }) {
  const filled = Math.round((pct / 100) * width);
  return (
    <div className="flex items-center gap-1 overflow-hidden" style={{ width }}>
      <div
        className="h-1.5 rounded-full transition-all"
        style={{
          width:      `${(pct / 100) * 100}%`,
          background: color,
          opacity:    0.75,
          minWidth:   1,
        }}
      />
    </div>
  );
}

export default function CpuStatsPanel() {
  const [cores,    setCores]    = useState<CoreStats[]>(BASE_CORES);
  const [memory,   setMemory]   = useState<MemoryStats>(BASE_MEMORY);
  const [revealed, setRevealed] = useState(false);
  const [tick,     setTick]     = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(true);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setCores((prev) =>
        prev.map((c) => ({
          ...c,
          usage: Math.max(0.5, Math.min(99, c.usage + (Math.random() - 0.48) * 8)),
          freq:  Math.round(c.baseFreq + (Math.random() - 0.5) * 400),
        })),
      );
      setMemory((prev) => ({
        ...prev,
        used:   Math.max(8, Math.min(prev.total * 0.85, prev.used + (Math.random() - 0.5) * 0.3)),
        cached: Math.max(4, Math.min(prev.total * 0.35, prev.cached + (Math.random() - 0.5) * 0.2)),
      }));
    }, 1600);
    return () => clearInterval(id);
  }, []);

  const avgUsage   = cores.reduce((s, c) => s + c.usage, 0) / cores.length;
  const memUsedPct = (memory.used / memory.total) * 100;
  const memUsedColor = usageColor(memUsedPct);

  return (
    <div
      ref={ref}
      className="overflow-hidden font-mono"
      style={{
        background:   'rgba(1,1,10,0.97)',
        border:       '1px solid rgba(255,255,255,0.07)',
        borderRadius: '3px',
        boxShadow:    '0 0 0 1px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.6)',
        opacity:      revealed ? 1 : 0,
        transition:   'opacity 0.2s ease',
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
          construx@sys — cpu &amp; memory
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: 'rgba(240,239,255,0.2)' }}>
          avg {avgUsage.toFixed(1)}%
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          cat /proc/cpuinfo && free -h
        </span>
      </div>

      <div className="px-4 py-3">
        {/* CPU section */}
        <div className="mb-4">
          <div className="text-[7px] uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
            AMD EPYC 7543 · 8 cores · 3.6GHz
          </div>
          <div className="grid grid-cols-1 gap-1">
            {cores.map((core) => {
              const color = usageColor(core.usage);
              return (
                <div key={core.id} className="flex items-center gap-2 text-[8px]">
                  <span style={{ color: 'rgba(255,255,255,0.2)', minWidth: '28px', flexShrink: 0 }}>
                    cpu{core.id}
                  </span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width:      `${core.usage}%`,
                        background: color,
                        opacity:    0.75,
                        transition: 'width 0.4s ease, background 0.4s ease',
                      }}
                    />
                  </div>
                  <span className="tabular-nums flex-shrink-0" style={{ color, minWidth: '36px', textAlign: 'right' }}>
                    {core.usage.toFixed(1)}%
                  </span>
                  <span className="tabular-nums flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)', minWidth: '52px', textAlign: 'right' }}>
                    {core.freq}MHz
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: '12px' }} />

        {/* Memory section */}
        <div>
          <div className="text-[7px] uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Memory — {memory.total}GB DDR4 ECC
          </div>
          <div className="space-y-1.5">
            {[
              { label: 'used',    value: memory.used,    color: memUsedColor },
              { label: 'cached',  value: memory.cached,  color: '#7dd3fc'    },
              { label: 'buffers', value: memory.buffers, color: '#a78bfa'    },
              { label: 'free',    value: memory.free,    color: 'rgba(255,255,255,0.15)' },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-2 text-[8px]">
                <span style={{ color: 'rgba(255,255,255,0.2)', minWidth: '48px', flexShrink: 0 }}>
                  {row.label}
                </span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width:      `${(row.value / memory.total) * 100}%`,
                      background: row.color,
                      opacity:    0.75,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
                <span className="tabular-nums flex-shrink-0" style={{ color: row.color, minWidth: '44px', textAlign: 'right' }}>
                  {row.value.toFixed(1)}GB
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          8 cores · 64GB RAM · live · 1.6s
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: 'rgba(240,239,255,0.15)' }}>
          tick {tick}
        </span>
      </div>
    </div>
  );
}
