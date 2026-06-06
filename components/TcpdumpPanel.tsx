'use client';

import { useState, useEffect, useRef } from 'react';

interface PacketEntry {
  ts:      string;
  src:     string;
  srcPort: number;
  dst:     string;
  dstPort: number;
  proto:   'TCP' | 'UDP' | 'ICMP';
  flags:   string;
  len:     number;
  seq?:    string;
  ack?:    string;
}

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const BASE: PacketEntry[] = [
  { ts: '08:14:02.441221', src: '10.0.1.42',     srcPort: 54321, dst: '10.0.0.10', dstPort: 443, proto: 'TCP',  flags: '[S]',     len: 60,  seq: '0' },
  { ts: '08:14:02.441580', src: '10.0.0.10',     srcPort:   443, dst: '10.0.1.42', dstPort: 54321, proto: 'TCP', flags: '[S.]', len: 60, seq: '0', ack: '1' },
  { ts: '08:14:02.441729', src: '10.0.1.42',     srcPort: 54321, dst: '10.0.0.10', dstPort: 443, proto: 'TCP',  flags: '[.]',     len:  0,  ack: '1' },
  { ts: '08:14:02.442101', src: '10.0.1.42',     srcPort: 54321, dst: '10.0.0.10', dstPort: 443, proto: 'TCP',  flags: '[P.]',    len: 517 },
  { ts: '08:14:02.442890', src: '10.0.0.10',     srcPort:   443, dst: '10.0.1.42', dstPort: 54321, proto: 'TCP', flags: '[P.]', len: 78 },
  { ts: '08:14:02.489012', src: '82.44.12.91',   srcPort: 61882, dst: '10.0.0.10', dstPort: 443, proto: 'TCP',  flags: '[S]',     len: 60 },
  { ts: '08:14:02.490112', src: '10.0.0.10',     srcPort:   443, dst: '82.44.12.91', dstPort: 61882, proto: 'TCP', flags: '[S.]', len: 60 },
  { ts: '08:14:03.001441', src: '10.0.1.1',      srcPort:     0, dst: '10.0.0.10', dstPort: 0,   proto: 'ICMP', flags: 'echo-request', len: 84 },
  { ts: '08:14:03.001598', src: '10.0.0.10',     srcPort:     0, dst: '10.0.1.1',  dstPort: 0,   proto: 'ICMP', flags: 'echo-reply',   len: 84 },
  { ts: '08:14:03.244001', src: '127.0.0.1',     srcPort: 45212, dst: '127.0.0.1', dstPort: 6379, proto: 'TCP',  flags: '[P.]',    len: 44 },
  { ts: '08:14:03.244188', src: '127.0.0.1',     srcPort:  6379, dst: '127.0.0.1', dstPort: 45212, proto: 'TCP', flags: '[P.]', len: 92 },
  { ts: '08:14:03.891002', src: '10.0.1.44',     srcPort: 62001, dst: '10.0.0.10', dstPort: 443, proto: 'TCP',  flags: '[S]',     len: 60 },
  { ts: '08:14:04.002111', src: '10.0.0.10',     srcPort:   5432, dst: '127.0.0.1', dstPort: 54411, proto: 'TCP', flags: '[P.]', len: 128 },
  { ts: '08:14:04.004881', src: '127.0.0.1',     srcPort: 54411, dst: '10.0.0.10', dstPort: 5432, proto: 'TCP',  flags: '[.]',     len: 0 },
  { ts: '08:14:05.001441', src: '10.0.1.1',      srcPort:     0, dst: '10.0.0.10', dstPort: 0,   proto: 'ICMP', flags: 'echo-request', len: 84 },
];

