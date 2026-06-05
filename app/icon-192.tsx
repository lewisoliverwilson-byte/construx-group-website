import { ImageResponse } from 'next/og';

export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

export default function Icon192() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: '#000008',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 28,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            background: '#F97316',
            borderRadius: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            fontWeight: 700,
            color: '#000000',
            letterSpacing: '0.04em',
            boxShadow: '0 0 48px rgba(249,115,22,0.7)',
          }}
        >
          CX
        </div>
      </div>
    ),
    { ...size },
  );
}
