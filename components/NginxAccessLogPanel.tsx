'use client';

import { useState, useEffect, useRef } from 'react';

interface LogEntry {
  ip: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
  path: string;
  status: number;
  bytes: number;
  ms: number;
  ua: string;
}

const POOL: LogEntry[] = [
  { ip: '82.34.201.117',  method: 'GET',    path: '/api/v1/products?page=1&limit=50',    status: 200, bytes: 14820, ms: 43,  ua: 'scoutr-agent/2.1' },
  { ip: '54.240.196.186', method: 'GET',    path: '/',                                   status: 200, bytes: 8240,  ms: 22,  ua: 'Googlebot/2.1' },
  { ip: '146.70.87.22',   method: 'POST',   path: '/api/v1/scan/trigger',                status: 202, bytes: 240,   ms: 18,  ua: 'axios/1.7.2' },
  { ip: '172.16.0.1',     method: 'GET',    path: '/health',                             status: 200, bytes: 42,    ms: 2,   ua: 'kube-probe/1.32' },
  { ip: '34.118.40.97',   method: 'GET',    path: '/journal',                            status: 200, bytes: 12400, ms: 31,  ua: 'Mozilla/5.0' },
  { ip: '91.108.4.200',   method: 'HEAD',   path: '/api/v1/products',                    status: 200, bytes: 0,     ms: 8,   ua: 'python-httpx/0.27' },
  { ip: '108.162.215.44', method: 'GET',    path: '/ventures/scoutr',                    status: 200, bytes: 9870,  ms: 28,  ua: 'Mozilla/5.0 Chrome/121' },
  { ip: '54.240.196.186', method: 'GET',    path: '/robots.txt',                         status: 200, bytes: 182,   ms: 4,   ua: 'Googlebot/2.1' },
  { ip: '34.250.87.18',   method: 'POST',   path: '/api/v1/marqet/embed',                status: 201, bytes: 512,   ms: 187, ua: 'axios/1.7.2' },
  { ip: '82.34.201.117',  method: 'GET',    path: '/api/v1/products?page=2&limit=50',    status: 200, bytes: 14230, ms: 41,  ua: 'scoutr-agent/2.1' },
  { ip: '203.0.113.42',   method: 'POST',   path: '/api/contact',                        status: 204, bytes: 0,     ms: 156, ua: 'Mozilla/5.0 Safari/17' },
  { ip: '172.16.0.1',     method: 'GET',    path: '/health',                             status: 200, bytes: 42,    ms: 1,   ua: 'kube-probe/1.32' },
  { ip: '46.101.26.111',  method: 'GET',    path: '/api/v1/scan/status/f3a9c1b2',        status: 200, bytes: 380,   ms: 12,  ua: 'python-requests/2.32' },
  { ip: '151.101.1.195',  method: 'GET',    path: '/_next/static/chunks/main-app.js',    status: 200, bytes: 49200, ms: 6,   ua: 'Mozilla/5.0 Chrome/121' },
  { ip: '108.162.215.44', method: 'GET',    path: '/now',                                status: 200, bytes: 7640,  ms: 24,  ua: 'Mozilla/5.0 Firefox/121' },
  { ip: '45.79.126.39',   method: 'POST',   path: '/api/v1/hyve/messages',               status: 201, bytes: 840,   ms: 67,  ua: 'axios/1.7.2' },
  { ip: '172.16.0.1',     method: 'GET',    path: '/health',                             status: 200, bytes: 42,    ms: 2,   ua: 'kube-probe/1.32' },
  { ip: '34.118.40.97',   method: 'DELETE', path: '/api/v1/scan/f3a9c1b2',               status: 204, bytes: 0,     ms: 22,  ua: 'scoutr-agent/2.1' },
  { ip: '198.41.128.77',  method: 'GET',    path: '/sitemap.xml',                        status: 200, bytes: 2840,  ms: 9,   ua: 'bingbot/2.0' },
  { ip: '82.34.201.117',  method: 'GET',    path: '/api/v1/products?page=3&limit=50',    status: 200, bytes: 13980, ms: 39,  ua: 'scoutr-agent/2.1' },
  { ip: '10.244.1.8',     method: 'POST',   path: '/api/v1/auth/refresh',                status: 200, bytes: 640,   ms: 14,  ua: 'axios/1.7.2' },
  { ip: '108.162.215.44', method: 'GET',    path: '/uses',                               status: 200, bytes: 11200, ms: 29,  ua: 'Mozilla/5.0 Chrome/121' },
];

function statusColor(code: number): string {
  if (code < 300) return '#4ade80';
  if (code < 400) return '#fbbf24';
  if (code < 500) return '#F97316';
  return '#f87171';
}

function methodColor(method: string): string {
  switch (method) {
    case 'GET':    return '#7dd3fc';
    case 'POST':   return '#4ade80';
    case 'PUT':    return '#fbbf24';
    case 'DELETE': return '#f87171';
    case 'HEAD':   return '#a78bfa';
    default:       return '#67e8f9';
  }
}

function msColor(ms: number): string {
  if (ms < 20)  return 'rgba(74,222,128,0.8)';
  if (ms < 100) return 'rgba(251,191,36,0.8)';
  return 'rgba(248,113,113,0.8)';
}

export default function NginxAccessLogPanel() {
  const [log, setLog] = useState<LogEntry[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const tickRef = useRef(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          // Seed first 8 entries immediately
          setLog(POOL.slice(0, 8));
          tickRef.current = 8;
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started.current) return;
    const id = setInterval(() => {
      tickRef.current = (tickRef.current + 1) % POOL.length;
      const entry = POOL[tickRef.current];
      setLog((prev) => [...prev.slice(-15), entry]);
    }, 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      ref={ref}
      className="overflow-hidden font-mono"
      style={{
        background: 'rgba(1,1,10,0.97)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '3px',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.6)',
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
          construx@sys — nginx access log
        </span>
        <span
          className="text-[8px] uppercase tracking-widest flex items-center gap-1.5"
          style={{ color: 'rgba(74,222,128,0.55)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#4ade80', boxShadow: '0 0 4px rgba(74,222,128,0.7)' }} />
          live
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          tail -f /var/log/nginx/access.log | awk '{"{print $1, $6, $7, $9, $10}"}'
        </span>
      </div>

      {/* Log entries */}
      <div className="px-4 py-2 space-y-0.5" style={{ minHeight: '220px' }}>
        {log.map((entry, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-[8px] leading-relaxed"
            style={{
              opacity: i === log.length - 1 ? 1 : 0.55 + (i / log.length) * 0.4,
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.15)', minWidth: '112px', fontVariantNumeric: 'tabular-nums' }}>
              {entry.ip}
            </span>
            <span
              className="text-[7px] uppercase px-1 py-px rounded-sm font-bold"
              style={{ color: methodColor(entry.method), minWidth: '40px', textAlign: 'center', background: `${methodColor(entry.method)}15` }}
            >
              {entry.method}
            </span>
            <span
              className="flex-1 truncate"
              style={{ color: 'rgba(240,239,255,0.5)' }}
            >
              {entry.path}
            </span>
            <span style={{ color: statusColor(entry.status), minWidth: '30px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {entry.status}
            </span>
            <span style={{ color: msColor(entry.ms), minWidth: '45px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {entry.ms}ms
            </span>
            <span style={{ color: 'rgba(255,255,255,0.1)', minWidth: '52px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {entry.bytes.toLocaleString()}B
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
          nginx/1.25.3 · combined log format
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: 'rgba(240,239,255,0.2)' }}>
          updating 0.6Hz
        </span>
      </div>
    </div>
  );
}
