import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getAllPostMeta } from '@/lib/posts';

export const metadata: Metadata = {
  title: '404 — Signal Lost',
  description: 'The page you requested could not be located.',
};

const pingLines = [
  { prefix: '$', text: 'ping construx.group --path $REQUEST_PATH', dim: false },
  { prefix: '>', text: 'PING construx.group (104.21.0.1): 56 data bytes', dim: true },
  { prefix: '!', text: 'Request timeout for icmp_seq 0 — host unreachable', dim: false, warn: true },
  { prefix: '!', text: 'Request timeout for icmp_seq 1 — host unreachable', dim: false, warn: true },
  { prefix: '!', text: 'Request timeout for icmp_seq 2 — host unreachable', dim: false, warn: true },
  { prefix: ' ', text: '', dim: true },
  { prefix: ' ', text: '--- construx.group ping statistics ---', dim: true },
  { prefix: ' ', text: '3 packets transmitted, 0 packets received, 100.0% packet loss', dim: true },
  { prefix: ' ', text: '', dim: true },
  { prefix: '~', text: 'ERR_404: Route does not exist in this namespace.', dim: false },
  { prefix: ' ', text: '  code:      HTTP_404_NOT_FOUND', dim: true },
  { prefix: ' ', text: '  signal:    LOST', dim: true },
  { prefix: ' ', text: '  recovery:  Navigate to a valid coordinate.', dim: true },
];

