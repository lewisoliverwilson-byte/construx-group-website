import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllPostMeta, getPostBySlug } from '@/lib/posts';
import { formatDate } from '@/lib/utils';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPostMeta().map((p) => ({ slug: p.slug }));
}

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

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {/* Hero */}
      <section className="relative pt-36 pb-12 px-5 grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-radial-orange pointer-events-none" />
        <div className="relative mx-auto max-w-3xl">
          <Link
            href="/journal"
            className="inline-flex items-center gap-1.5 font-mono text-[9px] text-text-dim hover:text-text-muted transition-colors mb-8 group uppercase tracking-widest"
          >
            <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
            // JOURNAL
          </Link>

          <div className="flex items-center gap-3 mb-4 animate-fade-in flex-wrap">
            <span
              className="font-mono text-[9px] font-medium px-2 py-0.5 text-construx uppercase tracking-widest"
              style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '2px' }}
            >
              {post.tag}
            </span>
            <span className="font-mono text-[10px] text-text-dim">{post.author}</span>
            <span className="text-text-dim text-xs opacity-50">·</span>
            <time dateTime={post.date} className="font-mono text-[10px] text-text-dim">
              {formatDate(post.date)}
            </time>
            <span className="text-text-dim text-xs opacity-50">·</span>
            <span className="font-mono text-[10px] text-text-dim">{post.readingTime} min read</span>
          </div>

          <h1 className="text-display-sm text-text-base mb-5 leading-tight animate-fade-up"
            style={{ animationDelay: '80ms' }}>
            {post.title}
          </h1>
          <p className="text-text-muted leading-relaxed text-base max-w-2xl animate-fade-up"
            style={{ animationDelay: '200ms' }}>
            {post.excerpt}
          </p>
        </div>
      </section>

      {/* Post body */}
      <article className="px-5 py-16 mx-auto max-w-3xl">
        <div className="prose-construx">
          <MDXRemote source={post.content} />
        </div>

        {/* Footer: author + prev/next */}
        <div className="mt-20 pt-10 border-t border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
            <div>
              <p className="font-mono text-[9px] text-text-dim mb-1.5 uppercase tracking-widest">// WRITTEN BY</p>
              <p className="text-sm font-semibold text-text-base">{post.author}</p>
              <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest mt-0.5">Construx Group</p>
            </div>
            <Link
              href="/journal"
              className="inline-flex items-center gap-1.5 font-mono text-[10px] text-construx hover:text-orange-400 transition-colors font-medium uppercase tracking-widest"
            >
              <ArrowLeft size={11} />
              ALL POSTS
            </Link>
          </div>

          {(prevPost || nextPost) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prevPost ? (
                <Link
                  href={`/journal/${prevPost.slug}`}
                  className="group flex flex-col gap-1.5 px-5 py-4 transition-all hover:bg-subtle"
                  style={{ background: 'rgba(5,5,18,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '3px' }}
                >
                  <span className="font-mono text-[9px] text-text-dim uppercase tracking-widest flex items-center gap-1.5">
                    <ArrowLeft size={10} className="group-hover:-translate-x-0.5 transition-transform" />
                    Previous
                  </span>
                  <span className="text-sm font-semibold text-text-muted group-hover:text-text-base transition-colors leading-snug line-clamp-2">
                    {prevPost.title}
                  </span>
                </Link>
              ) : <div />}
              {nextPost ? (
                <Link
                  href={`/journal/${nextPost.slug}`}
                  className="group flex flex-col gap-1.5 px-5 py-4 transition-all hover:bg-subtle text-right sm:items-end"
                  style={{ background: 'rgba(5,5,18,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '3px' }}
                >
                  <span className="font-mono text-[9px] text-text-dim uppercase tracking-widest flex items-center gap-1.5 justify-end">
                    Next
                    <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  <span className="text-sm font-semibold text-text-muted group-hover:text-text-base transition-colors leading-snug line-clamp-2">
                    {nextPost.title}
                  </span>
                </Link>
              ) : <div />}
            </div>
          )}
        </div>
      </article>

      {relatedByTag.length > 0 && (
        <section className="px-5 pb-20 mx-auto max-w-3xl border-t border-border">
          <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-text-dim pt-10 mb-6">
            // MORE LIKE THIS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedByTag.map((related) => (
              <Link
                key={related.slug}
                href={`/journal/${related.slug}`}
                className="group flex flex-col gap-2 px-5 py-4 transition-all hover:bg-subtle border border-transparent hover:border-construx/15"
                style={{ borderRadius: '3px', background: 'rgba(5,5,18,0.5)' }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="font-mono text-[9px] font-medium px-2 py-0.5 text-construx uppercase tracking-widest"
                    style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.18)', borderRadius: '2px' }}
                  >
                    {related.tag}
                  </span>
                  <span className="font-mono text-[10px] text-text-dim">{related.readingTime} min read</span>
                </div>
                <p className="text-sm font-semibold text-text-base group-hover:text-text-base transition-colors leading-snug line-clamp-2">
                  {related.title}
                </p>
                <p className="text-xs text-text-muted leading-relaxed line-clamp-2 opacity-70">
                  {related.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
