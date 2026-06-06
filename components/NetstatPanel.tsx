'use client';

import { useState, useEffect, useRef } from 'react';

interface Socket {
  proto:   'tcp' | 'tcp6' | 'udp' | 'udp6';
  local:   string;
  port:    number;
  state:   'LISTEN' | 'ESTAB' | 'UNCONN';
  process: string;
  pid:     number;
  accent:  string;
}

const SOCKETS: Socket[] = [
  { proto: 'tcp6', local: '0.0.0.0', port:   80, state: 'LISTEN', process: 'nginx',         pid:  812,  accent: '#4ade80'  },
  { proto: 'tcp6', local: '0.0.0.0', port:  443, state: 'LISTEN', process: 'nginx',         pid:  812,  accent: '#4ade80'  },
  { proto: 'tcp',  local: '0.0.0.0', port:   22, state: 'LISTEN', process: 'sshd',          pid:  587,  accent: '#a78bfa'  },
  { proto: 'tcp',  local: '127.0.0.1',port: 5432, state: 'LISTEN', process: 'postgres',      pid: 1024,  accent: '#67e8f9'  },
  { proto: 'tcp',  local: '127.0.0.1',port: 6379, state: 'LISTEN', process: 'redis-server',  pid: 1102,  accent: '#f87171'  },
  { proto: 'tcp',  local: '0.0.0.0', port: 3001, state: 'LISTEN', process: 'node',          pid: 4481,  accent: '#F97316'  },
  { proto: 'tcp',  local: '0.0.0.0', port: 9100, state: 'LISTEN', process: 'node_exporter', pid: 1284,  accent: '#fbbf24'  },
  { proto: 'tcp',  local: '127.0.0.1',port: 9090, state: 'LISTEN', process: 'prometheus',    pid: 1348,  accent: '#F97316'  },
  { proto: 'tcp6', local: '::1',      port: 4040, state: 'LISTEN', process: 'node',          pid: 4482,  accent: '#F97316'  },
  { proto: 'udp',  local: '0.0.0.0', port:   53, state: 'UNCONN', process: 'systemd-resolve',pid:  642, accent: '#67e8f9'  },
  { proto: 'udp',  local: '0.0.0.0', port:  123, state: 'UNCONN', process: 'chronyd',        pid:  703, accent: '#a78bfa'  },
  { proto: 'tcp',  local: '0.0.0.0', port: 8080, state: 'LISTEN', process: 'caddy',          pid: 1500, accent: '#4ade80'  },
];

function protoColor(proto: Socket['proto']) {
  if (proto.startsWith('tcp')) return '#67e8f9';
  return '#fbbf24';
}

function stateColor(state: Socket['state']) {
  if (state === 'LISTEN') return '#4ade80';
  if (state === 'ESTAB')  return '#F97316';
  return 'rgba(240,239,255,0.25)';
}

export default function NetstatPanel() {
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
    if (revealed === 0 || revealed > SOCKETS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 75);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone = revealed > SOCKETS.length;
  const tcpCount = SOCKETS.filter((s) => s.proto.startsWith('tcp')).length;
  const udpCount = SOCKETS.filter((s) => s.proto.startsWith('udp')).length;

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
          construx@sys — listening sockets
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.6)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${SOCKETS.length} sockets` : 'scanning…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          ss -tulnp
        </span>
      </div>

      {/* Column headers */}
      <div
        className="flex items-center gap-3 px-4 py-1 text-[7px] uppercase tracking-widest select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
      >
        <span style={{ minWidth: '44px', flexShrink: 0 }}>PROTO</span>
        <span style={{ minWidth: '80px', flexShrink: 0 }}>LOCAL</span>
        <span style={{ minWidth: '52px', flexShrink: 0, textAlign: 'right' }}>PORT</span>
        <span style={{ minWidth: '56px', flexShrink: 0, paddingLeft: '8px' }}>STATE</span>
        <span style={{ minWidth: '100px', flexShrink: 0 }}>PROCESS</span>
        <span>PID</span>
      </div>

      {/* Socket rows */}
      <div className="px-4 py-2 space-y-1.5">
        {SOCKETS.slice(0, revealed).map((s, i) => (
          <div key={i} className="flex items-center gap-3 text-[8px] tabular-nums">
            <span style={{ color: protoColor(s.proto), minWidth: '44px', flexShrink: 0, fontWeight: 600 }}>
              {s.proto}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '80px', flexShrink: 0 }}>
              {s.local}
            </span>
            <span style={{ color: '#F97316', minWidth: '52px', flexShrink: 0, textAlign: 'right', fontWeight: 700 }}>
              :{s.port}
            </span>
            <span style={{ color: stateColor(s.state), minWidth: '56px', flexShrink: 0, paddingLeft: '8px' }}>
              {s.state}
            </span>
            <span style={{ color: s.accent, minWidth: '100px', flexShrink: 0, fontWeight: 600 }}>
              {s.process}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.25)' }}>
              {s.pid}
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
          {tcpCount} tcp · {udpCount} udp · ss 7.1 · kernel 6.8.4
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          iproute2
        </span>
      </div>
    </div>
  );
}