export default function NotFound() {
  const recentPosts = getAllPostMeta().slice(0, 3);
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-5 grid-bg overflow-hidden">
      <div className="absolute inset-0 bg-radial-orange pointer-events-none" />

      {/* HUD: top-left */}
      <div className="absolute top-8 left-8 hidden md:flex flex-col gap-1.5 opacity-30 pointer-events-none select-none">
        <p className="font-mono text-[9px] uppercase tracking-widest text-text-dim">COORD: NULL</p>
        <p className="font-mono text-[9px] uppercase tracking-widest text-text-dim">NAMESPACE: /404</p>
      </div>
      {/* HUD: top-right */}
      <div className="absolute top-8 right-8 hidden md:flex flex-col items-end gap-1.5 opacity-30 pointer-events-none select-none">
        <p className="font-mono text-[9px] uppercase tracking-widest text-text-dim">STATUS: 404</p>
        <p className="font-mono text-[9px] uppercase tracking-widest text-text-dim">SIGNAL: LOST</p>
      </div>

      <div className="relative w-full max-w-xl">
        {/* Large 404 label */}
        <p className="font-mono text-[10px] font-medium tracking-[0.3em] uppercase text-construx mb-5 text-center animate-fade-in">
          // ERR.404 — SIGNAL.LOST
        </p>

        {/* Terminal window */}
        <div
          className="overflow-hidden mb-8 animate-fade-up"
          style={{
            animationDelay: '80ms',
            background: 'rgba(3,3,14,0.97)',
            border: '1px solid rgba(249,115,22,0.2)',
            borderRadius: '6px',
            boxShadow: '0 0 40px rgba(249,115,22,0.06), 0 16px 48px rgba(0,0,0,0.7)',
          }}
        >
          {/* Title bar */}
          <div
            className="flex items-center gap-3 px-4 py-2.5 border-b select-none"
            style={{
              borderColor: 'rgba(249,115,22,0.12)',
              background: 'rgba(249,115,22,0.03)',
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim flex-1 text-center">
              construx/network — ping.scan
            </span>
            <span
              className="font-mono text-[8px] uppercase tracking-widest"
              style={{ color: 'rgba(255,80,70,0.5)' }}
            >
              ● TIMEOUT
            </span>
          </div>

          {/* Terminal body */}
          <div className="p-5 font-mono text-[11px] leading-relaxed flex flex-col gap-0.5">
            {pingLines.map((line, i) => (
              <div key={i} className="flex gap-3">
                <span
                  className="flex-shrink-0 w-3 text-right"
                  style={{
                    color: line.warn
                      ? 'rgba(255,189,46,0.7)'
                      : line.prefix === '$'
                      ? 'rgba(249,115,22,0.6)'
                      : line.prefix === '~'
                      ? 'rgba(255,80,70,0.7)'
                      : 'rgba(255,255,255,0.15)',
                  }}
                >
                  {line.prefix}
                </span>
                <span
                  style={{
                    color: line.warn
                      ? 'rgba(255,189,46,0.85)'
                      : line.prefix === '~'
                      ? 'rgba(255,100,90,0.9)'
                      : line.dim
                      ? 'rgba(255,255,255,0.28)'
                      : 'rgba(255,255,255,0.72)',
                  }}
                >
                  {line.text}
                </span>
              </div>
            ))}
            {/* Static cursor */}
            <div className="flex gap-3 mt-2">
              <span className="flex-shrink-0 w-3" style={{ color: 'rgba(249,115,22,0.6)' }}>$</span>
              <span className="inline-block w-2 h-3" style={{ background: 'rgba(249,115,22,0.35)' }} />
            </div>
          </div>

          {/* Status bar */}
          <div
            className="flex items-center justify-between px-4 py-1.5 border-t"
            style={{
              borderColor: 'rgba(249,115,22,0.1)',
              background: 'rgba(0,0,0,0.3)',
            }}
          >
            <span
              className="font-mono text-[8px] uppercase tracking-widest flex items-center gap-1.5"
              style={{ color: 'rgba(255,80,70,0.5)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF5F57' }} />
              SYS:NET — ROUTE.UNRESOLVED
            </span>
            <span className="font-mono text-[8px]" style={{ color: 'rgba(255,255,255,0.12)' }}>
              exit 68
            </span>
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex flex-wrap justify-center gap-3 mb-12 animate-fade-up"
          style={{ animationDelay: '220ms' }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-xs font-semibold bg-construx text-black hover:bg-orange-400 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] uppercase tracking-wider"
            style={{ borderRadius: '3px' }}
          >
            <ArrowLeft size={13} />
            Return to base
          </Link>
          <Link
            href="/ventures"
            className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-xs font-medium border border-border-bright text-text-muted hover:text-text-base hover:border-construx transition-all uppercase tracking-wider"
            style={{ borderRadius: '3px' }}
          >
            View ventures
          </Link>
        </div>

        {/* Recent dispatches */}
        {recentPosts.length > 0 && (
          <div
            className="overflow-hidden animate-fade-up"
            style={{
              animationDelay: '320ms',
              background: 'rgba(5,5,18,0.7)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '3px',
            }}
          >
            {/* Title bar */}
            <div
              className="flex items-center gap-3 px-4 py-2 select-none"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: '#FF5F57' }} />
                <span className="w-2 h-2 rounded-full" style={{ background: '#FFBD2E' }} />
                <span className="w-2 h-2 rounded-full" style={{ background: '#28C840' }} />
              </div>
              <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-text-dim/50 flex-1 text-center">
                construx.journal — recent dispatches
              </span>
            </div>
            {/* Shell prompt */}
            <div className="px-4 py-1.5 select-none" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
              <span className="font-mono text-[8px]" style={{ color: 'rgba(74,222,128,0.4)' }}>construx@sys:~$</span>
              <span className="font-mono text-[8px] ml-1" style={{ color: 'rgba(240,239,255,0.2)' }}>construx journal --recent --limit=3</span>
            </div>
            <div className="flex flex-col divide-y divide-white/[0.04]">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/journal/${post.slug}`}
                  className="group flex items-center gap-3 px-4 py-3 transition-all hover:bg-white/[0.03]"
                >
                  <span
                    className="font-mono text-[9px] font-medium px-1.5 py-0.5 text-construx uppercase tracking-widest flex-shrink-0"
                    style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.18)', borderRadius: '2px' }}
                  >
                    {post.tag}
                  </span>
                  <span className="text-xs text-text-muted group-hover:text-text-base transition-colors flex-1 min-w-0 truncate">
                    {post.title}
                  </span>
                  <ArrowRight size={11} className="flex-shrink-0 text-text-dim group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
