'use client';

import { useState, useEffect, useRef } from 'react';

interface Revision {
  rev:      number;
  image:    string;
  pods:     number;
  ready:    number;
  weight:   number;
  role:     'stable' | 'canary' | 'preview';
}

interface AnalysisRun {
  name:    string;
  status:  'Running' | 'Successful' | 'Failed' | 'Pending';
  metric:  string;
  value:   string;
}

type StepStatus = 'done' | 'active' | 'pending';

interface RolloutStep {
  label:  string;
  status: StepStatus;
}

const REVISIONS: Revision[] = [
  { rev: 10, image: 'construxgroup/api:v2.15.0', pods: 2, ready: 2, weight: 30, role: 'canary' },
  { rev:  9, image: 'construxgroup/api:v2.14.2', pods: 2, ready: 2, weight: 70, role: 'stable' },
];

const STEPS: RolloutStep[] = [
  { label: 'setWeight: 10%',          status: 'done' },
  { label: 'pause 5m',                status: 'done' },
  { label: 'analysis: success-rate',  status: 'done' },
  { label: 'setWeight: 30%',          status: 'active' },
  { label: 'pause 10m',               status: 'pending' },
  { label: 'setWeight: 60%',          status: 'pending' },
  { label: 'pause 10m',               status: 'pending' },
  { label: 'setWeight: 100%',         status: 'pending' },
];

const ANALYSIS: AnalysisRun[] = [
  { name: 'api-success-rate-1',  status: 'Successful', metric: 'success-rate', value: '99.2%' },
  { name: 'api-p99-latency-1',   status: 'Successful', metric: 'p99-latency',  value: '142ms' },
  { name: 'api-success-rate-2',  status: 'Running',    metric: 'success-rate', value: '98.8%' },
];

const EVENTS = [
  { ts: '08:41:02', msg: 'RolloutUpdated: construx-api updated to revision 10' },
  { ts: '08:41:03', msg: 'ScalingReplicaSet: Scaled up replica set api-v2.15.0-7f4d8c9b6 to 1' },
  { ts: '08:41:15', msg: 'SetWeight: Updated VirtualService weight 10' },
  { ts: '08:46:15', msg: 'AnalysisRunStarted: api-success-rate-1 started' },
  { ts: '08:47:15', msg: 'AnalysisRunSuccessful: api-success-rate-1 passed (99.2%)' },
  { ts: '08:47:16', msg: 'SetWeight: Updated VirtualService weight 30' },
  { ts: '08:47:17', msg: 'ScalingReplicaSet: Scaled up replica set api-v2.15.0 to 2' },
];

function stepIcon(status: StepStatus): string {
  if (status === 'done')    return '✓';
  if (status === 'active')  return '▶';
  return '○';
}

function stepColor(status: StepStatus): string {
  if (status === 'done')   return '#4ade80';
  if (status === 'active') return '#fbbf24';
  return 'rgba(240,239,255,0.2)';
}

function analysisColor(status: AnalysisRun['status']): string {
  if (status === 'Successful') return '#4ade80';
  if (status === 'Running')    return '#fbbf24';
  if (status === 'Failed')     return '#f87171';
  return 'rgba(240,239,255,0.3)';
}

function weightBar(weight: number, role: Revision['role']): string {
  const filled = Math.round(weight / 10);
  const color  = role === 'canary' ? '▰' : '▮';
  return color.repeat(filled) + '▱'.repeat(10 - filled);
}

