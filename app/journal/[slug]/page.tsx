import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function JournalPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen">
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

          <div className="flex items-center gap-3 mb-4">
            <span
              className="font-mono text-[9px] font-medium px-2 py-0.5 text-construx uppercase tracking-widest"
              style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '2px' }}
            >
              {post.tag}
            </span>
            <span className="font-mono text-[10px] text-text-dim">{post.author}</span>
            <span className="text-text-dim text-xs">·</span>
            <time dateTime={post.date} className="font-mono text-[10px] text-text-dim">
              {formatDate(post.date)}
            </time>
          </div>

          <h1 className="text-display-sm text-text-base mb-5 leading-tight">
            {post.title}
          </h1>
          <p className="text-text-muted leading-relaxed text-base max-w-2xl">
            {post.excerpt}
          </p>
        </div>
      </section>

      {/* Post body */}
      <article className="px-5 py-16 mx-auto max-w-3xl">
        <div className="prose-construx">
          <MDXRemote source={post.content} />
        </div>

        {/* Footer */}
        <div className="mt-20 pt-10 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
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
            MORE FROM THE JOURNAL
          </Link>
        </div>
      </article>
    </div>
  );
}
