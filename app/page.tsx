import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ventures } from '@/lib/ventures';
import { getAllPostMeta } from '@/lib/posts';
import { formatDate } from '@/lib/utils';
import Reveal from '@/components/ui/Reveal';
import TitleBlock from '@/components/ui/TitleBlock';

export const metadata: Metadata = {
  title: 'Construx Group — AI Development Studio',
  description:
    'Construx Group is a UK engineering studio that designs and ships AI-native products — from research to production.',
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Construx Group',
  description:
    'A UK engineering studio that designs and ships AI-native products — from research to production.',
  url: 'https://construxgroup.io',
  logo: 'https://construxgroup.io/brand/construx-mark-512px.png',
};

const CAPABILITIES = [
  {
    num: '01',
    title: 'AI products, end to end',
    body: 'Concept to production. We design, engineer, deploy, and operate complete AI-native products — the five on our manifest were all built this way.',
  },
  {
    num: '02',
    title: 'Agent systems & pipelines',
    body: 'Multi-agent architectures that work unsupervised: research pipelines, content systems, decision engines. Our newsletter is written, edited, and published by one every day.',
  },
  {
    num: '03',
    title: 'Product engineering',
    body: 'Production-grade web applications. Next.js, TypeScript, AWS. Real architecture, tested, observable — built to be maintained, not demoed.',
  },
  {
    num: '04',
    title: 'AI integration for clients',
    body: 'Through Construx Studio we take a small number of engagements per quarter — adding genuine AI capability to products that need more than a chatbot.',
  },
];

const SECTIONS = [
  { id: 'studio', label: '01 / Studio' },
  { id: 'capabilities', label: '02 / Capabilities' },
  { id: 'projects', label: '03 / Projects' },
  { id: 'journal', label: '04 / Journal' },
  { id: 'contact', label: '05 / Contact' },
];

