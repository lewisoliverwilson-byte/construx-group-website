import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeHighlight from 'rehype-highlight';
import { getAllPostMeta, getPostBySlug } from '@/lib/posts';
import { formatDate } from '@/lib/utils';
import ReadingProgress from '@/components/journal/ReadingProgress';
import CopyLink from '@/components/journal/CopyLink';
import SharePost from '@/components/journal/SharePost';
import TableOfContents from '@/components/journal/TableOfContents';
import BackToTop from '@/components/journal/BackToTop';
import CodeBlock from '@/components/journal/CodeBlock';
import { extractHeadings, slugify } from '@/lib/headings';
import { ventures } from '@/lib/ventures';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://construxgroup.io';
  const url = `${siteUrl}/journal/${slug}`;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      authors: [post.author],
      tags: [post.tag],
      siteName: 'Construx Group',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function JournalPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = getAllPostMeta();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  const relatedByTag = allPosts
    .filter((p) => p.slug !== slug && p.tag === post.tag)
    .slice(0, 2);

  const headings = extractHeadings(post.content);

  const contentLower = (post.title + ' ' + post.content).toLowerCase();
  const mentionedVentures = ventures.filter((v) => {
    const keywords = [v.name.toLowerCase(), v.slug.toLowerCase()];
    return keywords.some((kw) => contentLower.includes(kw));
  });

  const mdxComponents = {
    h2: ({ children }: { children: React.ReactNode }) => {
      const id = slugify(String(children));
      return <h2 id={id}>{children}</h2>;
    },
    h3: ({ children }: { children: React.ReactNode }) => {
      const id = slugify(String(children));
      return <h3 id={id}>{children}</h3>;
    },
    pre: CodeBlock,
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: 'Construx Group', url: 'https://construxgroup.io' },
    url: `https://construxgroup.io/journal/${post.slug}`,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://construxgroup.io' },
      { '@type': 'ListItem', position: 2, name: 'Journal', item: 'https://construxgroup.io/journal' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://construxgroup.io/journal/${post.slug}` },
    ],
  };

  return (
    <div className="min-h-screen">
      <ReadingProgress />
      <BackToTop />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-14 px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(139,92,246,0.07), transparent 65%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 t-meta hover:text-white/55 transition-colors mb-10 group"
          >
            <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
            Journal
          </Link>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-7 animate-fade-in">
            <span
              className="font-mono text-[9px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
              style={{
                color: 'rgba(167,139,250,0.9)',
                background: 'rgba(139,92,246,0.09)',
                border: '1px solid rgba(139,92,246,0.2)',
              }}
            >
              {post.tag}
            </span>
            <time dateTime={post.date} className="t-meta">
              {formatDate(post.date)}
            </time>
            <span className="t-meta">·</span>
            <span className="t-meta">{post.readingTime} min read</span>
          </div>

          <h1
            className="font-display text-white/[0.94] mb-6 animate-fade-up"
            style={{
              fontWeight: 700,
              fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              animationDelay: '80ms',
            }}
          >
            {post.title}
          </h1>
          <p
            className="t-lead max-w-2xl animate-fade-up"
            style={{ animationDelay: '180ms' }}
          >
            {post.excerpt}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6">
        <div className="hairline" />
      </div>

      {/* ── Body ── */}
      <div className="px-6 py-16 mx-auto max-w-5xl flex gap-12 items-start">
        <TableOfContents headings={headings} />
        <article className="min-w-0 flex-1 max-w-3xl mx-auto xl:mx-0">
          <div className="prose-construx">
            <MDXRemote
              source={post.content}
              components={mdxComponents}
              options={{ mdxOptions: { rehypePlugins: [rehypeHighlight] } }}
            />
          </div>

          {/* Footer: author + actions */}
          <div className="mt-20 pt-10 border-t border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-4">
                <div
                  className="h-11 w-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <span className="font-display text-[13px] text-white/60" style={{ fontWeight: 700 }}>
                    {post.author.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-[14px] text-white/80 font-normal">{post.author}</p>
                  <p className="t-meta mt-0.5" style={{ fontSize: 9 }}>Construx Group</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <SharePost title={post.title} dispatchNum={String(allPosts.length - currentIndex).padStart(3, '0')} />
                <CopyLink />
              </div>
            </div>

            {/* Prev / Next */}
            {(prevPost || nextPost) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevPost ? (
                  <Link
                    href={`/journal/${prevPost.slug}`}
                    className="group card card-hover p-6"
                  >
                    <p className="t-meta mb-3 flex items-center gap-1.5" style={{ fontSize: 9 }}>
                      <ArrowLeft size={10} className="group-hover:-translate-x-0.5 transition-transform" />
                      Previous
                    </p>
                    <p className="t-card text-[14.5px] leading-snug line-clamp-2 group-hover:text-white transition-colors">
                      {prevPost.title}
                    </p>
                  </Link>
                ) : <div />}
                {nextPost ? (
                  <Link
                    href={`/journal/${nextPost.slug}`}
                    className="group card card-hover p-6 sm:text-right"
                  >
                    <p className="t-meta mb-3 flex items-center gap-1.5 sm:justify-end" style={{ fontSize: 9 }}>
                      Next
                      <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                    </p>
                    <p className="t-card text-[14.5px] leading-snug line-clamp-2 group-hover:text-white transition-colors">
                      {nextPost.title}
                    </p>
                  </Link>
                ) : <div />}
              </div>
            )}
          </div>

          {/* Mentioned ventures */}
          {mentionedVentures.length > 0 && (
            <div className="mt-10">
              <p className="t-eyebrow mb-4" style={{ fontSize: 9 }}>Mentioned in this post</p>
              <div className="flex flex-wrap gap-2">
                {mentionedVentures.map((v) => (
                  <Link
                    key={v.id}
                    href={`/ventures/${v.slug}`}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all hover:-translate-y-px"
                    style={{
                      background: `${v.accent}0a`,
                      border: `1px solid ${v.accent}22`,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: v.accent, boxShadow: `0 0 5px ${v.accent}80` }}
                    />
                    <span className="text-[12px] font-light" style={{ color: `${v.accent}d8` }}>
                      {v.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>

      {/* ── Related ── */}
      {relatedByTag.length > 0 && (
        <section className="px-6 pb-24 mx-auto max-w-3xl">
          <p className="t-eyebrow mb-6">More on {post.tag}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedByTag.map((related) => (
              <Link
                key={related.slug}
                href={`/journal/${related.slug}`}
                className="group card card-hover p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="t-meta" style={{ fontSize: 9 }}>{formatDate(related.date)}</span>
                  <span className="t-meta" style={{ fontSize: 9 }}>·</span>
                  <span className="t-meta" style={{ fontSize: 9 }}>{related.readingTime} min</span>
                </div>
                <p className="t-card text-[15px] leading-snug mb-2 group-hover:text-white transition-colors line-clamp-2">
                  {related.title}
                </p>
                <p className="t-body text-[12.5px] line-clamp-2">{related.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
