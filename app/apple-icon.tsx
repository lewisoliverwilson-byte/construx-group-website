import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#000008',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            background: '#F97316',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, sans-serif',
            fontSize: 42,
            fontWeight: 700,
            color: '#000000',
            letterSpacing: '0.04em',
          }}
        >
          CX
        </div>
      </div>
    ),
    { ...size },
  );
}
