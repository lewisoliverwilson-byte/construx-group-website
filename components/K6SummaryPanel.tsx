'use client';

import { useState, useEffect, useRef } from 'react';

interface Metric {
  name:       string;
  value:      string;
  extra?:     string;
  passed:     boolean | null;
  threshold?: string;
  color?:     string;
}

interface ThresholdCheck {
  metric:  string;
  check:   string;
  result:  'passed' | 'failed';
}

const HTTP_METRICS: Metric[] = [
  { name: 'http_req_duration',       value: 'avg=143ms',  extra: 'p90=287ms  p95=412ms  p99=891ms', passed: true,  threshold: 'p95<500ms', color: '#4ade80'  },
  { name: 'http_req_failed',         value: '0.18%',      extra: '(41 of 22,800)',                  passed: true,  threshold: 'rate<1%',    color: '#4ade80'  },
  { name: 'http_reqs',               value: '22,800',     extra: '380 req/s',                       passed: null,  color: '#60a5fa'  },
  { name: 'http_req_blocked',        value: 'avg=1.2ms',  extra: 'p99=4.8ms',                       passed: null,  color: 'rgba(240,239,255,0.35)' },
  { name: 'http_req_connecting',     value: 'avg=0.9ms',  extra: 'p99=3.1ms',                       passed: null,  color: 'rgba(240,239,255,0.35)' },
  { name: 'http_req_tls_handshaking',value: 'avg=18ms',   extra: 'p99=41ms',                        passed: null,  color: 'rgba(240,239,255,0.35)' },
  { name: 'http_req_sending',        value: 'avg=0.3ms',  extra: 'p99=1.2ms',                       passed: null,  color: 'rgba(240,239,255,0.35)' },
  { name: 'http_req_receiving',      value: 'avg=2.1ms',  extra: 'p99=8.4ms',                       passed: null,  color: 'rgba(240,239,255,0.35)' },
  { name: 'http_req_waiting',        value: 'avg=140ms',  extra: 'p99=880ms',                       passed: null,  color: 'rgba(240,239,255,0.35)' },
];

const VU_METRICS: Metric[] = [
  { name: 'vus',         value: '500',    extra: 'min=1    max=500',    passed: null, color: '#fbbf24' },
  { name: 'vus_max',     value: '500',    extra: '',                    passed: null, color: '#fbbf24' },
  { name: 'iterations',  value: '22,800', extra: '380/s',               passed: null, color: '#60a5fa' },
  { name: 'data_sent',   value: '14 MB',  extra: '237 kB/s',            passed: null, color: 'rgba(240,239,255,0.35)' },
  { name: 'data_received',value: '312 MB',extra: '5.2 MB/s',            passed: null, color: 'rgba(240,239,255,0.35)' },
];

const THRESHOLDS: ThresholdCheck[] = [
  { metric: 'http_req_duration',  check: 'p95<500ms', result: 'passed' },
  { metric: 'http_req_failed',    check: 'rate<0.01', result: 'passed' },
  { metric: 'http_req_duration',  check: 'p99<2000ms',result: 'passed' },
];

const TOTAL = HTTP_METRICS.length + VU_METRICS.length + THRESHOLDS.length;

const STAGES = [
  { label: 'ramp-up',   dur: '30s',  vus: '0→500'  },
  { label: 'sustained', dur: '180s', vus: '500'    },
  { label: 'ramp-down', dur: '30s',  vus: '500→0'  },
];

