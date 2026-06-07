'use client';

import { useEffect, useRef, useState } from 'react';

const JOBS = [
  { repo: 'construx/api', job: 'unit-test', state: 'success', dur: '3m 12s', triggered: 'push' },
  { repo: 'construx/api', job: 'e2e-test', state: 'success', dur: '18m 40s', triggered: 'push' },
  { repo: 'construx/infra', job: 'tf-validate', state: 'success', dur: '2m 4s', triggered: 'pr' },
  { repo: 'construx/ml', job: 'model-eval', state: 'running', dur: '12m ...', triggered: 'push' },
  { repo: 'construx/web', job: 'lighthouse-audit', state: 'success', dur: '4m 28s', triggered: 'pr' },
  { repo: 'construx/api', job: 'security-scan', state: 'failure', dur: '5m 2s', triggered: 'pr' },
];

const DECKS = [
  { name: 'pr-tide', pools: 4, merges: 48, blocked: 1 },
  { name: 'post-submit', queued: 12, running: 3, done: 284 },
];

const STATE_COLOR: Record<string, string> = {
  success: '#4ade80',
  failure: '#f87171',
  running: '#fbbf24',
  pending: '#67e8f9',
  aborted: 'rgba(255,255,255,0.3)',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta)), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function ProwPanel() {
  const [visible, setVisible] = useState(false);
  const [jobRows, setJobRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalJobs = useCounter(4820, 8, 800);
  const passRate = useCounter(96, 0, 60000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const j = setInterval(() => setJobRows((x) => Math.min(x + 1, JOBS.length)), 140);
    return () => clearInterval(j);
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(103,232,249,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(103,232,249,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(103,232,249,0.08)', background: 'rgba(103,232,249,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(103,232,249,0.4)' }}>
          prow -- kubernetes ci -- tide merge automation
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalJobs.toLocaleString()} jobs
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>prow@ci</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>prowjob list --state=all --repo=construx/api --limit=20</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'total jobs', value: totalJobs.toLocaleString(), color: '#67e8f9' },
          { label: 'pass rate', value: `${passRate}%`, color: '#4ade80' },
          { label: 'running', value: JOBS.filter(j => j.state === 'running').length.toString(), color: '#fbbf24' },
          { label: 'failures', value: JOBS.filter(j => j.state === 'failure').length.toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Jobs */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // prow jobs
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {JOBS.slice(0, jobRows).map((job) => (
            <div key={job.repo + job.job} style={{ display: 'grid', gridTemplateColumns: '80px 100px 52px 1fr 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: `${STATE_COLOR[job.state]}06`, border: `1px solid ${STATE_COLOR[job.state]}18`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.repo}</span>
              <span style={{ color: STATE_COLOR[job.state], fontSize: 9, fontWeight: 600 }}>{job.job}</span>
              <span style={{ color: STATE_COLOR[job.state], fontSize: 8, fontWeight: 700 }}>{job.state.toUpperCase()}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 8 }}>{job.dur}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{job.triggered}</span>
            </div>
          ))}
        </div>

        {/* Tide */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // tide merge pools
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'pr-tide pools', value: DECKS[0].pools, color: '#67e8f9', sub: `${DECKS[0].merges} merges` },
            { label: 'blocked prs', value: DECKS[0].blocked, color: '#f87171', sub: 'require checks' },
            { label: 'post-submit queued', value: DECKS[1].queued, color: '#fbbf24', sub: `${DECKS[1].running} running` },
            { label: 'completed', value: DECKS[1].done, color: '#4ade80', sub: 'today' },
          ].map((stat) => (
            <div key={stat.label} style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2 }}>
              <div className="tabular-nums" style={{ fontSize: 16, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{stat.label}</div>
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.15)' }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          prow - kubernetes sigs - tide + deck + hook
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalJobs.toLocaleString()} jobs - {passRate}% pass
        </span>
      </div>
    </div>
  );
}
