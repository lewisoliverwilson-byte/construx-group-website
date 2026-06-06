import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ventures } from '@/lib/ventures';
import { getAllPostMeta } from '@/lib/posts';

const navLinks = [
  { href: '/ventures', label: 'Ventures' },
  { href: '/manifesto', label: 'Manifesto' },
  { href: '/founders', label: 'Founders' },
  { href: '/work-with-us', label: 'Work With Us' },
  { href: '/journal', label: 'Journal' },
  { href: '/contact', label: 'Contact' },
];

export default function Footer() {
  const allPosts = getAllPostMeta();
  const recentPosts = allPosts.slice(0, 4);
  const postCount = String(allPosts.length).padStart(3, '0');
  const now = new Date();
  const buildStamp = `BUILD.${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`;

  const tickerItems = [
    { pulse: true, text: 'SIGNAL: LIVE' },
    { text: 'CONSTRUX.GROUP' },
    { text: 'VENTURES: 003' },
    { text: `DISPATCHES: ${postCount}` },
    { text: 'AI.FRONTIER' },
    { text: 'COORD: 51.5074°N / 0.1278°W' },
    { text: buildStamp },
    { text: 'STATUS: ALL.SYSTEMS.NOMINAL' },
    { text: 'ORBIT.LOCK: ACQUIRED' },
    { text: 'CLAUDE.POWERED' },
  ];

  return (
    <footer className="relative border-t border-border mt-0">
      {/* Top gradient fade */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-construx/40 to-transparent" />

      {/* Telemetry ticker */}
      <div className="relative overflow-hidden border-b border-border" style={{ height: '28px', background: 'rgba(0,0,4,0.9)' }}>
        <div className="flex animate-marquee whitespace-nowrap absolute inset-y-0 left-0">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center gap-10 px-10" style={{ height: '28px' }}>
              {tickerItems.map(({ pulse, text }, i) => (
                <span key={i} className="flex items-center gap-1.5 font-mono text-[9px] text-text-dim uppercase tracking-[0.18em] flex-shrink-0">
                  {pulse && <span className="inline-block w-1 h-1 rounded-full bg-construx opacity-80 flex-shrink-0" />}
                  {!pulse && <span className="text-construx/30 text-[8px] flex-shrink-0">·</span>}
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-16 pointer-events-none" style={{ background: 'linear-gradient(90deg, rgba(0,0,4,0.9), transparent)' }} />
        <div className="absolute inset-y-0 right-0 w-16 pointer-events-none" style={{ background: 'linear-gradient(-90deg, rgba(0,0,4,0.9), transparent)' }} />
      </div>

      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          {/* Brand column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 bg-construx flex items-center justify-center shadow-[0_0_16px_rgba(249,115,22,0.3)]" style={{ borderRadius: '3px' }}>
                <span className="font-mono font-bold text-black text-sm">CX</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold tracking-wider text-text-base uppercase">Construx</span>
                <span className="text-[10px] font-medium tracking-widest text-text-muted uppercase">Group</span>
              </div>
            </div>
            <p className="text-text-muted text-sm leading-relaxed max-w-sm">
              A portfolio of AI-first ventures. We build the things that are only possible
              now that AI exists — and we build them properly.
            </p>
            <a
              href="https://anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[9px] text-text-dim hover:text-construx uppercase tracking-[0.18em] mt-4 inline-block transition-colors"
            >
              Powered by Claude &amp; Anthropic ↗
            </a>
          </div>

          {/* Site links */}
          <div>
            <h3 className="font-mono text-[9px] font-medium tracking-[0.2em] uppercase text-text-dim mb-4">
              // NAVIGATE
            </h3>
            <ul className="flex flex-col gap-2.5">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-text-muted hover:text-construx transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ventures */}
          <div>
            <h3 className="font-mono text-[9px] font-medium tracking-[0.2em] uppercase text-text-dim mb-4">
              // VENTURES
            </h3>
            <ul className="flex flex-col gap-2.5">
              {ventures.map((v) => (
                <li key={v.id}>
                  <a
                    href={v.url ?? `/ventures/${v.slug}`}
                    target={v.url ? '_blank' : undefined}
                    rel={v.url ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-base transition-colors group"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: v.accent }}
                    />
                    {v.name}
                    {v.url && (
                      <ArrowUpRight
                        size={11}
                        className="opacity-0 group-hover:opacity-60 transition-opacity"
                      />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Journal */}
          <div>
            <h3 className="font-mono text-[9px] font-medium tracking-[0.2em] uppercase text-text-dim mb-4">
              // JOURNAL
            </h3>
            <ul className="flex flex-col gap-2.5">
              {recentPosts.map((post, i) => {
                const dispatchNum = String(allPosts.length - i).padStart(3, '0');
                return (
                  <li key={post.slug}>
                    <Link
                      href={`/journal/${post.slug}`}
                      className="flex items-start gap-2 text-sm text-text-muted hover:text-construx transition-colors leading-snug group"
                    >
                      <span className="font-mono text-[9px] text-construx/30 group-hover:text-construx/60 tabular-nums flex-shrink-0 mt-0.5">
                        #{dispatchNum}
                      </span>
                      <span className="line-clamp-2">{post.title}</span>
                    </Link>
                  </li>
                );
              })}
              {recentPosts.length > 0 && (
                <li>
                  <Link
                    href="/journal"
                    className="font-mono text-[9px] text-text-dim hover:text-construx transition-colors uppercase tracking-widest"
                  >
                    All posts &rsaquo;
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 border-t border-border">
          <div className="flex items-center gap-4">
            <p className="font-mono text-[10px] text-text-dim">
              © {new Date().getFullYear()} Construx Group
            </p>
            <span className="flex items-center gap-1.5 font-mono text-[9px] text-text-dim uppercase tracking-widest">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-construx opacity-80" />
              SYS:ONLINE
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a href="mailto:lewis.oliver.wilson@googlemail.com" className="font-mono text-[10px] text-text-dim hover:text-construx transition-colors uppercase tracking-wider">
              Direct Line
            </a>
            <Link href="/manifesto" className="font-mono text-[10px] text-text-dim hover:text-text-muted transition-colors uppercase tracking-wider">
              Manifesto
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
