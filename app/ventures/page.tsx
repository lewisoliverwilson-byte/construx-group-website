import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import { ventures } from '@/lib/ventures';
import StatusBadge from '@/components/ui/StatusBadge';
import CountUp from '@/components/ui/CountUp';
import VentureProcessTable from '@/components/VentureProcessTable';
import VentureCrontabPanel from '@/components/VentureCrontabPanel';

export const metadata: Metadata = {
  title: 'Ventures',
  description:
    'The full portfolio of Construx Group ventures — live products, coming-soon launches, and ventures in incubation.',
};

const venturesListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Construx Group Ventures',
  url: 'https://construxgroup.io/ventures',
  itemListElement: ventures.map((v, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: v.name,
    description: v.tagline,
    url: `https://construxgroup.io/ventures/${v.slug}`,
  })),
};

export default function VenturesPage() {
  const live = ventures.filter((v) => v.status === 'live');
  const other = ventures.filter((v) => v.status !== 'live');

  return (
    <div className="relative min-h-screen grid-bg overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(venturesListSchema) }}
      />
      <div className="absolute inset-0 bg-radial-orange pointer-events-none" />

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-5 text-center">
        <p className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-construx mb-4 animate-fade-in">
          // THE PORTFOLIO
        </p>
        <h1 className="text-display text-text-base mb-5 animate-fade-up"
          style={{ animationDelay: '90ms' }}>
          Our <span className="text-gradient-orange">Ventures</span>
        </h1>
        <p className="text-text-muted max-w-lg mx-auto leading-relaxed text-base animate-fade-up"
          style={{ animationDelay: '220ms' }}>
          Each venture is an independent product, built AI-first, owned by Construx Group.
          Navigate the solar system from the homepage, or read the full manifest below.
        </p>
      </section>

      {/* Stats bar */}
      <section className="relative border-y border-border px-5" style={{ background: 'rgba(3,3,14,0.7)' }}>
        <div className="mx-auto max-w-6xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '3px', margin: '0 auto' }}>
          {/* Terminal title bar */}
          <div
            className="flex items-center gap-3 px-4 py-2 select-none"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,8,0.5)' }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: '#FF5F57' }} />
              <span className="w-2 h-2 rounded-full" style={{ background: '#FFBD2E' }} />
              <span className="w-2 h-2 rounded-full" style={{ background: '#28C840' }} />
            </div>
            <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-text-dim/40 flex-1">
              construx.portfolio — metrics.overview
            </span>
            <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: 'rgba(74,222,128,0.45)' }}>
              ● LIVE
            </span>
          </div>
          {/* Shell prompt */}
          <div className="px-4 py-1.5 select-none" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
            <span className="font-mono text-[8px]" style={{ color: 'rgba(74,222,128,0.4)' }}>construx@sys:~$</span>
            <span className="font-mono text-[8px] ml-1" style={{ color: 'rgba(240,239,255,0.2)' }}>construx portfolio --metrics --format=table</span>
          </div>
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { node: <CountUp to={live.length} pad={3} />, label: 'Live ventures', key: 'ventures' },
              { node: <CountUp to={167} suffix="+" />, label: 'Marketplace listings', key: 'listings' },
              { node: <span>{'<5s'}</span>, label: 'Avg. scan time', key: 'scan' },
              { node: <CountUp to={4} />, label: 'Tools replaced', key: 'tools' },
            ].map(({ node, label, key }, i) => (
              <div
                key={key}
                className="text-center py-7 px-4"
                style={{
                  borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
              >
                <p className="font-mono text-heading-xl font-bold text-gradient-orange mb-1">{node}</p>
                <p className="font-mono text-[10px] text-text-dim uppercase tracking-[0.2em]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process table */}
      <section className="relative px-5 pt-10 pb-4 mx-auto max-w-6xl">
        <VentureProcessTable />
      </section>

      {/* Crontab scheduler */}
      <section className="relative px-5 pb-6 mx-auto max-w-6xl">
        <VentureCrontabPanel />
      </section>

      {/* Live ventures */}
      <section className="relative px-5 pt-6 pb-8 mx-auto max-w-6xl">
        <h2 className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-text-dim mb-6">
          // LIVE
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {live.map((v) => (
            <article
              key={v.id}
              className="group relative overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.015]"
              style={{
                background: 'rgba(5,5,18,0.88)',
                border: `1px solid ${v.accent}20`,
                boxShadow: `0 0 40px ${v.accent}08`,
                borderRadius: '3px',
              }}
            >
              {/* Terminal title bar */}
              <div
                className="flex items-center gap-2 px-3 py-2 flex-shrink-0 select-none"
                style={{ background: `${v.accent}0a`, borderBottom: `1px solid ${v.accent}18` }}
              >
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#FF5F57' }} />
                  <span className="w-2 h-2 rounded-full" style={{ background: '#FFBD2E' }} />
                  <span className="w-2 h-2 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <span className="font-mono text-[8px] uppercase tracking-[0.2em] flex-1 text-center" style={{ color: `${v.accent}55` }}>
                  construx.{v.slug} — {v.category.toLowerCase()}
                </span>
              </div>
              {/* Shell prompt */}
              <div className="px-3 py-1.5 select-none" style={{ borderBottom: `1px solid ${v.accent}08`, background: 'rgba(255,255,255,0.01)' }}>
                <span className="font-mono text-[8px]" style={{ color: 'rgba(74,222,128,0.4)' }}>construx@sys:~$</span>
                <span className="font-mono text-[8px] ml-1" style={{ color: 'rgba(240,239,255,0.2)' }}>{`construx ventures --open ${v.slug} --status=live`}</span>
              </div>

              <div className="flex flex-col flex-1 p-7">
                {/* Planet + name */}
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="h-14 w-14 rounded-full flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${v.accent}cc, ${v.accent}44)`,
                      boxShadow: `0 0 28px ${v.accent}44, 0 0 56px ${v.accent}18`,
                    }}
                  />
                  <div>
                    <h3 className="text-lg font-bold text-text-base leading-tight">{v.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={v.status} />
                      <span
                        className="font-mono text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5"
                        style={{ color: v.accent, background: `${v.accent}14`, border: `1px solid ${v.accent}20`, borderRadius: '2px' }}
                      >
                        {v.category}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm font-semibold mb-3" style={{ color: v.accent }}>
                  {v.tagline}
                </p>
                <p className="text-sm text-text-muted leading-relaxed flex-1 mb-5 line-clamp-4">
                  {v.pitch}
                </p>

                {/* Mini stats */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {v.stats.slice(0, 4).map((s) => (
                    <div
                      key={s.label}
                      className="px-2.5 py-2"
                      style={{
                        background: `${v.accent}08`,
                        border: `1px solid ${v.accent}18`,
                        borderRadius: '2px',
                      }}
                    >
                      <p className="font-mono text-xs font-semibold tabular-nums" style={{ color: v.accent }}>{s.value}</p>
                      <p className="font-mono text-[9px] text-text-dim uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Latency sparkline */}
                <div className="flex items-end gap-0.5 mb-3">
                  {v.latencyBars.split('').map((bar, i) => (
                    <span
                      key={i}
                      className="font-mono text-[10px] leading-none"
                      style={{ color: `${v.accent}${i % 3 === 0 ? 'bb' : '44'}` }}
                    >
                      {bar}
                    </span>
                  ))}
                  <span className="font-mono text-[8px] ml-1.5 self-center" style={{ color: `${v.accent}55` }}>p50</span>
                </div>

                {/* Tech stack chips */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {v.techStack.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="font-mono text-[8px] px-1.5 py-0.5 uppercase tracking-wider"
                      style={{
                        background: `${v.accent}0d`,
                        border: `1px solid ${v.accent}1a`,
                        color: `${v.accent}88`,
                        borderRadius: '2px',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex items-center gap-3">
                  {v.url && (
                    <a
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 font-mono text-xs font-semibold text-black transition-all hover:scale-[1.03] uppercase tracking-wider"
                      style={{
                        backgroundColor: v.accent,
                        boxShadow: `0 0 16px ${v.accent}44`,
                        borderRadius: '3px',
                      }}
                    >
                      Visit Site <ArrowUpRight size={13} />
                    </a>
                  )}
                  <Link
                    href={`/ventures/${v.slug}`}
                    className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-text-dim hover:text-text-muted transition-colors"
                  >
                    Full details <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
              {/* Status footer */}
              <div
                className="flex items-center justify-between px-3 py-1.5 select-none"
                style={{ borderTop: `1px solid ${v.accent}14`, background: 'rgba(0,0,0,0.28)' }}
              >
                <span className="font-mono text-[8px] uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'rgba(74,222,128,0.55)' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ade80', boxShadow: '0 0 3px rgba(74,222,128,0.5)' }} />
                  LIVE
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[8px] tabular-nums" style={{ color: `${v.accent}40` }}>p50 &lt;80ms</span>
                  <span className="font-mono text-[8px]" style={{ color: 'rgba(255,255,255,0.1)' }}>exit: 0</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Other / coming soon */}
      {other.length > 0 && (
        <section className="relative px-5 py-8 mx-auto max-w-6xl">
          <h2 className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-text-dim mb-6">
            // COMING SOON
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {other.map((v) => (
              <Link
                key={v.id}
                href={`/ventures/${v.slug}`}
                className="group relative overflow-hidden transition-all duration-200"
                style={{
                  background: 'rgba(5,5,18,0.5)',
                  border: `1px solid ${v.accent}18`,
                  borderRadius: '3px',
                }}
              >
                {/* Terminal title bar */}
                <div
                  className="flex items-center gap-2 px-3 py-2 select-none"
                  style={{ background: `${v.accent}06`, borderBottom: `1px solid ${v.accent}12` }}
                >
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF5F57' }} />
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FFBD2E' }} />
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#28C840' }} />
                  </div>
                  <span
                    className="font-mono text-[8px] uppercase tracking-[0.2em] flex-1 text-center truncate"
                    style={{ color: `${v.accent}45` }}
                  >
                    construx.{v.slug} — {v.status}
                  </span>
                  <span className="font-mono text-[7px] uppercase tracking-widest flex-shrink-0" style={{ color: `${v.accent}50` }}>
                    ◈ SOON
                  </span>
                </div>
                {/* Shell prompt */}
                <div className="px-3 py-1.5 select-none" style={{ borderBottom: `1px solid ${v.accent}06`, background: 'rgba(255,255,255,0.01)' }}>
                  <span className="font-mono text-[8px]" style={{ color: 'rgba(74,222,128,0.4)' }}>construx@sys:~$</span>
                  <span className="font-mono text-[8px] ml-1" style={{ color: 'rgba(240,239,255,0.2)' }}>{`construx ventures --open ${v.slug} --status=pending`}</span>
                </div>
                <div className="p-6 flex items-center gap-4">
                  <div
                    className="h-10 w-10 rounded-full flex-shrink-0 opacity-50 group-hover:opacity-80 transition-opacity"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${v.accent}aa, ${v.accent}33)`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-muted group-hover:text-text-base transition-colors">
                      {v.name}
                    </p>
                    <StatusBadge status={v.status} className="mt-1" />
                  </div>
                  <ChevronRight size={15} className="text-text-dim group-hover:text-text-muted transition-colors" />
                </div>
                {/* Status footer */}
                <div
                  className="flex items-center justify-between px-3 py-1.5 select-none"
                  style={{ borderTop: `1px solid ${v.accent}10`, background: 'rgba(0,0,0,0.22)' }}
                >
                  <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: `${v.accent}45` }}>
                    ◈ {v.status.toUpperCase()}
                  </span>
                  <span className="font-mono text-[8px]" style={{ color: 'rgba(255,255,255,0.08)' }}>pending</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Incubation teaser — classified intel terminal */}
      <section className="relative px-5 pb-28 mx-auto max-w-6xl">
        <h2 className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-text-dim mb-6">
          // IN INCUBATION
        </h2>
        <div
          className="overflow-hidden"
          style={{
            background: 'rgba(2,2,12,0.97)',
            border: '1px solid rgba(168,85,247,0.2)',
            borderRadius: '4px',
            boxShadow: '0 0 40px rgba(168,85,247,0.05)',
          }}
        >
          {/* Title bar */}
          <div
            className="flex items-center gap-3 px-4 py-2.5 select-none"
            style={{ borderBottom: '1px solid rgba(168,85,247,0.12)', background: 'rgba(168,85,247,0.04)' }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] flex-1 text-center" style={{ color: 'rgba(168,85,247,0.55)' }}>
              construx.classified — venture.registry — clearance: INTERNAL
            </span>
            <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: 'rgba(168,85,247,0.4)' }}>
              ◈ RESTRICTED
            </span>
          </div>

          {/* Terminal body */}
          <div className="font-mono p-6" style={{ fontSize: '11px', lineHeight: '1.9', color: 'rgba(240,239,255,0.5)' }}>
            {/* Shell prompt */}
            <div style={{ marginBottom: '14px' }}>
              <span style={{ color: '#4ade80', fontWeight: 600 }}>construx@internal</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$ </span>
              <span style={{ color: 'rgba(240,239,255,0.3)' }}>cat /var/construx/ventures/incubation.json | jq .</span>
            </div>

            {/* Access notice */}
            <div className="mb-5 px-4 py-3" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.14)', borderRadius: '2px' }}>
              <p style={{ color: 'rgba(168,85,247,0.8)' }}>{'// ACCESS LEVEL: CONSTRUX-INTERNAL'}</p>
              <p style={{ color: 'rgba(240,239,255,0.22)' }}>{'// VENTURE DATA REDACTED PENDING ORBITAL INSERTION'}</p>
              <p style={{ color: 'rgba(240,239,255,0.22)' }}>{'// CLEARANCE REQUIRED FOR UNREDACTED VIEW'}</p>
            </div>

            {/* Redacted venture entries */}
            {[
              { codename: 'LATTICE', category: 'Social', orbit: '∿ DEMAND.TESTING', phase: 'D+30', color: '#a78bfa' },
              { codename: '[REDACTED]', category: '██████', orbit: '∿ ARCHITECTURE', phase: 'D+??', color: 'rgba(168,85,247,0.3)' },
              { codename: '[REDACTED]', category: '██████', orbit: '∿ CONCEPT', phase: 'D+??', color: 'rgba(168,85,247,0.2)' },
              { codename: '[REDACTED]', category: '██████', orbit: '∿ STEALTH', phase: 'D+??', color: 'rgba(168,85,247,0.15)' },
            ].map((entry, i) => (
              <div key={i} className="flex items-center gap-5 py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
                <span className="w-28 flex-shrink-0" style={{ color: entry.color, fontWeight: 600 }}>{entry.codename}</span>
                <span className="w-20 flex-shrink-0" style={{ color: 'rgba(240,239,255,0.2)' }}>{entry.category}</span>
                <span className="flex-1" style={{ color: 'rgba(240,239,255,0.3)' }}>{entry.orbit}</span>
                <span style={{ color: 'rgba(168,85,247,0.5)', letterSpacing: '0.1em' }}>{entry.phase}</span>
              </div>
            ))}

            {/* Footer prompt */}
            <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <p style={{ color: 'rgba(240,239,255,0.15)', marginBottom: '8px' }}>{'// 4 VENTURES IN ASTEROID BELT — ORBITING INTO VIEW WHEN READY'}</p>
              <p>
                <span style={{ color: '#4ade80', fontWeight: 600 }}>construx@internal</span>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$ </span>
                <Link
                  href="/journal"
                  style={{ color: 'rgba(168,85,247,0.6)' }}
                  className="hover:text-purple-400 transition-colors"
                >
                  {'→ WATCH THE JOURNAL FOR LAUNCH SIGNALS'}
                </Link>
              </p>
            </div>
          </div>

          {/* Status bar */}
          <div
            className="flex items-center justify-between px-4 py-1.5"
            style={{ borderTop: '1px solid rgba(168,85,247,0.1)', background: 'rgba(0,0,0,0.3)' }}
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-[8px] uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'rgba(168,85,247,0.6)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(168,85,247,0.8)' }} />
                INCUBATION.ACTIVE
              </span>
              <span className="font-mono text-[8px]" style={{ color: 'rgba(255,255,255,0.15)' }}>4 VENTURES</span>
            </div>
            <span className="font-mono text-[8px]" style={{ color: 'rgba(168,85,247,0.3)' }}>
              construx.classified
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
