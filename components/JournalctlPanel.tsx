'use client';

import { useState, useEffect, useRef } from 'react';

interface LogEntry {
  time:    string;
  host:    string;
  unit:    string;
  message: string;
  level:   'info' | 'notice' | 'warn' | 'err' | 'debug';
}

const BASE_ENTRIES: LogEntry[] = [
  { time: '09:14:02', host: 'sys', unit: 'sshd',          message: 'Accepted publickey for lewis from 82.27.x.x port 52144 ssh2',                        level: 'info'   },
  { time: '09:14:02', host: 'sys', unit: 'systemd',       message: 'Starting Session 42 of User lewis.',                                                    level: 'info'   },
  { time: '09:13:58', host: 'sys', unit: 'nginx',         message: '2 worker processes started (pid: 14820, 14821)',                                        level: 'notice' },
  { time: '09:13:55', host: 'sys', unit: 'construx-api',  message: 'Server listening on :3001 — environment: production',                                   level: 'info'   },
  { time: '09:13:54', host: 'sys', unit: 'construx-api',  message: 'Connected to Postgres at db.construxgroup.io:5432 (pool: 10)',                         level: 'info'   },
  { time: '09:13:50', host: 'sys', unit: 'redis',         message: 'Server started, Redis version=7.2.4, port=6379, fd=5',                                 level: 'notice' },
  { time: '09:13:48', host: 'sys', unit: 'systemd',       message: 'Started Redis In-Memory Data Store.',                                                   level: 'info'   },
  { time: '09:01:44', host: 'sys', unit: 'kernel',        message: 'BTRFS: device label construx-data devid 1 transid 14182 /dev/nvme1n1',                 level: 'debug'  },
  { time: '08:59:41', host: 'sys', unit: 'sshd',          message: 'Disconnected from 82.27.x.x port 52098: disconnected by user',                         level: 'info'   },
  { time: '08:55:12', host: 'sys', unit: 'construx-api',  message: 'WARN: rate limit reached for 91.108.x.x — 429 returned',                              level: 'warn'   },
  { time: '08:41:28', host: 'sys', unit: 'node_exporter', message: 'Listening on :9100',                                                                    level: 'info'   },
  { time: '07:30:00', host: 'sys', unit: 'cron',          message: 'CRON[14204]: (lewis) CMD (/usr/local/bin/construx-backup.sh >> /var/log/backup.log)',   level: 'info'   },
  { time: '07:29:58', host: 'sys', unit: 'systemd',       message: 'construx-cert-renew.service: Deactivated successfully.',                                level: 'info'   },
  { time: '07:29:57', host: 'sys', unit: 'certbot',       message: 'Certificate not yet due for renewal. Next renewal: 2029-10-22',                        level: 'notice' },
  { time: '02:14:55', host: 'sys', unit: 'sshd',          message: 'Disconnected from invalid user admin 185.220.x.x port 41228',                          level: 'warn'   },
  { time: '02:14:33', host: 'sys', unit: 'sshd',          message: 'Failed password for invalid user admin from 185.220.x.x port 41228 ssh2',              level: 'err'    },
];

function levelColor(level: LogEntry['level']): string {
  switch (level) {
    case 'err':    return '#f87171';
    case 'warn':   return '#fbbf24';
    case 'notice': return '#67e8f9';
    case 'debug':  return 'rgba(240,239,255,0.2)';
    default:       return 'rgba(240,239,255,0.45)';
  }
}

function unitColor(unit: string): string {
  if (unit === 'sshd')         return '#a78bfa';
  if (unit === 'nginx')        return '#4ade80';
  if (unit.startsWith('construx')) return '#F97316';
  if (unit === 'kernel')       return '#67e8f9';
  if (unit === 'redis')        return '#f87171';
  if (unit === 'cron')         return '#fbbf24';
  return 'rgba(240,239,255,0.3)';
}

export default function JournalctlPanel() {
  const [revealed,  setRevealed] = useState(0);
  const [entries,   setEntries]  = useState<LogEntry[]>(BASE_ENTRIES);
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
    if (revealed === 0 || revealed > BASE_ENTRIES.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 65);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const LIVE_ENTRIES: LogEntry[] = [
      { time: 'now', host: 'sys', unit: 'construx-api', message: 'GET /api/health 200 — 2ms',      level: 'debug' },
      { time: 'now', host: 'sys', unit: 'nginx',        message: '82.27.x.x "GET / HTTP/2.0" 200', level: 'debug' },
      { time: 'now', host: 'sys', unit: 'node_exporter',message: 'Scraped by Prometheus at :9090',  level: 'debug' },
    ];
    let idx = 0;
    const id = setInterval(() => {
      setEntries((prev) => [{ ...LIVE_ENTRIES[idx % LIVE_ENTRIES.length], time: new Date().toTimeString().slice(0, 8) }, ...prev.slice(0, 15)]);
      idx++;
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const errCount  = entries.filter((e) => e.level === 'err').length;
  const warnCount = entries.filter((e) => e.level === 'warn').length;

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
          construx@sys — systemd journal
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums flex items-center gap-2" style={{ color: 'rgba(240,239,255,0.2)' }}>
          {errCount > 0 && <span style={{ color: '#f87171' }}>{errCount} err</span>}
          {warnCount > 0 && <span style={{ color: '#fbbf24' }}>{warnCount} warn</span>}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          journalctl -n 16 --no-pager --output=short
        </span>
      </div>

      {/* Log rows */}
      <div className="px-4 py-2 space-y-0.5">
        {entries.slice(0, revealed).map((e, i) => {
          const lc = levelColor(e.level);
          const uc = unitColor(e.unit);
          return (
            <div key={i} className="flex items-start gap-2 text-[8px] leading-relaxed">
              <span style={{ color: 'rgba(240,239,255,0.2)', flexShrink: 0, minWidth: '52px' }}>{e.time}</span>
              <span style={{ color: 'rgba(240,239,255,0.15)', flexShrink: 0, minWidth: '32px' }}>{e.host}</span>
              <span style={{ color: uc, flexShrink: 0, minWidth: '96px' }}>{e.unit}[1]:</span>
              <span style={{ color: lc }} className="break-all">{e.message}</span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          boot +9h · live tail · {BASE_ENTRIES.length} units
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          journald v255
        </span>
      </div>
    </div>
  );
}
