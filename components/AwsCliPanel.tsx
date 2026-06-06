'use client';

import { useState, useEffect, useRef } from 'react';

interface AppRow {
  appId:      string;
  name:       string;
  status:     'SUCCEED' | 'RUNNING' | 'FAILED' | 'PENDING';
  branch:     string;
  updated:    string;
  url:        string;
}

interface BucketRow {
  name:        string;
  region:      string;
  created:     string;
  objects:     number;
  size:        string;
}

interface AlarmRow {
  name:        string;
  state:       'OK' | 'ALARM' | 'INSUFFICIENT_DATA';
  metric:      string;
  threshold:   string;
  updated:     string;
}

const APPS: AppRow[] = [
  { appId: 'd3dpr3doar5fjy', name: 'construx-group-website',  status: 'SUCCEED', branch: 'master', updated: '2h ago',  url: 'construxgroup.io' },
  { appId: 'dv4ftwlkwnu99',  name: 'construx-workspace',       status: 'SUCCEED', branch: 'master', updated: '4h ago',  url: 'workspace.construxgroup.io' },
  { appId: 'd2r34fj0wnx2ua', name: 'construx-daily',           status: 'RUNNING', branch: 'master', updated: '12m ago', url: 'daily.construxgroup.io' },
  { appId: 'dh20jci5d0961',  name: 'the-marqet',               status: 'SUCCEED', branch: 'master', updated: '1d ago',  url: 'themarqet.io' },
];

const BUCKETS: BucketRow[] = [
  { name: 'construx-assets-prod',  region: 'eu-west-2', created: '2029-08-01', objects: 4218,  size: '12.4 GB' },
  { name: 'construx-backups-prod', region: 'eu-west-2', created: '2029-08-01', objects: 91,    size: '3.1 GB' },
  { name: 'construx-logs-archive', region: 'us-east-1', created: '2030-01-01', objects: 18204, size: '28.7 GB' },
  { name: 'construx-cdn-origin',   region: 'eu-west-2', created: '2030-06-15', objects: 1082,  size: '892 MB' },
];

const ALARMS: AlarmRow[] = [
  { name: 'construx-website-5xx-rate',     state: 'OK',   metric: 'HTTPCode_ELB_5XX_Count', threshold: '> 10 / 5m',  updated: '4h ago' },
  { name: 'construx-db-cpu-high',          state: 'OK',   metric: 'CPUUtilization',          threshold: '> 80% / 5m', updated: '1h ago' },
  { name: 'construx-redis-memory',         state: 'OK',   metric: 'DatabaseMemoryUsagePercentage', threshold: '> 85%', updated: '30m ago' },
  { name: 'construx-amplify-build-fail',   state: 'ALARM',metric: 'FailedBuilds',             threshold: '> 0 / 1h',  updated: '11m ago' },
  { name: 'construx-s3-cost-spike',        state: 'OK',   metric: 'BucketSizeBytes',          threshold: '> 50 GB',   updated: '1d ago' },
];

function statusColor(s: AppRow['status']): string {
  if (s === 'SUCCEED') return '#4ade80';
  if (s === 'RUNNING') return '#fbbf24';
  if (s === 'FAILED')  return '#f87171';
  return 'rgba(240,239,255,0.3)';
}

function alarmColor(s: AlarmRow['state']): string {
  if (s === 'OK')    return '#4ade80';
  if (s === 'ALARM') return '#f87171';
  return '#fbbf24';
}

const TOTAL = APPS.length + BUCKETS.length + ALARMS.length;

