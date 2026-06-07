'use client';

import { useState, useEffect, useRef } from 'react';

type LineKind = 'prompt' | 'comment' | 'gpu-hot' | 'gpu-mid' | 'gpu-ok' | 'proc' | 'header' | 'stat' | 'blank';

interface CliLine {
  kind: LineKind;
  text: string;
}

const LINES: CliLine[] = [
  { kind: 'comment',  text: '# nvidia-smi: GPU utilisation, memory, temperature, and process table' },
  { kind: 'prompt',   text: 'nvidia-smi' },
  { kind: 'stat',     text: '+--------------------------------------------------------------------------------------+' },
  { kind: 'stat',     text: '| NVIDIA-SMI 560.35.03    Driver: 560.35.03    CUDA: 12.6                            |' },
  { kind: 'stat',     text: '+-------------------------------+---------------------+-------------------------------+' },
  { kind: 'header',   text: '| GPU  Name           Temp  Perf  Pwr:Usage/Cap  Memory-Usage         GPU-Util       |' },
  { kind: 'gpu-hot',  text: '|  0  NVIDIA A100 SXM  72C   P0   312W / 400W   38400MiB / 40960MiB  93%   Default  |' },
  { kind: 'gpu-mid',  text: '|  1  NVIDIA A100 SXM  68C   P0   284W / 400W   31744MiB / 40960MiB  71%   Default  |' },
  { kind: 'stat',     text: '+--------------------------------------------------------------------------------------+' },
  { kind: 'blank',    text: '' },
  { kind: 'header',   text: '| Processes:                                                                          |' },
  { kind: 'header',   text: '|  GPU   GI   CI   PID     Type   Process name                            GPU Memory |' },
  { kind: 'proc',     text: '|    0    0    0   18241    C      python3 train_construx_model.py          32748MiB  |' },
  { kind: 'proc',     text: '|    0    0    0   18998    G      /usr/bin/Xorg                             2048MiB  |' },
  { kind: 'proc',     text: '|    1    0    0   19312    C      python3 eval_construx_model.py           31744MiB  |' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# dmon: continuous monitoring (like top, 1s refresh)' },
  { kind: 'prompt',   text: 'nvidia-smi dmon -s pucvmet -d 1' },
  { kind: 'header',   text: '#gpu  pwr  temp    sm   mem   enc   dec  mclk  pclk' },
  { kind: 'header',   text: '#Idx    W     C     %     %     %     %   MHz   MHz' },
  { kind: 'gpu-hot',  text: '    0  312    72    93    81     0     0  1593  1410' },
  { kind: 'gpu-mid',  text: '    1  284    68    71    64     0     0  1593  1395' },
  { kind: 'blank',    text: '' },
  { kind: 'comment',  text: '# nvitop: htop-style GPU process monitor (pip install nvitop)' },
  { kind: 'prompt',   text: 'nvitop --monitor-mode' },
  { kind: 'gpu-ok',   text: '  GPU 0  A100 SXM  93%  38.4/40.0 GiB  72°C  312W/400W  ████████████████████░░ 93%' },
  { kind: 'gpu-mid',  text: '  GPU 1  A100 SXM  71%  31.7/40.0 GiB  68°C  284W/400W  ██████████████░░░░░░░░ 71%' },
];

const TOTAL = LINES.length + 3;

function lineColor(k: LineKind): string {
  switch (k) {
    case 'comment':  return 'rgba(240,239,255,0.22)';
    case 'prompt':   return 'rgba(240,239,255,0.6)';
    case 'gpu-hot':  return '#f87171';
    case 'gpu-mid':  return '#fbbf24';
    case 'gpu-ok':   return '#4ade80';
    case 'proc':     return '#67e8f9';
    case 'header':   return '#a78bfa';
    case 'stat':     return 'rgba(240,239,255,0.3)';
    default:         return 'transparent';
  }
}

export default function NvidiaSmiPanel() {
  const [revealed,    setRevealed]    = useState(0);
  const [liveGpuUtil, setLiveGpuUtil] = useState(93);
  const ref      = useRef<HTMLDivElement>(null);
  const started  = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setRevealed(1);
          timerRef.current = setInterval(() => {
            setLiveGpuUtil(Math.floor(84 + Math.random() * 12));
          }, 1850);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (revealed === 0 || revealed > TOTAL) return;
    const delay = LINES[revealed - 1]?.kind === 'blank' ? 30 : 79;
    const id = setTimeout(() => setRevealed((r) => r + 1), delay);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const allDone    = revealed > TOTAL;
  const shownLines = LINES.slice(0, Math.max(0, revealed - 1));

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
          construx@gpu-01 — nvidia-smi · GPU utilisation · A100 training
        </span>
        <span className="text-[8px] tabular-nums" style={{ color: allDone ? '#f87171' : 'rgba(240,239,255,0.2)' }}>
          {allDone ? `${liveGpuUtil}% util` : 'loading…'}
        </span>
      </div>

      {/* Shell prompt */}
      <div
        className="px-4 py-1.5 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
      >
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.45)' }}>construx@gpu-01# </span>
        <span className="text-[9px] ml-1" style={{ color: 'rgba(240,239,255,0.22)' }}>
          nvidia-smi · dmon · nvitop · GPU util · memory · power · temp
        </span>
      </div>

      {/* CLI output */}
      <div className="px-4 pt-2 pb-2">
        {shownLines.map((l, i) => (
          <div
            key={i}
            className="text-[7.5px] leading-[1.8]"
            style={{ color: lineColor(l.kind) }}
          >
            {l.kind === 'blank' ? ' ' : (
              <>
                {l.kind === 'prompt' && (
                  <span style={{ color: 'rgba(74,222,128,0.45)', marginRight: '6px' }}>$</span>
                )}
                {l.text}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Metadata */}
      {allDone && (
        <div
          className="flex items-center gap-4 flex-wrap px-4 py-1.5 text-[7.5px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span style={{ color: 'rgba(240,239,255,0.25)' }}>CUDA 12.6 ·</span>
          <span style={{ color: '#f87171' }}>{liveGpuUtil}% GPU util</span>
          <span style={{ color: '#fbbf24' }}>312W / 400W</span>
          <span style={{ color: '#67e8f9' }}>38.4 / 40.0 GiB VRAM</span>
          <span style={{ color: '#a78bfa' }}>2× A100 SXM</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-1.5 select-none"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,4,0.5)' }}
      >
        <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
          nvidia-smi · dmon · nvitop · A100 SXM · training · CUDA 12.6
        </span>
        <span className="text-[8px] uppercase tracking-widest" style={{ color: allDone ? '#f87171' : 'rgba(240,239,255,0.15)' }}>
          {allDone ? '● training' : 'loading'}
        </span>
      </div>
    </div>
  );
}
