import { ImageResponse } from 'next/og';

export const alt = 'Construx Group — AI-First Ventures';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
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
          padding: '80px 96px',
          position: 'relative',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(249,115,22,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.06) 1px,transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        {/* Radial glow */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            left: -200,
            width: 800,
            height: 800,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,115,22,0.18), transparent 65%)',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 52 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: '#F97316',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 700,
              color: '#000000',
              letterSpacing: '0.06em',
              boxShadow: '0 0 32px rgba(249,115,22,0.5)',
            }}
          >
            CX
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#F0EFFF',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Construx
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: 'rgba(240,239,255,0.45)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginTop: 2,
              }}
            >
              Group
            </span>
          </div>
        </div>

        {/* Eyebrow */}
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#F97316',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          // AI.FRONTIER
        </div>

        {/* Heading */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: '#F0EFFF',
            lineHeight: 1.0,
            letterSpacing: '-0.03em',
            marginBottom: 28,
            maxWidth: 900,
          }}
        >
          Building at the{' '}
          <span style={{ color: '#F97316' }}>AI frontier</span>
        </div>

        {/* Descriptor */}
        <div
          style={{
            fontSize: 22,
            color: 'rgba(240,239,255,0.5)',
            lineHeight: 1.5,
            maxWidth: 680,
          }}
        >
          A portfolio of AI-first ventures. We build the things that are only
          possible now that AI exists.
        </div>

        {/* Bottom HUD strip */}
        <div
          style={{
            position: 'absolute',
            bottom: 44,
            left: 96,
            right: 96,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {['Scoutr', 'The Marqet', 'The Hyve'].map((name) => (
              <span
                key={name}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'rgba(240,239,255,0.3)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}
              >
                {name}
              </span>
            ))}
          </div>
          <span
            style={{
              fontSize: 11,
              color: 'rgba(240,239,255,0.2)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            ACTIVE.VENTURES: 003
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
