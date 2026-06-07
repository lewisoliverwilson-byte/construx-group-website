'use client';

import { useEffect, useRef, useState } from 'react';

const QUEUES = [
  { name: 'default', workers: 10, processed: 48200, failed: 2, pending: 84, paused: false },
  { name: 'critical', workers: 5, processed: 8400, failed: 0, pending: 12, paused: false },
  { name: 'ml-inference', workers: 3, processed: 1240, failed: 1, pending: 28, paused: false },
  { name: 'email-send', workers: 2, processed: 4820, failed: 0, pending: 4, paused: false },
];

const JOBS = [
  { kind: 'EmbeddingJob', state: 'completed', attempt: 1, dur: '1.2s', worker: 'ml-inference', ts: '2m ago' },
  { kind: 'EmailJob', state: 'completed', attempt: 1, dur: '0.4s', worker: 'email-send', ts: '3m ago' },
  { kind: 'SyncJob', state: 'running', attempt: 1, dur: '...' , worker: 'default', ts: 'now' },
  { kind: 'ReportJob', state: 'errored', attempt: 3, dur: '8s', worker: 'default', ts: '12m ago' },
  { kind: 'IndexJob', state: 'completed', attempt: 1, dur: '2.8s', worker: 'default', ts: '18m ago' },
];

const STATE_COLOR: Record<string, string> = {
  completed: '#4ade80',
  running: '#fbbf24',
  errored: '#f87171',
  pending: '#67e8f9',
  cancelled: 'rgba(255,255,255,0.3)',
};

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function RiverPanel() {
  const [visible, setVisible] = useState(false);
  const [qRows, setQRows] = useState(0);
  const [jRows, setJRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const totalJobs = useCounter(62660, 24, 700);
  const throughput = useCounter(820, 8, 800);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const q = setInterval(() => setQRows((x) => Math.min(x + 1, QUEUES.length)), 160);
    const j = setInterval(() => setJRows((x) => Math.min(x + 1, JOBS.length)), 140);
    return () => { clearInterval(q); clearInterval(j); };
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
          river -- postgres-backed job queue -- go
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {throughput.toLocaleString()} jobs/min
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#67e8f9', fontWeight: 600 }}>river@queue</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>river bench --queues default,critical,ml-inference --count 10000 --workers 20</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'jobs/min', value: throughput.toLocaleString(), color: '#67e8f9' },
          { label: 'total jobs', value: totalJobs.toLocaleString(), color: '#4ade80' },
          { label: 'queues', value: QUEUES.length.toString(), color: '#a78bfa' },
          { label: 'errored', value: QUEUES.reduce((a, q) => a + q.failed, 0).toString(), color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* Queues */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // queues
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {QUEUES.slice(0, qRows).map((q) => (
            <div key={q.name} style={{ display: 'grid', gridTemplateColumns: '80px 24px 52px 32px 36px 36px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#67e8f9', fontSize: 9, fontWeight: 600 }}>{q.name}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 8, textAlign: 'center' }}>{q.workers}w</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 8, textAlign: 'right' }}>{q.processed.toLocaleString()}</span>
              <span className="tabular-nums" style={{ color: q.failed > 0 ? '#f87171' : 'rgba(255,255,255,0.2)', fontSize: 8, textAlign: 'right' }}>{q.failed}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{q.pending}</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>ACTIVE</span>
            </div>
          ))}
        </div>

        {/* Recent jobs */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // recent jobs
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {JOBS.slice(0, jRows).map((job) => (
            <div key={job.kind + job.ts} style={{ display: 'grid', gridTemplateColumns: '80px 52px 24px 36px 64px 28px', alignItems: 'center', gap: 8, padding: '4px 8px', background: `${STATE_COLOR[job.state]}06`, border: `1px solid ${STATE_COLOR[job.state]}14`, borderRadius: 2 }}>
              <span style={{ color: STATE_COLOR[job.state], fontSize: 8, fontWeight: 600 }}>{job.kind}</span>
              <span style={{ color: STATE_COLOR[job.state], fontSize: 8 }}>{job.state}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'center' }}>{job.attempt}</span>
              <span className="tabular-nums" style={{ color: '#fbbf24', fontSize: 8, textAlign: 'right' }}>{job.dur}</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.worker}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{job.ts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(103,232,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          river v0.12 - mit - postgres-native job queue
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {totalJobs.toLocaleString()} total - {throughput.toLocaleString()} /min
        </span>
      </div>
    </div>
  );
}
