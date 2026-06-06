'use client';

import { useState, useEffect } from 'react';

interface CronJob {
  schedule: string;
  desc: string;
  venture: string;
  accentColor: string;
  status: 'running' | 'idle' | 'queued';
  lastRun: string;
  nextRun: string;
}

const JOBS: CronJob[] = [
  {
    schedule: '0 * * * *',
    desc: 'scoutr scan --deep --all-retailers --notify-arbitrage',
    venture: 'SCOUTR',
    accentColor: '#F97316',
    status: 'running',
    lastRun: '01:00:02',
    nextRun: '02:00:00',
  },
  {
    schedule: '*/15 * * * *',
    desc: 'scoutr price-delta --threshold=2.5% --emit-alerts',
    venture: 'SCOUTR',
    accentColor: '#F97316',
    status: 'idle',
    lastRun: '01:45:01',
    nextRun: '02:00:00',
  },
  {
    schedule: '0 4 * * *',
    desc: 'scoutr index --rebuild --optimize --vacuum',
    venture: 'SCOUTR',
    accentColor: '#F97316',
    status: 'idle',
    lastRun: '04:00:08',
    nextRun: '04:00:00',
  },
  {
    schedule: '*/30 * * * *',
    desc: 'marqet sync --catalogue --check-new --publish-approved',
    venture: 'MARQET',
    accentColor: '#7dd3fc',
    status: 'queued',
    lastRun: '01:30:04',
    nextRun: '02:00:00',
  },
  {
    schedule: '0 2 * * *',
    desc: 'marqet embed --regenerate-vectors --model=claude-opus',
    venture: 'MARQET',
    accentColor: '#7dd3fc',
    status: 'idle',
    lastRun: '02:00:14',
    nextRun: '02:00:00',
  },
  {
    schedule: '0 9 * * 1-5',
    desc: 'hyve digest --team-summary --send-slack --daily-brief',
    venture: 'HYVE',
    accentColor: '#4ade80',
    status: 'idle',
    lastRun: 'Mon 09:00',
    nextRun: 'Tue 09:00',
  },
  {
    schedule: '*/5 * * * *',
    desc: 'hyve context --prune-stale --rerank-relevance',
    venture: 'HYVE',
    accentColor: '#4ade80',
    status: 'running',
    lastRun: '01:55:03',
    nextRun: '02:00:00',
  },
  {
    schedule: '0 6 * * 0',
    desc: 'sys backup --all-ventures --encrypt --s3-upload',
    venture: 'SYS',
    accentColor: '#a78bfa',
    status: 'idle',
    lastRun: 'Sun 06:00',
    nextRun: 'Sun 06:00',
  },
  {
    schedule: '0 0 * * *',
    desc: 'sys metrics --aggregate --export-influx --alert-thresholds',
    venture: 'SYS',
    accentColor: '#a78bfa',
    status: 'idle',
    lastRun: '00:00:05',
    nextRun: '00:00:00',
  },
];

const STATUS_CONFIG = {
  running: { color: 'rgba(249,115,22,0.9)', label: 'RUNNING', dot: '#F97316' },
  idle:    { color: 'rgba(74,222,128,0.7)',  label: 'IDLE',    dot: '#4ade80' },
  queued:  { color: 'rgba(234,179,8,0.8)',   label: 'QUEUED',  dot: '#FBBF24' },
};

export default function VentureCrontabPanel() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const runningCount = JOBS.filter((j) => j.status === 'running').length;
  const queuedCount  = JOBS.filter((j) => j.status === 'queued').length;

  return (
    <div
      className="overflow-hidden font-mono"
      style={{
        background: 'rgba(1,1,10,0.97)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '3px',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 24px 64px rgba(0,0,0,0.6)',
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
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          construx@sys — crontab — scheduler
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(249,115,22,0.7)' }}>
            {runningCount} running
          </span>
          <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(234,179,8,0.6)' }}>
            {queuedCount} queued
          </span>
        </div>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          crontab -l | grep -v &quot;^#&quot; | sort -t&quot; &quot; -k6
        </span>
      </div>

      {/* Column headers */}
      <div
        className="grid gap-0 px-4 py-1.5 text-[8px] uppercase tracking-[0.15em] select-none"
        style={{
          gridTemplateColumns: '110px 1fr 64px 70px 70px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          color: 'rgba(240,239,255,0.2)',
          background: 'rgba(255,255,255,0.01)',
        }}
      >
        <span>SCHEDULE</span>
        <span>COMMAND</span>
        <span className="text-center">VENTURE</span>
        <span className="text-center">LAST RUN</span>
        <span className="text-center">STATUS</span>
      </div>

      {/* Job rows */}
      <div>
        {JOBS.map((job, i) => {
          const statusCfg = STATUS_CONFIG[job.status];
          const isRunning = job.status === 'running';
          const pulse = isRunning && tick % 2 === 0;

          return (
            <div
              key={i}
              className="grid items-center px-4 py-2 gap-0"
              style={{
                gridTemplateColumns: '110px 1fr 64px 70px 70px',
                borderBottom: i < JOBS.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                background: isRunning ? 'rgba(249,115,22,0.025)' : 'transparent',
              }}
            >
              {/* Schedule */}
              <span
                className="text-[9px] tabular-nums truncate pr-2"
                style={{ color: 'rgba(103,232,249,0.5)' }}
              >
                {job.schedule}
              </span>

              {/* Command */}
              <span
                className="text-[9px] truncate pr-3"
                style={{ color: isRunning ? 'rgba(240,239,255,0.65)' : 'rgba(240,239,255,0.35)' }}
              >
                {job.desc}
              </span>

              {/* Venture */}
              <span
                className="text-[8px] uppercase tracking-widest text-center truncate"
                style={{ color: `${job.accentColor}88` }}
              >
                {job.venture}
              </span>

              {/* Last run */}
              <span
                className="text-[9px] tabular-nums text-center"
                style={{ color: 'rgba(240,239,255,0.2)' }}
              >
                {job.lastRun}
              </span>

              {/* Status */}
              <div className="flex items-center justify-center gap-1.5">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    background: statusCfg.dot,
                    opacity: pulse ? 0.4 : 0.9,
                    transition: 'opacity 0.6s ease',
                    boxShadow: isRunning ? `0 0 5px ${statusCfg.dot}` : 'none',
                  }}
                />
                <span className="text-[8px] uppercase tracking-widest" style={{ color: statusCfg.color }}>
                  {statusCfg.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,6,0.5)' }}
      >
        <div className="flex items-center gap-4">
          <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.5)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: '#4ade80', boxShadow: '0 0 4px #4ade80', opacity: tick % 2 === 0 ? 0.5 : 1, transition: 'opacity 0.6s ease' }}
            />
            DAEMON ACTIVE
          </span>
          <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.15)' }}>
            {JOBS.length} JOBS
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.12)' }}>TZ=UTC</span>
          <span className="text-[8px]" style={{ color: 'rgba(249,115,22,0.35)' }}>construx@sys</span>
        </div>
      </div>
    </div>
  );
}
