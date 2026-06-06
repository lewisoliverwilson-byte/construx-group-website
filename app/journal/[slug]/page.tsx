import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeHighlight from 'rehype-highlight';
import { getAllPostMeta, getPostBySlug } from '@/lib/posts';
import { formatDate } from '@/lib/utils';
import ReadingProgress from '@/components/journal/ReadingProgress';
import DispatchHUD from '@/components/journal/DispatchHUD';
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

  const dispatchNumber = String(allPosts.length - currentIndex).padStart(3, '0');

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
      <DispatchHUD dispatchNum={dispatchNumber} readingTime={post.readingTime} tag={post.tag} />
      <BackToTop />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
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

          {/* Dispatch metadata — terminal chrome panel */}
          <div
            className="mb-8 overflow-hidden animate-fade-in"
            style={{
              background: 'rgba(2,2,12,0.92)',
              border: '1px solid rgba(249,115,22,0.14)',
              borderRadius: '4px',
              boxShadow: '0 0 30px rgba(249,115,22,0.04), inset 0 1px 0 rgba(255,255,255,0.02)',
            }}
          >
            {/* Title bar */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 select-none"
              style={{ borderBottom: '1px solid rgba(249,115,22,0.08)', background: 'rgba(249,115,22,0.025)' }}
            >
              <div className="flex items-center gap-1.5">
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', boxShadow: '0 0 3px rgba(255,95,87,0.4)' }} />
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', boxShadow: '0 0 3px rgba(255,189,46,0.35)' }} />
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28C840', display: 'inline-block', boxShadow: '0 0 3px rgba(40,200,64,0.35)' }} />
              </div>
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] flex-1 text-center" style={{ color: 'rgba(249,115,22,0.4)' }}>
                construx.journal — dispatch-{dispatchNumber}
              </span>
              <span className="font-mono text-[8px] tabular-nums" style={{ color: 'rgba(255,255,255,0.15)' }}>
                {post.readingTime}m
              </span>
            </div>
            {/* Shell prompt */}
            <div className="flex items-center gap-2 px-4 py-2.5 font-mono text-[10px]" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,6,0.3)' }}>
              <span style={{ color: '#4ade80', fontWeight: 600 }}>construx@sys</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>:~$</span>
              <span style={{ color: 'rgba(240,239,255,0.3)' }}>
                dispatch --read {post.slug} --format=article
              </span>
            </div>
            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
              <span className="font-mono text-[9px] tabular-nums font-semibold" style={{ color: 'rgba(249,115,22,0.6)' }}>
                #{dispatchNumber}
              </span>
              <span style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
              <Link
                href={`/journal?tag=${encodeURIComponent(post.tag)}`}
                className="font-mono text-[9px] font-medium px-2 py-0.5 text-construx uppercase tracking-widest hover:bg-construx/20 transition-colors"
                style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '2px' }}
              >
                {post.tag}
              </Link>
              <span style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
              <span className="font-mono text-[10px]" style={{ color: 'rgba(240,239,255,0.4)' }}>{post.author}</span>
              <span style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
              <time dateTime={post.date} className="font-mono text-[10px] tabular-nums" style={{ color: 'rgba(240,239,255,0.35)' }}>
                {formatDate(post.date)}
              </time>
              <span className="ml-auto font-mono text-[8px] uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'rgba(74,222,128,0.55)' }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#4ade80', boxShadow: '0 0 3px rgba(74,222,128,0.5)' }} />
                indexed
              </span>
            </div>
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
      <div className="px-5 py-16 mx-auto max-w-5xl flex gap-12 items-start">
        <TableOfContents headings={headings} />
        <article className="min-w-0 flex-1 max-w-3xl mx-auto xl:mx-0">
        <div className="prose-construx">
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{ mdxOptions: { rehypePlugins: [rehypeHighlight] } }}
          />
        </div>

        {/* Footer: author + prev/next */}
        <div className="mt-20 pt-10 border-t border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
            <div>
              <p className="font-mono text-[9px] text-text-dim mb-1.5 uppercase tracking-widest">// WRITTEN BY</p>
              <p className="text-sm font-semibold text-text-base">{post.author}</p>
              <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest mt-0.5">Construx Group</p>
            </div>
            <div className="flex items-center gap-3">
              <SharePost title={post.title} dispatchNum={dispatchNumber} />
              <CopyLink />
              <Link
                href="/journal"
                className="inline-flex items-center gap-1.5 font-mono text-[10px] text-construx hover:text-orange-400 transition-colors font-medium uppercase tracking-widest"
              >
                <ArrowLeft size={11} />
                ALL POSTS
              </Link>
            </div>
          </div>

          {(prevPost || nextPost) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prevPost ? (
                <Link
                  href={`/journal/${prevPost.slug}`}
                  className="group flex flex-col overflow-hidden transition-all hover:border-construx/20"
                  style={{ background: 'rgba(5,5,18,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '3px' }}
                >
                  <div
                    className="flex items-center gap-2 px-3 py-2 select-none"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}
                  >
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF5F57' }} />
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FFBD2E' }} />
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#28C840' }} />
                    </div>
                    <span className="font-mono text-[8px] text-text-dim/40 uppercase tracking-widest flex items-center gap-1.5 flex-1">
                      <ArrowLeft size={9} className="group-hover:-translate-x-0.5 transition-transform" />
                      journal.prev
                    </span>
                  </div>
                  {/* Shell prompt */}
                  <div className="px-3 py-1 select-none" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: 'rgba(255,255,255,0.01)' }}>
                    <span className="font-mono text-[7px]" style={{ color: 'rgba(74,222,128,0.4)' }}>construx@sys:~$</span>
                    <span className="font-mono text-[7px] ml-1" style={{ color: 'rgba(240,239,255,0.2)' }}>{`cat /journal/${prevPost.slug}`}</span>
                  </div>
                  <div className="px-4 py-3">
                    <span className="text-sm font-semibold text-text-muted group-hover:text-text-base transition-colors leading-snug line-clamp-2">
                      {prevPost.title}
                    </span>
                  </div>
                </Link>
              ) : <div />}
              {nextPost ? (
                <Link
                  href={`/journal/${nextPost.slug}`}
                  className="group flex flex-col overflow-hidden transition-all hover:border-construx/20 text-right sm:items-end"
                  style={{ background: 'rgba(5,5,18,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '3px' }}
                >
                  <div
                    className="flex items-center gap-2 px-3 py-2 select-none w-full"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}
                  >
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF5F57' }} />
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FFBD2E' }} />
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#28C840' }} />
                    </div>
                    <span className="font-mono text-[8px] text-text-dim/40 uppercase tracking-widest flex items-center gap-1.5 flex-1 justify-end">
                      journal.next
                      <ArrowRight size={9} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                  {/* Shell prompt */}
                  <div className="px-3 py-1 select-none w-full" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: 'rgba(255,255,255,0.01)' }}>
                    <span className="font-mono text-[7px]" style={{ color: 'rgba(74,222,128,0.4)' }}>construx@sys:~$</span>
                    <span className="font-mono text-[7px] ml-1" style={{ color: 'rgba(240,239,255,0.2)' }}>{`cat /journal/${nextPost.slug}`}</span>
                  </div>
                  <div className="px-4 py-3 w-full">
                    <span className="text-sm font-semibold text-text-muted group-hover:text-text-base transition-colors leading-snug line-clamp-2">
                      {nextPost.title}
                    </span>
                  </div>
                </Link>
              ) : <div />}
            </div>
          )}
        </div>

        {/* Venture signal strip */}
        {mentionedVentures.length > 0 && (
          <div
            className="mt-10 overflow-hidden font-mono"
            style={{
              background: 'rgba(0,0,6,0.6)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '4px',
            }}
          >
            {/* title bar */}
            <div
              className="flex items-center gap-3 px-4 py-2.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,8,0.4)' }}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
              </div>
              <span className="flex-1 text-center text-[9px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                venture.signal — mentioned in this dispatch
              </span>
              <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.12)' }}>
                {mentionedVentures.length}
              </span>
            </div>
            {/* Shell prompt */}
            <div className="px-4 py-1.5 select-none" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
              <span className="font-mono text-[9px]" style={{ color: 'rgba(74,222,128,0.4)' }}>construx@sys:~$</span>
              <span className="font-mono text-[9px] ml-1.5" style={{ color: 'rgba(240,239,255,0.22)' }}>{`grep -r "${post.slug}" /var/construx/ventures/ --ventures=${mentionedVentures.length}`}</span>
            </div>
            <div className="flex flex-wrap gap-2 p-4">
              {mentionedVentures.map((v) => (
                <Link
                  key={v.id}
                  href={`/ventures/${v.slug}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 transition-all hover:opacity-100"
                  style={{
                    background: `${v.accent}0d`,
                    border: `1px solid ${v.accent}22`,
                    borderRadius: '2px',
                    opacity: 0.8,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: v.accent }}
                  />
                  <span className="text-[9px] uppercase tracking-widest" style={{ color: `${v.accent}cc` }}>
                    {v.name}
                  </span>
                  <span className="text-[8px]" style={{ color: `${v.accent}55` }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        )}
        </article>
      </div>

      {relatedByTag.length > 0 && (
        <section className="px-5 pb-20 mx-auto max-w-3xl">
          <div
            className="overflow-hidden"
            style={{
              background: 'rgba(3,3,14,0.7)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '3px',
            }}
          >
            {/* Terminal title bar */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 select-none"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
              </div>
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-text-dim/50 flex-1">
                journal.related — {post.tag.toLowerCase()} · {relatedByTag.length} dispatches
              </span>
            </div>
            {/* Shell prompt */}
            <div className="px-4 py-1.5 select-none" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
              <span className="font-mono text-[9px]" style={{ color: 'rgba(74,222,128,0.4)' }}>construx@sys:~$</span>
              <span className="font-mono text-[9px] ml-1.5" style={{ color: 'rgba(240,239,255,0.22)' }}>{`journal --related --tag="${post.tag}" --exclude=${post.slug} --limit=${relatedByTag.length}`}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
              {relatedByTag.map((related) => (
                <Link
                  key={related.slug}
                  href={`/journal/${related.slug}`}
                  className="group flex flex-col gap-2 px-5 py-5 transition-all hover:bg-subtle"
                  style={{ background: 'rgba(3,3,14,0.7)' }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-[9px] font-medium px-2 py-0.5 text-construx uppercase tracking-widest"
                      style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.18)', borderRadius: '2px' }}
                    >
                      {related.tag}
                    </span>
                    <span className="font-mono text-[10px] text-text-dim">{related.readingTime} min</span>
                  </div>
                  <p className="text-sm font-semibold text-text-muted group-hover:text-text-base transition-colors leading-snug line-clamp-2">
                    {related.title}
                  </p>
                  <p className="text-xs text-text-muted leading-relaxed line-clamp-2 opacity-60">
                    {related.excerpt}
                  </p>
                </Link>
              ))}
            </div>
            {/* Status footer */}
            <div
              className="flex items-center justify-between px-5 py-1.5 select-none"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.3)' }}
            >
              <span className="font-mono text-[8px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
                {relatedByTag.length} dispatch{relatedByTag.length !== 1 ? 'es' : ''} / tag: {post.tag.toLowerCase()}
              </span>
              <span className="font-mono text-[8px] flex items-center gap-1.5" style={{ color: 'rgba(249,115,22,0.4)' }}>
                <span className="inline-block w-1 h-1 rounded-full" style={{ background: 'rgba(249,115,22,0.7)' }} />
                indexed
              </span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
