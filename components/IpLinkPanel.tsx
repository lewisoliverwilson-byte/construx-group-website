'use client';

import { useState, useEffect, useRef } from 'react';

interface LinkEntry {
  idx:    number;
  name:   string;
  flags:  string;
  mtu:    number;
  state:  'UP' | 'DOWN' | 'UNKNOWN';
  mac:    string;
  type:   string;
  txrx?:  string;
}

const LINKS: LinkEntry[] = [
  { idx: 1, name: 'lo',       flags: '<LOOPBACK,UP,LOWER_UP>', mtu: 65536, state: 'UNKNOWN', mac: '00:00:00:00:00:00', type: 'loopback' },
  { idx: 2, name: 'eth0',     flags: '<BROADCAST,MULTICAST,UP,LOWER_UP>', mtu: 1500, state: 'UP', mac: 'fa:16:3e:4a:b2:1c', type: 'ether',    txrx: 'RX: 14.2 GiB  TX: 2.8 GiB' },
  { idx: 3, name: 'eth1',     flags: '<BROADCAST,MULTICAST>', mtu: 1500, state: 'DOWN', mac: 'fa:16:3e:7c:d4:88', type: 'ether' },
  { idx: 4, name: 'wg0',      flags: '<POINTOPOINT,NOARP,UP,LOWER_UP>', mtu: 1420, state: 'UNKNOWN', mac: '', type: 'none', txrx: 'RX: 822 MiB  TX: 1.1 GiB' },
  { idx: 5, name: 'docker0',  flags: '<NO-CARRIER,BROADCAST,MULTICAST,UP>', mtu: 1500, state: 'DOWN', mac: '02:42:d4:1b:aa:03', type: 'ether' },
  { idx: 6, name: 'cni0',     flags: '<BROADCAST,MULTICAST,UP,LOWER_UP>', mtu: 1450, state: 'UP', mac: '0e:c8:3f:22:81:d4', type: 'ether', txrx: 'RX: 4.1 GiB  TX: 3.6 GiB' },
  { idx: 7, name: 'flannel.1',flags: '<BROADCAST,MULTICAST,UP,LOWER_UP>', mtu: 1450, state: 'UNKNOWN', mac: 'c2:44:12:b8:f3:02', type: 'ether', txrx: 'RX: 892 MiB  TX: 1.3 GiB' },
];

function stateColor(s: LinkEntry['state']): string {
  if (s === 'UP')      return '#4ade80';
  if (s === 'DOWN')    return '#f87171';
  return 'rgba(240,239,255,0.3)';
}

function nameColor(name: string): string {
  if (name === 'lo')            return 'rgba(240,239,255,0.3)';
  if (name.startsWith('wg'))    return '#a78bfa';
  if (name.startsWith('cni') || name.startsWith('flannel')) return '#67e8f9';
  if (name.startsWith('docker'))return '#fbbf24';
  return '#60a5fa';
}

export default function IpLinkPanel() {
  const [revealed, setRevealed] = useState(0);
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
    if (revealed === 0 || revealed > LINKS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 95);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone  = revealed > LINKS.length;
  const displayed = LINKS.slice(0, allDone ? LINKS.length : revealed);
  const upCount   = displayed.filter((l) => l.state === 'UP').length;

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
          construx@sys — ip link
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${upCount}/${LINKS.length} up` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          ip -s link show
        </span>
      </div>

      {/* Entries */}
      <div className="px-4 py-2 space-y-2">
        {displayed.map((link, i) => (
          <div key={i} className="space-y-0.5">
            {/* Main line */}
            <div className="flex items-start gap-2 text-[8px]">
              <span style={{ color: 'rgba(240,239,255,0.22)', minWidth: '16px', flexShrink: 0 }}>
                {link.idx}:
              </span>
              <span style={{ color: nameColor(link.name), minWidth: '80px', flexShrink: 0, fontWeight: 700 }}>
                {link.name}
              </span>
              <span style={{ color: 'rgba(240,239,255,0.22)', flexShrink: 0 }}>
                {link.flags}
              </span>
              <span style={{ color: 'rgba(240,239,255,0.3)', flexShrink: 0 }}>
                mtu {link.mtu}
              </span>
              <span style={{ color: stateColor(link.state), flexShrink: 0, fontWeight: 700 }}>
                state {link.state}
              </span>
            </div>
            {/* MAC line */}
            {link.mac && (
              <div className="flex items-center gap-2 text-[8px] pl-6">
                <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '52px', flexShrink: 0 }}>
                  link/{link.type}
                </span>
                <span style={{ color: 'rgba(240,239,255,0.4)' }}>
                  {link.mac}
                </span>
                {link.txrx && (
                  <span style={{ color: 'rgba(240,239,255,0.22)' }}>
                    · {link.txrx}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          {LINKS.length} interfaces · {upCount} up · iproute2 6.7 · kernel 6.8.4
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● done' : 'loading'}
        </span>
      </div>
    </div>
  );
}
