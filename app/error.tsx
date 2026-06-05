'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[construx] runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 grid-bg overflow-hidden">
      <div className="absolute inset-0 bg-radial-orange pointer-events-none" />

      <div className="relative text-center max-w-lg">
        <p className="font-mono text-[10px] font-medium tracking-[0.3em] uppercase text-construx mb-6 animate-fade-in">
          // SYS.ERR — RUNTIME.FAULT
        </p>
        <h1 className="text-display text-text-base mb-4 leading-none animate-fade-up"
          style={{ animationDelay: '80ms' }}>
          <span className="text-gradient-orange">Error</span>
        </h1>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-dim mb-8 animate-fade-up"
          style={{ animationDelay: '160ms' }}>
          Something went wrong
        </p>
        <p className="text-text-muted text-sm leading-relaxed mb-10 animate-fade-up"
          style={{ animationDelay: '200ms' }}>
          An unexpected error occurred. You can attempt to recover or return to base.
        </p>
        <div className="flex flex-wrap justify-center gap-3 animate-fade-up"
          style={{ animationDelay: '280ms' }}>
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

      {error.digest && (
        <p className="absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[9px] text-text-dim uppercase tracking-[0.2em] opacity-30">
          REF: {error.digest}
        </p>
      )}
    </div>
  );
}
