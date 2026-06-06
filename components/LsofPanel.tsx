'use client';

import { useState, useEffect, useRef } from 'react';

interface LsofEntry {
  command: string;
  pid:     number;
  type:    string;
  proto:   string;
  local:   string;
  remote:  string;
  state:   string;
}

const BASE: LsofEntry[] = [
  { command: 'node',      pid: 14832, type: 'IPv4', proto: 'TCP', local: '127.0.0.1:3000',       remote: '127.0.0.1:54210',    state: 'ESTABLISHED' },
  { command: 'node',      pid: 14832, type: 'IPv4', proto: 'TCP', local: '0.0.0.0:3000',          remote: '*:*',                state: 'LISTEN' },
  { command: 'postgres',  pid:  7241, type: 'IPv4', proto: 'TCP', local: '127.0.0.1:5432',        remote: '127.0.0.1:54411',    state: 'ESTABLISHED' },
  { command: 'postgres',  pid:  7241, type: 'IPv4', proto: 'TCP', local: '0.0.0.0:5432',          remote: '*:*',                state: 'LISTEN' },
  { command: 'redis-ser', pid:  8120, type: 'IPv4', proto: 'TCP', local: '127.0.0.1:6379',        remote: '*:*',                state: 'LISTEN' },
  { command: 'redis-ser', pid:  8120, type: 'IPv4', proto: 'TCP', local: '127.0.0.1:6379',        remote: '127.0.0.1:45212',    state: 'ESTABLISHED' },
  { command: 'nginx',     pid:  1201, type: 'IPv4', proto: 'TCP', local: '0.0.0.0:80',            remote: '*:*',                state: 'LISTEN' },
  { command: 'nginx',     pid:  1201, type: 'IPv4', proto: 'TCP', local: '0.0.0.0:443',           remote: '*:*',                state: 'LISTEN' },
  { command: 'nginx',     pid:  1201, type: 'IPv4', proto: 'TCP', local: '10.0.0.10:443',         remote: '82.44.12.91:61882',  state: 'ESTABLISHED' },
  { command: 'nginx',     pid:  1201, type: 'IPv4', proto: 'TCP', local: '10.0.0.10:443',         remote: '10.0.1.42:54321',    state: 'ESTABLISHED' },
  { command: 'wireguard', pid:  2841, type: 'IPv4', proto: 'UDP', local: '0.0.0.0:51820',         remote: '*:*',                state: '' },
  { command: 'sshd',      pid:   941, type: 'IPv4', proto: 'TCP', local: '0.0.0.0:22',            remote: '*:*',                state: 'LISTEN' },
  { command: 'sshd',      pid: 15021, type: 'IPv4', proto: 'TCP', local: '10.0.0.10:22',          remote: '192.168.1.10:52281', state: 'ESTABLISHED' },
  { command: 'prometheu', pid:  3401, type: 'IPv4', proto: 'TCP', local: '0.0.0.0:9090',          remote: '*:*',                state: 'LISTEN' },
  { command: 'node',      pid: 14833, type: 'IPv4', proto: 'TCP', local: '127.0.0.1:3001',        remote: '*:*',                state: 'LISTEN' },
  { command: 'containerd',pid:  1899, type: 'IPv4', proto: 'TCP', local: '127.0.0.1:9091',        remote: '*:*',                state: 'LISTEN' },
  { command: 'dockerd',   pid:  2001, type: 'IPv4', proto: 'TCP', local: '127.0.0.1:2376',        remote: '*:*',                state: 'LISTEN' },
  { command: 'grafana',   pid:  3810, type: 'IPv4', proto: 'TCP', local: '0.0.0.0:3002',          remote: '*:*',                state: 'LISTEN' },
];

const LIVE: LsofEntry[] = [
  { command: 'nginx',  pid: 1201,  type: 'IPv4', proto: 'TCP', local: '10.0.0.10:443', remote: '91.108.4.11:55091',  state: 'ESTABLISHED' },
  { command: 'node',   pid: 14832, type: 'IPv4', proto: 'TCP', local: '127.0.0.1:3000', remote: '127.0.0.1:54522', state: 'ESTABLISHED' },
  { command: 'sshd',   pid: 15099, type: 'IPv4', proto: 'TCP', local: '10.0.0.10:22',  remote: '10.0.1.5:62001',   state: 'ESTABLISHED' },
];

