import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon512() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: '#000008',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 72,
        }}
      >
        <div
          style={{
            width: 320,
            height: 320,
            background: '#F97316',
            borderRadius: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 128,
            fontWeight: 700,
            color: '#000000',
            letterSpacing: '0.04em',
            boxShadow: '0 0 120px rgba(249,115,22,0.7)',
          }}
        >
          CX
        </div>
      </div>
    ),
    { ...size },
  );
}
