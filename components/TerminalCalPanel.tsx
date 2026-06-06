'use client';

import { useState, useEffect } from 'react';

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Milestone {
  day: number;
  label: string;
  color: string;
}

const MILESTONES: Milestone[] = [
  { day: 1,  label: 'scoutr v1.4 deploy',           color: '#F97316' },
  { day: 8,  label: 'marqet embed pipeline GA',      color: '#7dd3fc' },
  { day: 15, label: 'hyve websocket refactor',       color: '#4ade80' },
  { day: 22, label: 'dispatch review + publish',     color: '#a78bfa' },
];

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function TerminalCalPanel() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  if (!now) return null;

  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const cells = buildCalendar(year, month);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const milestoneMap = new Map(MILESTONES.map((m) => [m.day, m]));

  return (
    <div
      className="overflow-hidden font-mono"
      style={{
        background: 'rgba(1,1,10,0.97)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '3px',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.6)',
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
          construx@sys — schedule
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(249,115,22,0.55)' }}>
          {MONTH_NAMES[month].toLowerCase()} {year}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          cal -m && cat /var/construx/schedule/{month + 1}.log
        </span>
      </div>

      <div className="flex gap-0">
        {/* Calendar grid */}
        <div className="px-4 py-4 flex-shrink-0" style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          {/* Month header */}
          <div
            className="text-center text-[9px] font-semibold mb-2 uppercase tracking-widest"
            style={{ color: 'rgba(249,115,22,0.75)' }}
          >
            {MONTH_NAMES[month]} {year}
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-x-1 mb-1">
            {DAYS.map((d, i) => (
              <div
                key={d}
                className="text-center text-[7px] uppercase tracking-widest w-6"
                style={{ color: i >= 5 ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.18)' }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-x-1 mb-0.5">
              {week.map((day, di) => {
                const isToday = day === today;
                const milestone = day ? milestoneMap.get(day) : undefined;
                const isWeekend = di >= 5;

                return (
                  <div
                    key={di}
                    className="text-center text-[8px] w-6 h-5 flex items-center justify-center rounded-sm relative"
                    style={{
                      background: isToday ? 'rgba(249,115,22,0.25)' : milestone ? `${milestone.color}15` : 'transparent',
                      color: !day ? 'transparent'
                        : isToday ? 'rgba(249,115,22,1)'
                        : milestone ? milestone.color
                        : isWeekend ? 'rgba(248,113,113,0.45)'
                        : 'rgba(240,239,255,0.45)',
                      fontWeight: isToday ? '700' : '400',
                      border: isToday ? '1px solid rgba(249,115,22,0.5)' : milestone ? `1px solid ${milestone.color}35` : '1px solid transparent',
                    }}
                  >
                    {day ?? ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Milestone list */}
        <div className="flex-1 px-4 py-4">
          <div
            className="text-[7px] uppercase tracking-widest mb-3"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            // upcoming
          </div>
          <div className="space-y-2.5">
            {MILESTONES.map((m) => (
              <div key={m.day} className="flex items-start gap-2.5">
                <span
                  className="text-[9px] tabular-nums flex-shrink-0 font-semibold"
                  style={{ color: m.color, minWidth: '20px' }}
                >
                  {String(m.day).padStart(2, '0')}
                </span>
                <span
                  className="w-1 h-1 rounded-full flex-shrink-0 mt-1"
                  style={{ background: m.color, boxShadow: `0 0 4px ${m.color}` }}
                />
                <span className="text-[8px] leading-relaxed" style={{ color: 'rgba(240,239,255,0.5)' }}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>

          <div
            className="mt-4 pt-3 text-[7px] uppercase tracking-widest"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.18)' }}
          >
            today: {String(today).padStart(2, '0')}/{String(month + 1).padStart(2, '0')}/{year}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          construx schedule · {MILESTONES.length} events
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.4)' }}>
          current month
        </span>
      </div>
    </div>
  );
}
