'use client';

import { useState, useEffect, useRef } from 'react';

interface TempSensor {
  adapter:  string;
  name:     string;
  temp:     number;
  high:     number;
  crit:     number;
  accent:   string;
}

const BASE: TempSensor[] = [
  { adapter: 'k10temp-pci-00c3',  name: 'Tdie',    temp: 38.2, high: 95.0, crit: 105.0, accent: '#F97316' },
  { adapter: 'k10temp-pci-00c3',  name: 'Tccd1',   temp: 36.5, high: 95.0, crit: 105.0, accent: '#F97316' },
  { adapter: 'k10temp-pci-00c3',  name: 'Tccd2',   temp: 37.1, high: 95.0, crit: 105.0, accent: '#F97316' },
  { adapter: 'nct6798-isa-02a0',  name: 'SYSTIN',  temp: 29.0, high: 80.0, crit: 90.0,  accent: '#4ade80' },
  { adapter: 'nct6798-isa-02a0',  name: 'CPUTIN',  temp: 40.5, high: 80.0, crit: 90.0,  accent: '#fbbf24' },
  { adapter: 'nct6798-isa-02a0',  name: 'AUXTIN0', temp: 26.5, high: 80.0, crit: 90.0,  accent: '#4ade80' },
  { adapter: 'nvme-pci-0100',     name: 'Composite',temp: 33.8, high: 84.8, crit: 84.8, accent: '#67e8f9' },
  { adapter: 'nvme-pci-0200',     name: 'Composite',temp: 35.1, high: 84.8, crit: 84.8, accent: '#67e8f9' },
];

function tempColor(temp: number, high: number, crit: number): string {
  const pct = temp / crit;
  if (pct < 0.4)  return '#67e8f9';
  if (pct < 0.6)  return '#4ade80';
  if (pct < 0.75) return '#fbbf24';
  if (pct < 0.9)  return '#F97316';
  return '#f87171';
}

function jitter(v: number, delta = 1.2): number {
  return Math.max(20, v + (Math.random() - 0.5) * delta);
}

export default function SensorsPanel() {
  const [revealed, setRevealed] = useState(0);
  const [sensors,  setSensors]  = useState<TempSensor[]>(BASE);
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
    const id = setTimeout(() => setRevealed((r) => r + 1), 80);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => {
      setSensors((prev) => prev.map((s) => ({ ...s, temp: jitter(s.temp, 0.8) })));
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const maxTemp = Math.max(...sensors.map((s) => s.temp));

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
          construx@sys — hardware sensors
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: 'rgba(240,239,255,0.2)' }}>
          peak {maxTemp.toFixed(1)}°c
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          sensors -j 2&gt;/dev/null | python3 -m json.tool
        </span>
      </div>

      {/* Column headers */}
      <div
        className="px-4 py-1 flex items-center select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.025)' }}
      >
        {[
          { label: 'ADAPTER',   width: '180px' },
          { label: 'SENSOR',    width: '80px'  },
          { label: 'TEMP',      width: '96px'  },
          { label: 'HIGH',      width: '64px'  },
          { label: 'CRIT',      width: '64px'  },
          { label: 'GAUGE',     width: 'auto'  },
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

      {/* Sensor rows */}
      <div className="px-4 py-2 space-y-1.5">
        {sensors.slice(0, revealed).map((s, i) => {
          const tc = tempColor(s.temp, s.high, s.crit);
          const barPct = Math.min(100, (s.temp / s.crit) * 100);
          return (
            <div key={i} className="flex items-center text-[8px] tabular-nums">
              <span style={{ color: s.accent + '70', minWidth: '180px', flexShrink: 0, fontSize: '7px' }}>
                {s.adapter}
              </span>
              <span style={{ color: 'rgba(240,239,255,0.45)', minWidth: '80px', flexShrink: 0 }}>
                {s.name}
              </span>
              <span style={{ color: tc, minWidth: '96px', flexShrink: 0 }}>
                +{s.temp.toFixed(1)}°C
              </span>
              <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '64px', flexShrink: 0 }}>
                +{s.high.toFixed(1)}°C
              </span>
              <span style={{ color: 'rgba(248,113,113,0.45)', minWidth: '64px', flexShrink: 0 }}>
                +{s.crit.toFixed(1)}°C
              </span>
              <div className="flex items-center gap-1.5 flex-1">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)', maxWidth: '80px' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${barPct}%`, background: tc, opacity: 0.8, transition: 'width 0.6s ease' }}
                  />
                </div>
                <span style={{ color: 'rgba(240,239,255,0.2)', fontSize: '7px' }}>{barPct.toFixed(0)}%</span>
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
          {BASE.length} sensors · lm-sensors 3.6.0 · live refresh
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          k10temp · nct6798 · nvme
        </span>
      </div>
    </div>
  );
}
