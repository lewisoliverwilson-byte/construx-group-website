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

  const liveVentures = ventures.filter(v => v.status === 'live');
  const devVentures = ventures.filter(v => v.status === 'dev');

  return (
    <footer className="relative border-t border-border mt-0">
      {/* Gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="h-9 w-9 flex items-center justify-center border border-white/10"
                style={{ borderRadius: '4px' }}
              >
                <span
                  className="text-[12px] text-white/70 select-none"
                  style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 700, letterSpacing: '0.08em' }}
                >
                  CX
                </span>
              </div>
              <div>
                <p
                  className="text-sm text-white/80 uppercase tracking-[0.14em]"
                  style={{ fontFamily: 'Clash Display, system-ui, sans-serif', fontWeight: 600 }}
                >
                  Construx
                </p>
                <p className="font-mono text-[9px] text-white/25 uppercase tracking-[0.2em]">Group</p>
              </div>
            </div>
            <p className="text-sm text-white/38 leading-relaxed max-w-xs font-light">
              A portfolio of AI-first ventures. We build the things that are only possible now that AI exists.
            </p>
            <p className="font-mono text-[9px] text-white/18 uppercase tracking-[0.16em] mt-5">
              Powered by Claude &amp; Anthropic
            </p>
          </div>

          {/* Site links */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/28 mb-4">Navigation</p>
            <ul className="flex flex-col gap-0.5">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="block py-1.5 text-sm text-white/38 hover:text-white/75 transition-colors font-light"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ventures */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/28 mb-4">Ventures</p>
            <div className="flex flex-col gap-0.5">
              {liveVentures.map((v) => (
                <a
                  key={v.id}
                  href={v.url ?? `/ventures/${v.slug}`}
                  target={v.url ? '_blank' : undefined}
                  rel={v.url ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-2.5 py-1.5 text-sm text-white/38 hover:text-white/75 transition-colors group font-light"
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: v.accent }} />
                  {v.name}
                  {v.url && (
                    <ArrowUpRight size={11} className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />
                  )}
                </a>
              ))}
              {devVentures.length > 0 && (
                <>
                  <div className="my-1 border-t border-border" />
                  {devVentures.map((v) => (
                    <div key={v.id} className="flex items-center gap-2.5 py-1.5 text-sm text-white/22 font-light">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-50" style={{ background: v.accent }} />
                      {v.name}
                      <span className="ml-auto font-mono text-[8px] text-white/18 uppercase tracking-wider">Dev</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Journal */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/28 mb-4">
              Journal {allPosts.length > 0 && <span className="text-white/18 ml-1">/ {allPosts.length}</span>}
            </p>
            <ul className="flex flex-col gap-0.5">
              {recentPosts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/journal/${post.slug}`}
                    className="block py-1.5 text-sm text-white/38 hover:text-white/75 transition-colors font-light leading-snug line-clamp-2"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
              {allPosts.length > 4 && (
                <li className="mt-1">
                  <Link
                    href="/journal"
                    className="font-mono text-[9px] text-white/22 hover:text-white/45 transition-colors uppercase tracking-wider"
                  >
                    All posts →
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 border-t border-border">
          <div className="flex items-center gap-5">
            <p className="font-mono text-[10px] text-white/20">
              © {new Date().getFullYear()} Construx Group
            </p>
            <span className="flex items-center gap-1.5 font-mono text-[9px] text-white/18 uppercase tracking-wider">
              <span
                className="inline-block rounded-full"
                style={{ width: '4px', height: '4px', background: '#4ade80', boxShadow: '0 0 4px rgba(74,222,128,0.6)' }}
              />
              All Systems Online
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="mailto:lewis.oliver.wilson@googlemail.com"
              className="font-mono text-[10px] text-white/20 hover:text-white/45 transition-colors uppercase tracking-wider"
            >
              Contact
            </a>
            <Link
              href="/manifesto"
              className="font-mono text-[10px] text-white/20 hover:text-white/45 transition-colors uppercase tracking-wider"
            >
              Manifesto
            </Link>
            <a
              href="/feed.xml"
              className="font-mono text-[10px] text-white/20 hover:text-white/45 transition-colors uppercase tracking-wider flex items-center gap-1.5"
            >
              <span className="w-1 h-1 rounded-full bg-white/25" />
              RSS
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