function stateColor(state: string): string {
  if (state === 'ESTABLISHED') return '#4ade80';
  if (state === 'LISTEN')      return '#60a5fa';
  if (state === 'TIME_WAIT')   return '#fbbf24';
  if (state === 'CLOSE_WAIT')  return '#f87171';
  return 'rgba(240,239,255,0.25)';
}

function cmdColor(cmd: string): string {
  if (cmd === 'node')       return '#4ade80';
  if (cmd === 'nginx')      return '#67e8f9';
  if (cmd === 'postgres')   return '#60a5fa';
  if (cmd === 'redis-ser')  return '#f87171';
  if (cmd === 'wireguard')  return '#a78bfa';
  if (cmd === 'sshd')       return '#fbbf24';
  if (cmd === 'prometheu')  return '#fb923c';
  if (cmd === 'grafana')    return '#fb923c';
  return 'rgba(240,239,255,0.5)';
}

export default function LsofPanel() {
  const [revealed, setRevealed] = useState(0);
  const [live, setLive]         = useState<LsofEntry[]>([]);
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
    const id = setTimeout(() => setRevealed((r) => r + 1), 76);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= BASE.length) return;
    const id = setInterval(() => {
      const entry = { ...LIVE[liveIdx % LIVE.length] };
      setLive((prev) => [...prev.slice(-3), entry]);
      setLiveIdx((i) => i + 1);
    }, 2300);
    return () => clearInterval(id);
  }, [revealed, liveIdx]);

  const allDone  = revealed > BASE.length;
  const displayed = BASE.slice(0, allDone ? BASE.length : revealed);
  const rows      = [...displayed, ...live];

  const listening   = rows.filter((r) => r.state === 'LISTEN').length;
  const established = rows.filter((r) => r.state === 'ESTABLISHED').length;

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
          construx@sys — lsof -i -n -P
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${rows.length} fds` : 'scanning…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>sudo lsof -i -n -P | grep -E &apos;LISTEN|ESTABLISHED|UDP&apos;</span>
      </div>

      {/* Column headers */}
      {revealed > 0 && (
        <div
          className="flex items-center px-4 py-1 text-[7px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.16)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ minWidth: '76px', flexShrink: 0 }}>Command</span>
          <span style={{ minWidth: '44px', flexShrink: 0 }}>PID</span>
          <span style={{ minWidth: '36px', flexShrink: 0 }}>Proto</span>
          <span style={{ minWidth: '180px', flexShrink: 0 }}>Local</span>
          <span style={{ minWidth: '180px', flexShrink: 0 }}>Remote</span>
          <span>State</span>
        </div>
      )}

      {/* Rows */}
      <div className="px-4 py-1.5 space-y-0.5">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center text-[8px] leading-[1.7]">
            <span style={{ color: cmdColor(row.command), minWidth: '76px', flexShrink: 0, fontWeight: 700 }}>
              {row.command}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.28)', minWidth: '44px', flexShrink: 0 }}>
              {row.pid}
            </span>
            <span style={{ color: row.proto === 'UDP' ? '#a78bfa' : '#60a5fa', minWidth: '36px', flexShrink: 0 }}>
              {row.proto}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.45)', minWidth: '180px', flexShrink: 0 }}>
              {row.local}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '180px', flexShrink: 0 }}>
              {row.remote}
            </span>
            <span style={{ color: stateColor(row.state), fontWeight: row.state === 'ESTABLISHED' ? 600 : 400 }}>
              {row.state || '—'}
            </span>
          </div>
        ))}
        {allDone && (
          <div className="text-[8px] mt-0.5" style={{ color: 'rgba(74,222,128,0.3)' }}>▌</div>
        )}
      </div>

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-4 px-4 py-1.5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
        >
          <span className="text-[8px]" style={{ color: 'rgba(96,165,250,0.6)' }}>LISTEN {listening}</span>
          <span className="text-[8px]" style={{ color: 'rgba(74,222,128,0.6)' }}>ESTABLISHED {established}</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          lsof 4.98 · /proc/net/tcp · /proc/net/tcp6
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● live' : 'scanning'}
        </span>
      </div>
    </div>
  );
}
