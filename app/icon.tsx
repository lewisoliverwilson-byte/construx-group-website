import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#F97316',
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          fontSize: 12,
          fontWeight: 700,
          color: '#000000',
          letterSpacing: '0.06em',
        }}
      >
        CX
      </div>
    ),
    { ...size },
  );
}
