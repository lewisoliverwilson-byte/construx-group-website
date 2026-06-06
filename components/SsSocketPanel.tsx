'use client';

import { useState, useEffect, useRef } from 'react';

interface Socket {
  state:   'LISTEN' | 'ESTAB' | 'TIME-WAIT';
  recvQ:   number;
  sendQ:   number;
  local:   string;
  peer:    string;
  process: string;
  accent?: string;
}

const SOCKETS: Socket[] = [
  { state: 'LISTEN', recvQ: 0, sendQ: 0, local: '0.0.0.0:80',    peer: '0.0.0.0:*', process: 'nginx (pid=744)',           accent: '#4ade80' },
  { state: 'LISTEN', recvQ: 0, sendQ: 0, local: '0.0.0.0:443',   peer: '0.0.0.0:*', process: 'nginx (pid=744)',           accent: '#4ade80' },
  { state: 'LISTEN', recvQ: 0, sendQ: 0, local: '127.0.0.1:3000', peer: '0.0.0.0:*', process: 'node (pid=1847 scoutr-api)', accent: '#F97316' },
  { state: 'LISTEN', recvQ: 0, sendQ: 0, local: '127.0.0.1:3001', peer: '0.0.0.0:*', process: 'node (pid=2041 marqet)',   accent: '#7dd3fc' },
  { state: 'LISTEN', recvQ: 0, sendQ: 0, local: '127.0.0.1:3002', peer: '0.0.0.0:*', process: 'node (pid=1988 hyve-api)', accent: '#4ade80' },
  { state: 'LISTEN', recvQ: 0, sendQ: 0, local: '127.0.0.1:3003', peer: '0.0.0.0:*', process: 'node (pid=2210 construx-web)', accent: '#a78bfa' },
  { state: 'LISTEN', recvQ: 0, sendQ: 0, local: '127.0.0.1:8080', peer: '0.0.0.0:*', process: 'node (pid=1988 hyve-ws)',  accent: '#4ade80' },
  { state: 'LISTEN', recvQ: 0, sendQ: 0, local: '127.0.0.1:5432', peer: '0.0.0.0:*', process: 'postgres (pid=1203)',      accent: '#7dd3fc' },
  { state: 'LISTEN', recvQ: 0, sendQ: 0, local: '127.0.0.1:6379', peer: '0.0.0.0:*', process: 'redis-server (pid=891)',   accent: '#f87171' },
  { state: 'LISTEN', recvQ: 0, sendQ: 0, local: '0.0.0.0:22',    peer: '0.0.0.0:*', process: 'sshd (pid=588)',           accent: '#fbbf24' },
];

function stateColor(state: Socket['state']): string {
  switch (state) {
    case 'LISTEN':    return '#4ade80';
    case 'ESTAB':     return '#7dd3fc';
    case 'TIME-WAIT': return '#fbbf24';
  }
}

export default function SsSocketPanel() {
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
    const id = setTimeout(() => setRevealed((r) => r + 1), 70);
    return () => clearTimeout(id);
  }, [revealed]);

  const visibleSockets = SOCKETS.slice(0, revealed);
  const listenCount    = SOCKETS.filter((s) => s.state === 'LISTEN').length;

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
          construx@sys — socket statistics
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.5)' }}>
          {listenCount} listening
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          ss -tlnp
        </span>
      </div>

      {/* Column headers */}
      <div
        className="px-4 py-1 flex items-center select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.025)' }}
      >
        {[
          { label: 'State',   width: '72px'  },
          { label: 'Recv-Q',  width: '56px'  },
          { label: 'Send-Q',  width: '56px'  },
          { label: 'Local',   width: '140px' },
          { label: 'Peer',    width: '96px'  },
          { label: 'Process', width: 'auto'  },
        ].map((col) => (
          <span
            key={col.label}
            className="text-[8px] uppercase tracking-wider"
            style={{ color: 'rgba(255,255,255,0.2)', minWidth: col.width, flexShrink: 0 }}
          >
            {col.label}
          </span>
        ))}
      </div>

      {/* Socket rows */}
      <div className="px-4 py-2 space-y-px">
        {visibleSockets.map((sock, i) => (
          <div key={i} className="flex items-center text-[8px] tabular-nums">
            <span style={{ color: stateColor(sock.state), minWidth: '72px', flexShrink: 0, fontWeight: 600 }}>
              {sock.state}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '56px', flexShrink: 0 }}>
              {sock.recvQ}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '56px', flexShrink: 0 }}>
              {sock.sendQ}
            </span>
            <span style={{ color: sock.accent ?? 'rgba(240,239,255,0.6)', minWidth: '140px', flexShrink: 0 }}>
              {sock.local}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '96px', flexShrink: 0 }}>
              {sock.peer}
            </span>
            <span className="truncate" style={{ color: 'rgba(240,239,255,0.4)' }}>
              {sock.process}
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
          ss · socket statistics · tcp only
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          {SOCKETS.length} entries
        </span>
      </div>
    </div>
  );
}
