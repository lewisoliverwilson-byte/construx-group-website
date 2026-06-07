'use client';

import { useState, useEffect, useRef } from 'react';

type StepStatus = 'success' | 'failure' | 'skipped' | 'in_progress' | 'queued';

interface WorkflowStep {
  name:     string;
  status:   StepStatus;
  durationS: number;
  output?:  string;
}

interface WorkflowJob {
  name:     string;
  runner:   string;
  status:   StepStatus;
  steps:    WorkflowStep[];
}

const JOBS: WorkflowJob[] = [
  {
    name: 'lint-and-typecheck', runner: 'ubuntu-latest', status: 'success',
    steps: [
      { name: 'Checkout',           status: 'success', durationS: 2  },
      { name: 'Setup Bun',          status: 'success', durationS: 4  },
      { name: 'Restore cache',      status: 'success', durationS: 8  },
      { name: 'Install deps',       status: 'success', durationS: 12 },
      { name: 'Run Biome lint',     status: 'success', durationS: 6  },
      { name: 'TypeScript check',   status: 'success', durationS: 14 },
    ],
  },
  {
    name: 'test', runner: 'ubuntu-latest', status: 'success',
    steps: [
      { name: 'Checkout',           status: 'success', durationS: 2  },
      { name: 'Setup Bun',          status: 'success', durationS: 4  },
      { name: 'Restore cache',      status: 'success', durationS: 7  },
      { name: 'Install deps',       status: 'success', durationS: 11 },
      { name: 'Start Postgres',     status: 'success', durationS: 5  },
      { name: 'Run migrations',     status: 'success', durationS: 8  },
      { name: 'Run unit tests',     status: 'success', durationS: 23, output: '✓ 214 tests passed in 22.8s' },
      { name: 'Upload coverage',    status: 'success', durationS: 3  },
    ],
  },
  {
    name: 'build', runner: 'ubuntu-latest', status: 'success',
    steps: [
      { name: 'Checkout',           status: 'success', durationS: 2  },
      { name: 'Setup Bun',          status: 'success', durationS: 4  },
      { name: 'Restore Next cache', status: 'success', durationS: 19 },
      { name: 'Install deps',       status: 'success', durationS: 11 },
      { name: 'Build Next.js',      status: 'success', durationS: 48, output: '✓ Route (app): 42 routes compiled' },
      { name: 'Upload artifact',    status: 'success', durationS: 6  },
    ],
  },
  {
    name: 'deploy', runner: 'ubuntu-latest', status: 'success',
    steps: [
      { name: 'Checkout',           status: 'success', durationS: 2  },
      { name: 'Configure AWS OIDC', status: 'success', durationS: 3  },
      { name: 'Download artifact',  status: 'success', durationS: 5  },
      { name: 'Deploy to Amplify',  status: 'success', durationS: 34, output: '✓ Deploy complete: d3dpr3doar5fjy' },
      { name: 'Invalidate CDN',     status: 'success', durationS: 8  },
      { name: 'Notify Slack',       status: 'success', durationS: 2  },
    ],
  },
];

const TOTAL_STEPS = JOBS.reduce((s, j) => s + j.steps.length, 0);
const TOTAL = TOTAL_STEPS + JOBS.length;

function statusColor(s: StepStatus): string {
  if (s === 'success')     return '#4ade80';
  if (s === 'failure')     return '#f87171';
  if (s === 'in_progress') return '#fbbf24';
  if (s === 'skipped')     return 'rgba(240,239,255,0.2)';
  return 'rgba(240,239,255,0.15)';
}

function statusIcon(s: StepStatus): string {
  if (s === 'success')     return '✓';
  if (s === 'failure')     return '✗';
  if (s === 'in_progress') return '●';
  if (s === 'skipped')     return '–';
  return '○';
}

const totalDurationS = JOBS.reduce(
  (s, j) => Math.max(s, j.steps.reduce((ss, step) => ss + step.durationS, 0)),
  0,
);

export default function GhActionsRunPanel() {
  const [revealed, setRevealed] = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  let globalStep = 0;

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
    const id = setTimeout(() => setRevealed((r) => r + 1), 77);
    return () => clearTimeout(id);
  }, [revealed]);

  const allDone = revealed > TOTAL;

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
          github actions · deploy.yml · run #1847
        </span>
        <span className="text-[8px]" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${totalDurationS}s` : 'running…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>lewisoliverwilson-byte/construx-group-website</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          push to master · commit eb1f09e · triggered by lewis
        </span>
      </div>

      {/* Jobs */}
      <div className="px-4 py-2 space-y-3">
        {JOBS.map((job, ji) => {
          const jobRevealIndex = globalStep;
          globalStep += job.steps.length + 1;
          const jobShown = revealed > jobRevealIndex;
          if (!jobShown) return null;

          let stepBase = jobRevealIndex + 1;
          const shownSteps = job.steps.filter((_, si) => revealed > stepBase + si);

          return (
            <div key={ji}>
              {/* Job header */}
              <div className="flex items-center gap-2 text-[7.5px] mb-1">
                <span style={{ color: statusColor(job.status), fontWeight: 700 }}>{statusIcon(job.status)}</span>
                <span style={{ color: '#60a5fa', fontWeight: 600 }}>{job.name}</span>
                <span style={{ color: 'rgba(240,239,255,0.2)' }}>on {job.runner}</span>
                <span style={{ color: 'rgba(240,239,255,0.18)', marginLeft: 'auto', fontSize: '7px' }}>
                  {job.steps.reduce((s, st) => s + st.durationS, 0)}s
                </span>
              </div>

              {/* Steps */}
              <div className="pl-4 space-y-0.5">
                {shownSteps.map((step, si) => (
                  <div key={si}>
                    <div
                      className="flex items-center gap-2 text-[7px] leading-[1.7]"
                      style={{
                        borderLeft: `2px solid ${statusColor(step.status)}22`,
                        paddingLeft: '4px',
                      }}
                    >
                      <span style={{ color: statusColor(step.status), minWidth: '10px', flexShrink: 0 }}>
                        {statusIcon(step.status)}
                      </span>
                      <span style={{ color: 'rgba(240,239,255,0.4)', flexGrow: 1 }}>{step.name}</span>
                      <span style={{ color: 'rgba(240,239,255,0.18)' }}>{step.durationS}s</span>
                    </div>
                    {step.output && (
                      <div className="pl-6 text-[7px]" style={{ color: 'rgba(240,239,255,0.22)' }}>
                        {step.output}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>{JOBS.length} jobs passed</span>
          <span>{TOTAL_STEPS} steps total</span>
          <span style={{ color: '#60a5fa' }}>{totalDurationS}s wall time</span>
          <span className="ml-auto" style={{ color: '#4ade80' }}>● All checks passed</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          github actions · ubuntu-latest · run #1847
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? `● ${JOBS.length} jobs` : 'loading'}
        </span>
      </div>
    </div>
  );
}
