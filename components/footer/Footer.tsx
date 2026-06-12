import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ventures } from '@/lib/ventures';
import { getAllPostMeta } from '@/lib/posts';

const navLinks = [
  { href: '/ventures', label: 'Ventures' },
  { href: '/manifesto', label: 'Manifesto' },
  { href: '/journal', label: 'Journal' },
  { href: '/founders', label: 'Founders' },
  { href: '/work-with-us', label: 'Work With Us' },
  { href: '/now', label: 'Now' },
  { href: '/uses', label: 'Uses' },
  { href: '/contact', label: 'Contact' },
];

export default function Footer() {
  const allPosts = getAllPostMeta();
  const recentPosts = allPosts.slice(0, 4);
  const liveVentures = ventures.filter(v => v.status === 'live');

  return (
    <footer className="relative border-t border-border overflow-hidden">
      <div className="absolute top-0 left-0 right-0 hairline" />

      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-20 pb-10">
        {/* Top: statement + columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          {/* Brand statement */}
          <div className="lg:col-span-5">
            <p className="t-eyebrow mb-6">Construx Group</p>
            <p
              className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-[1.12] text-white/85 mb-6"
              style={{ fontWeight: 600, letterSpacing: '-0.02em' }}
            >
              We build what only
              <br />
              AI makes possible.
            </p>
            <p className="t-body max-w-sm mb-8">
              Five AI-native ventures, built from first principles by a small team
              operating at the frontier.
            </p>
            <p className="t-meta">Powered by Claude &amp; Anthropic</p>
          </div>

          {/* Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10">
            {/* Site */}
            <div>
              <p className="t-eyebrow mb-5" style={{ fontSize: 9 }}>Site</p>
              <ul className="flex flex-col gap-0.5">
                {navLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="block py-1.5 text-[13.5px] text-white/38 hover:text-white/80 transition-colors font-light"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ventures */}
            <div>
              <p className="t-eyebrow mb-5" style={{ fontSize: 9 }}>Ventures</p>
              <div className="flex flex-col gap-0.5">
                {liveVentures.map((v) => (
                  <a
                    key={v.id}
                    href={v.url ?? `/ventures/${v.slug}`}
                    target={v.url ? '_blank' : undefined}
                    rel={v.url ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-2.5 py-1.5 text-[13.5px] text-white/38 hover:text-white/80 transition-colors group font-light"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: v.accent, boxShadow: `0 0 5px ${v.accent}70` }}
                    />
                    {v.name}
                    {v.url && (
                      <ArrowUpRight size={11} className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Journal */}
            <div className="col-span-2 md:col-span-1">
              <p className="t-eyebrow mb-5" style={{ fontSize: 9 }}>
                Journal{allPosts.length > 0 && <span className="text-white/15 ml-1.5">{allPosts.length}</span>}
              </p>
              <ul className="flex flex-col gap-0.5">
                {recentPosts.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/journal/${post.slug}`}
                      className="block py-1.5 text-[13px] text-white/38 hover:text-white/80 transition-colors font-light leading-snug line-clamp-1"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
                <li className="mt-2">
                  <Link
                    href="/journal"
                    className="t-meta hover:text-white/50 transition-colors"
                  >
                    All posts →
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Giant wordmark */}
        <div className="relative select-none pointer-events-none mb-10" aria-hidden="true">
          <p
            className="font-display leading-[0.8] whitespace-nowrap"
            style={{
              fontWeight: 700,
              fontSize: 'clamp(4rem, 12.5vw, 12rem)',
              letterSpacing: '-0.04em',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.015) 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            CONSTRUX
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 border-t border-border">
          <div className="flex items-center gap-5">
            <p className="t-meta">© {new Date().getFullYear()} Construx Group</p>
            <span className="flex items-center gap-1.5 t-meta">
              <span
                className="inline-block rounded-full animate-glow-pulse"
                style={{ width: '4px', height: '4px', background: '#4ade80', boxShadow: '0 0 4px rgba(74,222,128,0.6)' }}
              />
              All systems online
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="mailto:lewis.oliver.wilson@googlemail.com"
              className="t-meta hover:text-white/50 transition-colors"
            >
              Contact
            </a>
            <a
              href="/feed.xml"
              className="t-meta hover:text-white/50 transition-colors"
            >
              RSS
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
