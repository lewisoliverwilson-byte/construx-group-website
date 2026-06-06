'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';

function useClock() {
  const [t, setT] = useState('');
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setT(
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [blink, setBlink] = useState(true);
  const clock = useClock();

  useEffect(() => {
    console.error('[construx] runtime error:', error);
  }, [error]);

  useEffect(() => {
    const id = setInterval(() => setBlink((b) => !b), 530);
    return () => clearInterval(id);
  }, []);

  const errorLines = [
    { prefix: '$', text: 'next start --env construx/production', dim: false },
    { prefix: '>', text: 'Runtime initialised — awaiting requests', dim: true },
    { prefix: '!', text: `RuntimeError: Unexpected exception caught`, dim: false, red: true },
    ...(error.message
      ? [{ prefix: ' ', text: `  message: ${error.message.slice(0, 72)}`, dim: true }]
      : []),
    ...(error.digest
      ? [{ prefix: ' ', text: `  digest:  ${error.digest}`, dim: true }]
      : []),
    { prefix: ' ', text: `  timestamp: ${new Date().toISOString()}`, dim: true },
    { prefix: ' ', text: `  env:       production`, dim: true },
    { prefix: ' ', text: '', dim: true },
    { prefix: '~', text: 'Entering recovery mode. Awaiting operator action.', dim: false },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-5 grid-bg overflow-hidden">
      <div className="absolute inset-0 bg-radial-orange pointer-events-none" />

      <div className="relative w-full max-w-xl">
        {/* Terminal panel */}
        <div
          className="overflow-hidden mb-8"
          style={{
            background: 'rgba(3,3,14,0.97)',
            border: '1px solid rgba(255,80,70,0.3)',
            borderRadius: '6px',
            boxShadow: '0 0 40px rgba(255,80,70,0.1), 0 16px 48px rgba(0,0,0,0.7)',
          }}
        >
          {/* Title bar */}
          <div
            className="flex items-center gap-3 px-4 py-2.5 border-b select-none"
            style={{
              borderColor: 'rgba(255,80,70,0.2)',
              background: 'rgba(255,80,70,0.04)',
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim flex-1 text-center">
              construx/runtime — stderr
            </span>
            <span
              className="font-mono text-[8px] tabular-nums"
              style={{ color: 'rgba(255,80,70,0.5)' }}
            >
              {clock}
            </span>
          </div>

          {/* Shell prompt */}
          <div className="px-4 py-1.5 select-none" style={{ borderBottom: '1px solid rgba(255,80,70,0.08)', background: 'rgba(255,80,70,0.02)' }}>
            <span className="font-mono text-[9px]" style={{ color: 'rgba(74,222,128,0.35)' }}>construx@sys:~$</span>
            <span className="font-mono text-[9px] ml-1.5" style={{ color: 'rgba(240,239,255,0.18)' }}>next start --env production --capture-stderr</span>
          </div>
          {/* Terminal body */}
          <div className="p-5 font-mono text-[11px] leading-relaxed flex flex-col gap-0.5">
            {errorLines.map((line, i) => (
              <div key={i} className="flex gap-3">
                <span
                  className="flex-shrink-0 w-3 text-right"
                  style={{
                    color: line.red
                      ? 'rgba(255,80,70,0.8)'
                      : line.prefix === '$'
                      ? 'rgba(249,115,22,0.6)'
                      : line.prefix === '~'
                      ? 'rgba(40,200,64,0.6)'
                      : 'rgba(255,255,255,0.15)',
                  }}
                >
                  {line.prefix}
                </span>
                <span
                  style={{
                    color: line.red
                      ? 'rgba(255,100,90,0.9)'
                      : line.dim
                      ? 'rgba(255,255,255,0.28)'
                      : 'rgba(255,255,255,0.7)',
                  }}
                >
                  {line.text}
                </span>
              </div>
            ))}
            {/* Blinking cursor */}
            <div className="flex gap-3 mt-1">
              <span className="flex-shrink-0 w-3" style={{ color: 'rgba(249,115,22,0.6)' }}>$</span>
              <span
                className="inline-block w-2 h-3"
                style={{
                  background: blink ? 'rgba(249,115,22,0.8)' : 'transparent',
                  transition: 'background 0.1s',
                }}
              />
            </div>
          </div>

          {/* Status bar */}
          <div
            className="flex items-center justify-between px-4 py-1.5 border-t"
            style={{
              borderColor: 'rgba(255,80,70,0.15)',
              background: 'rgba(0,0,0,0.3)',
            }}
          >
            <span
              className="font-mono text-[8px] uppercase tracking-widest flex items-center gap-1.5"
              style={{ color: 'rgba(255,80,70,0.6)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF5F57' }} />
              SYS:ERR — RECOVERY.MODE
            </span>
            <span className="font-mono text-[8px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
              {error.digest ? `ref:${error.digest}` : 'no digest'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-xs font-semibold bg-construx text-black hover:bg-orange-400 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] uppercase tracking-wider"
            style={{ borderRadius: '3px' }}
          >
            <RefreshCw size={13} />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-xs font-medium border border-border-bright text-text-muted hover:text-text-base hover:border-construx transition-all uppercase tracking-wider"
            style={{ borderRadius: '3px' }}
          >
            <ArrowLeft size={13} />
            Return to base
          </Link>
        </div>
      </div>
    </div>
  );
}
