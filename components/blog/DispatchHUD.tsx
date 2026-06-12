'use client';

import { useEffect, useState } from 'react';

interface Props {
  dispatchNum: string;
  readingTime: number;
  tag: string;
}

export default function DispatchHUD({ dispatchNum, readingTime, tag }: Props) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      setProgress(Math.round(pct));
      setVisible(scrollTop > 120);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  const minsRemaining = Math.max(0, Math.round(readingTime * (1 - progress / 100)));
  const bars = Math.round(progress / 10);
  const barStr = '█'.repeat(bars) + '░'.repeat(10 - bars);

  return (
    <div
      className="fixed top-20 right-4 z-[9990] hidden lg:flex flex-col gap-0 font-mono text-[8px] pointer-events-none select-none transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(16px)',
        background: 'rgba(1,1,10,0.88)',
        border: '1px solid rgba(249,115,22,0.14)',
        borderRadius: '3px',
        boxShadow: '0 0 24px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.03)',
        width: '150px',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}
      >
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF5F57' }} />
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FFBD2E' }} />
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#28C840' }} />
        </div>
        <span className="uppercase tracking-widest text-construx/60 flex-1 text-center">DISPATCH</span>
        <span className="tabular-nums text-construx/50">#{dispatchNum}</span>
      </div>
      {/* Shell prompt */}
      <div className="px-3 py-1 select-none" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
        <span className="font-mono text-[7px]" style={{ color: 'rgba(74,222,128,0.4)' }}>construx@sys:~$</span>
        <span className="font-mono text-[7px] ml-1" style={{ color: 'rgba(240,239,255,0.2)' }}>{`dispatch --track --num=${dispatchNum}`}</span>
      </div>

      {/* Body */}
      <div className="px-3 py-2.5 flex flex-col gap-2">
        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>READ</span>
            <span className="tabular-nums" style={{ color: 'rgba(249,115,22,0.7)' }}>{progress}%</span>
          </div>
          <span
            className="font-mono text-[8px] tracking-[0.08em] block"
            style={{ color: `rgba(249,115,22,${0.2 + (progress / 100) * 0.6})`, letterSpacing: '0' }}
          >
            {barStr}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <span className="uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>ETA</span>
          <span className="tabular-nums" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {minsRemaining > 0 ? `${minsRemaining}m` : 'done'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>TAG</span>
          <span
            className="uppercase tracking-widest truncate ml-2 text-right"
            style={{ color: 'rgba(249,115,22,0.5)', maxWidth: '80px' }}
          >
            {tag}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-3 py-1.5 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <span className="uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.18)' }}>construx/journal</span>
      </div>
    </div>
  );
}
