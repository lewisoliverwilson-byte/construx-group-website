'use client';

import { useEffect, useState, useRef } from 'react';

interface PingRow {
  host: string;
  endpoint: string;
  accent: string;
  pingMs: number[];
}

const ROWS: PingRow[] = [
  { host: 'scoutr.io',      endpoint: '104.21.72.18',  accent: '#C8F50C', pingMs: [12, 14, 11, 13, 16, 12, 10, 15, 13, 14] },
  { host: 'themarqet.shop', endpoint: '172.67.139.4',  accent: '#3B82F6', pingMs: [18, 22, 19, 21, 17, 20, 23, 18, 22, 19] },
  { host: 'thehyve.io',     endpoint: '172.67.201.88', accent: '#8B5CF6', pingMs: [9,  11, 8,  10, 12, 9,  11, 8,  10, 9  ] },
  { host: 'construxgroup.io', endpoint: '108.162.215.1', accent: '#F97316', pingMs: [7, 8, 6, 9, 7, 8, 6, 8, 7, 9] },
];

function sparkbar(pings: number[], accent: string, active: boolean): React.ReactNode {
  const max = Math.max(...pings, 1);
  return (
    <div className="flex items-end gap-px" style={{ height: '16px' }}>
      {pings.map((p, i) => {
        const h = Math.max(2, Math.round((p / max) * 14));
        const isLatest = i === pings.length - 1;
        return (
          <div
            key={i}
            style={{
              width: '3px',
              height: `${h}px`,
              background: isLatest && active ? accent : `${accent}55`,
              borderRadius: '1px 1px 0 0',
              transition: 'height 0.3s ease',
            }}
          />
        );
      })}
    </div>
  );
}

export default function NetworkPingPanel() {
  const [visible, setVisible] = useState(false);
  const [tick, setTick] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          setVisible(true);
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setTick((t) => t + 1), 1800);
    return () => clearInterval(id);
  }, [visible]);

  return (
    <div
      ref={ref}
      className="px-5 mx-auto max-w-5xl"
      aria-hidden="true"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}
    >
      <div
        className="overflow-hidden"
        style={{
          background: 'rgba(0,0,6,0.75)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '3px',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-2.5 px-3 py-2 select-none"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: '#FF5F57' }} />
            <span className="w-2 h-2 rounded-full" style={{ background: '#FFBD2E' }} />
            <span className="w-2 h-2 rounded-full" style={{ background: '#28C840' }} />
          </div>
          <span
            className="font-mono text-[8px] uppercase tracking-[0.2em] flex-1 text-center"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            construx.network — endpoint.health
          </span>
          <span className="font-mono text-[8px] tabular-nums flex items-center gap-1" style={{ color: 'rgba(74,222,128,0.5)' }}>
            <span className="inline-block w-1 h-1 rounded-full status-blink" style={{ background: '#4ade80' }} />
            LIVE
          </span>
        </div>

        {/* Shell prompt */}
        <div
          className="px-3 py-1.5 select-none"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
        >
          <span className="font-mono text-[8px]" style={{ color: 'rgba(74,222,128,0.4)' }}>construx@sys:~$</span>
          <span className="font-mono text-[8px] ml-1.5" style={{ color: 'rgba(240,239,255,0.2)' }}>
            ping construx.fleet --all --interval=1800ms --format=table
          </span>
        </div>

        {/* Ping table */}
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-[9px]" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,4,0.4)' }}>
                {['HOST', 'ENDPOINT', 'P50', 'SPARKLINE', 'STATUS'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-1.5 text-left uppercase tracking-[0.15em]"
                    style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => {
                const p50 = Math.round(row.pingMs.reduce((a, b) => a + b, 0) / row.pingMs.length);
                const isLast = i === ROWS.length - 1;
                return (
                  <tr
                    key={row.host}
                    style={{ borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.03)' }}
                  >
                    <td className="px-4 py-2" style={{ color: row.accent }}>
                      {row.host}
                    </td>
                    <td className="px-4 py-2 tabular-nums" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      {row.endpoint}
                    </td>
                    <td className="px-4 py-2 tabular-nums" style={{ color: 'rgba(240,239,255,0.6)' }}>
                      {p50}ms
                    </td>
                    <td className="px-4 py-2">
                      {sparkbar(row.pingMs, row.accent, visible && tick > 0)}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className="flex items-center gap-1.5 uppercase tracking-widest"
                        style={{ color: 'rgba(74,222,128,0.7)', fontSize: '8px' }}
                      >
                        <span className="w-1 h-1 rounded-full" style={{ background: '#4ade80' }} />
                        200 OK
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-1.5 select-none"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}
        >
          <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
            {ROWS.length} endpoints · all nominal
          </span>
          <span className="font-mono text-[8px] tabular-nums" style={{ color: 'rgba(249,115,22,0.3)' }}>
            construx@sys
          </span>
        </div>
      </div>
    </div>
  );
}