export default function AwsCliPanel() {
  const [revealed, setRevealed] = useState(0);
  const [liveDuration, setLiveDuration] = useState('12m');
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

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 77);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= TOTAL) return;
    const id = setInterval(() => {
      const mins = Math.floor(12 + Math.random() * 5);
      setLiveDuration(`${mins}m`);
    }, 2200);
    return () => clearInterval(id);
  }, [revealed]);

  const allDone = revealed > TOTAL;

  const shownApps    = APPS.slice(0, Math.max(0, Math.min(APPS.length, revealed)));
  const shownBuckets = BUCKETS.slice(0, Math.max(0, Math.min(BUCKETS.length, revealed - APPS.length)));
  const shownAlarms  = ALARMS.slice(0, Math.max(0, Math.min(ALARMS.length, revealed - APPS.length - BUCKETS.length)));

  const alarming = ALARMS.filter((a) => a.state === 'ALARM').length;

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
          construx@sys — aws amplify list-apps
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? (alarming > 0 ? '#f87171' : 'rgba(74,222,128,0.5)') : 'rgba(240,239,255,0.2)' }}>
          {allDone ? (alarming > 0 ? `${alarming} alarm` : 'all green') : 'querying…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>aws amplify list-apps --region eu-west-2 --output table</span>
      </div>

      {/* Amplify Apps */}
      {shownApps.length > 0 && (
        <div className="px-4 py-1.5 space-y-0.5">
          {shownApps.map((app, i) => (
            <div key={i} className="flex items-center text-[8px] leading-[1.65] gap-2">
              <span style={{ color: statusColor(app.status), minWidth: '60px', flexShrink: 0, fontWeight: 700 }}>
                {app.status === 'RUNNING' ? `▶ ${liveDuration}` : app.status === 'SUCCEED' ? '✓ OK' : '✗ FAIL'}
              </span>
              <span style={{ color: '#f97316', minWidth: '88px', flexShrink: 0 }}>{app.appId}</span>
              <span style={{ color: 'rgba(240,239,255,0.55)', minWidth: '192px', flexShrink: 0 }}>{app.name}</span>
              <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '52px', flexShrink: 0 }}>{app.updated}</span>
              <span style={{ color: 'rgba(96,165,250,0.55)' }}>{app.url}</span>
            </div>
          ))}
        </div>
      )}

      {/* S3 Buckets */}
      {shownBuckets.length > 0 && (
        <div className="px-4 py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div
            className="text-[9px] mb-0.5 select-none"
            style={{ color: 'rgba(74,222,128,0.45)' }}
          >
            construx@sys:~$ <span style={{ color: 'rgba(240,239,255,0.22)' }}>aws s3 ls --human-readable</span>
          </div>
          {shownBuckets.map((b, i) => (
            <div key={i} className="flex items-center text-[8px] leading-[1.65] gap-2">
              <span style={{ color: '#fbbf24', minWidth: '180px', flexShrink: 0 }}>{b.name}</span>
              <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '76px', flexShrink: 0 }}>{b.region}</span>
              <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '64px', flexShrink: 0 }}>{b.objects} objs</span>
              <span style={{ color: 'rgba(240,239,255,0.35)', fontWeight: 600 }}>{b.size}</span>
            </div>
          ))}
        </div>
      )}

      {/* CloudWatch Alarms */}
      {shownAlarms.length > 0 && (
        <div className="px-4 py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div
            className="text-[9px] mb-0.5 select-none"
            style={{ color: 'rgba(74,222,128,0.45)' }}
          >
            construx@sys:~$ <span style={{ color: 'rgba(240,239,255,0.22)' }}>aws cloudwatch describe-alarms --state-value ALARM,OK</span>
          </div>
          {shownAlarms.map((a, i) => (
            <div key={i} className="flex items-center text-[8px] leading-[1.65] gap-2">
              <span style={{ color: alarmColor(a.state), minWidth: '72px', flexShrink: 0, fontWeight: 700 }}>
                {a.state === 'ALARM' ? '✗ ALARM' : '✓ OK'}
              </span>
              <span style={{ color: a.state === 'ALARM' ? 'rgba(248,113,113,0.7)' : 'rgba(240,239,255,0.4)', minWidth: '224px', flexShrink: 0 }}>
                {a.name}
              </span>
              <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '72px', flexShrink: 0 }}>{a.threshold}</span>
              <span style={{ color: 'rgba(240,239,255,0.15)' }}>{a.updated}</span>
            </div>
          ))}
        </div>
      )}

      {/* Cursor */}
      {allDone && (
        <div className="px-4 text-[8px]" style={{ color: 'rgba(74,222,128,0.3)' }}>▌</div>
      )}

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-4 px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#f97316' }}>{APPS.length} Amplify apps</span>
          <span style={{ color: '#fbbf24' }}>{BUCKETS.length} S3 buckets</span>
          <span style={{ color: alarming > 0 ? '#f87171' : 'rgba(74,222,128,0.5)' }}>
            {alarming > 0 ? `${alarming} alarm firing` : `${ALARMS.length} alarms OK`}
          </span>
          <span className="ml-auto">eu-west-2 · us-east-1</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          aws-cli 2.22.4 · profile: construx-prod · iam: deploy-user
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? (alarming > 0 ? 'rgba(248,113,113,0.4)' : 'rgba(74,222,128,0.35)') : 'rgba(240,239,255,0.15)' }}>
          {allDone ? (alarming > 0 ? '● 1 alarm' : '● all green') : 'loading'}
        </span>
      </div>
    </div>
  );
}
