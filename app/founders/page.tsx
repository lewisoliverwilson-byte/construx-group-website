import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Founders',
  description:
    'Lewis Wilson and Dan — the two people behind Construx Group. How they met, why they started building, and how the group operates.',
};

const founders = [
  {
    name: 'Lewis Wilson',
    role: 'Co-founder',
    bio: `Placeholder bio — Lewis's story, background, and role within Construx Group will live here. Update this via the content file.`,
    focus: ['Product strategy', 'Technical architecture', 'Venture direction'],
    accent: '#F97316',
  },
  {
    name: 'Dan',
    role: 'Co-founder',
    bio: `Placeholder bio — Dan's story, background, and role within Construx Group will live here. Update this via the content file.`,
    focus: ['Design', 'Operations', 'Growth'],
    accent: '#8B5CF6',
  },
];

export default function FoundersPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-36 pb-16 px-5 overflow-hidden grid-bg">
        <div className="absolute inset-0 bg-radial-orange pointer-events-none" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-construx mb-5">
            // THE PEOPLE
          </p>
          <h1 className="text-display text-text-base mb-6 leading-none">
            The <span className="text-gradient-orange">Founders</span>
          </h1>
          <p className="text-text-muted text-base leading-relaxed max-w-lg mx-auto">
            Two people. Equal billing. Everything built, owned, and shipped together.
          </p>
        </div>
      </section>

      {/* Founder cards */}
      <section className="px-5 py-20 mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {founders.map((f) => (
            <article
              key={f.name}
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(5,5,18,0.88)',
                border: `1px solid ${f.accent}20`,
                boxShadow: `0 0 40px ${f.accent}08`,
              }}
            >
              <div
                className="h-1"
                style={{ background: `linear-gradient(90deg, transparent, ${f.accent}, transparent)` }}
              />

              <div className="p-8">
                {/* Avatar placeholder */}
                <div className="mb-6">
                  <div
                    className="h-20 w-20 rounded-2xl flex items-center justify-center text-2xl font-bold"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${f.accent}55, ${f.accent}11)`,
                      border: `1px solid ${f.accent}28`,
                      color: f.accent,
                    }}
                  >
                    {f.name.charAt(0)}
                  </div>
                </div>

                <div className="mb-5">
                  <h2 className="text-xl font-bold text-text-base mb-1">{f.name}</h2>
                  <p className="text-sm font-medium" style={{ color: f.accent }}>
                    {f.role}, Construx Group
                  </p>
                </div>

                <p className="text-sm text-text-muted leading-relaxed mb-6">{f.bio}</p>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-text-dim mb-2">
                    Focus areas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {f.focus.map((area) => (
                      <span
                        key={area}
                        className="text-xs px-2.5 py-1 rounded-lg"
                        style={{
                          background: `${f.accent}12`,
                          border: `1px solid ${f.accent}22`,
                          color: f.accent,
                        }}
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Origin story */}
        <div
          className="mt-16 rounded-2xl p-10"
          style={{
            background: 'rgba(5,5,18,0.8)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <h2 className="text-heading-xl text-text-base mb-6">
            How Construx started
          </h2>
          <p className="text-text-muted leading-relaxed text-base mb-4">
            Placeholder — the origin story of Construx Group, how Lewis and Dan started working
            together, and what they observed about AI that made them start building this way.
            This section will be updated with the real story.
          </p>
          <p className="text-text-muted leading-relaxed text-base">
            The core insight that drove everything: a small team equipped with the right AI tools
            can build what a large studio used to require six months and a dozen engineers to produce.
            Not by being reckless, but by eliminating every form of unnecessary friction from the process.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/work-with-us"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-construx text-black hover:bg-orange-400 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)]"
          >
            Work with us <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
