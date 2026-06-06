'use client';

import { useState, useEffect } from 'react';

interface Stage {
  name: string;
  duration: string;
  status: 'pass' | 'fail' | 'skip';
}

interface Pipeline {
  repo: string;
  branch: string;
  commit: string;
  message: string;
  accentColor: string;
  stages: Stage[];
  totalTime: string;
  deployedAt: string;
}

const PIPELINES: Pipeline[] = [
  {
    repo: 'scoutr',
    branch: 'main',
    commit: 'a3f2c91',
    message: 'feat: add batch mode for retailer scan pipeline',
    accentColor: '#F97316',
    stages: [
      { name: 'install',    duration: '12s',  status: 'pass' },
      { name: 'typecheck',  duration: '8s',   status: 'pass' },
      { name: 'lint',       duration: '4s',   status: 'pass' },
      { name: 'test',       duration: '34s',  status: 'pass' },
      { name: 'build',      duration: '21s',  status: 'pass' },
      { name: 'deploy',     duration: '18s',  status: 'pass' },
    ],
    totalTime: '1m 37s',
    deployedAt: '12m ago',
  },
  {
    repo: 'marqet',
    branch: 'main',
    commit: 'e6c3a18',
    message: 'chore: regenerate embeddings with text-embedding-3-small',
    accentColor: '#7dd3fc',
    stages: [
      { name: 'install',    duration: '11s',  status: 'pass' },
      { name: 'typecheck',  duration: '9s',   status: 'pass' },
      { name: 'lint',       duration: '3s',   status: 'pass' },
      { name: 'test',       duration: '28s',  status: 'pass' },
      { name: 'build',      duration: '19s',  status: 'pass' },
      { name: 'deploy',     duration: '22s',  status: 'pass' },
    ],
    totalTime: '1m 32s',
    deployedAt: '5h ago',
  },
  {
    repo: 'hyve',
    branch: 'main',
    commit: 'f2d7b31',
    message: 'refactor: simplify websocket connection pool management',
    accentColor: '#4ade80',
    stages: [
      { name: 'install',    duration: '13s',  status: 'pass' },
      { name: 'typecheck',  duration: '10s',  status: 'pass' },
      { name: 'lint',       duration: '4s',   status: 'pass' },
      { name: 'test',       duration: '42s',  status: 'pass' },
      { name: 'build',      duration: '25s',  status: 'pass' },
      { name: 'deploy',     duration: '16s',  status: 'pass' },
    ],
    totalTime: '1m 50s',
    deployedAt: '7h ago',
  },
  {
    repo: 'website',
    branch: 'master',
    commit: 'b51eaff',
    message: 'feat: BuildOutputPanel on stats; dispatches 457-459',
    accentColor: '#a78bfa',
    stages: [
      { name: 'install',    duration: '8s',   status: 'pass' },
      { name: 'typecheck',  duration: '12s',  status: 'pass' },
      { name: 'lint',       duration: '3s',   status: 'skip' },
      { name: 'test',       duration: '—',    status: 'skip' },
      { name: 'build',      duration: '44s',  status: 'pass' },
      { name: 'deploy',     duration: '31s',  status: 'pass' },
    ],
    totalTime: '1m 38s',
    deployedAt: '38m ago',
  },
];

const STAGE_STYLE = {
  pass: { icon: '✓', color: 'rgba(74,222,128,0.8)' },
  fail: { icon: '✗', color: 'rgba(248,113,113,0.85)' },
  skip: { icon: '—', color: 'rgba(240,239,255,0.2)' },
};

export default function CIPipelinePanel() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3500);
    return () => clearInterval(id);
  }, []);

  const passing = PIPELINES.filter((p) => p.stages.every((s) => s.status !== 'fail')).length;

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
          construx@sys — gh actions — CI/CD
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.6)' }}>
          {passing}/{PIPELINES.length} passing
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          gh run list --all --json status,name,commit --jq &apos;.[].status&apos;
        </span>
      </div>

      {/* Pipelines */}
      <div>
        {PIPELINES.map((pipeline, pi) => (
          <div
            key={pipeline.repo}
            className="px-4 py-3"
            style={{ borderBottom: pi < PIPELINES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
          >
            {/* Repo + commit */}
            <div className="flex items-center gap-3 mb-2.5">
              <span
                className="text-[9px] uppercase tracking-widest font-semibold"
                style={{ color: pipeline.accentColor, minWidth: '60px' }}
              >
                {pipeline.repo}
              </span>
              <span className="text-[8px]" style={{ color: 'rgba(74,222,128,0.5)' }}>
                {pipeline.commit}
              </span>
              <span
                className="text-[9px] flex-1 truncate"
                style={{ color: 'rgba(240,239,255,0.4)' }}
              >
                {pipeline.message}
              </span>
              <span className="text-[8px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {pipeline.deployedAt}
              </span>
            </div>

            {/* Stages */}
            <div className="flex items-center gap-2 flex-wrap">
              {pipeline.stages.map((stage, si) => {
                const style = STAGE_STYLE[stage.status];
                return (
                  <div
                    key={stage.name}
                    className="flex items-center gap-1.5"
                  >
                    <span
                      className="text-[8px] uppercase tracking-widest px-2 py-0.5"
                      style={{
                        background: stage.status === 'pass' ? 'rgba(74,222,128,0.07)' : stage.status === 'fail' ? 'rgba(248,113,113,0.07)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${stage.status === 'pass' ? 'rgba(74,222,128,0.15)' : stage.status === 'fail' ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.05)'}`,
                        borderRadius: '2px',
                        color: style.color,
                      }}
                    >
                      {style.icon} {stage.name}
                    </span>
                    <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
                      {stage.duration}
                    </span>
                    {si < pipeline.stages.length - 1 && (
                      <span style={{ color: 'rgba(255,255,255,0.12)' }}>›</span>
                    )}
                  </div>
                );
              })}
              <span className="ml-auto text-[8px]" style={{ color: 'rgba(240,239,255,0.2)' }}>
                {pipeline.totalTime}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span
          className="flex items-center gap-1.5 text-[8px] uppercase tracking-widest"
          style={{ color: 'rgba(74,222,128,0.55)' }}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{
              background: '#4ade80',
              boxShadow: '0 0 4px #4ade80',
              opacity: tick % 2 === 0 ? 0.4 : 1,
              transition: 'opacity 0.7s ease',
            }}
          />
          ALL CLEAR · GitHub Actions
        </span>
        <span className="text-[8px]" style={{ color: 'rgba(249,115,22,0.3)' }}>AWS Amplify auto-deploy</span>
      </div>
    </div>
  );
}
