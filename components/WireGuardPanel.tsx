'use client';

import { useState, useEffect, useRef } from 'react';

interface Peer {
  alias:     string;
  pubkey:    string;
  endpoint:  string;
  allowed:   string;
  handshake: string;
  rxMB:      number;
  txMB:      number;
  isActive:  boolean;
}

const PEERS: Peer[] = [
  { alias: 'dev-laptop',     pubkey: 'K8mZ2+pQr1Wk...', endpoint: '203.0.113.14:51820',  allowed: '10.8.0.2/32', handshake: '44 seconds ago',  rxMB: 182.4, txMB:  44.1, isActive: true  },
  { alias: 'vps-fra01',      pubkey: 'Xj4nB7dA9vLe...', endpoint: '195.201.91.82:51820', allowed: '10.8.0.3/32', handshake: '2 minutes ago',   rxMB:  91.2, txMB: 211.8, isActive: true  },
  { alias: 'ci-runner-01',   pubkey: 'Pm3sT5gH8zRw...', endpoint: '13.215.44.90:51820',  allowed: '10.8.0.4/32', handshake: '8 minutes ago',   rxMB:   4.7, txMB:   1.2, isActive: true  },
  { alias: 'ci-runner-02',   pubkey: 'Ys9qC2jM1bKn...', endpoint: '13.215.44.91:51820',  allowed: '10.8.0.5/32', handshake: '9 minutes ago',   rxMB:   3.9, txMB:   0.8, isActive: true  },
  { alias: 'staging-server', pubkey: 'Dv6wF4aE0mUp...', endpoint: '49.13.28.144:51820',  allowed: '10.8.0.6/32', handshake: '1 hour ago',      rxMB:  22.1, txMB:  38.4, isActive: false },
  { alias: 'old-macbook',    pubkey: 'Rl1oG7hN5cXt...', endpoint: '(none)',               allowed: '10.8.0.7/32', handshake: '3 weeks ago',     rxMB:   0.0, txMB:   0.0, isActive: false },
];

const IFACE = {
  name:      'wg0',
  publicKey: 'ZTfY3+bK8mX2pQr1Wk4nB7dA9vLeXj4....',
  port:      51820,
  ip:        '10.8.0.1/24',
  dns:       '1.1.1.1',
};

const TOTAL = PEERS.length + 4;

function peerStatus(p: Peer): string {
  if (!p.isActive) return 'offline';
  return 'online';
}

export default function WireGuardPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [liveRx,    setLiveRx]    = useState(182.4);
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
    const id = setTimeout(() => setRevealed((r) => r + 1), 82);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => setLiveRx((v) => parseFloat((v + Math.random() * 0.4).toFixed(1))), 2300);
    return () => clearInterval(id);
  }, []);

  const allDone     = revealed > TOTAL;
  const shownPeers  = PEERS.slice(0, Math.max(0, Math.min(PEERS.length, revealed)));
  const showIface   = revealed > PEERS.length;

  const activePeers = PEERS.filter((p) => p.isActive).length;

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
          construx@sys — wg show wg0
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${activePeers}/${PEERS.length} peers` : 'polling…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          sudo wg show wg0
        </span>
      </div>

      {/* Interface info */}
      {showIface && (
        <div
          className="px-4 py-1.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <div className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'rgba(240,239,255,0.16)' }}>
            interface: {IFACE.name}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-0.5 text-[7.5px]">
            <span><span style={{ color: 'rgba(240,239,255,0.25)' }}>public key:  </span><span style={{ color: '#60a5fa' }}>{IFACE.publicKey}</span></span>
            <span><span style={{ color: 'rgba(240,239,255,0.25)' }}>port: </span><span style={{ color: '#4ade80' }}>{IFACE.port}</span></span>
            <span><span style={{ color: 'rgba(240,239,255,0.25)' }}>ip: </span><span style={{ color: '#4ade80' }}>{IFACE.ip}</span></span>
          </div>
        </div>
      )}

      {/* Column headers */}
      {shownPeers.length > 0 && (
        <div
          className="flex items-center px-4 py-0.5 text-[6.5px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.14)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ minWidth: '100px', flexShrink: 0 }}>Peer</span>
          <span style={{ minWidth: '48px',  flexShrink: 0 }}>Status</span>
          <span style={{ minWidth: '148px', flexShrink: 0 }}>Endpoint</span>
          <span style={{ minWidth: '104px', flexShrink: 0 }}>Last Handshake</span>
          <span style={{ minWidth: '52px',  flexShrink: 0, textAlign: 'right' }}>RX MB</span>
          <span style={{ textAlign: 'right' }}>TX MB</span>
        </div>
      )}

      {/* Peer rows */}
      <div className="px-4 py-1.5 space-y-0.5">
        {shownPeers.map((p, i) => (
          <div
            key={i}
            className="flex items-center text-[7.5px] leading-[1.7]"
            style={{
              borderLeft: p.isActive ? '2px solid rgba(74,222,128,0.4)' : '2px solid rgba(255,255,255,0.06)',
              paddingLeft: '4px',
            }}
          >
            <span style={{ color: p.isActive ? 'rgba(240,239,255,0.55)' : 'rgba(240,239,255,0.2)', minWidth: '100px', flexShrink: 0 }}>{p.alias}</span>
            <span style={{ color: p.isActive ? '#4ade80' : 'rgba(240,239,255,0.18)', minWidth: '48px', flexShrink: 0, fontSize: '6.5px', fontWeight: 700 }}>
              {peerStatus(p)}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.22)', minWidth: '148px', flexShrink: 0 }}>{p.endpoint}</span>
            <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '104px', flexShrink: 0 }}>{p.handshake}</span>
            <span style={{ color: '#60a5fa', minWidth: '52px', flexShrink: 0, textAlign: 'right' }}>
              {i === 0 ? liveRx.toFixed(1) : p.rxMB.toFixed(1)}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.3)', textAlign: 'right', paddingLeft: '12px' }}>{p.txMB.toFixed(1)}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>{activePeers} online</span>
          <span>{PEERS.length - activePeers} offline</span>
          <span>{PEERS.reduce((s, p) => s + p.rxMB, 0).toFixed(1)} MB rx total</span>
          <span className="ml-auto">wg 1.0.20210914 · kernel module</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          wireguard 1.0 · wg0 · 10.8.0.1/24 · udp :51820
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? `● ${activePeers} active` : 'loading'}
        </span>
      </div>
    </div>
  );
}
