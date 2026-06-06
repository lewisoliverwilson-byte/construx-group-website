'use client';

import { useState, useEffect, useRef } from 'react';

interface AuthEntry {
  ts:       string;
  host:     string;
  service:  string;
  pid:      number;
  message:  string;
  type:     'ok' | 'fail' | 'info';
}

const BASE_ENTRIES: AuthEntry[] = [
  { ts: 'Dec 14 08:47:02', host: 'construx-prod', service: 'sshd',    pid: 48812, message: 'Accepted publickey for lewis from 10.0.1.4 port 52214 ssh2: ED25519 SHA256:YMm/…', type: 'ok'   },
  { ts: 'Dec 14 08:47:02', host: 'construx-prod', service: 'sshd',    pid: 48812, message: 'pam_unix(sshd:session): session opened for user lewis(uid=1000) by (uid=0)',          type: 'info' },
  { ts: 'Dec 14 07:14:55', host: 'construx-prod', service: 'sshd',    pid: 44201, message: 'Failed password for root from 218.92.0.184 port 38812 ssh2',                          type: 'fail' },
  { ts: 'Dec 14 07:14:53', host: 'construx-prod', service: 'sshd',    pid: 44200, message: 'Failed password for root from 218.92.0.184 port 38811 ssh2',                          type: 'fail' },
  { ts: 'Dec 14 07:14:51', host: 'construx-prod', service: 'sshd',    pid: 44198, message: 'Invalid user admin from 218.92.0.184 port 38809',                                     type: 'fail' },
  { ts: 'Dec 14 06:00:01', host: 'construx-prod', service: 'CRON',    pid: 41002, message: 'pam_unix(cron:session): session opened for user deploy(uid=1001) by (uid=0)',         type: 'info' },
  { ts: 'Dec 14 06:00:03', host: 'construx-prod', service: 'CRON',    pid: 41002, message: 'pam_unix(cron:session): session closed for user deploy',                              type: 'info' },
  { ts: 'Dec 13 23:41:08', host: 'construx-prod', service: 'sshd',    pid: 38221, message: 'Accepted publickey for lewis from 192.168.1.10 port 60441 ssh2: ED25519 SHA256:YMm/…',type: 'ok'   },
  { ts: 'Dec 13 22:15:44', host: 'construx-prod', service: 'sshd',    pid: 37014, message: 'Failed password for invalid user ubuntu from 45.142.120.31 port 44021 ssh2',          type: 'fail' },
  { ts: 'Dec 13 22:15:43', host: 'construx-prod', service: 'sshd',    pid: 37013, message: 'Connection closed by invalid user ubuntu 45.142.120.31 port 44020 [preauth]',         type: 'fail' },
  { ts: 'Dec 13 18:30:12', host: 'construx-prod', service: 'sudo',    pid: 35882, message: 'lewis : TTY=pts/0 ; PWD=/home/lewis ; USER=root ; COMMAND=/usr/bin/systemctl restart nginx', type: 'info' },
  { ts: 'Dec 13 18:30:12', host: 'construx-prod', service: 'sudo',    pid: 35882, message: 'pam_unix(sudo:session): session opened for user root(uid=0) by lewis(uid=1000)',      type: 'info' },
  { ts: 'Dec 13 16:55:02', host: 'construx-prod', service: 'sshd',    pid: 34110, message: 'Accepted publickey for deploy from 10.0.2.22 port 41882 ssh2: ED25519 SHA256:Xkp/…', type: 'ok'   },
  { ts: 'Dec 13 14:22:38', host: 'construx-prod', service: 'sshd',    pid: 32441, message: 'Failed password for nobody from 91.108.4.172 port 29812 ssh2',                        type: 'fail' },
  { ts: 'Dec 13 09:01:55', host: 'construx-prod', service: 'sshd',    pid: 28812, message: 'Accepted publickey for lewis from 10.0.1.4 port 51002 ssh2: ED25519 SHA256:YMm/…',    type: 'ok'   },
];

const LIVE_ENTRIES: AuthEntry[] = [
  { ts: 'Dec 14 09:14:22', host: 'construx-prod', service: 'sshd', pid: 49100, message: 'Failed password for root from 103.45.66.88 port 44812 ssh2',                         type: 'fail' },
  { ts: 'Dec 14 09:16:01', host: 'construx-prod', service: 'sshd', pid: 49210, message: 'Accepted publickey for lewis from 10.0.1.4 port 53001 ssh2: ED25519 SHA256:YMm/…',   type: 'ok'   },
  { ts: 'Dec 14 09:18:44', host: 'construx-prod', service: 'sudo', pid: 49330, message: 'lewis : TTY=pts/1 ; PWD=/var/log ; USER=root ; COMMAND=/bin/tail -f auth.log',       type: 'info' },
];

function typeColor(type: AuthEntry['type']) {
  if (type === 'ok')   return '#4ade80';
  if (type === 'fail') return '#f87171';
  return 'rgba(240,239,255,0.35)';
}

function typeIcon(type: AuthEntry['type']) {
  if (type === 'ok')   return '✓';
  if (type === 'fail') return '✗';
  return '·';
}

function serviceColor(service: string) {
  if (service === 'sshd') return '#a78bfa';
  if (service === 'sudo') return '#fbbf24';
  if (service === 'CRON') return '#67e8f9';
  return 'rgba(240,239,255,0.3)';
}

export default function VarLogAuthPanel() {
  const [entries, setEntries]   = useState<AuthEntry[]>([]);
  const [revealed, setRevealed] = useState(0);
  const liveIdx = useRef(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setEntries(BASE_ENTRIES);
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > BASE_ENTRIES.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 70);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= BASE_ENTRIES.length) return;
    const id = setInterval(() => {
      const next = LIVE_ENTRIES[liveIdx.current % LIVE_ENTRIES.length];
      liveIdx.current++;
      setEntries((prev) => [next, ...prev.slice(0, 14)]);
    }, 3800);
    return () => clearInterval(id);
  }, [revealed]);

  const allDone   = revealed > BASE_ENTRIES.length;
  const displayed = allDone ? entries : BASE_ENTRIES.slice(0, revealed);
  const failCount = displayed.filter((e) => e.type === 'fail').length;

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
          construx@sys — auth log
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: failCount > 0 ? 'rgba(248,113,113,0.7)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${failCount} fails · live` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          tail -f /var/log/auth.log
        </span>
      </div>

      {/* Entries */}
      <div className="px-4 py-2 space-y-1">
        {displayed.map((e, i) => (
          <div key={i} className="flex items-start gap-2 text-[8px]">
            <span style={{ color: typeColor(e.type), flexShrink: 0, fontWeight: 700, marginTop: '1px' }}>
              {typeIcon(e.type)}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.22)', flexShrink: 0, minWidth: '100px' }}>
              {e.ts}
            </span>
            <span style={{ color: serviceColor(e.service), flexShrink: 0, minWidth: '44px' }}>
              {e.service}
            </span>
            <span style={{ color: typeColor(e.type), opacity: 0.85, lineHeight: 1.4 }}>
              {e.message}
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
          /var/log/auth.log · 15 entries · journald
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● live' : 'reading'}
        </span>
      </div>
    </div>
  );
}
