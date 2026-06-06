'use client';

import { useState, useEffect, useRef } from 'react';

interface Session {
  user:     string;
  tty:      string;
  date:     string;
  time:     string;
  from:     string;
  idle:     string;
  current:  boolean;
  accent:   string;
}

const BASE_SESSIONS: Session[] = [
  { user: 'lewis',   tty: 'pts/0',  date: 'Dec 14', time: '09:14', from: '10.0.1.4',        idle: '.',      current: true,  accent: '#F97316' },
  { user: 'deploy',  tty: 'pts/1',  date: 'Dec 14', time: '08:52', from: '10.0.2.22',       idle: '02:41',  current: false, accent: '#4ade80' },
  { user: 'monitor', tty: 'pts/2',  date: 'Dec 14', time: '06:00', from: '127.0.0.1',       idle: '05:18',  current: false, accent: '#67e8f9' },
  { user: 'lewis',   tty: 'tty1',   date: 'Dec 13', time: '23:41', from: '(:0)',             idle: '10:02',  current: false, accent: '#F97316' },
  { user: 'deploy',  tty: 'pts/3',  date: 'Dec 14', time: '07:30', from: '10.0.2.22',       idle: '04:12',  current: false, accent: '#4ade80' },
  { user: 'lewis',   tty: 'pts/4',  date: 'Dec 14', time: '09:01', from: 'tmux(4481).%0',   idle: '00:08',  current: false, accent: '#F97316' },
];

function userColor(user: string, accent: string) {
  return accent;
}

export default function WhoPanel() {
  const [revealed, setRevealed] = useState(0);
  const [tick, setTick]         = useState(0);
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
    if (revealed === 0 || revealed > BASE_SESSIONS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 90);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(id);
  }, []);

  const allDone     = revealed > BASE_SESSIONS.length;
  const activeCount = BASE_SESSIONS.filter((s) => s.idle === '.').length;

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
          construx@sys — active sessions
        </span>
        <span
          className="text-[8px] uppercase tracking-widest tabular-nums"
          style={{ color: allDone ? 'rgba(74,222,128,0.6)' : 'rgba(240,239,255,0.2)' }}
        >
          {allDone ? `${BASE_SESSIONS.length} sessions` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          who -uH
        </span>
      </div>

      {/* Column headers */}
      <div
        className="flex items-center gap-3 px-4 py-1 text-[7px] uppercase tracking-widest select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
      >
        <span style={{ minWidth: '72px', flexShrink: 0 }}>USER</span>
        <span style={{ minWidth: '64px', flexShrink: 0 }}>TTY</span>
        <span style={{ minWidth: '80px', flexShrink: 0 }}>LOGIN</span>
        <span style={{ minWidth: '48px', flexShrink: 0 }}>IDLE</span>
        <span>FROM</span>
      </div>

      {/* Session rows */}
      <div className="px-4 py-2 space-y-1.5">
        {BASE_SESSIONS.slice(0, revealed).map((s, i) => (
          <div key={i} className="flex items-center gap-3 text-[8px] tabular-nums">
            <span style={{ color: userColor(s.user, s.accent), minWidth: '72px', flexShrink: 0, fontWeight: 700 }}>
              {s.user}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.35)', minWidth: '64px', flexShrink: 0 }}>
              {s.tty}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.4)', minWidth: '80px', flexShrink: 0 }}>
              {s.date} {s.time}
            </span>
            <span style={{ color: s.idle === '.' ? '#4ade80' : 'rgba(240,239,255,0.25)', minWidth: '48px', flexShrink: 0 }}>
              {s.idle === '.' ? (
                <span style={{ color: '#4ade80' }}>● active</span>
              ) : s.idle}
            </span>
            <span style={{ color: s.from.startsWith('10.') ? '#67e8f9' : 'rgba(240,239,255,0.25)' }}>
              {s.from}
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
          {BASE_SESSIONS.length} sessions · {activeCount} active · wtmp 2029-11-01
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          util-linux 2.39
        </span>
      </div>
    </div>
  );
}
