'use client';

import { useState, useEffect, useRef } from 'react';

interface ProcEntry {
  user:    string;
  pid:     number;
  cpu:     number;
  mem:     number;
  vsz:     number;
  rss:     number;
  stat:    string;
  started: string;
  time:    string;
  command: string;
}

const BASE: ProcEntry[] = [
  { user: 'construx', pid: 14832, cpu: 18.4, mem: 3.1, vsz: 1842576, rss: 128440, stat: 'Ssl', started: '08:12', time: '0:14.82', command: 'node /app/server.js' },
  { user: 'construx', pid: 14901, cpu: 11.2, mem: 2.7, vsz: 1648320, rss: 111280, stat: 'Ssl', started: '08:12', time: '0:09.41', command: 'node /app/worker.js --queue=default' },
  { user: 'postgres', pid:  4421, cpu:  6.8, mem: 1.4, vsz:  392416, rss:  57344, stat: 'Ss',  started: '07:40', time: '0:05.17', command: 'postgres: construx construx_prod [local]' },
  { user: 'redis',    pid:  3891, cpu:  3.2, mem: 0.8, vsz:   93040, rss:  32768, stat: 'Ssl', started: '07:39', time: '0:02.98', command: 'redis-server 127.0.0.1:6379' },
  { user: 'root',     pid:  1204, cpu:  2.1, mem: 0.2, vsz:   29876, rss:   8192, stat: 'Ss',  started: '07:38', time: '0:01.44', command: 'nginx: master process /usr/sbin/nginx' },
  { user: 'www-data', pid:  1206, cpu:  1.9, mem: 0.1, vsz:   30112, rss:   6144, stat: 'S',   started: '07:38', time: '0:01.32', command: 'nginx: worker process' },
  { user: 'construx', pid: 15040, cpu:  1.4, mem: 0.6, vsz:  614400, rss:  24576, stat: 'Sl',  started: '08:14', time: '0:00.91', command: 'node /app/scripts/metrics-exporter.js' },
  { user: 'prometh',  pid:  5512, cpu:  0.9, mem: 1.2, vsz:  823296, rss:  49152, stat: 'Ssl', started: '07:41', time: '0:00.74', command: '/usr/bin/prometheus --config.file=/etc/prometheus/prometheus.yml' },
  { user: 'root',     pid:   812, cpu:  0.4, mem: 0.0, vsz:   13568, rss:   2048, stat: 'Ss',  started: '07:38', time: '0:00.22', command: '/usr/sbin/sshd -D' },
  { user: 'root',     pid:  6701, cpu:  0.3, mem: 0.1, vsz:   22320, rss:   4096, stat: 'Ss',  started: '07:42', time: '0:00.18', command: 'cloudflared tunnel run construx-tunnel' },
  { user: 'root',     pid:     1, cpu:  0.0, mem: 0.0, vsz:  169984, rss:  13312, stat: 'Ss',  started: '07:37', time: '0:00.08', command: '/sbin/init' },
  { user: 'root',     pid:   234, cpu:  0.0, mem: 0.0, vsz:       0, rss:      0, stat: 'S',   started: '07:37', time: '0:00.04', command: '[kworker/u4:2-events_unbound]' },
];

function userColor(user: string): string {
  if (user === 'construx') return '#4ade80';
  if (user === 'root')     return '#f87171';
  if (user === 'postgres') return '#60a5fa';
  if (user === 'redis')    return '#fbbf24';
  if (user === 'prometh')  return '#a78bfa';
  return 'rgba(240,239,255,0.4)';
}

function cpuBar(cpu: number): string {
  const filled = Math.round(cpu / 5);
  return '█'.repeat(Math.min(filled, 8)) + '░'.repeat(Math.max(0, 8 - filled));
}

function cpuColor(cpu: number): string {
  if (cpu >= 15) return '#f87171';
  if (cpu >=  5) return '#fbbf24';
  if (cpu >=  1) return '#4ade80';
  return 'rgba(240,239,255,0.25)';
}

function fmtKb(kb: number): string {
  if (kb === 0) return '      0';
  if (kb >= 1_000_000) return `${(kb / 1_000_000).toFixed(1)}G`.padStart(7);
  if (kb >=     1_000) return `${(kb /     1_000).toFixed(0)}M`.padStart(7);
  return `${kb}K`.padStart(7);
}

