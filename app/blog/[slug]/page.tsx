import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeHighlight from 'rehype-highlight';
import { getAllPostMeta, getPostBySlug } from '@/lib/posts';
import { formatDate } from '@/lib/utils';
import ReadingProgress from '@/components/blog/ReadingProgress';
import CopyLink from '@/components/blog/CopyLink';
import SharePost from '@/components/blog/SharePost';
import TableOfContents from '@/components/blog/TableOfContents';
import BackToTop from '@/components/blog/BackToTop';
import CodeBlock from '@/components/blog/CodeBlock';
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
  const url = `${siteUrl}/blog/${slug}`;

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

export default async function BlogPostPage({ params }: Props) {
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
    url: `https://construxgroup.io/blog/${post.slug}`,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://construxgroup.io' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://construxgroup.io/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://construxgroup.io/blog/${post.slug}` },
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

      {/* ── Title block ── */}
      <section className="relative pt-40 pb-12">
        <div className="mx-auto max-w-3xl px-6">
          <Link href="/blog" className="btn-text mb-12 inline-flex group">
            <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
            Blog
          </Link>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-7 animate-fade-in">
            <span className="t-meta">{post.tag}</span>
            <span className="t-meta" style={{ opacity: 0.5 }}>·</span>
            <time dateTime={post.date} className="t-meta">{formatDate(post.date)}</time>
            <span className="t-meta" style={{ opacity: 0.5 }}>·</span>
            <span className="t-meta">{post.readingTime} min read</span>
          </div>

          <h1
            className="font-display mb-7 animate-fade-up"
            style={{
              fontWeight: 600,
              fontSize: 'clamp(1.9rem,4.2vw,3.2rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              color: 'var(--ink)',
              animationDelay: '60ms',
            }}
          >
            {post.title}
          </h1>
          <p className="t-lead animate-fade-up" style={{ maxWidth: '58ch', animationDelay: '140ms' }}>
            {post.excerpt}
          </p>

          <div className="title-rule mt-10" style={{ maxWidth: 120 }} />
        </div>
      </section>

      {/* ── Body ── */}
      <div className="px-6 pb-16 mx-auto max-w-5xl flex gap-12 items-start">
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
          <div className="mt-20 pt-10 border-t" style={{ borderColor: 'var(--hairline)' }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
              <div>
                <p className="font-display text-[15px]" style={{ fontWeight: 600, color: 'var(--ink)' }}>
                  {post.author}
                </p>
                <p className="t-meta mt-1" style={{ fontSize: 9.5 }}>Construx Group</p>
              </div>
              <div className="flex items-center gap-3">
                <SharePost title={post.title} dispatchNum={String(allPosts.length - currentIndex).padStart(3, '0')} />
                <CopyLink />
              </div>
            </div>

            {/* Prev / Next */}
            {(prevPost || nextPost) && (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-px border-t border-b"
                style={{ background: 'var(--hairline)', borderColor: 'var(--hairline)' }}
              >
                {prevPost ? (
                  <Link
                    href={`/blog/${prevPost.slug}`}
                    className="group p-6"
                    style={{ background: 'var(--paper)' }}
                  >
                    <p className="t-meta mb-3 flex items-center gap-1.5" style={{ fontSize: 9.5 }}>
                      <ArrowLeft size={10} />
                      Previous
                    </p>
                    <p
                      className="t-card text-[15px] leading-snug line-clamp-2 group-hover:underline"
                      style={{ textDecorationColor: 'var(--orange)', textUnderlineOffset: 4 }}
                    >
                      {prevPost.title}
                    </p>
                  </Link>
                ) : <div style={{ background: 'var(--paper)' }} />}
                {nextPost ? (
                  <Link
                    href={`/blog/${nextPost.slug}`}
                    className="group p-6 sm:text-right"
                    style={{ background: 'var(--paper)' }}
                  >
                    <p className="t-meta mb-3 flex items-center gap-1.5 sm:justify-end" style={{ fontSize: 9.5 }}>
                      Next
                      <ArrowRight size={10} />
                    </p>
                    <p
                      className="t-card text-[15px] leading-snug line-clamp-2 group-hover:underline"
                      style={{ textDecorationColor: 'var(--orange)', textUnderlineOffset: 4 }}
                    >
                      {nextPost.title}
                    </p>
                  </Link>
                ) : <div style={{ background: 'var(--paper)' }} />}
              </div>
            )}
          </div>

          {/* Mentioned projects */}
          {mentionedVentures.length > 0 && (
            <div className="mt-10">
              <p className="t-eyebrow mb-4" style={{ fontSize: 9.5 }}>Projects in this entry</p>
              <div className="flex flex-wrap gap-2">
                {mentionedVentures.map((v) => (
                  <Link
                    key={v.id}
                    href={`/ventures/${v.slug}`}
                    className="inline-flex items-center gap-2.5 px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors hover:border-[#16181A]"
                    style={{
                      border: '1px solid var(--hairline)',
                      borderRadius: 2,
                      color: 'var(--ink-muted)',
                      background: 'var(--paper-raised)',
                    }}
                  >
                    <span className="dot-live" style={{ width: 5, height: 5 }} />
                    {v.name}
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
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-px border-t border-b"
            style={{ background: 'var(--hairline)', borderColor: 'var(--hairline)' }}
          >
            {relatedByTag.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="group p-6"
                style={{ background: 'var(--paper)' }}
              >
                <p className="t-meta mb-3" style={{ fontSize: 9.5 }}>
                  {formatDate(related.date)} · {related.readingTime} min
                </p>
                <p
                  className="t-card text-[15.5px] leading-snug mb-2 group-hover:underline line-clamp-2"
                  style={{ textDecorationColor: 'var(--orange)', textUnderlineOffset: 4 }}
                >
                  {related.title}
                </p>
                <p className="t-body text-[13px] line-clamp-2">{related.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
