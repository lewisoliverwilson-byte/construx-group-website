'use client';

import { useState, useEffect, useRef } from 'react';

interface Monitor {
  name:      string;
  url:       string;
  uptime:    number;
  p50:       number;
  p95:       number;
  status:    'up' | 'degraded' | 'down';
  accent:    string;
  checks:    boolean[];
}

const MONITORS: Monitor[] = [
  {
    name:   'Scoutr',
    url:    'scoutr.io',
    uptime: 99.97,
    p50:    43,
    p95:    128,
    status: 'up',
    accent: '#F97316',
    checks: [true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,false,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true],
  },
  {
    name:   'The Marqet',
    url:    'themarqet.io',
    uptime: 100.0,
    p50:    28,
    p95:    84,
    status: 'up',
    accent: '#7dd3fc',
    checks: Array(60).fill(true),
  },
  {
    name:   'The Hyve',
    url:    'thehyve.io',
    uptime: 99.94,
    p50:    67,
    p95:    190,
    status: 'up',
    accent: '#4ade80',
    checks: [true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,false,false,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true],
  },
  {
    name:   'construxgroup.io',
    url:    'construxgroup.io',
    uptime: 100.0,
    p50:    22,
    p95:    61,
    status: 'up',
    accent: '#a78bfa',
    checks: Array(60).fill(true),
  },
];

function statusColor(status: Monitor['status']): string {
  switch (status) {
    case 'up':       return '#4ade80';
    case 'degraded': return '#fbbf24';
    case 'down':     return '#f87171';
  }
}

function statusLabel(status: Monitor['status']): string {
  switch (status) {
    case 'up':       return 'operational';
    case 'degraded': return 'degraded';
    case 'down':     return 'incident';
  }
}

function p50Color(ms: number): string {
  if (ms < 50)  return '#4ade80';
  if (ms < 100) return '#fbbf24';
  return '#F97316';
}

export default function UptimePanel() {
  const [tick, setTick] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
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
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > MONITORS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 120);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2800);
    return () => clearInterval(id);
  }, []);

  const allUp = MONITORS.every((m) => m.status === 'up');

  return (
    <div
      ref={ref}
      className="overflow-hidden font-mono"
      style={{
        background: 'rgba(1,1,10,0.97)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '3px',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.6)',
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
          construx@sys — uptime monitor
        </span>
        <span
          className="text-[8px] uppercase tracking-widest flex items-center gap-1.5"
          style={{ color: allUp ? 'rgba(74,222,128,0.55)' : 'rgba(251,191,36,0.7)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: allUp ? '#4ade80' : '#fbbf24', boxShadow: `0 0 4px ${allUp ? 'rgba(74,222,128,0.7)' : 'rgba(251,191,36,0.7)'}` }}
          />
          {allUp ? 'all systems operational' : 'degraded'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          checkly run --all --format=table --period=30d
        </span>
      </div>

      {/* Monitor rows */}
      <div className="px-4 py-3 space-y-4">
        {MONITORS.map((monitor, i) => {
          const vis = i < revealed;
          const dotPulse = tick % 2 === 0;
          return (
            <div
              key={monitor.name}
              style={{ opacity: vis ? 1 : 0, transition: 'opacity 0.15s ease' }}
            >
              {/* Header row */}
              <div className="flex items-center gap-3 mb-1.5 text-[8px]">
                <span
                  style={{
                    color: statusColor(monitor.status),
                    transition: 'opacity 0.5s ease',
                    opacity: dotPulse ? 1 : 0.5,
                  }}
                >
                  ●
                </span>
                <span style={{ color: monitor.accent, fontWeight: 600, minWidth: '110px' }}>
                  {monitor.name}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>{monitor.url}</span>
                <span className="ml-auto" style={{ color: statusColor(monitor.status) }}>
                  {statusLabel(monitor.status)}
                </span>
              </div>

              {/* Check history sparkline */}
              <div className="flex items-end gap-px mb-1.5 ml-4">
                {monitor.checks.map((ok, ci) => (
                  <div
                    key={ci}
                    style={{
                      width:            4,
                      height:           12,
                      background:       ok ? `${monitor.accent}80` : 'rgba(248,113,113,0.6)',
                      borderRadius:     1,
                      flexShrink:       0,
                    }}
                  />
                ))}
              </div>

              {/* Metrics row */}
              <div className="flex items-center gap-5 ml-4 text-[8px]">
                <span>
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}>uptime </span>
                  <span style={{ color: monitor.uptime >= 99.9 ? '#4ade80' : '#fbbf24', fontWeight: 700 }}>
                    {monitor.uptime.toFixed(2)}%
                  </span>
                </span>
                <span>
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}>p50 </span>
                  <span style={{ color: p50Color(monitor.p50), fontVariantNumeric: 'tabular-nums' }}>
                    {monitor.p50}ms
                  </span>
                </span>
                <span>
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}>p95 </span>
                  <span style={{ color: p50Color(monitor.p95), fontVariantNumeric: 'tabular-nums' }}>
                    {monitor.p95}ms
                  </span>
                </span>
                <span style={{ color: 'rgba(255,255,255,0.12)' }}>
                  30d · 60 checks
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
          {MONITORS.length} monitors · checkly + aws route53
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: 'rgba(240,239,255,0.15)' }}>
          5min intervals
        </span>
      </div>
    </div>
  );
}
