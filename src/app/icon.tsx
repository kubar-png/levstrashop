import { ImageResponse } from 'next/og';

// Brand mark (sparkle from BrandLogo) as a generated PNG icon — lime on forest.
export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1f4537',
        }}
      >
        <svg viewBox="0 0 32 32" width="46" height="46" fill="#e1f861">
          <path d="M16 2c1.5 5.2 4.3 8 9.5 9.5C20.3 13 17.5 15.8 16 21c-1.5-5.2-4.3-8-9.5-9.5C11.7 10 14.5 7.2 16 2Z" />
          <path d="M16 11c1.5 5.2 4.3 8 9.5 9.5C20.3 22 17.5 24.8 16 30c-1.5-5.2-4.3-8-9.5-9.5C11.7 19 14.5 16.2 16 11Z" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
