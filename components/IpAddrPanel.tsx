'use client';

import { useState, useEffect, useRef } from 'react';

interface IpEntry {
  index:  number;
  name:   string;
  flags:  string;
  mtu:    number;
  mac:    string;
  addrs:  { family: string; addr: string; scope: string }[];
  state:  'UP' | 'DOWN' | 'UNKNOWN';
  accent: string;
}

const INTERFACES: IpEntry[] = [
  {
    index: 1,
    name:  'lo',
    flags: 'LOOPBACK,UP,LOWER_UP',
    mtu:   65536,
    mac:   '00:00:00:00:00:00',
    addrs: [
      { family: 'inet',  addr: '127.0.0.1/8',  scope: 'host' },
      { family: 'inet6', addr: '::1/128',       scope: 'host' },
    ],
    state:  'UNKNOWN',
    accent: 'rgba(240,239,255,0.3)',
  },
  {
    index: 2,
    name:  'eth0',
    flags: 'BROADCAST,MULTICAST,UP,LOWER_UP',
    mtu:   1500,
    mac:   'fa:16:3e:4a:9c:12',
    addrs: [
      { family: 'inet',  addr: '10.0.1.42/24',           scope: 'global' },
      { family: 'inet6', addr: '2a01:4f8:c17:4a82::1/64', scope: 'global' },
      { family: 'inet6', addr: 'fe80::f816:3eff:fe4a:9c12/64', scope: 'link' },
    ],
    state:  'UP',
    accent: '#F97316',
  },
  {
    index: 3,
    name:  'tailscale0',
    flags: 'POINTOPOINT,MULTICAST,NOARP,UP,LOWER_UP',
    mtu:   1280,
    mac:   'N/A',
    addrs: [
      { family: 'inet',  addr: '100.100.42.1/32',           scope: 'global' },
      { family: 'inet6', addr: 'fd7a:115c:a1e0::1:2b01/128', scope: 'global' },
    ],
    state:  'UP',
    accent: '#a78bfa',
  },
  {
    index: 4,
    name:  'docker0',
    flags: 'NO-CARRIER,BROADCAST,MULTICAST,UP',
    mtu:   1500,
    mac:   '02:42:e8:3f:a1:04',
    addrs: [
      { family: 'inet', addr: '172.17.0.1/16', scope: 'global' },
    ],
    state:  'DOWN',
    accent: '#67e8f9',
  },
  {
    index: 5,
    name:  'br-9f2a3c81f4d2',
    flags: 'BROADCAST,MULTICAST,UP,LOWER_UP',
    mtu:   1500,
    mac:   '02:42:d1:8e:b2:9a',
    addrs: [
      { family: 'inet', addr: '172.18.0.1/16', scope: 'global' },
    ],
    state:  'UP',
    accent: '#4ade80',
  },
];

function stateColor(s: IpEntry['state']): string {
  if (s === 'UP')      return '#4ade80';
  if (s === 'DOWN')    return '#f87171';
  return 'rgba(240,239,255,0.3)';
}

export default function IpAddrPanel() {
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
    if (revealed === 0 || revealed > INTERFACES.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 110);
    return () => clearTimeout(id);
  }, [revealed]);

  const upCount = INTERFACES.filter((i) => i.state === 'UP').length;

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
          construx@sys — network interfaces
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.2)' }}>
          {upCount}/{INTERFACES.length} up
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          ip addr show
        </span>
      </div>

      {/* Interface entries */}
      <div className="px-4 py-2.5 space-y-3">
        {INTERFACES.slice(0, revealed).map((iface) => (
          <div key={iface.index}>
            {/* Interface header line */}
            <div className="flex items-start gap-2 text-[8px] tabular-nums leading-5">
              <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '16px' }}>{iface.index}:</span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-0.5">
                  <span style={{ color: iface.accent }}>{iface.name}</span>
                  <span style={{ color: 'rgba(240,239,255,0.18)', fontSize: '7px' }}>{iface.flags}</span>
                  <span style={{ color: 'rgba(240,239,255,0.2)' }}>mtu {iface.mtu}</span>
                  <span
                    className="text-[7px] uppercase tracking-widest px-1.5 py-0 rounded-sm"
                    style={{
                      background: stateColor(iface.state) + '15',
                      color:      stateColor(iface.state),
                    }}
                  >
                    {iface.state}
                  </span>
                </div>
                {/* Link/ether line */}
                {iface.mac !== 'N/A' && (
                  <div style={{ color: 'rgba(240,239,255,0.2)', paddingLeft: '0' }}>
                    <span style={{ color: 'rgba(240,239,255,0.15)' }}>{'    link/ether '}</span>
                    <span style={{ color: 'rgba(240,239,255,0.35)' }}>{iface.mac}</span>
                    <span style={{ color: 'rgba(240,239,255,0.12)' }}>{' brd ff:ff:ff:ff:ff:ff'}</span>
                  </div>
                )}
                {/* Address lines */}
                {iface.addrs.map((a, ai) => (
                  <div key={ai} style={{ color: 'rgba(240,239,255,0.2)' }}>
                    <span style={{ color: 'rgba(240,239,255,0.15)' }}>{'    ' + a.family.padEnd(6)}</span>
                    <span style={{ color: iface.accent + 'cc' }}>{a.addr}</span>
                    <span style={{ color: 'rgba(240,239,255,0.15)' }}>{' scope '}</span>
                    <span style={{ color: 'rgba(240,239,255,0.3)' }}>{a.scope}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          {INTERFACES.length} interfaces · ipv4 + ipv6 · tailscale mesh vpn
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          iproute2 5.18.0
        </span>
      </div>
    </div>
  );
}
