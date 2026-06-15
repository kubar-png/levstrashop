import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Ciaobag — Cestujte se stylem';
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
          background: '#1f4537',
          position: 'relative',
          fontFamily: 'serif',
        }}
      >
        {/* Diagonal cream wedge — adds depth like a sunlit photo */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(115deg, rgba(242,240,235,0.06) 0%, rgba(242,240,235,0.18) 35%, rgba(31,69,55,0) 60%)',
            display: 'flex',
          }}
        />

        {/* Soft vignette at the bottom — same trick the hero photo uses */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.45) 100%)',
            display: 'flex',
          }}
        />

        {/* Lime star accent — top right */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            right: 80,
            width: 140,
            height: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            viewBox="0 0 32 32"
            width="140"
            height="140"
            fill="#e1f861"
            style={{ display: 'block', opacity: 0.92 }}
          >
            <path d="M16 2c1.5 5.2 4.3 8 9.5 9.5C20.3 13 17.5 15.8 16 21c-1.5-5.2-4.3-8-9.5-9.5C11.7 10 14.5 7.2 16 2Z" />
            <path d="M16 11c1.5 5.2 4.3 8 9.5 9.5C20.3 22 17.5 24.8 16 30c-1.5-5.2-4.3-8-9.5-9.5C11.7 19 14.5 16.2 16 11Z" />
          </svg>
        </div>

        {/* Content block — bottom left, mirrors the hero's layout */}
        <div
          style={{
            position: 'absolute',
            left: 80,
            right: 80,
            bottom: 80,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Wordmark + brand tag */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              marginBottom: 36,
            }}
          >
            <svg viewBox="0 0 32 32" width="48" height="48" fill="#f2f0eb">
              <path d="M16 2c1.5 5.2 4.3 8 9.5 9.5C20.3 13 17.5 15.8 16 21c-1.5-5.2-4.3-8-9.5-9.5C11.7 10 14.5 7.2 16 2Z" opacity="0.92" />
              <path d="M16 11c1.5 5.2 4.3 8 9.5 9.5C20.3 22 17.5 24.8 16 30c-1.5-5.2-4.3-8-9.5-9.5C11.7 19 14.5 16.2 16 11Z" opacity="0.92" />
            </svg>
            <div
              style={{
                fontSize: 44,
                color: '#f2f0eb',
                fontFamily: 'serif',
                letterSpacing: -1,
                lineHeight: 1,
              }}
            >
              ciaobag
            </div>
          </div>

          {/* Headline — mirrors the home hero */}
          <div
            style={{
              fontSize: 138,
              color: '#ffffff',
              fontWeight: 600,
              letterSpacing: -5,
              lineHeight: 1,
              fontFamily: 'sans-serif',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>Cestujte se</span>
            <span>stylem.</span>
          </div>

          {/* Tagline — serif, matches the hero subhead */}
          <div
            style={{
              marginTop: 36,
              fontSize: 32,
              color: 'rgba(242,240,235,0.85)',
              fontFamily: 'serif',
              maxWidth: 820,
              lineHeight: 1.3,
              display: 'flex',
            }}
          >
            Kufry a kabelky, které zvládnou letiště i večerní rande
          </div>

          {/* Bottom row: lime CTA pill + URL */}
          <div
            style={{
              marginTop: 44,
              display: 'flex',
              alignItems: 'center',
              gap: 24,
            }}
          >
            <div
              style={{
                background: '#e1f861',
                color: '#2b312f',
                padding: '14px 30px',
                borderRadius: 999,
                fontSize: 26,
                fontWeight: 600,
                letterSpacing: -0.4,
                fontFamily: 'sans-serif',
                display: 'flex',
              }}
            >
              Nakupovat
            </div>
            <div
              style={{
                fontSize: 26,
                color: 'rgba(242,240,235,0.7)',
                fontFamily: 'sans-serif',
                letterSpacing: 1,
                display: 'flex',
              }}
            >
              ciaobag.cz
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
