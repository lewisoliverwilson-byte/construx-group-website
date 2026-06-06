'use client';

import { useState, useEffect, useRef } from 'react';

interface K8sEvent {
  lastSeen: string;
  type:     'Normal' | 'Warning';
  reason:   string;
  object:   string;
  message:  string;
}

const BASE_EVENTS: K8sEvent[] = [
  { lastSeen: '2s',   type: 'Normal',  reason: 'Pulled',             object: 'pod/construx-api-7d8f9b-xkp2n',   message: 'Successfully pulled image "gcr.io/construx/api:a1b2c3d" in 1.824s'            },
  { lastSeen: '3s',   type: 'Normal',  reason: 'Started',            object: 'pod/construx-api-7d8f9b-xkp2n',   message: 'Started container construx-api'                                               },
  { lastSeen: '3s',   type: 'Normal',  reason: 'Created',            object: 'pod/construx-api-7d8f9b-xkp2n',   message: 'Created container construx-api'                                               },
  { lastSeen: '12s',  type: 'Normal',  reason: 'ScalingReplicaSet',  object: 'deploy/construx-api',             message: 'Scaled up replica set construx-api-7d8f9b to 3'                              },
  { lastSeen: '14s',  type: 'Normal',  reason: 'SuccessfulCreate',   object: 'rs/construx-api-7d8f9b',          message: 'Created pod: construx-api-7d8f9b-xkp2n'                                       },
  { lastSeen: '2m',   type: 'Normal',  reason: 'Sync',               object: 'ingress/construx-ingress',        message: 'Scheduled for sync'                                                           },
  { lastSeen: '4m',   type: 'Warning', reason: 'BackOff',            object: 'pod/redis-0',                     message: 'Back-off restarting failed container redis in pod redis-0 — OOMKilled'        },
  { lastSeen: '5m',   type: 'Normal',  reason: 'Killing',            object: 'pod/construx-api-6c9f4d-mn8pl',   message: 'Stopping container construx-api (old replica set)'                            },
  { lastSeen: '8m',   type: 'Normal',  reason: 'Pulled',             object: 'pod/scoutr-worker-5b8c7-vx4qm',  message: 'Successfully pulled image "gcr.io/construx/scoutr:f4e5d6c" in 2.11s'          },
  { lastSeen: '15m',  type: 'Warning', reason: 'FailedScheduling',   object: 'pod/hyve-ctx-8k7b2-zt9lf',       message: 'nodes: 0/3 available; insufficient cpu (2). preemption: 0/3 unsuitable'       },
  { lastSeen: '18m',  type: 'Normal',  reason: 'NodeNotReady',       object: 'node/prod-node-02',              message: 'Node prod-node-02 status is now: NodeReady'                                   },
  { lastSeen: '22m',  type: 'Normal',  reason: 'HorizontalPodAutoscaler', object: 'hpa/construx-api-hpa',     message: 'New size: 3; reason: cpu resource utilization above target'                   },
];

function typeColor(type: K8sEvent['type']): string {
  return type === 'Warning' ? '#fbbf24' : '#4ade80';
}

function reasonColor(reason: string): string {
  if (['BackOff', 'FailedScheduling', 'OOMKilled'].includes(reason)) return '#f87171';
  if (['Warning', 'NodeNotReady'].includes(reason)) return '#fbbf24';
  if (['Pulled', 'Started', 'Created', 'SuccessfulCreate', 'Sync'].includes(reason)) return '#4ade80';
  if (['ScalingReplicaSet', 'HorizontalPodAutoscaler'].includes(reason)) return '#67e8f9';
  if (reason === 'Killing') return 'rgba(240,239,255,0.35)';
  return '#F97316';
}

export default function K8sEventsPanel() {
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
    if (revealed === 0 || revealed > BASE_EVENTS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 72);
    return () => clearTimeout(id);
  }, [revealed]);

  const warnings = BASE_EVENTS.filter((e) => e.type === 'Warning').length;
  const normals  = BASE_EVENTS.filter((e) => e.type === 'Normal').length;

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
          construx@sys — kubernetes events
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums flex items-center gap-2" style={{ color: 'rgba(240,239,255,0.2)' }}>
          {warnings > 0 && <span style={{ color: '#fbbf24' }}>{warnings}w</span>}
          <span style={{ color: '#4ade80' }}>{normals}n</span>
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          kubectl get events --sort-by=&apos;.lastTimestamp&apos; -n production
        </span>
      </div>

      {/* Column headers */}
      <div
        className="px-4 py-1 flex items-center select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.025)' }}
      >
        {[
          { label: 'LAST SEEN', width: '68px' },
          { label: 'TYPE',      width: '68px' },
          { label: 'REASON',    width: '168px' },
          { label: 'OBJECT',    width: '228px' },
          { label: 'MESSAGE',   width: 'auto'  },
        ].map((col) => (
          <span
            key={col.label}
            className="text-[8px] uppercase tracking-wider"
            style={{ color: 'rgba(255,255,255,0.2)', minWidth: col.width, flexShrink: 0 }}
          >
            {col.label}
          </span>
        ))}
      </div>

      {/* Event rows */}
      <div className="px-4 py-2 space-y-1">
        {BASE_EVENTS.slice(0, revealed).map((ev, i) => (
          <div key={i} className="flex items-start text-[8px] leading-relaxed">
            <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '68px', flexShrink: 0 }}>
              {ev.lastSeen}
            </span>
            <span style={{ color: typeColor(ev.type), minWidth: '68px', flexShrink: 0 }}>
              {ev.type}
            </span>
            <span style={{ color: reasonColor(ev.reason), minWidth: '168px', flexShrink: 0 }}>
              {ev.reason}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.35)', minWidth: '228px', flexShrink: 0 }}>
              {ev.object}
            </span>
            <span className="flex-1 break-all" style={{ color: ev.type === 'Warning' ? 'rgba(251,191,36,0.7)' : 'rgba(240,239,255,0.4)' }}>
              {ev.message}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          {BASE_EVENTS.length} events · namespace: production · k8s 1.31
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.15)' }}>
          3 nodes · gke
        </span>
      </div>
    </div>
  );
}
