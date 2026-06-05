import { ImageResponse } from 'next/og';
import { getPostBySlug, getAllPostMeta } from '@/lib/posts';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateImageMetadata() {
  return getAllPostMeta().map((p) => ({
    id: p.slug,
    alt: p.title,
    size,
    contentType,
  }));
}

export default async function JournalPostOGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const title = post?.title ?? 'Journal';
  const excerpt = post?.excerpt ?? '';
  const tag = post?.tag ?? 'Journal';
  const author = post?.author ?? 'Construx Group';

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#000008',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '72px 96px',
          position: 'relative',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(249,115,22,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.05) 1px,transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        {/* Radial glow */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            left: -200,
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,115,22,0.14), transparent 65%)',
          }}
        />
        {/* Top stripe */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #F97316, transparent)',
          }}
        />

        {/* Breadcrumb */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'rgba(240,239,255,0.3)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            marginBottom: 36,
          }}
        >
          // CONSTRUX.SYS › JOURNAL
        </div>

        {/* Tag + Author */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#F97316',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              background: 'rgba(249,115,22,0.12)',
              border: '1px solid rgba(249,115,22,0.25)',
              padding: '4px 12px',
              borderRadius: 2,
            }}
          >
            {tag}
          </span>
          <span
            style={{
              fontSize: 12,
              color: 'rgba(240,239,255,0.35)',
              letterSpacing: '0.1em',
            }}
          >
            {author}
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 50 ? 50 : 60,
            fontWeight: 700,
            color: '#F0EFFF',
            lineHeight: 1.08,
            letterSpacing: '-0.025em',
            marginBottom: 28,
            maxWidth: 900,
          }}
        >
          {title}
        </div>

        {/* Excerpt */}
        {excerpt && (
          <div
            style={{
              fontSize: 20,
              color: 'rgba(240,239,255,0.45)',
              lineHeight: 1.5,
              maxWidth: 760,
            }}
          >
            {excerpt}
          </div>
        )}

        {/* Bottom badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 44,
            right: 96,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              background: '#F97316',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              color: '#000000',
              letterSpacing: '0.06em',
            }}
          >
            CX
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'rgba(240,239,255,0.3)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Construx Group Journal
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
