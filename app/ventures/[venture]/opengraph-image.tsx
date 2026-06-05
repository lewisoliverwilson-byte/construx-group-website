import { ImageResponse } from 'next/og';
import { getVentureBySlug, ventures } from '@/lib/ventures';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateImageMetadata() {
  return ventures.map((v) => ({
    id: v.slug,
    alt: `${v.name} — ${v.tagline}`,
    size,
    contentType,
  }));
}

export default async function VentureOGImage({
  params,
}: {
  params: Promise<{ venture: string }>;
}) {
  const { venture: slug } = await params;
  const venture = getVentureBySlug(slug);

  const accent = venture?.accent ?? '#F97316';
  const name = venture?.name ?? 'Construx Group';
  const tagline = venture?.tagline ?? 'AI-First Ventures';
  const category = venture?.category ?? '';
  const stats = venture?.stats.slice(0, 4) ?? [];

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
        {/* Accent grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(${accent}10 1px,transparent 1px),linear-gradient(90deg,${accent}10 1px,transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
        {/* Radial glow */}
        <div
          style={{
            position: 'absolute',
            top: -240,
            left: -120,
            width: 900,
            height: 900,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${accent}22, transparent 65%)`,
          }}
        />
        {/* Top accent stripe */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
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
            marginBottom: 40,
          }}
        >
          // CONSTRUX.SYS › {slug.toUpperCase()}
        </div>

        {/* Planet orb + name row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 24 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, ${accent}dd, ${accent}44)`,
              boxShadow: `0 0 40px ${accent}55`,
              flexShrink: 0,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {category && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: accent,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  background: `${accent}14`,
                  border: `1px solid ${accent}28`,
                  padding: '3px 10px',
                  borderRadius: 2,
                }}
              >
                {category}
              </span>
            )}
            <span
              style={{
                fontSize: 64,
                fontWeight: 700,
                color: '#F0EFFF',
                lineHeight: 1.0,
                letterSpacing: '-0.025em',
              }}
            >
              {name}
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: accent,
            marginBottom: 36,
            letterSpacing: '-0.01em',
          }}
        >
          {tagline}
        </div>

        {/* Stats row */}
        {stats.length > 0 && (
          <div style={{ display: 'flex', gap: 12 }}>
            {stats.map((s) => (
              <div
                key={s.label}
                style={{
                  padding: '10px 18px',
                  background: `${accent}10`,
                  border: `1px solid ${accent}22`,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <span
                  style={{ fontSize: 20, fontWeight: 700, color: accent }}
                >
                  {s.value}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: 'rgba(240,239,255,0.35)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                  }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom: Construx Group badge */}
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
            Construx Group
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
