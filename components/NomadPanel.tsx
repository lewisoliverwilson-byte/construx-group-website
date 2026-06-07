'use client';

import { useEffect, useRef, useState } from 'react';

const JOBS = [
  { name: 'construx-api', type: 'service', datacenters: 'dc1', taskGroups: 2, running: 4, queued: 0, status: 'running' },
  { name: 'construx-worker', type: 'service', datacenters: 'dc1', taskGroups: 1, running: 6, queued: 0, status: 'running' },
  { name: 'construx-batch-enricher', type: 'batch', datacenters: 'dc1', taskGroups: 1, running: 0, queued: 0, status: 'dead' },
  { name: 'construx-cron-scraper', type: 'batch', datacenters: 'dc1', taskGroups: 1, running: 1, queued: 0, status: 'running' },
];

const ALLOCATIONS = [
  { id: 'alloc-a1b2', job: 'construx-api', task: 'api', node: 'nomad-client-01', cpu: 284, memMB: 512, status: 'running' },
  { id: 'alloc-c3d4', job: 'construx-api', task: 'api', node: 'nomad-client-02', cpu: 276, memMB: 496, status: 'running' },
  { id: 'alloc-e5f6', job: 'construx-worker', task: 'worker', node: 'nomad-client-01', cpu: 184, memMB: 256, status: 'running' },
  { id: 'alloc-g7h8', job: 'construx-cron-scraper', task: 'scraper', node: 'nomad-client-03', cpu: 120, memMB: 128, status: 'running' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function NomadPanel() {
  const [visible, setVisible] = useState(false);
  const [jobRows, setJobRows] = useState(0);
  const [allocRows, setAllocRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const jobsScheduled = useCounter(2840, 4, 800);
  const allocsPlaced = useCounter(28400, 48, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const j = setInterval(() => setJobRows((x) => Math.min(x + 1, JOBS.length)), 160);
    const a = setInterval(() => setAllocRows((x) => Math.min(x + 1, ALLOCATIONS.length)), 140);
    return () => { clearInterval(j); clearInterval(a); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(74,222,128,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(74,222,128,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(74,222,128,0.08)', background: 'rgba(74,222,128,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(74,222,128,0.4)' }}>
          nomad -- workload orchestrator -- jobs / allocations / clients
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {JOBS.filter(j => j.status === 'running').length} running
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>nomad@cluster</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>nomad job status construx-api && nomad alloc status -short && nomad node status</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'jobs scheduled', value: jobsScheduled.toLocaleString(), color: '#4ade80' },
          { label: 'allocs placed', value: allocsPlaced.toLocaleString(), color: '#67e8f9' },
          { label: 'jobs', value: JOBS.length.toString(), color: '#a78bfa' },
          { label: 'running', value: JOBS.filter(j => j.status === 'running').length.toString(), color: '#fbbf24' },
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
          // jobs
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {JOBS.slice(0, jobRows).map((job) => (
            <div key={job.name} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 28px 20px 20px 20px 44px', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 2 }}>
              <span style={{ color: '#4ade80', fontSize: 8, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.name}</span>
              <span style={{ color: '#67e8f9', fontSize: 7 }}>{job.type}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{job.datacenters}</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'center' }}>{job.taskGroups}tg</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{job.running}r</span>
              <span className="tabular-nums" style={{ color: job.queued > 0 ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 7, textAlign: 'center' }}>{job.queued}q</span>
              <span style={{ color: job.status === 'running' ? '#4ade80' : 'rgba(255,255,255,0.3)', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{job.status}</span>
            </div>
          ))}
        </div>

        {/* Allocations */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // allocations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ALLOCATIONS.slice(0, allocRows).map((alloc) => (
            <div key={alloc.id} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 52px 68px 40px 36px 44px', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.08)', borderRadius: 2 }}>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, fontFamily: 'monospace' }}>{alloc.id}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alloc.job}</span>
              <span style={{ color: '#4ade80', fontSize: 7 }}>{alloc.task}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{alloc.node}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'right' }}>{alloc.cpu}m</span>
              <span className="tabular-nums" style={{ color: '#a78bfa', fontSize: 7, textAlign: 'right' }}>{alloc.memMB}M</span>
              <span style={{ color: '#4ade80', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{alloc.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          nomad v1.9 - bsl-1.1 - flexible workload orchestrator
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {jobsScheduled.toLocaleString()} jobs - {allocsPlaced.toLocaleString()} allocs
        </span>
      </div>
    </div>
  );
}
