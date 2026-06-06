'use client';

import { useState, useEffect, useRef } from 'react';

interface AuditEntry {
  ts:      string;
  type:    string;
  syscall: string;
  pid:     number;
  uid:     number;
  user:    string;
  result:  'success' | 'failed';
  detail:  string;
}

const BASE: AuditEntry[] = [
  { ts: '08:14:01.441', type: 'SYSCALL',   syscall: 'execve',      pid: 14832, uid: 1000, user: 'lewis',   result: 'success', detail: 'node /app/server.js' },
  { ts: '08:14:01.889', type: 'USER_AUTH', syscall: 'pam_unix',    pid:     0, uid:    0, user: 'lewis',   result: 'success', detail: 'acct=lewis exe=/usr/bin/sudo' },
  { ts: '08:14:02.112', type: 'SYSCALL',   syscall: 'open',        pid: 14832, uid: 1000, user: 'lewis',   result: 'success', detail: '/etc/ssl/certs/construx.pem' },
  { ts: '08:14:02.441', type: 'SYSCALL',   syscall: 'connect',     pid: 14832, uid: 1000, user: 'lewis',   result: 'success', detail: 'addr=10.0.0.10:5432 ESTABLISHED' },
  { ts: '08:14:03.001', type: 'USER_LOGIN',syscall: 'sshd',        pid: 15021, uid:    0, user: 'lewis',   result: 'success', detail: 'src=192.168.1.10 op=login' },
  { ts: '08:14:03.441', type: 'SYSCALL',   syscall: 'setuid',      pid: 15021, uid:    0, user: 'root',    result: 'success', detail: 'uid=1000 (lewis)' },
  { ts: '08:14:04.002', type: 'SYSCALL',   syscall: 'open',        pid: 15099, uid: 1000, user: 'lewis',   result: 'success', detail: '/home/lewis/.ssh/authorized_keys' },
  { ts: '08:14:05.441', type: 'USER_AUTH', syscall: 'pam_unix',    pid:     0, uid:    0, user: 'unknown', result: 'failed',  detail: 'acct=admin src=82.44.12.91 (brute)' },
  { ts: '08:14:05.442', type: 'USER_AUTH', syscall: 'pam_unix',    pid:     0, uid:    0, user: 'unknown', result: 'failed',  detail: 'acct=root src=82.44.12.91 (brute)' },
  { ts: '08:14:05.901', type: 'SYSCALL',   syscall: 'kill',        pid: 14950, uid:    0, user: 'root',    result: 'success', detail: 'sig=9 pid=82441 (malicious proc)' },
  { ts: '08:14:06.001', type: 'SYSCALL',   syscall: 'chmod',       pid: 14832, uid: 1000, user: 'lewis',   result: 'success', detail: '/var/log/app.log mode=0640' },
  { ts: '08:14:06.441', type: 'SYSCALL',   syscall: 'open',        pid: 14832, uid: 1000, user: 'lewis',   result: 'failed',  detail: '/etc/shadow PERMISSION_DENIED' },
  { ts: '08:14:07.001', type: 'USER_ROLE', syscall: 'sudo',        pid: 15040, uid: 1000, user: 'lewis',   result: 'success', detail: 'systemctl restart nginx' },
  { ts: '08:14:08.441', type: 'SYSCALL',   syscall: 'bind',        pid:   941, uid:    0, user: 'root',    result: 'success', detail: 'addr=0.0.0.0:22 proto=TCP' },
  { ts: '08:14:09.001', type: 'CONFIG',    syscall: 'auditctl',    pid: 15099, uid:    0, user: 'root',    result: 'success', detail: 'rules reloaded 28 active' },
];

const LIVE: AuditEntry[] = [
  { ts: '', type: 'SYSCALL',   syscall: 'connect',  pid: 14832, uid: 1000, user: 'lewis',   result: 'success', detail: 'addr=10.0.0.10:6379 ESTABLISHED' },
  { ts: '', type: 'USER_AUTH', syscall: 'pam_unix', pid:     0, uid:    0, user: 'unknown', result: 'failed',  detail: 'acct=pi src=91.108.4.11 (attempt)' },
  { ts: '', type: 'SYSCALL',   syscall: 'open',     pid: 14832, uid: 1000, user: 'lewis',   result: 'success', detail: '/app/config.json O_RDONLY' },
];

