'use client';

import { useState, useEffect, useRef } from 'react';

interface Device {
  hostname: string;
  ip:       string;
  os:       string;
  version:  string;
  lastSeen: string;
  routes:   string;
  tags:     string[];
  isOnline: boolean;
  isSelf:   boolean;
}

const DEVICES: Device[] = [
  { hostname: 'sys',              ip: '100.64.0.1',  os: 'linux',   version: '1.72.0', lastSeen: 'connected',     routes: '10.8.0.0/24', tags: ['tag:server'],    isOnline: true,  isSelf: true  },
  { hostname: 'dev-macbook',     ip: '100.64.0.2',  os: 'macos',   version: '1.72.0', lastSeen: 'connected',     routes: '',             tags: [],                isOnline: true,  isSelf: false },
  { hostname: 'vps-fra01',       ip: '100.64.0.3',  os: 'linux',   version: '1.70.0', lastSeen: 'connected',     routes: '192.168.1.0/24', tags: ['tag:server'],  isOnline: true,  isSelf: false },
  { hostname: 'ci-runner-01',    ip: '100.64.0.4',  os: 'linux',   version: '1.72.0', lastSeen: 'connected',     routes: '',             tags: ['tag:ci'],        isOnline: true,  isSelf: false },
  { hostname: 'ci-runner-02',    ip: '100.64.0.5',  os: 'linux',   version: '1.72.0', lastSeen: '4 minutes ago', routes: '',             tags: ['tag:ci'],        isOnline: false, isSelf: false },
  { hostname: 'staging-server',  ip: '100.64.0.6',  os: 'linux',   version: '1.68.0', lastSeen: '1 hour ago',    routes: '',             tags: ['tag:server'],    isOnline: false, isSelf: false },
  { hostname: 'ipad-pro',        ip: '100.64.0.7',  os: 'ios',     version: '1.72.0', lastSeen: '12 hours ago',  routes: '',             tags: [],                isOnline: false, isSelf: false },
  { hostname: 'exit-node-lon01', ip: '100.64.0.8',  os: 'linux',   version: '1.72.0', lastSeen: 'connected',     routes: '0.0.0.0/0',    tags: ['tag:exit-node'], isOnline: true,  isSelf: false },
];

const TOTAL = DEVICES.length;

function osColor(os: string): string {
  if (os === 'linux')  return '#4ade80';
  if (os === 'macos')  return '#60a5fa';
  if (os === 'ios')    return '#a78bfa';
  if (os === 'windows') return '#67e8f9';
  return 'rgba(240,239,255,0.3)';
}

function tagColor(tag: string): string {
  if (tag.includes('server'))   return 'rgba(249,115,22,0.5)';
  if (tag.includes('ci'))       return '#fbbf24';
  if (tag.includes('exit-node')) return '#f87171';
  return 'rgba(240,239,255,0.25)';
}

export default function TailnetStatusPanel() {
  const [revealed, setRevealed] = useState(0);
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
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 81);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone     = revealed > TOTAL;
  const shownDevs   = DEVICES.slice(0, Math.max(0, Math.min(DEVICES.length, revealed)));
  const onlineCount = DEVICES.filter((d) => d.isOnline).length;

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
          construx@sys — tailscale status
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${onlineCount}/${DEVICES.length} online` : 'querying…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          tailscale status --json | jq -r &apos;.Peers[] | [.HostName,.TailscaleIPs[0],.OS,.LastSeen] | @tsv&apos;
        </span>
      </div>

      {/* Column headers */}
      {shownDevs.length > 0 && (
        <div
          className="flex items-center px-4 py-0.5 text-[6.5px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ minWidth: '8px',   flexShrink: 0 }} />
          <span style={{ minWidth: '128px', flexShrink: 0 }}>Hostname</span>
          <span style={{ minWidth: '96px',  flexShrink: 0 }}>Tailscale IP</span>
          <span style={{ minWidth: '48px',  flexShrink: 0 }}>OS</span>
          <span style={{ minWidth: '52px',  flexShrink: 0 }}>Version</span>
          <span style={{ minWidth: '104px', flexShrink: 0 }}>Last Seen</span>
          <span>Routes / Tags</span>
        </div>
      )}

      {/* Device rows */}
      <div className="px-4 py-1.5 space-y-0.5">
        {shownDevs.map((d, i) => (
          <div
            key={i}
            className="flex items-center text-[7.5px] leading-[1.7]"
            style={{
              borderLeft: d.isOnline ? '2px solid rgba(74,222,128,0.4)' : '2px solid rgba(255,255,255,0.05)',
              paddingLeft: '4px',
            }}
          >
            <span style={{ minWidth: '8px', flexShrink: 0 }}>
              {d.isSelf && <span style={{ color: '#fbbf24', fontSize: '6px' }}>★</span>}
            </span>
            <span style={{ color: d.isOnline ? 'rgba(240,239,255,0.55)' : 'rgba(240,239,255,0.2)', minWidth: '128px', flexShrink: 0, fontWeight: d.isSelf ? 700 : 400 }}>
              {d.hostname}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.28)', minWidth: '96px', flexShrink: 0 }}>{d.ip}</span>
            <span style={{ color: osColor(d.os), minWidth: '48px', flexShrink: 0, fontSize: '7px' }}>{d.os}</span>
            <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '52px', flexShrink: 0 }}>{d.version}</span>
            <span style={{ color: d.isOnline ? '#4ade80' : 'rgba(240,239,255,0.18)', minWidth: '104px', flexShrink: 0 }}>{d.lastSeen}</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {d.routes && <span style={{ color: '#60a5fa', fontSize: '7px' }}>{d.routes}</span>}
              {d.tags.map((t, j) => (
                <span key={j} style={{ color: tagColor(t), fontSize: '6.5px', borderRadius: '2px', padding: '0 3px', background: 'rgba(255,255,255,0.04)' }}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>{onlineCount} online</span>
          <span>{DEVICES.length - onlineCount} offline</span>
          <span style={{ color: '#f87171' }}>1 exit node</span>
          <span className="ml-auto">tailnet: construx.ts.net · tailscale 1.72.0</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          tailscale 1.72.0 · wireguard mesh · coordination: controlplane.tailscale.com
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? `● ${DEVICES.length} devices` : 'loading'}
        </span>
      </div>
    </div>
  );
}
