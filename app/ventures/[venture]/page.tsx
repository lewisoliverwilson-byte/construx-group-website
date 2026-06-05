import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, ArrowLeft, ChevronRight, Tag } from 'lucide-react';
import { ventures, getVentureBySlug } from '@/lib/ventures';
import StatusBadge from '@/components/ui/StatusBadge';

interface Props {
  params: Promise<{ venture: string }>;
}

export async function generateStaticParams() {
  return ventures.map((v) => ({ venture: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venture: slug } = await params;
  const venture = getVentureBySlug(slug);
  if (!venture) return {};
  return {
    title: `${venture.name} — ${venture.tagline}`,
    description: venture.pitch,
  };
}

export default async function VenturePage({ params }: Props) {
  const { venture: slug } = await params;
  const venture = getVentureBySlug(slug);
  if (!venture) notFound();

  const others = ventures.filter((v) => v.id !== venture.id).slice(0, 2);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section
        className="relative pt-36 pb-24 px-5 overflow-hidden"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% -5%, ${venture.accent}14, transparent 65%), #000008`,
        }}
      >
        {/* Grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${venture.accent}18 1px,transparent 1px),linear-gradient(90deg,${venture.accent}18 1px,transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom,transparent,#000008)' }}
        />

        <div className="relative mx-auto max-w-4xl">
          <Link
            href="/ventures"
            className="inline-flex items-center gap-1.5 text-xs text-text-dim hover:text-text-muted transition-colors mb-8 group"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            All ventures
          </Link>

          <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
            {/* Planet orb */}
            <div
              className="h-20 w-20 rounded-full flex-shrink-0 animate-float"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${venture.accent}dd, ${venture.accent}44)`,
                boxShadow: `0 0 50px ${venture.accent}55, 0 0 100px ${venture.accent}22`,
              }}
            />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={venture.status} />
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-widest"
                  style={{ color: venture.accent, background: `${venture.accent}14` }}
                >
                  {venture.category}
                </span>
                <span className="text-xs text-text-dim tracking-wider uppercase">
                  Construx Group
                </span>
              </div>
              <h1 className="text-display-sm text-text-base mb-2">{venture.name}</h1>
              <p
                className="text-lg font-semibold leading-snug"
                style={{ color: venture.accent }}
              >
                {venture.tagline}
              </p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {venture.stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl px-4 py-3"
                style={{
                  background: `${venture.accent}0C`,
                  border: `1px solid ${venture.accent}1E`,
                }}
              >
                <p
                  className="text-lg font-bold leading-tight mb-0.5"
                  style={{ color: venture.accent }}
                >
                  {s.value}
                </p>
                <p className="text-xs text-text-dim uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            {venture.url ? (
              <a
                href={venture.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-black transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: venture.accent,
                  boxShadow: `0 0 24px ${venture.accent}44`,
                }}
              >
                Visit {venture.name} <ArrowUpRight size={15} />
              </a>
            ) : (
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-construx text-black hover:bg-orange-400 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)]"
              >
                Get early access <ChevronRight size={15} />
              </Link>
            )}
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border border-border-bright text-text-muted hover:text-text-base hover:border-construx/40 transition-all"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-5 pb-24 mx-auto max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main copy */}
          <div className="lg:col-span-2 space-y-6">
            {/* What it is */}
            <div
              className="rounded-2xl p-7"
              style={{
                background: 'rgba(5,5,18,0.8)',
                border: `1px solid ${venture.accent}18`,
              }}
            >
              <h2 className="text-sm font-semibold uppercase tracking-widest text-text-dim mb-4">
                What it is
              </h2>
              <p className="text-text-muted leading-relaxed text-base">{venture.what}</p>
            </div>

            {/* The pitch */}
            <div
              className="rounded-2xl p-7"
              style={{
                background: 'rgba(5,5,18,0.8)',
                border: `1px solid ${venture.accent}18`,
              }}
            >
              <h2 className="text-sm font-semibold uppercase tracking-widest text-text-dim mb-4">
                The pitch
              </h2>
              <p className="text-text-muted leading-relaxed text-base">{venture.pitch}</p>
            </div>

            {/* Key capabilities */}
            <div
              className="rounded-2xl p-7"
              style={{
                background: 'rgba(5,5,18,0.8)',
                border: `1px solid ${venture.accent}18`,
              }}
            >
              <h2 className="text-sm font-semibold uppercase tracking-widest text-text-dim mb-5 flex items-center gap-2">
                <Tag size={12} />
                Key capabilities
              </h2>
              <ul className="space-y-3">
                {venture.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span
                      className="mt-2 h-1.5 w-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: venture.accent }}
                    />
                    <span className="text-sm text-text-muted leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Status */}
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(5,5,18,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-text-dim mb-3">
                Status
              </p>
              <StatusBadge status={venture.status} />
            </div>

            {/* Category */}
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(5,5,18,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-text-dim mb-3">
                Category
              </p>
              <span
                className="text-sm font-semibold"
                style={{ color: venture.accent }}
              >
                {venture.category}
              </span>
            </div>

            {/* Parent group */}
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(5,5,18,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-text-dim mb-3">
                Parent group
              </p>
              <Link href="/" className="flex items-center gap-2 group">
                <div className="h-6 w-6 rounded bg-construx flex items-center justify-center">
                  <span className="text-[9px] font-bold text-black">CX</span>
                </div>
                <span className="text-sm text-text-muted group-hover:text-text-base transition-colors">
                  Construx Group
                </span>
              </Link>
            </div>

            {/* Visit CTA */}
            {venture.url && (
              <a
                href={venture.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-black transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: venture.accent,
                  boxShadow: `0 0 20px ${venture.accent}44`,
                }}
              >
                Visit Site <ArrowUpRight size={14} />
              </a>
            )}

            {/* Contact CTA */}
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium border border-border hover:border-border-bright text-text-muted hover:text-text-base transition-all"
            >
              Get in touch
            </Link>
          </div>
        </div>

        {/* Other ventures */}
        {others.length > 0 && (
          <div className="mt-20 pt-12 border-t border-border">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-text-dim mb-6">
              Other ventures
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {others.map((v) => (
                <Link
                  key={v.id}
                  href={`/ventures/${v.slug}`}
                  className="group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all bg-[rgba(5,5,18,0.6)] hover:bg-subtle"
                  style={{ border: `1px solid ${v.accent}18` }}
                >
                  <div
                    className="h-10 w-10 rounded-full flex-shrink-0"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${v.accent}bb, ${v.accent}44)`,
                      boxShadow: `0 0 14px ${v.accent}44`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-base">{v.name}</p>
                    <p className="text-xs text-text-dim truncate">{v.tagline}</p>
                  </div>
                  <ChevronRight size={14} className="text-text-dim group-hover:text-text-muted transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
