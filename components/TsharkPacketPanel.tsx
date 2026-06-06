'use client';

import { useState, useEffect, useRef } from 'react';

interface PacketRow {
  num:   number;
  time:  string;
  src:   string;
  dst:   string;
  proto: string;
  len:   number;
  info:  string;
  live?: boolean;
}

const PACKETS: PacketRow[] = [
  { num:  1, time: '0.000000', src: '10.0.0.12:51204',     dst: '10.0.0.1:443',         proto: 'TLS',  len:  583, info: 'Client Hello (SNI=construxgroup.io)' },
  { num:  2, time: '0.001142', src: '10.0.0.1:443',         dst: '10.0.0.12:51204',      proto: 'TLS',  len: 1514, info: 'Server Hello + Certificate' },
  { num:  3, time: '0.001480', src: '10.0.0.12:51204',     dst: '10.0.0.1:443',         proto: 'TLS',  len:  127, info: 'Client Key Exchange, Change Cipher' },
  { num:  4, time: '0.001922', src: '10.0.0.1:443',         dst: '10.0.0.12:51204',      proto: 'TLS',  len:   66, info: 'New Session Ticket, Change Cipher' },
  { num:  5, time: '0.002301', src: '10.0.0.12:51204',     dst: '10.0.0.1:443',         proto: 'HTTP', len:  488, info: 'GET /api/posts HTTP/2' },
  { num:  6, time: '0.014802', src: '10.0.0.1:443',         dst: '10.0.0.12:51204',      proto: 'HTTP', len: 2841, info: 'HTTP/2 200 OK (application/json)' },
  { num:  7, time: '0.021004', src: '10.0.0.42:49122',     dst: '10.0.0.1:443',         proto: 'TLS',  len:  321, info: 'Application Data [encrypted]' },
  { num:  8, time: '0.022100', src: '10.0.0.1:5432',        dst: '10.0.0.18:41088',      proto: 'PGSQL',len:  204, info: 'Query: SELECT * FROM posts WHERE published=true' },
  { num:  9, time: '0.034711', src: '10.0.0.18:41088',     dst: '10.0.0.1:5432',        proto: 'PGSQL',len: 4192, info: 'DataRow (18 rows) CommandComplete' },
  { num: 10, time: '0.041023', src: '10.0.0.12:51204',     dst: '8.8.8.8:53',           proto: 'DNS',  len:   70, info: 'Standard query A construxgroup.io' },
  { num: 11, time: '0.042811', src: '8.8.8.8:53',           dst: '10.0.0.12:51204',      proto: 'DNS',  len:   86, info: 'Standard query response A 104.21.14.53' },
  { num: 12, time: '0.055002', src: '10.0.0.1:6379',        dst: '10.0.0.12:52018',      proto: 'REDIS',len:   64, info: 'Inline command: GET session:abc123' },
  { num: 13, time: '0.055441', src: '10.0.0.12:52018',     dst: '10.0.0.1:6379',        proto: 'REDIS',len:  128, info: 'Bulk string: {"userId":"lewis","role":"admin"}' },
  { num: 14, time: '0.061008', src: '10.0.0.15:51310',     dst: '10.0.0.1:443',         proto: 'HTTP', len:  841, info: 'POST /api/posts HTTP/2 (application/json)', live: true },
  { num: 15, time: '0.084221', src: '10.0.0.1:443',         dst: '10.0.0.15:51310',      proto: 'HTTP', len:  412, info: 'HTTP/2 201 Created (application/json)', live: true },
  { num: 16, time: '0.092003', src: '10.0.0.12:51204',     dst: '10.0.0.1:443',         proto: 'TCP',  len:   66, info: 'ACK FIN — connection closing' },
];