export default function PsAuxPanel() {
  const [revealed, setRevealed] = useState(0);
  const [cpuJitter, setCpuJitter] = useState<number[]>(BASE.map((p) => p.cpu));
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
    if (revealed === 0 || revealed > BASE.length) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), 85);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed <= BASE.length) return;
    const id = setInterval(() => {
      setCpuJitter(BASE.map((p) => {
        const delta = (Math.random() - 0.5) * p.cpu * 0.3;
        return Math.max(0, parseFloat((p.cpu + delta).toFixed(1)));
      }));
    }, 2200);
    return () => clearInterval(id);
  }, [revealed]);

  const allDone  = revealed > BASE.length;
  const displayed = BASE.slice(0, allDone ? BASE.length : revealed);
  const totalCpu  = cpuJitter.slice(0, displayed.length).reduce((s, v) => s + v, 0);

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
          construx@sys — ps aux --sort=-%cpu
        </span>
        <span className="text-[8px] uppercase tracking-widest tabular-nums" style={{ color: allDone ? 'rgba(74,222,128,0.5)' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${displayed.length} procs · cpu ${totalCpu.toFixed(1)}%` : 'scanning…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@sys:~$</span>
        <span className="text-[9px] ml-2" style={{ color: 'rgba(240,239,255,0.22)' }}>
          ps aux --sort=-pcpu | head -13
        </span>
      </div>

      {/* Column header */}
      {revealed > 0 && (
        <div className="px-4 pt-2 pb-0.5 text-[8px] flex gap-0 select-none" style={{ color: 'rgba(240,239,255,0.2)' }}>
          <span style={{ minWidth: '64px' }}>USER</span>
          <span style={{ minWidth: '44px' }}>PID</span>
          <span style={{ minWidth: '40px' }}>%CPU</span>
          <span style={{ minWidth: '36px' }}>%MEM</span>
          <span style={{ minWidth: '72px' }}>VSZ</span>
          <span style={{ minWidth: '72px' }}>RSS</span>
          <span style={{ minWidth: '32px' }}>STAT</span>
          <span style={{ minWidth: '40px' }}>START</span>
          <span style={{ minWidth: '60px' }}>TIME</span>
          <span>COMMAND</span>
        </div>
      )}

      {/* Process rows */}
      <div className="px-4 py-1.5 space-y-0.5">
        {displayed.map((proc, i) => (
          <div key={i} className="flex items-center gap-0 text-[8px] leading-[1.6]">
            <span style={{ color: userColor(proc.user), minWidth: '64px', flexShrink: 0, fontWeight: 600 }}>
              {proc.user}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.3)', minWidth: '44px', flexShrink: 0 }}>
              {proc.pid}
            </span>
            <span style={{ color: cpuColor(cpuJitter[i] ?? proc.cpu), minWidth: '40px', flexShrink: 0, fontWeight: 700 }}>
              {(cpuJitter[i] ?? proc.cpu).toFixed(1)}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.35)', minWidth: '36px', flexShrink: 0 }}>
              {proc.mem.toFixed(1)}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '72px', flexShrink: 0 }}>
              {fmtKb(proc.vsz)}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.28)', minWidth: '72px', flexShrink: 0 }}>
              {fmtKb(proc.rss)}
            </span>
            <span style={{ color: '#67e8f9', minWidth: '32px', flexShrink: 0 }}>
              {proc.stat}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.2)', minWidth: '40px', flexShrink: 0 }}>
              {proc.started}
            </span>
            <span style={{ color: 'rgba(240,239,255,0.22)', minWidth: '60px', flexShrink: 0 }}>
              {proc.time}
            </span>
            <span
              style={{
                color:     proc.command.startsWith('[') ? 'rgba(240,239,255,0.2)' : 'rgba(240,239,255,0.45)',
                overflow:  'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth:  '220px',
              }}
            >
              {proc.command}
            </span>
          </div>
        ))}
      </div>

      {/* CPU bar strip */}
      {allDone && (
        <div className="px-4 pb-2 text-[8px]" style={{ color: 'rgba(240,239,255,0.15)' }}>
          <span style={{ color: 'rgba(240,239,255,0.18)' }}>cpu load: </span>
          {displayed.map((_, i) => (
            <span key={i} style={{ color: cpuColor(cpuJitter[i] ?? BASE[i].cpu), letterSpacing: '-2px' }}>
              {cpuBar(cpuJitter[i] ?? BASE[i].cpu)}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          {BASE.length} processes · procps 3.3.17 · linux 6.8.4
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? 'rgba(74,222,128,0.35)' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● live' : 'loading'}
        </span>
      </div>
    </div>
  );
}
