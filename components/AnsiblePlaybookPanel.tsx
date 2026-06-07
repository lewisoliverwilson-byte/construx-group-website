'use client';

import { useState, useEffect, useRef } from 'react';

type TaskResult = 'ok' | 'changed' | 'failed' | 'skipping' | 'unreachable';

interface TaskLine {
  kind:   'play' | 'task' | 'host' | 'recap' | 'recaprow';
  text?:  string;
  host?:  string;
  result?: TaskResult;
  task?:  string;
  ok?:    number; changed?: number; unreachable?: number; failed?: number; rescued?: number;
}

const LINES: TaskLine[] = [
  { kind: 'play',    text: 'PLAY [Deploy Construx API]' },
  { kind: 'task',    text: 'TASK [Gathering Facts]' },
  { kind: 'host',    host: 'vps-fra01',     result: 'ok'      },
  { kind: 'host',    host: 'vps-lon01',     result: 'ok'      },
  { kind: 'host',    host: 'ci-runner-01',  result: 'skipping' },
  { kind: 'task',    text: 'TASK [construx.api : Pull latest image from ECR]' },
  { kind: 'host',    host: 'vps-fra01',    result: 'changed'  },
  { kind: 'host',    host: 'vps-lon01',    result: 'changed'  },
  { kind: 'task',    text: 'TASK [construx.api : Copy systemd unit file]' },
  { kind: 'host',    host: 'vps-fra01',    result: 'ok'       },
  { kind: 'host',    host: 'vps-lon01',    result: 'ok'       },
  { kind: 'task',    text: 'TASK [construx.api : Run database migrations]' },
  { kind: 'host',    host: 'vps-fra01',    result: 'changed'  },
  { kind: 'host',    host: 'vps-lon01',    result: 'skipping' },
  { kind: 'task',    text: 'TASK [construx.api : Restart construx-api.service]' },
  { kind: 'host',    host: 'vps-fra01',    result: 'changed'  },
  { kind: 'host',    host: 'vps-lon01',    result: 'changed'  },
  { kind: 'task',    text: 'TASK [construx.api : Wait for health endpoint]' },
  { kind: 'host',    host: 'vps-fra01',    result: 'ok'       },
  { kind: 'host',    host: 'vps-lon01',    result: 'ok'       },
  { kind: 'play',    text: 'PLAY [Configure Monitoring]' },
  { kind: 'task',    text: 'TASK [Gathering Facts]' },
  { kind: 'host',    host: 'vps-fra01',    result: 'ok'       },
  { kind: 'host',    host: 'vps-lon01',    result: 'ok'       },
  { kind: 'task',    text: 'TASK [prometheus : Deploy prometheus config]' },
  { kind: 'host',    host: 'vps-fra01',    result: 'changed'  },
  { kind: 'host',    host: 'vps-lon01',    result: 'ok'       },
  { kind: 'task',    text: 'TASK [prometheus : Reload prometheus]' },
  { kind: 'host',    host: 'vps-fra01',    result: 'changed'  },
  { kind: 'host',    host: 'vps-lon01',    result: 'skipping' },
  { kind: 'task',    text: 'TASK [grafana : Install dashboard JSON]' },
  { kind: 'host',    host: 'vps-fra01',    result: 'ok'       },
  { kind: 'host',    host: 'vps-lon01',    result: 'ok'       },
  { kind: 'recap',   text: 'PLAY RECAP' },
  { kind: 'recaprow', host: 'vps-fra01',    ok: 7, changed: 4, unreachable: 0, failed: 0, rescued: 0 },
  { kind: 'recaprow', host: 'vps-lon01',    ok: 6, changed: 2, unreachable: 0, failed: 0, rescued: 0 },
  { kind: 'recaprow', host: 'ci-runner-01', ok: 1, changed: 0, unreachable: 0, failed: 0, rescued: 0 },
];

const TOTAL = LINES.length;

function resultColor(r: TaskResult): string {
  if (r === 'ok')          return '#4ade80';
  if (r === 'changed')     return '#fbbf24';
  if (r === 'failed')      return '#f87171';
  if (r === 'unreachable') return '#f87171';
  return 'rgba(240,239,255,0.2)';
}