const LIVE: PacketEntry[] = [
  { ts: '', src: '10.0.1.42', srcPort: 54322, dst: '10.0.0.10', dstPort: 443, proto: 'TCP', flags: '[P.]', len: 342 },
  { ts: '', src: '10.0.0.10', srcPort: 443, dst: '10.0.1.42', dstPort: 54322, proto: 'TCP', flags: '[.]', len: 0 },
  { ts: '', src: '127.0.0.1', srcPort: 45212, dst: '127.0.0.1', dstPort: 6379, proto: 'TCP', flags: '[P.]', len: 52 },
];

function protoColor(proto: PacketEntry['proto']): string {
  if (proto === 'TCP')  return '#60a5fa';
  if (proto === 'UDP')  return '#fbbf24';
  if (proto === 'ICMP') return '#a78bfa';
  return 'rgba(240,239,255,0.3)';
}

function flagColor(flags: string): string {
  if (flags.includes('[S]') && !flags.includes('.')) return '#4ade80';
  if (flags.includes('[S.]'))   return '#67e8f9';
  if (flags.includes('[FIN]') || flags.includes('[R]')) return '#f87171';
  if (flags.includes('echo'))   return '#a78bfa';
  return 'rgba(240,239,255,0.35)';
}

function fmtAddr(ip: string, port: number): string {
  if (port === 0) return ip;
  return `${ip}:${port}`;
}

export default function TcpdumpPanel() {
  const [revealed, setRevealed] = useState(0);
  const [live, setLive]         = useState<PacketEntry[]>([]);
  const [liveIdx, setLiveIdx]   = useState(0);
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
    const id = setTimeout(() => setRevealed((r) => r + 1), 75);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= BASE.length) return;
    const id = setInterval(() => {
      const now  = new Date();
      const ts   = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}.${String(now.getMilliseconds()).padStart(6,'0').slice(0,6)}`;
      const entry = { ...LIVE[liveIdx % LIVE.length], ts, len: rnd(40, 512) };
      setLive((prev) => [...prev.slice(-5), entry]);
      setLiveIdx((i) => i + 1);
    }, 2000);
    return () => clearInterval(id);
  }, [revealed, liveIdx]);

  const allDone  = revealed > BASE.length;
  const displayed = BASE.slice(0, allDone ? BASE.length : revealed);
  const rows      = [...displayed, ...live];
  const totalBytes = rows.reduce((s, r) => s + r.len, 0);

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
          construx@sys — tcpdump -i eth0 -n
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${rows.length} pkts · ${(totalBytes / 1024).toFixed(1)} KiB` : 'capturing…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          sudo tcpdump -i eth0 -n -q port 443 or port 6379 or port 5432 or icmp
        </span>
      </div>

      {/* Packets */}
      <div className="px-4 py-2 space-y-0.5">
        {rows.map((pkt, i) => (
          <div key={i} className="flex items-start text-[8px] leading-[1.6]">
            <span style={{ color: 'rgba(240,239,255,0.18)', minWidth: '88px', flexShrink: 0 }}>
              {pkt.ts}
            </span>
            <span style={{ color: protoColor(pkt.proto), minWidth: '40px', flexShrink: 0, fontWeight: 700 }}>
              {pkt.proto}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.45)', minWidth: '160px', flexShrink: 0 }}>
              {fmtAddr(pkt.src, pkt.srcPort)}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.2)', flexShrink: 0, marginRight: '4px' }}>→</span>
            <span style={{ color: 'rgba(240,239,255,0.45)', minWidth: '160px', flexShrink: 0 }}>
              {fmtAddr(pkt.dst, pkt.dstPort)}
            </span>
            <span style={{ color: flagColor(pkt.flags), minWidth: '88px', flexShrink: 0 }}>
              {pkt.flags}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.25)', flexShrink: 0 }}>
              len={pkt.len}
            </span>
          </div>
        ))}
        {allDone && (
          <div className="text-[8px] mt-0.5" style={{ color: 'rgba(74,222,128,0.3)' }}>
            ▌
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          tcpdump 4.99 · eth0 · promiscuous mode · libpcap 1.10
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● capturing' : 'loading'}
        </span>
      </div>
    </div>
  );
}
