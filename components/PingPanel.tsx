'use client';

import { useState, useEffect, useRef } from 'react';

interface PingTarget {
  label:    string;
  host:     string;
  region:   string;
  baseMs:   number;
  accent:   string;
  provider: string;
}

const TARGETS: PingTarget[] = [
  { label: 'London',       host: 'eu-west-2.aws.construxgroup.io',   region: 'eu-west-2',    baseMs:  8,  accent: '#F97316', provider: 'AWS'         },
  { label: 'Frankfurt',    host: 'eu-central-1.aws.construxgroup.io', region: 'eu-central-1', baseMs: 14,  accent: '#F97316', provider: 'AWS'         },
  { label: 'New York',     host: 'us-east-1.aws.construxgroup.io',   region: 'us-east-1',    baseMs: 72,  accent: '#7dd3fc', provider: 'AWS'         },
  { label: 'San Francisco', host: 'us-west-2.aws.construxgroup.io',  region: 'us-west-2',    baseMs: 131, accent: '#7dd3fc', provider: 'AWS'         },
  { label: 'Singapore',    host: 'ap-southeast-1.aws.construxgroup.io', region: 'ap-se-1',   baseMs: 168, accent: '#4ade80', provider: 'AWS'         },
  { label: 'Sydney',       host: 'ap-southeast-2.aws.construxgroup.io', region: 'ap-se-2',   baseMs: 241, accent: '#4ade80', provider: 'AWS'         },
  { label: 'Tokyo',        host: 'ap-northeast-1.aws.construxgroup.io', region: 'ap-ne-1',   baseMs: 195, accent: '#4ade80', provider: 'AWS'         },
  { label: 'São Paulo',    host: 'sa-east-1.aws.construxgroup.io',   region: 'sa-east-1',    baseMs: 187, accent: '#a78bfa', provider: 'AWS'         },
];

function msColor(ms: number): string {
  if (ms < 20)  return '#4ade80';
  if (ms < 80)  return '#4ade80';
  if (ms < 150) return '#fbbf24';
  if (ms < 250) return '#F97316';
  return '#f87171';
}

function msBar(ms: number, max = 300): number {
  return Math.min((ms / max) * 100, 100);
}

export default function PingPanel() {
  const [values,   setValues]   = useState<number[]>(TARGETS.map((t) => t.baseMs));
  const [revealed, setRevealed] = useState(0);
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
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TARGETS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 80);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setValues((prev) =>
        prev.map((v, i) => {
          const jitter = (Math.random() - 0.5) * TARGETS[i].baseMs * 0.18;
          return Math.max(1, Math.round(v + jitter));
        }),
      );
    }, 1800);
    return () => clearInterval(id);
  }, []);

  const visibleTargets = TARGETS.slice(0, revealed);
  const avgMs = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

  return (
    <div
      ref={ref}
      className="overflow-hidden font-mono"
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
          construx@sys — global latency
        </span>
        <span
          className="text-[8px] uppercase tracking-widest flex items-center gap-1.5 tabular-nums"
          style={{ color: 'rgba(74,222,128,0.55)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: '#4ade80', boxShadow: `0 0 4px rgba(74,222,128,${tick % 2 === 0 ? '0.7' : '0.3'})` }}
          />
          avg {avgMs}ms
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          ping -c4 --interval=1.8 --all-regions
        </span>
      </div>

      {/* Ping rows */}
      <div className="px-4 py-3 space-y-2.5">
        {visibleTargets.map((target, i) => {
          const ms    = values[i] ?? target.baseMs;
          const color = msColor(ms);
          const bar   = msBar(ms);

          return (
            <div key={target.label}>
              {/* Top row */}
              <div className="flex items-center gap-3 mb-1 text-[8px]">
                <span
                  style={{
                    color:     color,
                    opacity:   tick % 2 === 0 ? 1 : 0.5,
                    transition: 'opacity 0.4s ease',
                    flexShrink: 0,
                  }}
                >
                  ●
                </span>
                <span style={{ color: 'rgba(240,239,255,0.7)', minWidth: '90px', flexShrink: 0 }}>
                  {target.label}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.18)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {target.host}
                </span>
                <span
                  className="ml-auto tabular-nums font-semibold"
                  style={{ color, flexShrink: 0 }}
                >
                  {ms}ms
                </span>
                <span style={{ color: 'rgba(255,255,255,0.15)', flexShrink: 0 }}>
                  {target.region}
                </span>
              </div>

              {/* Latency bar */}
              <div className="ml-4 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width:      `${bar}%`,
                    background: color,
                    opacity:    0.7,
                    transition: 'width 0.4s ease, background 0.4s ease',
                  }}
                />
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
          {TARGETS.length} regions · aws route53 · 1.8s interval
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          icmp ttl=64
        </span>
      </div>
    </div>
  );
}