function typeColor(type: string): string {
  if (type === 'USER_AUTH')  return '#f87171';
  if (type === 'USER_LOGIN') return '#4ade80';
  if (type === 'USER_ROLE')  return '#fbbf24';
  if (type === 'CONFIG')     return '#a78bfa';
  return '#60a5fa';
}

function resultColor(result: AuditEntry['result']): string {
  return result === 'success' ? '#4ade80' : '#f87171';
}

function userColor(user: string): string {
  if (user === 'root')    return '#f87171';
  if (user === 'lewis')   return '#4ade80';
  if (user === 'unknown') return '#fbbf24';
  return 'rgba(240,239,255,0.4)';
}

function fmtTs(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}.${String(d.getMilliseconds()).padStart(3,'0')}`;
}

export default function AuditdPanel() {
  const [revealed, setRevealed] = useState(0);
  const [live, setLive]         = useState<AuditEntry[]>([]);
  const [liveIdx, setLiveIdx]   = useState(0);
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
    if (revealed === 0 || revealed > BASE.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 84);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= BASE.length) return;
    const id = setInterval(() => {
      const entry = { ...LIVE[liveIdx % LIVE.length], ts: fmtTs() };
      setLive((prev) => [...prev.slice(-4), entry]);
      setLiveIdx((i) => i + 1);
    }, 2400);
    return () => clearInterval(id);
  }, [revealed, liveIdx]);

  const allDone  = revealed > BASE.length;
  const displayed = BASE.slice(0, allDone ? BASE.length : revealed);
  const rows      = [...displayed, ...live];

  const failures = rows.filter((r) => r.result === 'failed').length;

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
          construx@sys — ausearch -i --start today
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${rows.length} events` : 'reading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>sudo ausearch -i --start today | aureport --syscall --summary -i</span>
      </div>

      {/* Column headers */}
      {revealed > 0 && (
        <div
          className="flex items-center px-4 py-1 text-[7px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.16)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ minWidth: '80px', flexShrink: 0 }}>Time</span>
          <span style={{ minWidth: '80px', flexShrink: 0 }}>Type</span>
          <span style={{ minWidth: '72px', flexShrink: 0 }}>Syscall</span>
          <span style={{ minWidth: '44px', flexShrink: 0 }}>PID</span>
          <span style={{ minWidth: '60px', flexShrink: 0 }}>User</span>
          <span style={{ minWidth: '60px', flexShrink: 0 }}>Result</span>
          <span>Detail</span>
        </div>
      )}

      {/* Events */}
      <div className="px-4 py-1.5 space-y-0.5">
        {rows.map((entry, i) => (
          <div key={i} className="flex items-start text-[8px] leading-[1.65]">
            <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '80px', flexShrink: 0 }}>
              {entry.ts}
            </span>
            <span style={{ color: typeColor(entry.type), minWidth: '80px', flexShrink: 0, fontWeight: 600 }}>
              {entry.type}
            </span>
            <span style={{ color: '#60a5fa', minWidth: '72px', flexShrink: 0 }}>
              {entry.syscall}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '44px', flexShrink: 0 }}>
              {entry.pid || '—'}
            </span>
            <span style={{ color: userColor(entry.user), minWidth: '60px', flexShrink: 0, fontWeight: 600 }}>
              {entry.user}
            </span>
            <span style={{ color: resultColor(entry.result), minWidth: '60px', flexShrink: 0, fontWeight: 600 }}>
              {entry.result}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.38)' }}>
              {entry.detail}
            </span>
          </div>
        ))}
        {allDone && (
          <div className="text-[8px] mt-0.5" style={{ color: 'rgba(74,222,128,0.3)' }}>▌</div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <div className="flex items-center gap-4">
          <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
            auditd 3.1 · kernel audit · 28 rules
          </span>
          {allDone && failures > 0 && (
            <span className="text-[8px]" style={{ color: 'rgba(248,113,113,0.5)' }}>
              {failures} failed
            </span>
          )}
        </div>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● auditing' : 'reading'}
        </span>
      </div>
    </div>
  );
}
