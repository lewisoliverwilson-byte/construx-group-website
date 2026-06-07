'use client';

import { useEffect, useRef, useState } from 'react';

const PIPELINERUNS = [
  { name: 'build-construx-api-run-28401', pipeline: 'build-and-push', duration: '4m12s', tasks: 8, succeeded: 8, status: 'Succeeded' },
  { name: 'deploy-staging-run-28400', pipeline: 'deploy-staging', duration: '2m08s', tasks: 5, succeeded: 5, status: 'Succeeded' },
  { name: 'security-scan-run-28399', pipeline: 'security-scan', duration: '-', tasks: 4, succeeded: 2, status: 'Running' },
  { name: 'integration-tests-run-28398', pipeline: 'integration-tests', duration: '8m44s', tasks: 12, succeeded: 12, status: 'Succeeded' },
];

const TASKRUNS = [
  { name: 'git-clone-run-abc', task: 'git-clone', workspace: 'source', pod: 'git-clone-pod-abc', duration: '8s', status: 'Succeeded' },
  { name: 'build-image-run-def', task: 'buildah-build', workspace: 'source', pod: 'build-image-pod-def', duration: '2m14s', status: 'Succeeded' },
  { name: 'push-image-run-ghi', task: 'buildah-push', workspace: 'source', pod: 'push-image-pod-ghi', duration: '48s', status: 'Running' },
  { name: 'trivy-scan-run-jkl', task: 'trivy-scan', workspace: 'source', pod: 'trivy-scan-pod-jkl', duration: '28s', status: 'Succeeded' },
];

function useCounter(base: number, delta: number, ms = 900) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setV((x) => x + Math.floor(Math.random() * delta) + 1), ms);
    return () => clearInterval(id);
  }, [delta, ms]);
  return v;
}

export default function TektonPanel() {
  const [visible, setVisible] = useState(false);
  const [prRows, setPrRows] = useState(0);
  const [trRows, setTrRows] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const runsTotal = useCounter(28400, 4, 800);
  const tasksSucceeded = useCounter(284000, 48, 600);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const p = setInterval(() => setPrRows((x) => Math.min(x + 1, PIPELINERUNS.length)), 160);
    const t = setInterval(() => setTrRows((x) => Math.min(x + 1, TASKRUNS.length)), 140);
    return () => { clearInterval(p); clearInterval(t); };
  }, [visible]);

  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(2,2,12,0.92)',
        border: '1px solid rgba(249,115,22,0.13)',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        boxShadow: '0 0 28px rgba(249,115,22,0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid rgba(249,115,22,0.08)', background: 'rgba(249,115,22,0.02)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 4px rgba(255,95,87,0.45)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 4px rgba(255,189,46,0.4)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 4px rgba(40,200,64,0.4)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(249,115,22,0.4)' }}>
          tekton -- k8s-native ci -- pipelineruns / taskruns / workspaces
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {runsTotal.toLocaleString()} runs
        </span>
      </div>

      {/* Shell prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)', fontSize: 10 }}>
        <span style={{ color: '#f97316', fontWeight: 600 }}>tkn@cluster</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
        <span style={{ color: 'rgba(240,239,255,0.3)' }}>tkn pipelinerun list --namespace prod && tkn pipeline start build-and-push --param image=construxgroup/api:latest</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
        {[
          { label: 'pipeline runs', value: runsTotal.toLocaleString(), color: '#f97316' },
          { label: 'tasks done', value: (tasksSucceeded / 1000).toFixed(0) + 'k', color: '#4ade80' },
          { label: 'pipelines', value: new Set(PIPELINERUNS.map(p => p.pipeline)).size.toString(), color: '#a78bfa' },
          { label: 'running', value: PIPELINERUNS.filter(p => p.status === 'Running').length.toString(), color: '#67e8f9' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '8px 10px', background: 'rgba(2,2,12,0.6)', textAlign: 'center' }}>
            <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>
        {/* PipelineRuns */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // pipeline runs
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {PIPELINERUNS.slice(0, prRows).map((pr) => (
            <div key={pr.name} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 40px 20px 20px 64px', alignItems: 'center', gap: 8, padding: '5px 8px', background: pr.status === 'Running' ? 'rgba(249,115,22,0.06)' : 'rgba(249,115,22,0.04)', border: `1px solid ${pr.status === 'Running' ? 'rgba(249,115,22,0.2)' : 'rgba(249,115,22,0.1)'}`, borderRadius: 2 }}>
              <span style={{ color: '#f97316', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pr.name}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pr.pipeline}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{pr.duration}</span>
              <span className="tabular-nums" style={{ color: '#67e8f9', fontSize: 7, textAlign: 'center' }}>{pr.tasks}</span>
              <span className="tabular-nums" style={{ color: '#4ade80', fontSize: 7, textAlign: 'center' }}>{pr.succeeded}</span>
              <span style={{ color: pr.status === 'Succeeded' ? '#4ade80' : '#f97316', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{pr.status}</span>
            </div>
          ))}
        </div>

        {/* TaskRuns */}
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>
          // task runs
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TASKRUNS.slice(0, trRows).map((tr) => (
            <div key={tr.name} style={{ display: 'grid', gridTemplateColumns: '80px 80px 64px 36px 48px', alignItems: 'center', gap: 8, padding: '4px 8px', background: tr.status === 'Running' ? 'rgba(249,115,22,0.06)' : 'rgba(249,115,22,0.04)', border: `1px solid ${tr.status === 'Running' ? 'rgba(249,115,22,0.2)' : 'rgba(249,115,22,0.08)'}`, borderRadius: 2 }}>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.task}</span>
              <span style={{ color: '#a78bfa', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.workspace}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.pod}</span>
              <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, textAlign: 'right' }}>{tr.duration}</span>
              <span style={{ color: tr.status === 'Succeeded' ? '#4ade80' : '#f97316', fontSize: 7, fontWeight: 700, textAlign: 'right' }}>{tr.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.25)' }}>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          tekton v0.62 - apache-2.0 - kubernetes-native ci/cd
        </span>
        <span className="tabular-nums" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
          {runsTotal.toLocaleString()} runs - {(tasksSucceeded / 1000).toFixed(0)}k tasks
        </span>
      </div>
    </div>
  );
}
