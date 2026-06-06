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
  { href: '/uses', label: 'Uses' },
  { href: '/now', label: 'Now' },
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
          <div
            className="overflow-hidden"
            style={{ background: 'rgba(3,3,14,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '3px' }}
          >
            <div
              className="flex items-center gap-2 px-3 py-2 select-none"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF5F57' }} />
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FFBD2E' }} />
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#28C840' }} />
              </div>
              <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-text-dim/30 flex-1 text-center">
                construx.nav
              </span>
            </div>
            <ul className="flex flex-col p-3 gap-0.5">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="block px-2 py-1.5 text-sm text-text-muted hover:text-construx hover:bg-construx/5 transition-colors rounded-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ventures */}
          <div
            className="overflow-hidden"
            style={{ background: 'rgba(3,3,14,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '3px' }}
          >
            <div
              className="flex items-center gap-2 px-3 py-2 select-none"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF5F57' }} />
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FFBD2E' }} />
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#28C840' }} />
              </div>
              <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-text-dim/30 flex-1 text-center">
                construx.ventures
              </span>
              <span className="font-mono text-[7px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.35)' }}>● live</span>
            </div>
            <ul className="flex flex-col p-3 gap-0.5">
              {ventures.map((v) => (
                <li key={v.id}>
                  <a
                    href={v.url ?? `/ventures/${v.slug}`}
                    target={v.url ? '_blank' : undefined}
                    rel={v.url ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-text-muted hover:text-text-base hover:bg-white/[0.03] transition-colors rounded-sm group"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: v.accent }}
                    />
                    {v.name}
                    {v.url && (
                      <ArrowUpRight
                        size={11}
                        className="ml-auto opacity-0 group-hover:opacity-50 transition-opacity"
                      />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Journal */}
          <div
            className="overflow-hidden"
            style={{ background: 'rgba(3,3,14,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '3px' }}
          >
            <div
              className="flex items-center gap-2 px-3 py-2 select-none"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF5F57' }} />
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FFBD2E' }} />
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#28C840' }} />
              </div>
              <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-text-dim/30 flex-1 text-center">
                construx.journal
              </span>
              <span className="font-mono text-[7px] tabular-nums" style={{ color: 'rgba(249,115,22,0.35)' }}>{postCount}</span>
            </div>
            <ul className="flex flex-col p-3 gap-0.5">
              {recentPosts.map((post, i) => {
                const dispatchNum = String(allPosts.length - i).padStart(3, '0');
                return (
                  <li key={post.slug}>
                    <Link
                      href={`/journal/${post.slug}`}
                      className="flex items-start gap-2 px-2 py-1.5 text-sm text-text-muted hover:text-construx hover:bg-construx/5 transition-colors leading-snug group rounded-sm"
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
                <li className="mt-1 px-2">
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
            <a
              href="/feed.xml"
              className="font-mono text-[10px] text-text-dim hover:text-construx transition-colors uppercase tracking-wider flex items-center gap-1"
              title="RSS Feed"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500/50" />
              RSS
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