export default function HomePage() {
  const allPosts = getAllPostMeta();
  const recentPosts = allPosts.slice(0, 3);
  const live = ventures.filter((v) => v.status === 'live');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* ════════ PLATE HERO ════════ */}
      <section className="relative min-h-screen flex flex-col">
        {/* Grid hairlines */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block" aria-hidden="true">
          <span className="absolute top-0 bottom-0 w-px" style={{ left: 'calc(50% - 240px)', background: 'var(--hairline)' }} />
          <span className="absolute top-0 bottom-0 w-px" style={{ right: '64px', background: 'var(--hairline)' }} />
          <Reveal
            variant="stamp"
            as="span"
            className="reg-mark"
            delay={900}
            style={{ position: 'absolute', left: 'calc(50% - 246px)', top: '88px' }}
          />
        </div>

        {/* Title block — the drawing sheet's corner stamp */}
        <div className="absolute right-10 top-32 hidden xl:block animate-fade-in" style={{ animationDelay: '1.1s' }}>
          <TitleBlock sheet="01 / 05" title="CONSTRUX GROUP — STUDIO" rev="B" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-10 flex-1 flex flex-col justify-center pt-32 pb-12">
          {/* Eyebrow */}
          <p className="t-eyebrow mb-10 animate-fade-in">An AI development studio</p>

          {/* Statement — hover reveals a drafting dimension line */}
          <div className="dim-host relative">
            <div
              className="dim-note hidden xl:flex absolute -left-12 top-2 bottom-4 flex-col items-center"
              aria-hidden="true"
            >
              <span style={{ width: 9, height: 1.5, background: 'var(--ink-muted)' }} />
              <span className="flex-1" style={{ width: 1, background: 'var(--ink-muted)' }} />
              <span
                className="font-mono text-[9px] my-2 uppercase tracking-[0.18em]"
                style={{ color: 'var(--ink-muted)', writingMode: 'vertical-rl' }}
              >
                3 LN · 600 WT
              </span>
              <span className="flex-1" style={{ width: 1, background: 'var(--ink-muted)' }} />
              <span style={{ width: 9, height: 1.5, background: 'var(--ink-muted)' }} />
            </div>
            <h1 className="t-hero mb-12 animate-fade-up" style={{ maxWidth: '15ch' }}>
              We build software with machines that build software.
            </h1>
          </div>

          {/* Serif intro — offset right on desktop */}
          <div className="lg:ml-auto lg:w-[420px] mb-16 animate-fade-up" style={{ animationDelay: '120ms' }}>
            <p className="t-lead">
              Construx Group is a UK engineering studio that designs and ships
              AI-native products — from research to production, without the agency
              overhead.
            </p>
          </div>

          {/* Title rule + fact strip */}
          <div>
            <div className="title-rule mb-5 animate-rule-draw" style={{ animationDelay: '350ms' }} />
            <div className="flex flex-wrap items-center gap-x-12 gap-y-3">
              <span className="t-fact animate-fade-up" style={{ animationDelay: '650ms' }}>Est. 2025</span>
              <span className="t-fact flex items-center gap-2.5 animate-fade-up" style={{ animationDelay: '780ms' }}>
                <span className="dot-live" />
                {live.length} products operational
              </span>
              <span className="t-fact animate-fade-up" style={{ animationDelay: '910ms' }}>United Kingdom</span>
              <span className="t-meta ml-auto hidden md:block animate-fade-in" style={{ animationDelay: '1200ms' }}>
                Scroll for manifest ↓
              </span>
            </div>
          </div>
        </div>

        {/* Section index */}
        <div className="relative border-t" style={{ borderColor: 'var(--hairline)' }}>
          <div className="mx-auto max-w-7xl px-6 lg:px-10 py-5 flex flex-wrap gap-x-10 gap-y-2">
            {SECTIONS.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="font-mono text-[11px] uppercase tracking-[0.12em] transition-colors hover:text-[#16181A]"
                style={{ color: i === 0 ? 'var(--ink)' : 'var(--ink-faint)' }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 01 / STUDIO ════════ */}
      <section id="studio" className="relative border-t" style={{ borderColor: 'var(--hairline)' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-28 lg:py-36">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14">
            <Reveal className="lg:col-span-4">
              <p className="t-eyebrow mb-4">01 / Studio</p>
              <h2 className="t-section">A small studio,<br />deliberately.</h2>
            </Reveal>
            <Reveal className="lg:col-span-5" delay={120}>
              <p className="t-lead mb-6">
                Most software teams are still organised around the cost of writing
                code. We aren&apos;t. With Claude as the build engine, one engineer
                ships what used to take a team — so the constraint moves to judgment:
                what to build, what to refuse, when it&apos;s done properly.
              </p>
              <p className="t-body">
                Every product on our manifest was designed, engineered, and deployed
                in-house. Nothing outsourced, nothing templated. The studio stays
                small because coordination is the enemy of good software.
              </p>
            </Reveal>
            <div className="lg:col-span-3">
              <dl className="flex flex-col">
                {[
                  { k: 'Founded', v: '2025' },
                  { k: 'Base', v: 'United Kingdom' },
                  { k: 'Products live', v: String(live.length) },
                  { k: 'Build engine', v: 'Claude' },
                  { k: 'Stack', v: 'Next.js / AWS' },
                ].map(({ k, v }, i) => (
                  <Reveal
                    key={k}
                    delay={200 + i * 90}
                    className="flex items-baseline justify-between gap-4 py-3.5 border-b"
                    style={{ borderColor: 'var(--hairline)' }}
                  >
                    <dt className="t-meta">{k}</dt>
                    <dd className="t-fact" style={{ fontSize: 12.5 }}>{v}</dd>
                  </Reveal>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ 02 / CAPABILITIES ════════ */}
      <section id="capabilities" className="relative border-t" style={{ borderColor: 'var(--hairline)' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-28 lg:py-36">
          <div className="flex items-end justify-between mb-16">
            <Reveal>
              <p className="t-eyebrow mb-4">02 / Capabilities</p>
              <h2 className="t-section">What we build.</h2>
            </Reveal>
            <Reveal variant="stamp" as="span" className="reg-mark hidden lg:block" delay={400} />
          </div>

          <div>
            {CAPABILITIES.map(({ num, title, body }, i) => (
              <Reveal
                key={num}
                delay={i * 80}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-10 py-9 border-b"
                style={{ borderColor: 'var(--hairline)' }}
              >
                <span className="md:col-span-1 font-mono text-[12px] tabular-nums pt-1" style={{ color: 'var(--ink-faint)' }}>
                  {num}
                </span>
                <h3 className="md:col-span-4 t-card text-[21px] leading-tight">{title}</h3>
                <p className="md:col-span-7 t-body" style={{ maxWidth: '58ch' }}>{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 03 / PROJECTS — charcoal plate manifest ════════ */}
      <section id="projects" className="plate relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-28 lg:py-36">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
            <Reveal className="lg:col-span-5">
              <p className="t-eyebrow mb-4">03 / Projects</p>
              <h2 className="t-section">The manifest.</h2>
            </Reveal>
            <Reveal className="lg:col-span-7 flex items-end" delay={120}>
              <p className="t-body" style={{ maxWidth: '52ch' }}>
                Five products, all operational, all built in-house. They are our
                current projects — proof of method, not the point of the studio.
              </p>
            </Reveal>
          </div>

          {/* Manifest table */}
          <div className="border-t" style={{ borderColor: 'var(--plate-hairline)' }}>
            {live.map((v, i) => (
              <Reveal key={v.id} delay={i * 70}>
                <Link
                  href={`/ventures/${v.slug}`}
                  className="manifest-row group grid grid-cols-12 items-baseline gap-3 md:gap-6 py-6 border-b transition-colors hover:bg-[#16181a]"
                  style={{ borderColor: 'var(--plate-hairline)' }}
                >
                  <span className="row-idx col-span-1 font-mono text-[11px] tabular-nums" style={{ color: 'var(--plate-muted)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="col-span-7 md:col-span-3 font-display text-[clamp(1.2rem,2.2vw,1.7rem)] leading-none transition-colors"
                    style={{ fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--plate-text)' }}
                  >
                    {v.name}
                  </span>
                  <span className="hidden md:block md:col-span-3 t-meta">{v.category}</span>
                  <span className="hidden md:flex md:col-span-4 items-baseline justify-between gap-6">
                    <span className="font-serif-body text-[13.5px]" style={{ color: 'var(--plate-muted)' }}>
                      {v.tagline}
                    </span>
                    <span className="flex items-center gap-3 flex-shrink-0">
                      <span className="flex items-center gap-2 t-meta">
                        <span className="dot-live" style={{ width: 5, height: 5 }} />
                        Live
                      </span>
                      <ArrowRight size={13} className="row-arrow" style={{ color: 'var(--plate-text)' }} />
                    </span>
                  </span>
                  <span className="col-span-4 md:hidden flex justify-end">
                    <ArrowUpRight size={14} style={{ color: 'var(--plate-muted)' }} />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-between">
            <Link href="/ventures" className="btn-text">
              Full project index <ArrowRight size={12} />
            </Link>
            <span className="t-meta hidden md:block">5 entries / all operational</span>
          </div>
        </div>
      </section>

      {/* ════════ 04 / JOURNAL ════════ */}
      {recentPosts.length > 0 && (
        <section id="journal" className="relative border-t" style={{ borderColor: 'var(--hairline)' }}>
          <div className="mx-auto max-w-7xl px-6 lg:px-10 py-28 lg:py-36">
            <div className="flex items-end justify-between mb-14">
              <Reveal>
                <p className="t-eyebrow mb-4">04 / Journal</p>
                <h2 className="t-section">Working notes.</h2>
              </Reveal>
              <Link href="/journal" className="btn-text hidden md:inline-flex">
                All {allPosts.length} entries <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: 'var(--hairline)' }}>
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/journal/${post.slug}`}
                  className="group flex flex-col p-8 transition-colors"
                  style={{ background: 'var(--paper)' }}
                >
                  <p className="t-meta mb-5">{formatDate(post.date)} · {post.readingTime} min</p>
                  <h3
                    className="t-card text-[19px] leading-snug mb-4 transition-colors group-hover:underline"
                    style={{ textDecorationColor: 'var(--orange)', textUnderlineOffset: 4 }}
                  >
                    {post.title}
                  </h3>
                  <p className="t-body text-[14px] line-clamp-2 mb-6">{post.excerpt}</p>
                  <span className="mt-auto t-meta flex items-center gap-1.5">
                    Read <ArrowRight size={10} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════ 05 / CONTACT ════════ */}
      <section id="contact" className="relative border-t" style={{ borderColor: 'var(--hairline)' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-28 lg:py-40">
          <Reveal>
            <p className="t-eyebrow mb-4">05 / Contact</p>
            <h2 className="t-hero mb-10" style={{ fontSize: 'clamp(2.4rem,5.5vw,5rem)', maxWidth: '16ch' }}>
              Building something that needs proper engineering?
            </h2>
          </Reveal>
          <Reveal variant="rule" className="title-rule mb-8" delay={250} style={{ maxWidth: 480 }} />
          <Reveal delay={350}>
            <p className="t-lead mb-12" style={{ maxWidth: '46ch' }}>
              We take a small number of client engagements each quarter through
              Construx Studio. If the work is serious, we should talk.
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <Link href="/work-with-us" className="btn-ink">
                Work with us
              </Link>
              <Link href="/contact" className="btn-text">
                General contact <ArrowRight size={12} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
