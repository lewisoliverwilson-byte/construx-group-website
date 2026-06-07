'use client';

import { useState, useEffect, useRef } from 'react';

interface SystemdUnit {
  name:      string;
  load:      string;
  active:    'active' | 'inactive' | 'failed' | 'activating';
  sub:       string;
  desc:      string;
  cpuMs:     number;
  memMB:     number;
  since:     string;
}

interface JournalLine {
  ts:      string;
  host:    string;
  unit:    string;
  level:   'info' | 'warn' | 'err';
  message: string;
}

const UNITS: SystemdUnit[] = [
  { name: 'construx-api.service',     load: 'loaded', active: 'active',     sub: 'running',   desc: 'Construx API Server',          cpuMs: 14820, memMB: 312, since: '3 days ago'   },
  { name: 'construx-worker.service',  load: 'loaded', active: 'active',     sub: 'running',   desc: 'Construx Background Worker',   cpuMs: 7440,  memMB: 189, since: '3 days ago'   },
  { name: 'caddy.service',            load: 'loaded', active: 'active',     sub: 'running',   desc: 'Caddy Web Server',             cpuMs: 2210,  memMB: 12,  since: '12 days ago'  },
  { name: 'postgresql.service',       load: 'loaded', active: 'active',     sub: 'running',   desc: 'PostgreSQL 16 Database',       cpuMs: 9180,  memMB: 94,  since: '12 days ago'  },
  { name: 'redis.service',            load: 'loaded', active: 'active',     sub: 'running',   desc: 'Redis In-Memory Store',        cpuMs: 1840,  memMB: 18,  since: '12 days ago'  },
  { name: 'prometheus.service',       load: 'loaded', active: 'active',     sub: 'running',   desc: 'Prometheus Monitoring Server', cpuMs: 3420,  memMB: 41,  since: '5 days ago'   },
  { name: 'construx-cron.timer',      load: 'loaded', active: 'active',     sub: 'waiting',   desc: 'Construx Scheduled Tasks',     cpuMs: 80,    memMB: 4,   since: '3 days ago'   },
  { name: 'node-exporter.service',    load: 'loaded', active: 'active',     sub: 'running',   desc: 'Node Exporter for Prometheus', cpuMs: 920,   memMB: 9,   since: '5 days ago'   },
  { name: 'tailscaled.service',       load: 'loaded', active: 'active',     sub: 'running',   desc: 'Tailscale Daemon',             cpuMs: 1640,  memMB: 22,  since: '12 days ago'  },
  { name: 'pgbackup.timer',           load: 'loaded', active: 'active',     sub: 'waiting',   desc: 'PostgreSQL Daily Backup',      cpuMs: 44,    memMB: 2,   since: '1 day ago'    },
  { name: 'construx-stale.service',   load: 'loaded', active: 'failed',     sub: 'failed',    desc: 'Construx Migration (legacy)',  cpuMs: 0,     memMB: 0,   since: '2 hours ago'  },
  { name: 'logrotate.timer',          load: 'loaded', active: 'inactive',   sub: 'dead',      desc: 'Daily Rotation of Log Files',  cpuMs: 0,     memMB: 0,   since: '7 hours ago'  },
];

const JOURNAL: JournalLine[] = [
  { ts: '14:31:02', host: 'vps-fra01', unit: 'construx-api',    level: 'info', message: 'GET /api/projects 200 142ms'       },
  { ts: '14:31:08', host: 'vps-fra01', unit: 'construx-worker', level: 'info', message: 'job completed: email.welcome #4821' },
  { ts: '14:31:19', host: 'vps-fra01', unit: 'caddy',           level: 'info', message: 'cert renewed: construxgroup.io'    },
  { ts: '14:31:31', host: 'vps-fra01', unit: 'construx-api',    level: 'warn', message: 'slow query detected: 1240ms'       },
  { ts: '14:31:44', host: 'vps-fra01', unit: 'postgresql',      level: 'info', message: 'checkpoint complete: wrote 144 buffers' },
  { ts: '14:32:01', host: 'vps-fra01', unit: 'construx-api',    level: 'err',  message: 'rate limit exceeded: 100.64.0.4'  },
];

const TOTAL = UNITS.length + JOURNAL.length;

function activeColor(a: SystemdUnit['active']): string {
  if (a === 'active')     return '#4ade80';
  if (a === 'activating') return '#fbbf24';
  if (a === 'failed')     return '#f87171';
  return 'rgba(240,239,255,0.2)';
}

function levelColor(l: JournalLine['level']): string {
  if (l === 'err')  return '#f87171';
  if (l === 'warn') return '#fbbf24';
  return '#4ade80';
}

