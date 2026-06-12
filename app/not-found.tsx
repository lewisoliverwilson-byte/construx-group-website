import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getAllPostMeta } from '@/lib/posts';

export const metadata: Metadata = {
  title: '404 — Not Found',
  description: 'The page you requested could not be located.',
};

export default function NotFound() {
  const recentPosts = getAllPostMeta().slice(0, 3);
  return (
    <div className="min-h-screen flex flex-col justify-center pt-32 pb-20">
      <div className="mx-auto w-full max-w-4xl px-6 lg:px-10">
        <div className="flex items-center gap-4 mb-8">
          <span className="reg-mark" />
          <p className="t-eyebrow">Error 404</p>
        </div>

        <h1 className="t-hero mb-8" style={{ fontSize: 'clamp(2.6rem,6vw,5rem)' }}>
          This page isn&apos;t
          <br />
          on the drawing.
        </h1>

        <div className="title-rule mb-8" style={{ maxWidth: 320 }} />

        <p className="t-lead mb-12" style={{ maxWidth: '44ch' }}>
          The route doesn&apos;t exist — moved, retired, or never drawn. Head back to
          a known coordinate.
        </p>

        <div className="flex flex-wrap items-center gap-5 mb-20">
          <Link href="/" className="btn-ink">
            <ArrowLeft size={12} /> Back to the studio
          </Link>
          <Link href="/ventures" className="btn-text">
            Project index <ArrowRight size={11} />
          </Link>
        </div>

        {recentPosts.length > 0 && (
          <div>
            <p className="t-eyebrow mb-5" style={{ fontSize: 9.5 }}>Or read something</p>
            <div className="border-t" style={{ borderColor: 'var(--hairline)' }}>
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/journal/${post.slug}`}
                  className="group flex items-baseline gap-6 py-3.5 border-b"
                  style={{ borderColor: 'var(--hairline)' }}
                >
                  <span className="t-meta flex-shrink-0" style={{ fontSize: 9.5 }}>{post.date}</span>
                  <span
                    className="font-serif-body text-[15px] group-hover:underline truncate"
                    style={{ color: 'var(--ink-muted)', textDecorationColor: 'var(--orange)', textUnderlineOffset: 3 }}
                  >
                    {post.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
