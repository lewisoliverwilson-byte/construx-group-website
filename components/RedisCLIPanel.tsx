'use client';

import { useState, useEffect, useRef } from 'react';

interface InfoRow {
  key:   string;
  value: string;
  group: string;
}

const INFO: InfoRow[] = [
  { group: 'server',      key: 'redis_version',           value: '7.4.0' },
  { group: 'server',      key: 'uptime_in_seconds',       value: '1 814 402' },
  { group: 'server',      key: 'hz',                      value: '10' },
  { group: 'clients',     key: 'connected_clients',       value: '24' },
  { group: 'clients',     key: 'blocked_clients',         value: '3' },
  { group: 'clients',     key: 'tracking_clients',        value: '0' },
  { group: 'memory',      key: 'used_memory_human',       value: '184.32M' },
  { group: 'memory',      key: 'used_memory_peak_human',  value: '241.18M' },
  { group: 'memory',      key: 'mem_fragmentation_ratio', value: '1.12' },
  { group: 'memory',      key: 'maxmemory_human',         value: '512.00M' },
  { group: 'memory',      key: 'maxmemory_policy',        value: 'allkeys-lru' },
  { group: 'stats',       key: 'total_commands_processed',value: '48 302 114' },
  { group: 'stats',       key: 'instantaneous_ops_per_sec',value: '3 847' },
  { group: 'stats',       key: 'keyspace_hits',           value: '41 882 033' },
  { group: 'stats',       key: 'keyspace_misses',         value: '6 420 081' },
  { group: 'stats',       key: 'hit_rate',                value: '86.72%' },
  { group: 'replication', key: 'role',                    value: 'master' },
  { group: 'replication', key: 'connected_slaves',        value: '2' },
  { group: 'keyspace',    key: 'db0',                     value: 'keys=84 201,expires=76 388,avg_ttl=3 491 204' },
  { group: 'keyspace',    key: 'db1',                     value: 'keys=1 204,expires=1 204,avg_ttl=86 231' },
];

interface KeyRow {
  key:  string;
  type: 'string' | 'hash' | 'list' | 'set' | 'zset' | 'stream';
  ttl:  string;
  size: string;
}

const KEYS: KeyRow[] = [
  { key: 'session:a9f3b2c1:*',                type: 'string', ttl: '86 400s', size: '2.1 KB' },
  { key: 'cache:posts:list',                   type: 'string', ttl: '300s',   size: '48 KB' },
  { key: 'cache:posts:7d9f4a2b',               type: 'string', ttl: '300s',   size: '12 KB' },
  { key: 'queue:email:pending',                type: 'list',   ttl: '∞',      size: '8 items' },
  { key: 'ratelimit:api:192.168.1.100',        type: 'string', ttl: '57s',    size: '8 B' },
  { key: 'ratelimit:api:10.0.0.42',            type: 'string', ttl: '43s',    size: '8 B' },
  { key: 'user:prefs:lewis',                   type: 'hash',   ttl: '∞',      size: '512 B' },
  { key: 'leaderboard:construx-daily:2030-11', type: 'zset',   ttl: '∞',      size: '4.2 KB' },
  { key: 'pubsub:notifications',               type: 'stream', ttl: '∞',      size: '1 204 entries' },
  { key: 'lock:cron:sitemap',                  type: 'string', ttl: '12s',    size: '8 B' },
];

interface MonitorRow {
  time:   string;
  client: string;
  cmd:    string;
  args:   string;
}

const MONITOR: MonitorRow[] = [
  { time: '09:15:00.001', client: '10.0.0.12:51204', cmd: 'GET',    args: 'session:a9f3b2c1:tok_abc123' },
  { time: '09:15:00.003', client: '10.0.0.12:51204', cmd: 'SET',    args: 'cache:posts:list EX 300' },
  { time: '09:15:00.041', client: '10.0.0.15:51310', cmd: 'ZADD',   args: 'leaderboard:construx-daily:2030-11 1420 lewis' },
  { time: '09:15:00.044', client: '10.0.0.15:51310', cmd: 'LPUSH',  args: 'queue:email:pending "{\"to\":\"...\"}"' },
  { time: '09:15:00.102', client: '10.0.0.18:52001', cmd: 'INCR',   args: 'ratelimit:api:10.0.0.42' },
  { time: '09:15:00.104', client: '10.0.0.18:52001', cmd: 'EXPIRE', args: 'ratelimit:api:10.0.0.42 60' },
];

function groupColor(g: string): string {
  if (g === 'memory')      return '#fbbf24';
  if (g === 'stats')       return '#60a5fa';
  if (g === 'replication') return '#f97316';
  if (g === 'keyspace')    return '#4ade80';
  return 'rgba(240,239,255,0.3)';
}

function typeColor(t: KeyRow['type']): string {
  if (t === 'string') return '#60a5fa';
  if (t === 'hash')   return '#f97316';
  if (t === 'list')   return '#fbbf24';
  if (t === 'set')    return '#4ade80';
  if (t === 'zset')   return '#a78bfa';
  return '#67e8f9';
}

