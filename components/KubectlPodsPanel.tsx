'use client';

import { useState, useEffect, useRef } from 'react';

interface Pod {
  namespace:  string;
  name:       string;
  ready:      string;
  status:     'Running' | 'Pending' | 'Completed' | 'CrashLoopBackOff';
  restarts:   number;
  age:        string;
  accent:     string;
}

const PODS: Pod[] = [
  { namespace: 'scoutr',    name: 'scoutr-api-7d9f6b-x4zrp',        ready: '1/1', status: 'Running',   restarts: 0,  age: '47d',  accent: '#F97316' },
  { namespace: 'scoutr',    name: 'scoutr-api-7d9f6b-m8wqk',        ready: '1/1', status: 'Running',   restarts: 0,  age: '47d',  accent: '#F97316' },
  { namespace: 'scoutr',    name: 'scoutr-worker-5c8d9a-n2lxs',     ready: '1/1', status: 'Running',   restarts: 1,  age: '47d',  accent: '#F97316' },
  { namespace: 'scoutr',    name: 'scoutr-embedding-cron-29042400', ready: '0/1', status: 'Completed', restarts: 0,  age: '6h',   accent: '#F97316' },
  { namespace: 'marqet',    name: 'marqet-web-6b4c7d-p9rjv',        ready: '1/1', status: 'Running',   restarts: 0,  age: '12d',  accent: '#7dd3fc' },
  { namespace: 'marqet',    name: 'marqet-web-6b4c7d-q7mwz',        ready: '1/1', status: 'Running',   restarts: 0,  age: '12d',  accent: '#7dd3fc' },
  { namespace: 'marqet',    name: 'marqet-scraper-8a2f1c-k6ths',    ready: '1/1', status: 'Running',   restarts: 0,  age: '12d',  accent: '#7dd3fc' },
  { namespace: 'marqet',    name: 'marqet-embed-worker-4d7e2b-r3nq', ready: '1/1', status: 'Running',  restarts: 2,  age: '12d',  accent: '#7dd3fc' },
  { namespace: 'hyve',      name: 'hyve-api-9f3e8c-v5wkj',          ready: '1/1', status: 'Running',   restarts: 0,  age: '31d',  accent: '#4ade80' },
  { namespace: 'hyve',      name: 'hyve-ws-2b6d4a-c8mpx',           ready: '1/1', status: 'Running',   restarts: 0,  age: '31d',  accent: '#4ade80' },
  { namespace: 'hyve',      name: 'hyve-ai-agent-7c1f9d-g4hzs',     ready: '1/1', status: 'Running',   restarts: 0,  age: '31d',  accent: '#4ade80' },
  { namespace: 'infra',     name: 'postgres-primary-0',              ready: '1/1', status: 'Running',   restarts: 0,  age: '180d', accent: '#a78bfa' },
  { namespace: 'infra',     name: 'postgres-replica-0',              ready: '1/1', status: 'Running',   restarts: 0,  age: '180d', accent: '#a78bfa' },
  { namespace: 'infra',     name: 'redis-master-0',                  ready: '1/1', status: 'Running',   restarts: 0,  age: '180d', accent: '#a78bfa' },
  { namespace: 'infra',     name: 'nginx-ingress-ctrl-6e7b8f-t2pls', ready: '1/1', status: 'Running',   restarts: 0,  age: '180d', accent: '#a78bfa' },
];

function statusColor(status: Pod['status']): string {
  switch (status) {
    case 'Running':          return '#4ade80';
    case 'Completed':        return '#7dd3fc';
    case 'Pending':          return '#fbbf24';
    case 'CrashLoopBackOff': return '#f87171';
  }
}

export default function KubectlPodsPanel() {
  const [revealed, setRevealed] = useState(0);
  const [tick,     setTick]     = useState(0);
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
    if (revealed === 0 || revealed > PODS.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 65);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const visiblePods   = PODS.slice(0, revealed);
  const runningCount  = PODS.filter((p) => p.status === 'Running').length;
  const namespaces    = [...new Set(PODS.map((p) => p.namespace))];

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
          construx@sys — kubernetes
        </span>
        <span
          className="text-[8px] uppercase tracking-widest flex items-center gap-1.5"
          style={{ color: 'rgba(74,222,128,0.55)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: '#4ade80', boxShadow: `0 0 4px rgba(74,222,128,${tick % 2 === 0 ? '0.7' : '0.3'})` }}
          />
          {runningCount}/{PODS.length} running
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          kubectl get pods --all-namespaces -o wide
        </span>
      </div>

      {/* Column headers */}
      <div
        className="px-4 py-1 flex items-center select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.025)' }}
      >
        {[
          { label: 'NAMESPACE', width: '80px'  },
          { label: 'NAME',      width: '260px' },
          { label: 'READY',     width: '48px'  },
          { label: 'STATUS',    width: '88px'  },
          { label: 'RESTARTS',  width: '72px'  },
          { label: 'AGE',       width: 'auto'  },
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

      {/* Pod rows */}
      <div className="px-4 py-2 space-y-px">
        {(() => {
          const rows: React.ReactNode[] = [];
          let lastNs = '';

          visiblePods.forEach((pod, i) => {
            if (pod.namespace !== lastNs) {
              lastNs = pod.namespace;
              if (i > 0) rows.push(<div key={`gap-${i}`} className="h-1.5" />);
            }

            rows.push(
              <div key={pod.name} className="flex items-center text-[8px] tabular-nums">
                <span style={{ color: pod.accent + '80', minWidth: '80px', flexShrink: 0 }}>
                  {pod.namespace}
                </span>
                <span style={{ color: 'rgba(240,239,255,0.55)', minWidth: '260px', flexShrink: 0 }}>
                  {pod.name}
                </span>
                <span style={{ color: pod.ready === '1/1' ? '#4ade80' : 'rgba(240,239,255,0.3)', minWidth: '48px', flexShrink: 0 }}>
                  {pod.ready}
                </span>
                <span style={{ color: statusColor(pod.status), minWidth: '88px', flexShrink: 0, fontWeight: 600 }}>
                  {pod.status}
                </span>
                <span style={{ color: pod.restarts > 0 ? '#fbbf24' : 'rgba(240,239,255,0.2)', minWidth: '72px', flexShrink: 0 }}>
                  {pod.restarts}
                </span>
                <span style={{ color: 'rgba(240,239,255,0.25)' }}>
                  {pod.age}
                </span>
              </div>,
            );
          });

          return rows;
        })()}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          {namespaces.length} namespaces · k8s v1.30 · eu-west-2
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: 'rgba(240,239,255,0.15)' }}>
          {PODS.length} pods
        </span>
      </div>
    </div>
  );
}
