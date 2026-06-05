import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getAllPostMeta } from '@/lib/posts';

export const metadata: Metadata = {
  title: '404 — Signal Lost',
  description: 'The page you requested could not be located.',
};

export default function NotFound() {
  const recentPosts = getAllPostMeta().slice(0, 3);
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-5 grid-bg overflow-hidden">
      <div className="absolute inset-0 bg-radial-orange pointer-events-none" />

      <div className="relative text-center max-w-lg">
        <p className="font-mono text-[10px] font-medium tracking-[0.3em] uppercase text-construx mb-6 animate-fade-in">
          // ERR.404 — SIGNAL.LOST
        </p>
        <h1
          className="text-display text-text-base mb-4 leading-none animate-fade-up"
          style={{ animationDelay: '80ms' }}
        >
          <span className="text-gradient-orange">404</span>
        </h1>
        <p
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-dim mb-8 animate-fade-up"
          style={{ animationDelay: '160ms' }}
        >
          Page not found
        </p>
        <p
          className="text-text-muted text-sm leading-relaxed mb-10 animate-fade-up"
          style={{ animationDelay: '200ms' }}
        >
          The coordinates you entered don't resolve to anything in our system.
          Try navigating back to base.
        </p>
        <div
          className="flex flex-wrap justify-center gap-3 animate-fade-up"
          style={{ animationDelay: '260ms' }}
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
      </div>

      {/* Recent dispatches */}
      {recentPosts.length > 0 && (
        <div className="relative mt-12 w-full max-w-lg">
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-text-dim mb-3 text-center">
            // RECENT DISPATCHES
          </p>
          <div className="flex flex-col gap-1">
            {recentPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/journal/${post.slug}`}
                className="group flex items-center gap-3 px-4 py-3 transition-all hover:bg-subtle border border-transparent hover:border-construx/20"
                style={{ borderRadius: '3px', background: 'rgba(5,5,18,0.5)' }}
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

      {/* Bottom HUD readout */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-30">
        <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-text-dim">
          COORD: NULL
        </p>
        <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-text-dim">
          STATUS: 404
        </p>
        <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-text-dim">
          SIGNAL: LOST
        </p>
      </div>
    </div>
  );
}