function cmdColor(cmd: string): string {
  if (cmd === 'GET' || cmd === 'HGET' || cmd === 'LRANGE') return '#60a5fa';
  if (cmd === 'SET' || cmd === 'LPUSH' || cmd === 'ZADD')  return '#f97316';
  if (cmd === 'EXPIRE' || cmd === 'INCR')                  return '#fbbf24';
  return 'rgba(240,239,255,0.4)';
}

const TOTAL = INFO.length + KEYS.length + MONITOR.length;

export default function RedisCLIPanel() {
  const [revealed, setRevealed] = useState(0);
  const [liveOps,  setLiveOps]  = useState(3847);
  const [liveConn, setLiveConn] = useState(24);
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
    const id = setTimeout(() => setRevealed((r) => r + 1), 74);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= TOTAL) return;
    const id = setInterval(() => {
      setLiveOps(Math.floor(3400 + Math.random() * 900));
      setLiveConn(Math.floor(18 + Math.random() * 12));
    }, 1900);
    return () => clearInterval(id);
  }, [revealed]);

  const allDone = revealed > TOTAL;

  const shownInfo    = INFO.slice(0, Math.max(0, Math.min(INFO.length, revealed)));
  const shownKeys    = KEYS.slice(0, Math.max(0, Math.min(KEYS.length, revealed - INFO.length)));
  const shownMonitor = MONITOR.slice(0, Math.max(0, Math.min(MONITOR.length, revealed - INFO.length - KEYS.length)));

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
          construx@redis — redis-cli info
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? '#f87171' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveOps.toLocaleString()} ops/s` : 'connecting…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@redis:6379&gt;</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>info all</span>
      </div>

      {/* INFO section */}
      {shownInfo.length > 0 && (
        <div className="px-4 py-1.5 space-y-0.5">
          {shownInfo.map((row, i) => (
            <div key={i} className="flex items-center text-[8px] leading-[1.6] gap-2">
              <span style={{ color: groupColor(row.group), minWidth: '18px', flexShrink: 0 }}>
                #
              </span>
              <span style={{ color: 'rgba(240,239,255,0.45)', minWidth: '228px', flexShrink: 0 }}>
                {row.key}
              </span>
              <span style={{ color: 'rgba(240,239,255,0.7)', fontWeight: 600 }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Keys section */}
      {shownKeys.length > 0 && (
        <div className="px-4 py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div
            className="text-[9px] mb-0.5 select-none"
            style={{ color: 'rgba(74,222,128,0.45)' }}
          >
            construx@redis:6379&gt; <span style={{ color: 'rgba(240,239,255,0.22)' }}>scan 0 count 10 match *</span>
          </div>
          <div className="space-y-0.5">
            {shownKeys.map((k, i) => (
              <div key={i} className="flex items-center text-[8px] leading-[1.65] gap-2">
                <span style={{ color: typeColor(k.type), minWidth: '44px', flexShrink: 0, fontWeight: 600 }}>
                  {k.type}
                </span>
                <span style={{ color: 'rgba(240,239,255,0.5)', minWidth: '252px', flexShrink: 0 }}>
                  {k.key}
                </span>
                <span style={{ color: k.ttl === '∞' ? 'rgba(240,239,255,0.2)' : '#fbbf24', minWidth: '72px', flexShrink: 0 }}>
                  {k.ttl}
                </span>
                <span style={{ color: 'rgba(240,239,255,0.2)' }}>{k.size}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monitor section */}
      {shownMonitor.length > 0 && (
        <div className="px-4 py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div
            className="text-[9px] mb-0.5 select-none"
            style={{ color: 'rgba(74,222,128,0.45)' }}
          >
            construx@redis:6379&gt; <span style={{ color: 'rgba(240,239,255,0.22)' }}>monitor</span>
          </div>
          {shownMonitor.map((m, i) => (
            <div key={i} className="flex items-center text-[8px] leading-[1.65] gap-2">
              <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '88px', flexShrink: 0 }}>{m.time}</span>
              <span style={{ color: 'rgba(240,239,255,0.25)', minWidth: '108px', flexShrink: 0 }}>[{m.client}]</span>
              <span style={{ color: cmdColor(m.cmd), minWidth: '52px', flexShrink: 0, fontWeight: 700 }}>{m.cmd}</span>
              <span style={{ color: 'rgba(240,239,255,0.35)' }}>{m.args}</span>
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
          <span style={{ color: '#f87171' }}>{liveOps.toLocaleString()} ops/s</span>
          <span style={{ color: '#60a5fa' }}>{liveConn} clients</span>
          <span>184 MB used · 512 MB max</span>
          <span className="ml-auto">86.72% hit rate</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          redis 7.4.0 · construx.redis.svc:6379 · master
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● connected' : 'loading'}
        </span>
      </div>
    </div>
  );
}
