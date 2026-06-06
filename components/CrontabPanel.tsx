'use client';

import { useState, useEffect, useRef } from 'react';

interface CronJob {
  schedule:    string;
  description: string;
  command:     string;
  accent:      string;
  label:       string;
  lastRan:     string;
  nextRun:     string;
}

const JOBS: CronJob[] = [
  {
    schedule:    '*/15 * * * *',
    description: 'Health check — ping all endpoints',
    command:     'construx-health-check --all --alert-on-fail',
    accent:      '#4ade80',
    label:       'every 15 min',
    lastRan:     '3m ago',
    nextRun:     'in 12m',
  },
  {
    schedule:    '0 * * * *',
    description: 'Scoutr embeddings sync',
    command:     'construx-scoutr embeddings:sync --delta',
    accent:      '#F97316',
    label:       'hourly',
    lastRan:     '41m ago',
    nextRun:     'in 19m',
  },
  {
    schedule:    '0 2 * * *',
    description: 'PostgreSQL backup to S3',
    command:     'pg_dump construxgroup | gzip | aws s3 cp - s3://construx-backups/$(date +%F).sql.gz',
    accent:      '#7dd3fc',
    label:       'daily 02:00',
    lastRan:     '6h ago',
    nextRun:     'in 18h',
  },
  {
    schedule:    '0 6 * * *',
    description: 'Marqet catalogue scraper',
    command:     'construx-marqet scraper:run --full --notify-on-new',
    accent:      '#7dd3fc',
    label:       'daily 06:00',
    lastRan:     '2h ago',
    nextRun:     'in 22h',
  },
  {
    schedule:    '30 7 * * *',
    description: 'Analytics digest email',
    command:     'construx-analytics digest --send --recipients=founders',
    accent:      '#a78bfa',
    label:       'daily 07:30',
    lastRan:     '30m ago',
    nextRun:     'in 23.5h',
  },
  {
    schedule:    '0 8 * * *',
    description: 'Journal search index rebuild',
    command:     'construx-web index:rebuild --source=content/journal',
    accent:      '#a78bfa',
    label:       'daily 08:00',
    lastRan:     '8m ago',
    nextRun:     'in 24h',
  },
  {
    schedule:    '0 9 * * 1',
    description: 'npm audit — security check',
    command:     'npm audit --audit-level=high --json | construx-notify --channel=infra',
    accent:      '#fbbf24',
    label:       'mon 09:00',
    lastRan:     '5d ago',
    nextRun:     'in 2d',
  },
  {
    schedule:    '0 0 1 * *',
    description: 'Monthly cost report',
    command:     'construx-aws costs:report --period=30d --send-to=founders',
    accent:      '#fbbf24',
    label:       'monthly',
    lastRan:     '12d ago',
    nextRun:     'in 18d',
  },
];

export default function CrontabPanel() {
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
    if (revealed === 0 || revealed > JOBS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 90);
    return () => clearTimeout(id);
  }, [revealed]);

  const visibleJobs = JOBS.slice(0, revealed);

  return (
    <div
      ref={ref}
      className="overflow-hidden font-mono"
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
          construx@sys — scheduled jobs
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.2)' }}>
          {JOBS.length} jobs
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          crontab -l | column -t
        </span>
      </div>

      {/* Jobs */}
      <div className="px-4 py-3 space-y-3">
        {visibleJobs.map((job, i) => (
          <div
            key={i}
            className="space-y-0.5"
          >
            {/* Schedule line */}
            <div className="flex items-center gap-3">
              <span
                className="text-[8px] tabular-nums font-semibold flex-shrink-0"
                style={{ color: 'rgba(240,239,255,0.35)', minWidth: '120px' }}
              >
                {job.schedule}
              </span>
              <span
                className="text-[7px] uppercase tracking-widest px-1.5 py-px rounded-sm flex-shrink-0"
                style={{ background: `${job.accent}18`, color: `${job.accent}cc` }}
              >
                {job.label}
              </span>
              <span className="text-[8px] ml-auto tabular-nums" style={{ color: 'rgba(255,255,255,0.15)' }}>
                last: <span style={{ color: 'rgba(255,255,255,0.3)' }}>{job.lastRan}</span>
              </span>
              <span className="text-[8px] tabular-nums" style={{ color: 'rgba(255,255,255,0.15)' }}>
                next: <span style={{ color: job.accent + 'aa' }}>{job.nextRun}</span>
              </span>
            </div>

            {/* Description */}
            <div className="text-[8px] pl-px" style={{ color: 'rgba(240,239,255,0.45)' }}>
              # {job.description}
            </div>

            {/* Command */}
            <div
              className="text-[8px] truncate"
              style={{ color: job.accent + '90', paddingLeft: '2px' }}
            >
              {job.command}
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
          construx@sys · cron daemon · all times UTC
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          8 scheduled
        </span>
      </div>
    </div>
  );
}
