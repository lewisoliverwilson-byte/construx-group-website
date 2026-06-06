'use client';

import { useState, useEffect, useRef } from 'react';

interface MetricLine {
  text:  string;
  type:  'help' | 'typedef' | 'metric' | 'comment' | 'sep';
}

const BASE_LINES: MetricLine[] = [
  { type: 'comment', text: '# Prometheus metrics — construx-api:9100' },
  { type: 'sep',     text: '' },
  { type: 'help',    text: '# HELP http_requests_total Total number of HTTP requests' },
  { type: 'typedef', text: '# TYPE http_requests_total counter' },
  { type: 'metric',  text: 'http_requests_total{method="GET",status="200"} 1847293' },
  { type: 'metric',  text: 'http_requests_total{method="POST",status="200"} 92841' },
  { type: 'metric',  text: 'http_requests_total{method="GET",status="404"} 14882' },
  { type: 'metric',  text: 'http_requests_total{method="POST",status="500"} 122' },
  { type: 'sep',     text: '' },
  { type: 'help',    text: '# HELP http_request_duration_seconds HTTP request latency' },
  { type: 'typedef', text: '# TYPE http_request_duration_seconds histogram' },
  { type: 'metric',  text: 'http_request_duration_seconds_bucket{le="0.005"} 1204421' },
  { type: 'metric',  text: 'http_request_duration_seconds_bucket{le="0.01"} 1489103' },
  { type: 'metric',  text: 'http_request_duration_seconds_bucket{le="0.025"} 1621488' },
  { type: 'metric',  text: 'http_request_duration_seconds_bucket{le="0.1"} 1802441' },
  { type: 'metric',  text: 'http_request_duration_seconds_bucket{le="+Inf"} 1847293' },
  { type: 'metric',  text: 'http_request_duration_seconds_sum 9241.882' },
  { type: 'metric',  text: 'http_request_duration_seconds_count 1847293' },
  { type: 'sep',     text: '' },
  { type: 'help',    text: '# HELP node_memory_MemAvailable_bytes Available memory' },
  { type: 'typedef', text: '# TYPE node_memory_MemAvailable_bytes gauge' },
  { type: 'metric',  text: 'node_memory_MemAvailable_bytes 3.4884e+09' },
  { type: 'sep',     text: '' },
  { type: 'help',    text: '# HELP node_cpu_seconds_total CPU time spent in each mode' },
  { type: 'typedef', text: '# TYPE node_cpu_seconds_total counter' },
  { type: 'metric',  text: 'node_cpu_seconds_total{cpu="0",mode="idle"} 1.42184e+06' },
  { type: 'metric',  text: 'node_cpu_seconds_total{cpu="0",mode="system"} 8841.22' },
  { type: 'metric',  text: 'node_cpu_seconds_total{cpu="0",mode="user"} 44120.48' },
  { type: 'sep',     text: '' },
  { type: 'help',    text: '# HELP go_goroutines Number of goroutines running' },
  { type: 'typedef', text: '# TYPE go_goroutines gauge' },
  { type: 'metric',  text: 'go_goroutines 84' },
  { type: 'sep',     text: '' },
  { type: 'help',    text: '# HELP process_open_fds Number of open file descriptors' },
  { type: 'typedef', text: '# TYPE process_open_fds gauge' },
  { type: 'metric',  text: 'process_open_fds 248' },
];

function lineColor(type: MetricLine['type']): string {
  if (type === 'help')    return 'rgba(240,239,255,0.28)';
  if (type === 'typedef') return '#fbbf24';
  if (type === 'metric')  return '#4ade80';
  if (type === 'comment') return '#67e8f9';
  return 'transparent';
}

export default function PrometheusMetricsPanel() {
  const [lines, setLines]     = useState<MetricLine[]>([]);
  const [revealed, setRevealed] = useState(0);
  const tickRef = useRef(0);
  const ref     = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setLines(BASE_LINES);
          setRevealed(1);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > BASE_LINES.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 65);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= BASE_LINES.length) return;
    const id = setInterval(() => {
      tickRef.current++;
      setLines((prev) =>
        prev.map((l) => {
          if (l.type !== 'metric') return l;
          if (l.text.includes('http_requests_total{method="GET",status="200"}')) {
            return { ...l, text: `http_requests_total{method="GET",status="200"} ${1847293 + tickRef.current * 47}` };
          }
          if (l.text.includes('go_goroutines')) {
            return { ...l, text: `go_goroutines ${84 + (tickRef.current % 5)}` };
          }
          if (l.text.includes('node_memory_MemAvailable_bytes')) {
            const base = 3.4884e+09;
            const jitter = (Math.random() - 0.5) * 1e8;
            return { ...l, text: `node_memory_MemAvailable_bytes ${(base + jitter).toExponential(4)}` };
          }
          return l;
        }),
      );
    }, 3000);
    return () => clearInterval(id);
  }, [revealed]);

  const allDone  = revealed > BASE_LINES.length;
  const displayed = allDone ? lines : BASE_LINES.slice(0, revealed);

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
          construx@sys — /metrics
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? '● scraping' : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          curl -s http://localhost:9090/metrics | head -40
        </span>
      </div>

      {/* Lines */}
      <div className="px-4 py-2 space-y-0.5">
        {displayed.map((l, i) => (
          l.type === 'sep'
            ? <div key={i} className="h-1" />
            : (
              <div key={i} className="text-[8px] leading-snug tabular-nums" style={{ color: lineColor(l.type) }}>
                {l.text}
              </div>
            )
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          prometheus 2.54 · scrape-interval 15s · :9090/metrics
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● live' : 'fetching'}
        </span>
      </div>
    </div>
  );
}