function protoColor(proto: string): string {
  if (proto === 'TLS')   return '#60a5fa';
  if (proto === 'HTTP')  return '#4ade80';
  if (proto === 'DNS')   return '#fbbf24';
  if (proto === 'PGSQL') return '#f97316';
  if (proto === 'REDIS') return '#f87171';
  if (proto === 'TCP')   return 'rgba(240,239,255,0.3)';
  return 'rgba(240,239,255,0.4)';
}

function lenColor(len: number): string {
  if (len > 2000) return '#f87171';
  if (len > 500)  return '#fbbf24';
  return 'rgba(240,239,255,0.25)';
}

export default function TsharkPacketPanel() {
  const [revealed, setRevealed]  = useState(0);
  const [liveNum,  setLiveNum]   = useState(16);
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
    if (revealed === 0 || revealed > PACKETS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 82);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= PACKETS.length) return;
    const id = setInterval(() => setLiveNum((n) => n + Math.floor(1 + Math.random() * 3)), 2000);
    return () => clearInterval(id);
  }, [revealed]);

  const allDone   = revealed > PACKETS.length;
  const displayed = PACKETS.slice(0, allDone ? PACKETS.length : revealed);

  const totalBytes = PACKETS.reduce((s, p) => s + p.len, 0);
  const protoSet   = [...new Set(PACKETS.map((p) => p.proto))];

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
          construx@sys — tshark -i eth0 -Y "ip"
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveNum} packets` : 'capturing…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          sudo tshark -i eth0 -Y "ip" -T fields -e frame.number -e frame.time_relative -e ip.src -e ip.dst -e _ws.col.Protocol -e frame.len -e _ws.col.Info
        </span>
      </div>

      {/* Column headers */}
      {revealed > 0 && (
        <div
          className="flex items-center px-4 py-1 text-[7px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.16)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ minWidth: '28px',  flexShrink: 0 }}>No.</span>
          <span style={{ minWidth: '64px',  flexShrink: 0 }}>Time</span>
          <span style={{ minWidth: '140px', flexShrink: 0 }}>Source</span>
          <span style={{ minWidth: '140px', flexShrink: 0 }}>Destination</span>
          <span style={{ minWidth: '52px',  flexShrink: 0 }}>Proto</span>
          <span style={{ minWidth: '40px',  flexShrink: 0 }}>Len</span>
          <span>Info</span>
        </div>
      )}

      {/* Packet rows */}
      <div className="px-4 py-1.5 space-y-0.5">
        {displayed.map((p, i) => (
          <div
            key={i}
            className="flex items-start text-[8px] leading-[1.6]"
            style={{
              background: p.live ? 'rgba(74,222,128,0.03)' : 'transparent',
              borderLeft: p.live ? '2px solid rgba(74,222,128,0.2)' : '2px solid transparent',
              paddingLeft: '2px',
            }}
          >
            <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '28px', flexShrink: 0 }}>
              {p.num}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '64px', flexShrink: 0 }}>
              {p.time}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.4)', minWidth: '140px', flexShrink: 0 }}>
              {p.src}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.35)', minWidth: '140px', flexShrink: 0 }}>
              {p.dst}
            </span>
            <span style={{ color: protoColor(p.proto), minWidth: '52px', flexShrink: 0, fontWeight: 700 }}>
              {p.proto}
            </span>
            <span style={{ color: lenColor(p.len), minWidth: '40px', flexShrink: 0 }}>
              {p.len}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.35)' }}>
              {p.info}
            </span>
          </div>
        ))}
        {allDone && (
          <div className="text-[8px] mt-0.5" style={{ color: 'rgba(74,222,128,0.3)' }}>▌</div>
        )}
      </div>

      {/* Protocol legend */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[7.5px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          {protoSet.map((proto) => (
            <span key={proto} style={{ color: protoColor(proto) }}>■ {proto}</span>
          ))}
          <span className="ml-auto">{totalBytes.toLocaleString()} bytes captured</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          tshark 4.4.2 · interface eth0 · construxgroup.io
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● live capture' : 'loading'}
        </span>
      </div>
    </div>
  );
}
