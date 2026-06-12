import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { ventures } from '@/lib/ventures';
import { getAllPostMeta } from '@/lib/posts';

const navLinks = [
  { href: '/ventures', label: 'Projects' },
  { href: '/manifesto', label: 'Manifesto' },
  { href: '/journal', label: 'Journal' },
  { href: '/founders', label: 'Studio' },
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
    <footer className="plate relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-20 pb-10">
        {/* Top: lockup + statement + columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 mb-16">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Image
              src="/brand/construx-group-primary-dark-@4x-1080px.png"
              alt="Construx Group"
              width={216}
              height={60}
              className="mb-8 h-auto w-[200px]"
            />
            <p
              className="font-display text-[clamp(1.3rem,2.2vw,1.8rem)] leading-[1.15] mb-6"
              style={{ fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--plate-text)' }}
            >
              We build software with
              <br />
              machines that build software.
            </p>
            <p className="t-meta">An AI development studio · United Kingdom</p>
          </div>

          {/* Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10">
            {/* Site */}
            <div>
              <p className="t-meta mb-5" style={{ fontSize: 9.5 }}>Index</p>
              <ul className="flex flex-col gap-0.5">
                {navLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="block py-1.5 font-mono text-[11.5px] uppercase tracking-[0.1em] transition-colors hover:text-[#EDEAE4]"
                      style={{ color: 'var(--plate-muted)' }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Projects */}
            <div>
              <p className="t-meta mb-5" style={{ fontSize: 9.5 }}>Projects</p>
              <div className="flex flex-col gap-0.5">
                {liveVentures.map((v) => (
                  <a
                    key={v.id}
                    href={v.url ?? `/ventures/${v.slug}`}
                    target={v.url ? '_blank' : undefined}
                    rel={v.url ? 'noopener noreferrer' : undefined}
                    className="group flex items-center gap-2.5 py-1.5 font-mono text-[11.5px] uppercase tracking-[0.1em] transition-colors hover:text-[#EDEAE4]"
                    style={{ color: 'var(--plate-muted)' }}
                  >
                    <span className="dot-live" style={{ width: 5, height: 5 }} />
                    {v.name}
                    {v.url && (
                      <ArrowUpRight size={10} className="ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Journal */}
            <div className="col-span-2 md:col-span-1">
              <p className="t-meta mb-5" style={{ fontSize: 9.5 }}>
                Journal <span style={{ opacity: 0.5 }}>· {allPosts.length}</span>
              </p>
              <ul className="flex flex-col gap-1">
                {recentPosts.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/journal/${post.slug}`}
                      className="block py-1.5 font-serif-body text-[13px] leading-snug line-clamp-1 transition-colors hover:text-[#EDEAE4]"
                      style={{ color: 'var(--plate-muted)' }}
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
                <li className="mt-2">
                  <Link href="/journal" className="t-meta hover:text-[#EDEAE4] transition-colors">
                    All posts →
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 border-t"
          style={{ borderColor: 'var(--plate-hairline)' }}
        >
          <div className="flex items-center gap-6">
            <p className="t-meta">© {new Date().getFullYear()} Construx Group</p>
            <span className="flex items-center gap-2 t-meta">
              <span className="dot-live" style={{ width: 5, height: 5 }} />
              5 products operational
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="mailto:lewis.oliver.wilson@googlemail.com"
              className="t-meta hover:text-[#EDEAE4] transition-colors"
            >
              Contact
            </a>
            <a href="/feed.xml" className="t-meta hover:text-[#EDEAE4] transition-colors">
              RSS
            </a>
            <span className="t-meta" style={{ opacity: 0.6 }}>
              Built with Claude
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