function resultLabel(r: TaskResult): string {
  if (r === 'ok')          return 'ok';
  if (r === 'changed')     return 'changed';
  if (r === 'failed')      return 'FAILED!';
  if (r === 'unreachable') return 'UNREACHABLE!';
  return 'skipping';
}

export default function AnsiblePlaybookPanel() {
  const [revealed, setRevealed] = useState(0);
  const [elapsed,  setElapsed]  = useState(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const startTs = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          startTs.current = Date.now();
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
    const id = setTimeout(() => setRevealed((r) => r + 1), 85);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.round((Date.now() - (startTs.current || Date.now())) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const allDone    = revealed > TOTAL;
  const shownLines = LINES.slice(0, Math.max(0, Math.min(LINES.length, revealed)));

  const totalChanged = 6;
  const totalFailed  = 0;

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
          construx@dev-macbook — ansible-playbook
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${elapsed}s` : 'running…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@dev-macbook:~/infra$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          ansible-playbook -i inventory/prod site.yml --tags deploy,monitoring
        </span>
      </div>

      {/* Lines */}
      <div className="px-4 py-1.5 space-y-0.5">
        {shownLines.map((line, i) => {
          if (line.kind === 'play') {
            return (
              <div key={i} className="pt-1.5 pb-0.5">
                <span className="text-[8px] uppercase tracking-widest" style={{ color: '#60a5fa' }}>
                  {'*'.repeat(12)} {line.text} {'*'.repeat(12)}
                </span>
              </div>
            );
          }
          if (line.kind === 'task') {
            return (
              <div key={i} className="pt-1">
                <span className="text-[8px]" style={{ color: 'rgba(240,239,255,0.4)' }}>
                  {line.text}
                </span>
                <span className="text-[8px] ml-2" style={{ color: 'rgba(240,239,255,0.15)' }}>
                  {'*'.repeat(24)}
                </span>
              </div>
            );
          }
          if (line.kind === 'host' && line.result) {
            return (
              <div key={i} className="flex items-center gap-2 text-[7.5px] leading-[1.6]" style={{ paddingLeft: '4px' }}>
                <span style={{ color: resultColor(line.result), minWidth: '56px', flexShrink: 0 }}>
                  {resultLabel(line.result)}:
                </span>
                <span style={{ color: 'rgba(240,239,255,0.45)' }}>[{line.host}]</span>
              </div>
            );
          }
          if (line.kind === 'recap') {
            return (
              <div key={i} className="pt-2 pb-0.5">
                <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(240,239,255,0.4)' }}>
                  {'*'.repeat(12)} {line.text} {'*'.repeat(12)}
                </span>
              </div>
            );
          }
          if (line.kind === 'recaprow') {
            return (
              <div key={i} className="flex items-center gap-3 text-[7.5px] leading-[1.7]">
                <span style={{ color: 'rgba(240,239,255,0.5)', minWidth: '112px', flexShrink: 0 }}>{line.host}</span>
                <span style={{ color: 'rgba(240,239,255,0.2)' }}>:</span>
                <span style={{ color: '#4ade80' }}>ok={line.ok}</span>
                <span style={{ color: '#fbbf24' }}>changed={line.changed}</span>
                <span style={{ color: line.unreachable! > 0 ? '#f87171' : 'rgba(240,239,255,0.2)' }}>unreachable={line.unreachable}</span>
                <span style={{ color: line.failed! > 0 ? '#f87171' : 'rgba(240,239,255,0.2)' }}>failed={line.failed}</span>
                <span style={{ color: 'rgba(240,239,255,0.2)' }}>rescued={line.rescued}</span>
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>3 hosts</span>
          <span style={{ color: '#fbbf24' }}>{totalChanged} changed</span>
          {totalFailed > 0 && <span style={{ color: '#f87171' }}>{totalFailed} failed</span>}
          <span>2 plays · {elapsed}s elapsed</span>
          <span className="ml-auto" style={{ color: totalFailed > 0 ? '#f87171' : '#4ade80' }}>
            {totalFailed > 0 ? '● FAILED' : '● SUCCESS'}
          </span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          ansible 2.18.1 · python 3.12 · inventory: prod
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? `● 3 hosts` : 'loading'}
        </span>
      </div>
    </div>
  );
}