export default function ArgoRolloutPanel() {
  const [revealed, setRevealed]   = useState(0);
  const [analysisVal, setAnalysisVal] = useState('98.8%');
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

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

  const TOTAL = REVISIONS.length + STEPS.length + ANALYSIS.length + EVENTS.length;

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 82);
    return () => clearTimeout(id);
  }, [revealed, TOTAL]);

  useEffect(() => {
    if (revealed <= TOTAL) return;
    const vals = ['98.8%', '99.1%', '98.6%', '99.4%', '98.9%'];
    let idx = 0;
    const id = setInterval(() => {
      setAnalysisVal(vals[idx % vals.length]);
      idx++;
    }, 2100);
    return () => clearInterval(id);
  }, [revealed, TOTAL]);

  const allDone = revealed > TOTAL;

  const revPhase = Math.min(revealed, REVISIONS.length);
  const stepPhase = Math.max(0, Math.min(revealed - REVISIONS.length, STEPS.length));
  const analysisPhase = Math.max(0, Math.min(revealed - REVISIONS.length - STEPS.length, ANALYSIS.length));
  const eventPhase = Math.max(0, Math.min(revealed - REVISIONS.length - STEPS.length - ANALYSIS.length, EVENTS.length));

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
          construx@sys — argo rollouts get rollout construx-api -n prod --watch
        </span>
        <span
          className="text-[8px] uppercase tracking-widest"
          style={{ color: '#fbbf24' }}
        >
          canary 30%
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>kubectl argo rollouts get rollout construx-api -n prod --watch</span>
      </div>

      <div className="px-4 py-2.5 space-y-4">

        {/* Revisions */}
        {revPhase > 0 && (
          <div>
            <div className="text-[7px] uppercase tracking-widest mb-1.5" style={{ color: 'rgba(240,239,255,0.2)' }}>Revisions</div>
            <div className="space-y-1">
              {REVISIONS.slice(0, revPhase).map((rev) => (
                <div key={rev.rev} className="flex items-center gap-3 text-[8px]">
                  <span style={{ color: 'rgba(240,239,255,0.35)', minWidth: '28px' }}>#{rev.rev}</span>
                  <span style={{ color: rev.role === 'canary' ? '#fbbf24' : '#4ade80', minWidth: '52px', fontWeight: 700 }}>
                    {rev.role}
                  </span>
                  <span style={{ color: 'rgba(240,239,255,0.4)', minWidth: '200px' }}>{rev.image}</span>
                  <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '56px' }}>
                    {rev.ready}/{rev.pods} pods
                  </span>
                  <span
                    className="tracking-widest text-[7px]"
                    style={{ color: rev.role === 'canary' ? '#fbbf24' : '#4ade80' }}
                  >
                    {weightBar(rev.weight, rev.role)}
                  </span>
                  <span style={{ color: rev.role === 'canary' ? '#fbbf24' : '#4ade80', minWidth: '32px' }}>
                    {rev.weight}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Steps */}
        {stepPhase > 0 && (
          <div>
            <div className="text-[7px] uppercase tracking-widest mb-1.5" style={{ color: 'rgba(240,239,255,0.2)' }}>Steps ({STEPS.filter(s => s.status === 'done').length}/{STEPS.length})</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
              {STEPS.slice(0, stepPhase).map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-[8px]">
                  <span style={{ color: stepColor(step.status), fontWeight: 700, width: '10px' }}>
                    {stepIcon(step.status)}
                  </span>
                  <span style={{ color: step.status === 'pending' ? 'rgba(240,239,255,0.2)' : 'rgba(240,239,255,0.55)' }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis runs */}
        {analysisPhase > 0 && (
          <div>
            <div className="text-[7px] uppercase tracking-widest mb-1.5" style={{ color: 'rgba(240,239,255,0.2)' }}>Analysis Runs</div>
            <div className="space-y-0.5">
              {ANALYSIS.slice(0, analysisPhase).map((run, i) => (
                <div key={i} className="flex items-center gap-3 text-[8px]">
                  <span style={{ color: analysisColor(run.status), fontWeight: 700, minWidth: '70px' }}>
                    {run.status}
                  </span>
                  <span style={{ color: 'rgba(240,239,255,0.4)', minWidth: '148px' }}>{run.name}</span>
                  <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '88px' }}>{run.metric}</span>
                  <span style={{ color: analysisColor(run.status) }}>
                    {run.status === 'Running' ? analysisVal : run.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events */}
        {eventPhase > 0 && (
          <div>
            <div className="text-[7px] uppercase tracking-widest mb-1.5" style={{ color: 'rgba(240,239,255,0.2)' }}>Events</div>
            <div className="space-y-0.5">
              {EVENTS.slice(0, eventPhase).map((ev, i) => (
                <div key={i} className="flex items-start gap-3 text-[8px] leading-[1.6]">
                  <span style={{ color: 'rgba(240,239,255,0.2)', flexShrink: 0 }}>{ev.ts}</span>
                  <span style={{ color: 'rgba(240,239,255,0.4)' }}>{ev.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {allDone && (
          <div className="text-[8px]" style={{ color: 'rgba(74,222,128,0.3)' }}>▌</div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          argo rollouts v1.7 · k8s 1.30 · namespace prod
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: '#fbbf24' }}>
          ● canary in progress
        </span>
      </div>
    </div>
  );
}
