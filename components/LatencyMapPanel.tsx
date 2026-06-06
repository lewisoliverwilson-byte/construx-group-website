'use client';

import { useState, useEffect } from 'react';

interface Node {
  city: string;
  code: string;
  base: number;
  jitter: number;
  color: string;
}

const NODES: Node[] = [
  { city: 'London',       code: 'LHR', base: 4,   jitter: 3,  color: '#4ade80'  },
  { city: 'Frankfurt',    code: 'FRA', base: 18,  jitter: 4,  color: '#4ade80'  },
  { city: 'New York',     code: 'JFK', base: 82,  jitter: 6,  color: '#67e8f9'  },
  { city: 'Los Angeles',  code: 'LAX', base: 140, jitter: 8,  color: '#67e8f9'  },
  { city: 'Singapore',    code: 'SIN', base: 168, jitter: 9,  color: '#a78bfa'  },
  { city: 'Tokyo',        code: 'NRT', base: 202, jitter: 11, color: '#a78bfa'  },
  { city: 'Sydney',       code: 'SYD', base: 289, jitter: 12, color: '#F97316'  },
  { city: 'São Paulo',    code: 'GRU', base: 215, jitter: 10, color: '#F97316'  },
];

const MAX_MS = 350;

function randLatency(base: number, jitter: number): number {
  return Math.max(1, base + Math.round((Math.random() - 0.5) * jitter * 2));
}

function latencyColor(ms: number): string {
  if (ms < 30)  return '#4ade80';
  if (ms < 100) return '#FBBF24';
  if (ms < 200) return '#F97316';
  return '#f87171';
}

export default function LatencyMapPanel() {
  const [latencies, setLatencies] = useState<Record<string, number>>(() =>
    Object.fromEntries(NODES.map((n) => [n.code, randLatency(n.base, n.jitter)]))
  );
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setLatencies(
        Object.fromEntries(NODES.map((n) => [n.code, randLatency(n.base, n.jitter)]))
      );
      setTick((t) => t + 1);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  const avgLatency = Math.round(
    Object.values(latencies).reduce((a, b) => a + b, 0) / NODES.length
  );

  return (
    <div
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
          construx@sys — ping — global latency
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.55)' }}>
          avg {avgLatency}ms
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          {`for r in ${NODES.map((n) => n.code).join(' ')}; do ping -c1 edge-$r.construxgroup.io; done`}
        </span>
      </div>

      {/* Nodes */}
      <div className="p-4 space-y-2.5">
        {NODES.map((node) => {
          const ms = latencies[node.code] ?? node.base;
          const pct = Math.min(100, (ms / MAX_MS) * 100);
          const color = latencyColor(ms);

          return (
            <div key={node.code} className="flex items-center gap-3">
              {/* Location */}
              <div className="flex-shrink-0" style={{ minWidth: '120px' }}>
                <span className="text-[8px] uppercase tracking-[0.12em]" style={{ color: 'rgba(240,239,255,0.25)' }}>
                  {node.code}
                </span>
                <span className="text-[10px] ml-2" style={{ color: 'rgba(240,239,255,0.55)' }}>
                  {node.city}
                </span>
              </div>

              {/* Bar */}
              <div
                className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: color,
                    opacity: 0.7,
                    transition: 'width 0.8s ease, background 0.4s ease',
                  }}
                />
              </div>

              {/* Latency */}
              <span
                className="text-[10px] tabular-nums flex-shrink-0"
                style={{ color, minWidth: '44px', textAlign: 'right' }}
              >
                {ms}ms
              </span>

              {/* Pulse */}
              <span
                className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background: color,
                  boxShadow: `0 0 4px ${color}`,
                  opacity: tick % 2 === 0 ? 0.3 : 0.9,
                  transition: 'opacity 0.8s ease',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,4,0.5)' }}
      >
        <div className="flex items-center gap-4">
          <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.5)' }}>
            ● edge: eu-west-2
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.1)' }}>TTL=64</span>
          <span className="text-[8px]" style={{ color: 'rgba(249,115,22,0.3)' }}>AWS Amplify CDN</span>
        </div>
      </div>
    </div>
  );
}
