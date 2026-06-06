'use client';

import { useState, useEffect, useRef } from 'react';

interface Hop {
  n: number;
  host: string;
  ip: string;
  ms1: string;
  ms2: string;
  ms3: string;
  highlight?: boolean;
}

const HOPS: Hop[] = [
  { n: 1,  host: 'router.local',              ip: '192.168.1.1',      ms1: '1.2',   ms2: '1.1',   ms3: '1.3' },
  { n: 2,  host: 'dsl-gw01.isp.net',          ip: '84.45.10.1',       ms1: '8.4',   ms2: '8.7',   ms3: '8.5' },
  { n: 3,  host: 'core-01.isp.net',           ip: '84.45.0.1',        ms1: '11.2',  ms2: '11.4',  ms3: '11.1' },
  { n: 4,  host: 'ae-3.ix.lon.isp.net',       ip: '195.66.230.250',   ms1: '14.8',  ms2: '15.1',  ms3: '14.9' },
  { n: 5,  host: 'lon-bb1.amazon.com',        ip: '52.93.12.50',      ms1: '17.3',  ms2: '17.2',  ms3: '17.6', highlight: true },
  { n: 6,  host: 'cloudfront-edge-lon.net',   ip: '54.230.40.10',     ms1: '19.1',  ms2: '19.3',  ms3: '18.9', highlight: true },
  { n: 7,  host: 's3.eu-west-2.amazonaws.com',ip: '52.94.9.1',        ms1: '22.4',  ms2: '22.7',  ms3: '22.5' },
  { n: 8,  host: 'amplify.eu-west-2.aws.com', ip: '35.176.80.10',     ms1: '24.8',  ms2: '24.9',  ms3: '25.1', highlight: true },
  { n: 9,  host: 'construxgroup.io',          ip: '54.230.40.11',     ms1: '26.2',  ms2: '26.4',  ms3: '26.1', highlight: true },
];

function colorForMs(ms: string): string {
  const v = parseFloat(ms);
  if (v < 10) return 'rgba(74,222,128,0.8)';
  if (v < 20) return 'rgba(253,224,71,0.75)';
  if (v < 50) return 'rgba(249,115,22,0.8)';
  return 'rgba(248,113,113,0.85)';
}

export default function TraceroutePanel() {
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
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > HOPS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 180);
    return () => clearTimeout(id);
  }, [revealed]);

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
          construx@sys — network trace
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.5)' }}>
          {HOPS.length} hops
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          traceroute -n construxgroup.io
        </span>
      </div>

      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-1.5 text-[7px] uppercase tracking-widest select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.18)' }}
      >
        <span style={{ minWidth: '18px' }}>#</span>
        <span style={{ minWidth: '200px' }}>HOST</span>
        <span style={{ minWidth: '120px' }}>IP</span>
        <span style={{ minWidth: '52px' }}>RTT₁</span>
        <span style={{ minWidth: '52px' }}>RTT₂</span>
        <span style={{ minWidth: '52px' }}>RTT₃</span>
      </div>

      {/* Hops */}
      <div className="py-2">
        {HOPS.map((hop, i) => (
          <div
            key={hop.n}
            className="flex items-center gap-3 px-4 py-0.5 text-[8px]"
            style={{
              background: hop.highlight ? 'rgba(249,115,22,0.03)' : 'transparent',
              opacity: i < revealed ? 1 : 0,
              transition: 'opacity 0.15s ease',
            }}
          >
            <span
              className="tabular-nums text-right"
              style={{ color: 'rgba(255,255,255,0.2)', minWidth: '18px' }}
            >
              {hop.n}
            </span>
            <span
              className="truncate"
              style={{
                color: hop.highlight ? 'rgba(249,115,22,0.8)' : 'rgba(240,239,255,0.45)',
                minWidth: '200px',
              }}
            >
              {hop.host}
            </span>
            <span
              className="tabular-nums"
              style={{ color: 'rgba(255,255,255,0.25)', minWidth: '120px', fontFamily: 'inherit' }}
            >
              {hop.ip}
            </span>
            <span className="tabular-nums" style={{ color: colorForMs(hop.ms1), minWidth: '52px' }}>
              {hop.ms1} ms
            </span>
            <span className="tabular-nums" style={{ color: colorForMs(hop.ms2), minWidth: '52px' }}>
              {hop.ms2} ms
            </span>
            <span className="tabular-nums" style={{ color: colorForMs(hop.ms3), minWidth: '52px' }}>
              {hop.ms3} ms
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          src: 192.168.1.100 → dst: construxgroup.io
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.45)' }}>
          26.2ms total
        </span>
      </div>
    </div>
  );
}
