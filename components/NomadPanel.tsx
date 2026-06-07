'use client';

import { useEffect, useRef, useState } from 'react';

const JOBS = [
  { name: 'api-gateway', type: 'service', status: 'running', groups: 1, allocs: 3, version: 12 },
  { name: 'batch-processor', type: 'batch', status: 'dead', groups: 1, allocs: 0, version: 8 },
  { name: 'redis-cache', type: 'service', status: 'running', groups: 1, allocs: 1, version: 4 },
  { name: 'data-pipeline', type: 'batch', status: 'running', groups: 2, allocs: 4, version: 3 },
  { name: 'nginx-ingress', type: 'system', status: 'running', groups: 1, allocs: 3, version: 7 },
];

const ALLOCS = [
  { id: 'abc12345', job: 'api-gateway', node: 'nomad-client-0', status: 'running', cpu: '240 MHz', mem: '128 MB', uptime: '4d 2h' },
  { id: 'def67890', job: 'api-gateway', node: 'nomad-client-1', status: 'running', cpu: '180 MHz', mem: '120 MB', uptime: '4d 2h' },
  { id: 'ghi11223', job: 'data-pipeline', node: 'nomad-client-2', status: 'running', cpu: '800 MHz', mem: '512 MB', uptime: '12h' },
  { id: 'jkl44556', job: 'redis-cache', node: 'nomad-client-0', status: 'running', cpu: '40 MHz', mem: '64 MB', uptime: '12d' },
];

const NODES = [
  { name: 'nomad-server-0', role: 'server+client', eligibility: 'eligible', status: 'ready', dc: 'eu-west-1' },
  { name: 'nomad-client-0', role: 'client', eligibility: 'eligible', status: 'ready', dc: 'eu-west-1' },
  { name: 'nomad-client-1', role: 'client', eligibility: 'eligible', status: 'ready', dc: 'eu-west-1' },
  { name: 'nomad-client-2', role: 'client', eligibility: 'eligible', status: 'ready', dc: 'us-east-1' },
];

const TYPE_COLOR: Record<string, string> = { service: '#4ade80', batch: '#fbbf24', system: '#67e8f9', periodic: '#a78bfa' };
const STATUS_COLOR: Record<string, string> = { running: '#4ade80', dead: 'rgba(255,255,255,0.3)', failed: '#f87171', pending: '#fbbf24' };

function useCounter(base: number, delta: number, ms = 1200) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta)), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function NomadPanel() {
  const [visible, setVisible] = useState(false);
  const [jobRows, setJobRows] = useState(0);
  const [allocRows, setAllocRows] = useState(0);
  const [nodeRows, setNodeRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const evalTotal = useCounter(48200, 4, 1100);
  const deployments = useCounter(284, 0, 4000);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const j = setInterval(() => setJobRows((x) => Math.min(x + 1, JOBS.length)), 150);
    const a = setInterval(() => setAllocRows((x) => Math.min(x + 1, ALLOCS.length)), 160);
    const n = setInterval(() => setNodeRows((x) => Math.min(x + 1, NODES.length)), 170);
    return () => { clearInterval(j); clearInterval(a); clearInterval(n); };
  }, [visible]);

  const runningJobs = JOBS.filter((j) => j.status === 'running').length;

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
          nomad -- workload orchestrator -- hashicorp
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {runningJobs}/{JOBS.length} jobs
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>nomad@cluster</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>nomad job status && nomad node status -verbose && nomad alloc logs -follow api-gateway</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'running jobs', value: runningJobs.toString(), color: '#4ade80' },
          { label: 'allocations', value: ALLOCS.length.toString(), color: '#67e8f9' },
          { label: 'evaluations', value: evalTotal.toLocaleString(), color: '#a78bfa' },
          { label: 'deployments', value: deployments.toString(), color: '#fbbf24' },
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
            <div key={job.name} style={{ display: 'grid', gridTemplateColumns: '100px 56px 1fr 28px 28px 32px', alignItems: 'center', gap: 8, padding: '4px 8px', background: `${TYPE_COLOR[job.type] ?? '#fff'}06`, border: `1px solid ${TYPE_COLOR[job.type] ?? '#fff'}18`, borderRadius: 2 }}>
              <span style={{ color: TYPE_COLOR[job.type] ?? '#fff', fontSize: 9, fontWeight: 600 }}>{job.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8 }}>{job.type}</span>
              <span style={{ color: STATUS_COLOR[job.status], fontSize: 9, fontWeight: 700 }}>{job.status.toUpperCase()}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, textAlign: 'right' }}>{job.groups}g</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 8, textAlign: 'right' }}>{job.allocs}a</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>v{job.version}</span>
            </div>
          ))}
        </div>

        {/* Allocations + nodes side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
              // allocations
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {ALLOCS.slice(0, allocRows).map((alloc) => (
                <div key={alloc.id} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 52px', alignItems: 'center', gap: 6, padding: '4px 8px', background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.08)', borderRadius: 2 }}>
                  <span style={{ color: '#67e8f9', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alloc.job}</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alloc.cpu}</span>
                  <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'right' }}>{alloc.status.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
              // nodes
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {NODES.slice(0, nodeRows).map((node) => (
                <div key={node.name} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.08)', borderRadius: 2 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ color: 'rgba(240,239,255,0.55)', fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{node.name}</span>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{node.dc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(74,222,128,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          nomad v1.8.2 - hashicorp - bsl
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {evalTotal.toLocaleString()} evals - {deployments} deployments
        </span>
      </div>
    </div>
  );
}