function msToHuman(ms: number): string {
  if (ms === 0)  return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function SystemdStatusPanel() {
  const [revealed, setRevealed] = useState(0);
  const [livePid,  setLivePid]  = useState(12844);
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
    const id = setTimeout(() => setRevealed((r) => r + 1), 83);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => {
      setLivePid((v) => v + Math.floor(Math.random() * 3));
    }, 2400);
    return () => clearInterval(id);
  }, []);

  const allDone      = revealed > TOTAL;
  const unitOffset   = 0;
  const journalOffset = UNITS.length;

  const shownUnits   = UNITS.slice(0, Math.max(0, Math.min(UNITS.length, revealed - unitOffset)));
  const shownJournal = JOURNAL.slice(0, Math.max(0, Math.min(JOURNAL.length, revealed - journalOffset)));

  const activeCount  = UNITS.filter((u) => u.active === 'active').length;
  const failedCount  = UNITS.filter((u) => u.active === 'failed').length;

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
          construx@vps-fra01 — systemctl list-units
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `pid ${livePid}` : 'querying…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@vps-fra01:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          systemctl list-units --type=service,timer --all --no-pager
        </span>
      </div>

      {/* Units */}
      {shownUnits.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1 select-none" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — UNITS ({UNITS.length})
          </div>
          <div
            className="flex items-center text-[6.5px] uppercase tracking-widest mb-0.5 select-none"
            style={{ color: 'rgba(240,239,255,0.12)' }}
          >
            <span style={{ minWidth: '212px', flexShrink: 0 }}>Unit</span>
            <span style={{ minWidth: '72px',  flexShrink: 0 }}>State</span>
            <span style={{ minWidth: '64px',  flexShrink: 0 }}>Sub</span>
            <span style={{ minWidth: '60px',  flexShrink: 0, textAlign: 'right' }}>CPU</span>
            <span style={{ minWidth: '56px',  flexShrink: 0, textAlign: 'right' }}>Mem</span>
            <span>Since</span>
          </div>
          <div className="space-y-0.5">
            {shownUnits.map((u, i) => (
              <div
                key={i}
                className="flex items-center text-[7.5px] leading-[1.7]"
                style={{
                  borderLeft: `2px solid ${u.active === 'active' ? 'rgba(74,222,128,0.3)' : u.active === 'failed' ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.05)'}`,
                  paddingLeft: '4px',
                }}
              >
                <span style={{ color: u.active === 'active' ? 'rgba(240,239,255,0.5)' : u.active === 'failed' ? '#f87171' : 'rgba(240,239,255,0.2)', minWidth: '212px', flexShrink: 0 }}>
                  {u.name}
                </span>
                <span style={{ color: activeColor(u.active), minWidth: '72px', flexShrink: 0 }}>{u.active}</span>
                <span style={{ color: 'rgba(240,239,255,0.28)', minWidth: '64px', flexShrink: 0, fontSize: '7px' }}>{u.sub}</span>
                <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '60px', flexShrink: 0, textAlign: 'right' }}>{msToHuman(u.cpuMs)}</span>
                <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '56px', flexShrink: 0, textAlign: 'right' }}>{u.memMB > 0 ? `${u.memMB}M` : '—'}</span>
                <span style={{ color: 'rgba(240,239,255,0.18)', fontSize: '7px' }}>{u.since}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Journal */}
      {shownJournal.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1 select-none" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — JOURNAL (recent)
          </div>
          <div className="space-y-0.5">
            {shownJournal.map((j, i) => (
              <div key={i} className="flex items-start text-[7.5px] leading-[1.7]">
                <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '56px', flexShrink: 0 }}>{j.ts}</span>
                <span style={{ color: 'rgba(240,239,255,0.18)', minWidth: '72px', flexShrink: 0 }}>{j.unit}</span>
                <span style={{ color: levelColor(j.level), minWidth: '28px', flexShrink: 0, fontSize: '7px', textTransform: 'uppercase' }}>{j.level}</span>
                <span style={{ color: 'rgba(240,239,255,0.4)' }}>{j.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>{activeCount} active</span>
          {failedCount > 0 && <span style={{ color: '#f87171' }}>{failedCount} failed</span>}
          <span>{UNITS.length - activeCount - failedCount} inactive</span>
          <span className="ml-auto" style={{ color: 'rgba(240,239,255,0.25)' }}>systemd 256 · linux 6.12.1</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          systemd 256 · vps-fra01 · uptime 12d 4h
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? `● ${UNITS.length} units` : 'loading'}
        </span>
      </div>
    </div>
  );
}
