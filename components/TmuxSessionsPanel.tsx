'use client';

import { useState, useEffect, useRef } from 'react';

interface TmuxWindow {
  index: number;
  name:  string;
  panes: number;
  active: boolean;
}

interface TmuxSession {
  name:     string;
  windows:  TmuxWindow[];
  created:  string;
  activity: string;
  attached: boolean;
  accent:   string;
}

const SESSIONS: TmuxSession[] = [
  {
    name:     'construx-web',
    windows: [
      { index: 0, name: 'editor',  panes: 2, active: true  },
      { index: 1, name: 'server',  panes: 1, active: false },
      { index: 2, name: 'git',     panes: 1, active: false },
    ],
    created:  '2029-08-10 07:02',
    activity: 'just now',
    attached: true,
    accent:   '#F97316',
  },
  {
    name:     'scoutr-api',
    windows: [
      { index: 0, name: 'api',      panes: 1, active: true  },
      { index: 1, name: 'logs',     panes: 2, active: false },
      { index: 2, name: 'db',       panes: 1, active: false },
      { index: 3, name: 'tests',    panes: 1, active: false },
    ],
    created:  '2029-08-09 14:18',
    activity: '3h ago',
    attached: false,
    accent:   '#67e8f9',
  },
  {
    name:     'hyve-ctx',
    windows: [
      { index: 0, name: 'context',  panes: 2, active: true  },
      { index: 1, name: 'ingest',   panes: 1, active: false },
    ],
    created:  '2029-08-08 11:42',
    activity: '22h ago',
    attached: false,
    accent:   '#a78bfa',
  },
  {
    name:     'infra',
    windows: [
      { index: 0, name: 'terraform',panes: 1, active: true  },
      { index: 1, name: 'ssh-prod', panes: 1, active: false },
      { index: 2, name: 'metrics',  panes: 1, active: false },
    ],
    created:  '2029-08-07 08:30',
    activity: '2d ago',
    attached: false,
    accent:   '#4ade80',
  },
];

export default function TmuxSessionsPanel() {
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
    if (revealed === 0 || revealed > SESSIONS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 110);
    return () => clearTimeout(id);
  }, [revealed]);

  const totalWindows = SESSIONS.reduce((s, sess) => s + sess.windows.length, 0);
  const totalPanes   = SESSIONS.reduce((s, sess) => s + sess.windows.reduce((w, wn) => w + wn.panes, 0), 0);

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
          construx@sys — tmux sessions
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: 'rgba(240,239,255,0.2)' }}>
          {SESSIONS.length}s · {totalWindows}w · {totalPanes}p
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          {'tmux list-sessions -F "#{session_name} #{session_windows}w #{session_created_string}"'}
        </span>
      </div>

      {/* Session blocks */}
      <div className="px-4 py-3 space-y-3">
        {SESSIONS.slice(0, revealed).map((sess) => (
          <div key={sess.name}>
            {/* Session header */}
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[9px] font-bold uppercase tracking-wider"
                style={{ color: sess.accent }}
              >
                {sess.name}
              </span>
              {sess.attached && (
                <span
                  className="text-[8px] uppercase tracking-widest px-1.5 py-px"
                  style={{ background: `${sess.accent}18`, color: sess.accent, borderRadius: '2px', border: `1px solid ${sess.accent}30` }}
                >
                  attached
                </span>
              )}
              <span className="text-[8px]" style={{ color: 'rgba(240,239,255,0.2)', marginLeft: 'auto' }}>
                {sess.windows.length} windows · {sess.activity}
              </span>
            </div>
            {/* Window list */}
            <div className="pl-3 space-y-0.5" style={{ borderLeft: `1px solid ${sess.accent}22` }}>
              {sess.windows.map((win) => (
                <div key={win.index} className="flex items-center gap-2 text-[8px]">
                  <span style={{ color: `${sess.accent}60`, minWidth: '18px' }}>
                    {win.index}:
                  </span>
                  <span style={{ color: win.active ? 'rgba(240,239,255,0.75)' : 'rgba(240,239,255,0.35)' }}>
                    {win.name}
                    {win.active && <span style={{ color: sess.accent }}> *</span>}
                  </span>
                  <span style={{ color: 'rgba(240,239,255,0.2)' }}>
                    [{win.panes} {win.panes === 1 ? 'pane' : 'panes'}]
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-1 pl-3 text-[8px]" style={{ color: 'rgba(240,239,255,0.15)' }}>
              created {sess.created}
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
          {SESSIONS.length} sessions · 1 attached · tmux 3.4
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          prefix: ctrl-a
        </span>
      </div>
    </div>
  );
}
