import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Levstra — Cestujte se stylem';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fdf6f0 0%, #f0c8a8 100%)',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 8,
            color: '#c46a3d',
            textTransform: 'uppercase',
          }}
        >
          LEVSTRA
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 110,
            color: '#171210',
            fontWeight: 600,
            letterSpacing: -2,
          }}
        >
          Cestujte se stylem.
        </div>
        <div
          style={{
            marginTop: 30,
            fontSize: 28,
            color: '#4a3a30',
            maxWidth: 900,
            textAlign: 'center',
          }}
        >
          Kabelky a kufry Marina Galanti
        </div>
      </div>
    ),
    size,
  );
}
