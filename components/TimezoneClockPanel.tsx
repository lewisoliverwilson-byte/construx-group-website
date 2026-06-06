'use client';

import { useState, useEffect, useRef } from 'react';

interface TZEntry {
  city:   string;
  zone:   string;
  offset: string;
  flag:   string;
}

const ZONES: TZEntry[] = [
  { city: 'London',      zone: 'Europe/London',           offset: '+00',  flag: '🇬🇧' },
  { city: 'New York',    zone: 'America/New_York',        offset: '-05',  flag: '🇺🇸' },
  { city: 'Los Angeles', zone: 'America/Los_Angeles',     offset: '-08',  flag: '🇺🇸' },
  { city: 'São Paulo',   zone: 'America/Sao_Paulo',       offset: '-03',  flag: '🇧🇷' },
  { city: 'Dubai',       zone: 'Asia/Dubai',              offset: '+04',  flag: '🇦🇪' },
  { city: 'Singapore',   zone: 'Asia/Singapore',          offset: '+08',  flag: '🇸🇬' },
  { city: 'Tokyo',       zone: 'Asia/Tokyo',              offset: '+09',  flag: '🇯🇵' },
  { city: 'Sydney',      zone: 'Australia/Sydney',        offset: '+11',  flag: '🇦🇺' },
];

function fmtTime(zone: string): string {
  return new Date().toLocaleTimeString('en-GB', {
    timeZone:    zone,
    hour12:      false,
    hour:        '2-digit',
    minute:      '2-digit',
    second:      '2-digit',
  });
}

function fmtDate(zone: string): string {
  return new Date().toLocaleDateString('en-GB', {
    timeZone: zone,
    weekday:  'short',
    month:    'short',
    day:      'numeric',
  });
}

function offsetColor(offset: string): string {
  if (offset === '+00') return 'rgba(240,239,255,0.35)';
  if (offset.startsWith('+')) return '#4ade80';
  return '#fbbf24';
}

function isBusinessHour(zone: string): boolean {
  const h = parseInt(
    new Date().toLocaleTimeString('en-GB', { timeZone: zone, hour: '2-digit', hour12: false }),
    10,
  );
  return h >= 9 && h < 18;
}

export default function TimezoneClockPanel() {
  const [tick, setTick]     = useState(0);
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
    if (revealed === 0 || revealed > ZONES.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 100);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= ZONES.length) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [revealed]);

  const allDone  = revealed > ZONES.length;
  const displayed = ZONES.slice(0, allDone ? ZONES.length : revealed);

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
          construx@sys — world clocks
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${ZONES.length} zones` : 'syncing…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          zdump -v UTC Europe/London America/New_York Asia/Tokyo | grep {new Date().getFullYear()}
        </span>
      </div>

      {/* Entries */}
      <div className="px-4 py-2 space-y-1.5">
        {displayed.map((z, i) => {
          const time    = fmtTime(z.zone);
          const date    = fmtDate(z.zone);
          const biz     = allDone && isBusinessHour(z.zone);
          return (
            <div key={i} className="flex items-center gap-3 text-[8px]">
              <span style={{ flexShrink: 0, minWidth: '12px' }}>{z.flag}</span>
              <span style={{ color: 'rgba(240,239,255,0.55)', minWidth: '80px', flexShrink: 0 }}>
                {z.city}
              </span>
              <span
                className="tabular-nums font-bold text-[9px]"
                style={{ color: biz ? '#4ade80' : 'rgba(240,239,255,0.75)', minWidth: '70px', flexShrink: 0, letterSpacing: '0.05em' }}
              >
                {allDone ? time : '--:--:--'}
              </span>
              <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '80px', flexShrink: 0 }}>
                {allDone ? date : ''}
              </span>
              <span style={{ color: offsetColor(z.offset), fontWeight: 700 }}>
                UTC{z.offset}
              </span>
              {biz && (
                <span className="text-[7px] uppercase tracking-wider" style={{ color: 'rgba(74,222,128,0.5)' }}>
                  ● biz
                </span>
              )}
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
          {ZONES.length} zones · ntp synced · chrony 4.5
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● live' : 'loading'}
        </span>
      </div>
    </div>
  );
}