export default function K6SummaryPanel() {
  const [revealed,  setRevealed]  = useState(0);
  const [liveRps,   setLiveRps]   = useState(380);
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
    const id = setTimeout(() => setRevealed((r) => r + 1), 79);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const id = setInterval(() => {
      setLiveRps((v) => Math.max(340, Math.min(420, v + Math.round((Math.random() - 0.5) * 22))));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const allDone      = revealed > TOTAL;
  const httpOffset   = 0;
  const vuOffset     = HTTP_METRICS.length;
  const thrOffset    = HTTP_METRICS.length + VU_METRICS.length;

  const shownHttp    = HTTP_METRICS.slice(0, Math.max(0, Math.min(HTTP_METRICS.length, revealed - httpOffset)));
  const shownVu      = VU_METRICS.slice(0, Math.max(0, Math.min(VU_METRICS.length, revealed - vuOffset)));
  const shownThr     = THRESHOLDS.slice(0, Math.max(0, Math.min(THRESHOLDS.length, revealed - thrOffset)));

  const passedCount  = THRESHOLDS.filter((t) => t.result === 'passed').length;
  const failedCount  = THRESHOLDS.length - passedCount;

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
          construx@ci-runner-01 — k6 run
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveRps} req/s` : 'running…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@ci-runner-01:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          k6 run --vus 500 --duration 240s --out json=results.json scripts/load-test.js
        </span>
      </div>

      {/* Stages */}
      <div className="px-4 pt-2 pb-1">
        <div className="text-[7px] uppercase tracking-widest mb-1 select-none" style={{ color: 'rgba(240,239,255,0.16)' }}>
          — STAGES
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {STAGES.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[7.5px]">
              <span style={{ color: 'rgba(240,239,255,0.28)' }}>{s.label}</span>
              <span style={{ color: 'rgba(240,239,255,0.18)' }}>·</span>
              <span style={{ color: '#60a5fa' }}>{s.dur}</span>
              <span style={{ color: 'rgba(240,239,255,0.18)' }}>·</span>
              <span style={{ color: '#fbbf24' }}>{s.vus} VUs</span>
            </div>
          ))}
        </div>
      </div>

      {/* HTTP metrics */}
      {shownHttp.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1 select-none" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — HTTP METRICS
          </div>
          <div
            className="flex items-center text-[6.5px] uppercase tracking-widest mb-0.5 select-none"
            style={{ color: 'rgba(240,239,255,0.12)' }}
          >
            <span style={{ minWidth: '188px', flexShrink: 0 }}>Metric</span>
            <span style={{ minWidth: '88px',  flexShrink: 0 }}>Value</span>
            <span>Breakdown</span>
          </div>
          <div className="space-y-0.5">
            {shownHttp.map((m, i) => (
              <div
                key={i}
                className="flex items-center text-[7.5px] leading-[1.7]"
                style={{
                  borderLeft: `2px solid ${m.passed === true ? 'rgba(74,222,128,0.3)' : m.passed === false ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  paddingLeft: '4px',
                }}
              >
                <span style={{ color: 'rgba(240,239,255,0.45)', minWidth: '188px', flexShrink: 0 }}>{m.name}</span>
                <span style={{ color: m.color ?? 'rgba(240,239,255,0.4)', minWidth: '88px', flexShrink: 0 }}>{m.value}</span>
                <span style={{ color: 'rgba(240,239,255,0.2)', fontSize: '7px' }}>{m.extra}</span>
                {m.threshold && (
                  <span style={{ color: m.passed ? '#4ade80' : '#f87171', fontSize: '7px', marginLeft: '8px' }}>
                    ✓ {m.threshold}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VU / data metrics */}
      {shownVu.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1 select-none" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — VUs + DATA
          </div>
          <div className="space-y-0.5">
            {shownVu.map((m, i) => (
              <div
                key={i}
                className="flex items-center text-[7.5px] leading-[1.7]"
                style={{ borderLeft: '2px solid rgba(251,191,36,0.15)', paddingLeft: '4px' }}
              >
                <span style={{ color: 'rgba(240,239,255,0.45)', minWidth: '188px', flexShrink: 0 }}>{m.name}</span>
                <span style={{ color: m.color ?? '#fbbf24', minWidth: '88px', flexShrink: 0 }}>{m.value}</span>
                <span style={{ color: 'rgba(240,239,255,0.2)', fontSize: '7px' }}>{m.extra}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Thresholds */}
      {shownThr.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="text-[7px] uppercase tracking-widest mb-1 select-none" style={{ color: 'rgba(240,239,255,0.16)' }}>
            — THRESHOLDS
          </div>
          <div className="space-y-0.5">
            {shownThr.map((t, i) => (
              <div key={i} className="flex items-center gap-3 text-[7.5px] leading-[1.7]">
                <span style={{ color: t.result === 'passed' ? '#4ade80' : '#f87171' }}>
                  {t.result === 'passed' ? '✓' : '✗'}
                </span>
                <span style={{ color: 'rgba(240,239,255,0.45)' }}>{t.metric}</span>
                <span style={{ color: 'rgba(240,239,255,0.22)' }}>{t.check}</span>
                <span style={{ color: t.result === 'passed' ? '#4ade80' : '#f87171', fontSize: '7px', textTransform: 'uppercase' }}>
                  {t.result}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {allDone && (
        <div
          className="flex items-center gap-3 flex-wrap px-4 py-1 text-[8px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,239,255,0.2)' }}
        >
          <span style={{ color: '#4ade80' }}>{passedCount}/{THRESHOLDS.length} thresholds passed</span>
          {failedCount > 0 && <span style={{ color: '#f87171' }}>{failedCount} failed</span>}
          <span style={{ color: '#60a5fa' }}>500 VUs · 240s</span>
          <span>22,800 requests</span>
          <span className="ml-auto" style={{ color: '#fbbf24' }}>● {liveRps} req/s LIVE</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          k6 0.54.0 · target: api.construxgroup.io · scenario: ramp
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#4ade80' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● test complete' : 'loading'}
        </span>
      </div>
    </div>
  );
}
