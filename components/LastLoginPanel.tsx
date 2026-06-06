'use client';

import { useState, useEffect, useRef } from 'react';

interface LoginEntry {
  user:     string;
  tty:      string;
  from:     string;
  loginAt:  string;
  logoutAt: string;
  duration: string;
  current:  boolean;
  accent:   string;
}

const ENTRIES: LoginEntry[] = [
  { user: 'lewis', tty: 'pts/2', from: '82.27.x.x',    loginAt: 'Sat Aug 10 09:14:02 2029', logoutAt: 'still logged in', duration: '—',    current: true,  accent: '#4ade80'  },
  { user: 'lewis', tty: 'pts/1', from: '82.27.x.x',    loginAt: 'Sat Aug 10 07:02:18 2029', logoutAt: 'Sat Aug 10 08:59:41 2029', duration: '01:57', current: false, accent: '#F97316' },
  { user: 'lewis', tty: 'pts/0', from: '82.27.x.x',    loginAt: 'Fri Aug 09 22:31:07 2029', logoutAt: 'Fri Aug 09 23:48:22 2029', duration: '01:17', current: false, accent: '#F97316' },
  { user: 'deploy', tty: 'pts/3', from: '3.10.x.x',   loginAt: 'Fri Aug 09 18:04:55 2029', logoutAt: 'Fri Aug 09 18:05:12 2029', duration: '00:00', current: false, accent: '#67e8f9' },
  { user: 'lewis', tty: 'pts/1', from: '82.27.x.x',   loginAt: 'Fri Aug 09 14:18:30 2029', logoutAt: 'Fri Aug 09 21:22:09 2029', duration: '07:03', current: false, accent: '#F97316' },
  { user: 'deploy', tty: 'pts/4', from: '3.10.x.x',  loginAt: 'Thu Aug 08 23:11:44 2029', logoutAt: 'Thu Aug 08 23:11:58 2029', duration: '00:00', current: false, accent: '#67e8f9' },
  { user: 'lewis', tty: 'pts/0', from: '46.235.x.x', loginAt: 'Thu Aug 08 11:42:00 2029', logoutAt: 'Thu Aug 08 19:55:32 2029', duration: '08:13', current: false, accent: '#fbbf24' },
  { user: 'lewis', tty: 'pts/2', from: '82.27.x.x',  loginAt: 'Wed Aug 07 08:30:14 2029', logoutAt: 'Wed Aug 07 23:01:47 2029', duration: '14:31', current: false, accent: '#F97316' },
  { user: 'root',  tty: 'pts/0', from: '10.0.x.x',   loginAt: 'Wed Aug 07 02:14:33 2029', logoutAt: 'Wed Aug 07 02:14:55 2029', duration: '00:00', current: false, accent: '#f87171' },
  { user: 'lewis', tty: 'pts/1', from: '82.27.x.x',  loginAt: 'Tue Aug 06 09:11:08 2029', logoutAt: 'Tue Aug 06 22:44:19 2029', duration: '13:33', current: false, accent: '#F97316' },
];

function userColor(user: string): string {
  if (user === 'root')   return '#f87171';
  if (user === 'deploy') return '#67e8f9';
  return '#4ade80';
}

export default function LastLoginPanel() {
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
    if (revealed === 0 || revealed > ENTRIES.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 75);
    return () => clearTimeout(id);
  }, [revealed]);

  const sessions = ENTRIES.length;
  const users    = [...new Set(ENTRIES.map((e) => e.user))].join(' · ');

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
          construx@sys — login history
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: 'rgba(240,239,255,0.2)' }}>
          {sessions} sessions
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          last -F -n 10
        </span>
      </div>

      {/* Column headers */}
      <div
        className="px-4 py-1 flex items-center select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.025)' }}
      >
        {[
          { label: 'USER',    width: '64px'  },
          { label: 'TTY',     width: '56px'  },
          { label: 'FROM',    width: '104px' },
          { label: 'LOGIN',   width: '200px' },
          { label: 'LOGOUT',  width: '200px' },
          { label: 'DUR',     width: 'auto'  },
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

      {/* Login rows */}
      <div className="px-4 py-2 space-y-1">
        {ENTRIES.slice(0, revealed).map((e, i) => (
          <div key={i} className="flex items-center text-[8px] tabular-nums">
            <span
              className="font-bold"
              style={{ color: userColor(e.user), minWidth: '64px', flexShrink: 0 }}
            >
              {e.user}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '56px', flexShrink: 0 }}>
              {e.tty}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.35)', minWidth: '104px', flexShrink: 0 }}>
              {e.from}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.4)', minWidth: '200px', flexShrink: 0 }}>
              {e.loginAt}
            </span>
            <span
              style={{
                color:    e.current ? '#4ade80' : 'rgba(240,239,255,0.3)',
                minWidth: '200px',
                flexShrink: 0,
              }}
            >
              {e.current ? '● still logged in' : e.logoutAt}
            </span>
            <span style={{ color: e.duration === '—' ? '#4ade80' : 'rgba(240,239,255,0.4)' }}>
              {e.duration}
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
          10 of {sessions} sessions · wtmp begins Tue Aug 01 00:00:01 2029
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          {users}
        </span>
      </div>
    </div>
  );
}
