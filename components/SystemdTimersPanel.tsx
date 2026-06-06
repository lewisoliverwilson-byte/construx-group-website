'use client';

import { useState, useEffect, useRef } from 'react';

interface TimerEntry {
  next:    string;
  left:    string;
  last:    string;
  passed:  string;
  unit:    string;
  activates: string;
}

const BASE: TimerEntry[] = [
  { next: 'Mon 2030-08-11 09:00:00', left: '44min',  last: 'Mon 2030-08-11 08:15:21', passed: '47s ago',  unit: 'construx-backup.timer',     activates: 'construx-backup.service' },
  { next: 'Mon 2030-08-11 09:00:00', left: '44min',  last: 'Mon 2030-08-11 00:00:00', passed: '8h ago',   unit: 'logrotate.timer',            activates: 'logrotate.service' },
  { next: 'Mon 2030-08-11 10:00:00', left: '1h 44min',last: 'Mon 2030-08-11 04:00:00', passed: '4h ago',  unit: 'construx-digest.timer',      activates: 'construx-digest.service' },
  { next: 'Mon 2030-08-11 12:00:00', left: '3h 44min',last: 'Sun 2030-08-10 12:00:00', passed: '20h ago', unit: 'construx-sitemap.timer',     activates: 'construx-sitemap.service' },
  { next: 'Tue 2030-08-12 00:00:00', left: '15h',    last: 'Mon 2030-08-11 00:00:05', passed: '8h ago',   unit: 'apt-daily.timer',            activates: 'apt-daily.service' },
  { next: 'Tue 2030-08-12 06:00:00', left: '21h',    last: 'Mon 2030-08-11 06:00:12', passed: '2h ago',   unit: 'certbot.timer',              activates: 'certbot.service' },
  { next: 'Tue 2030-08-12 08:00:00', left: '23h',    last: 'Mon 2030-08-11 08:00:00', passed: '15min ago',unit: 'construx-analytics.timer',   activates: 'construx-analytics.service' },
  { next: 'Sun 2030-08-17 00:00:00', left: '5d',     last: 'Sun 2030-08-10 00:00:00', passed: '1 day ago',unit: 'fstrim.timer',               activates: 'fstrim.service' },
  { next: 'Mon 2030-09-01 00:00:00', left: '20d',    last: 'Sat 2030-08-01 00:00:02', passed: '10d ago',  unit: 'construx-monthly-report.timer',activates: 'construx-monthly-report.service' },
];

function leftColor(left: string): string {
  if (left.includes('min') || left.startsWith('4')) return '#fbbf24';
  if (left.includes('1h') || left.includes('2h') || left.includes('3h')) return '#fbbf24';
  if (left.includes('d')) return '#4ade80';
  return '#60a5fa';
}

function unitColor(unit: string): string {
  if (unit.startsWith('construx-')) return '#f97316';
  if (unit.startsWith('apt') || unit.startsWith('logrotate')) return '#60a5fa';
  if (unit.startsWith('certbot')) return '#4ade80';
  return 'rgba(240,239,255,0.4)';
}

export default function SystemdTimersPanel() {
  const [revealed, setRevealed] = useState(0);
  const [tick, setTick]         = useState(0);
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
    const id = setTimeout(() => setRevealed((r) => r + 1), 82);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= BASE.length) return;
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, [revealed]);

  const allDone  = revealed > BASE.length;
  const displayed = BASE.slice(0, allDone ? BASE.length : revealed);

  void tick; // suppress unused warning — used to trigger periodic re-render for live feel

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
          construx@sys — systemctl list-timers --all
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${BASE.length} timers` : 'listing…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>systemctl list-timers --all --no-pager</span>
      </div>

      {/* Column headers */}
      {revealed > 0 && (
        <div
          className="flex items-center px-4 py-1 text-[7px] uppercase tracking-widest select-none"
          style={{ color: 'rgba(240,239,255,0.16)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ minWidth: '60px', flexShrink: 0 }}>Left</span>
          <span style={{ minWidth: '176px', flexShrink: 0 }}>Unit</span>
          <span style={{ minWidth: '128px', flexShrink: 0 }}>Activates</span>
          <span>Last · Passed</span>
        </div>
      )}

      {/* Timer rows */}
      <div className="px-4 py-1.5 space-y-0.5">
        {displayed.map((t, i) => (
          <div key={i} className="flex items-start text-[8px] leading-[1.65]">
            <span style={{ color: leftColor(t.left), minWidth: '60px', flexShrink: 0, fontWeight: 700 }}>
              {t.left}
            </span>
            <span style={{ color: unitColor(t.unit), minWidth: '176px', flexShrink: 0, fontWeight: 600 }}>
              {t.unit}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '128px', flexShrink: 0 }}>
              {t.activates}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.2)' }}>
              {t.passed}
            </span>
          </div>
        ))}
        {allDone && (
          <div className="text-[8px] mt-0.5" style={{ color: 'rgba(74,222,128,0.3)' }}>▌</div>
        )}
      </div>

      {/* Summary */}
      {allDone && (
        <div
          className="px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          {BASE.length} timers listed · {BASE.filter((t) => t.unit.startsWith('construx-')).length} construx services
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          systemd 255 · linux 6.8.0-construx · monotonic clock
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● active' : 'loading'}
        </span>
      </div>
    </div>
  );
}
