import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import { NewsletterSignup } from './NewsletterSignup';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: 'var(--color-forest)' }}>
      {/* ── Link columns ── */}
      <div className="px-8 pt-14 md:px-14 md:pt-16">
        <div className="flex flex-col gap-10 sm:flex-row sm:gap-16 md:gap-20">
          {/* Obchod + Podmínky sit side-by-side on mobile (saves vertical
              height); sm:contents flattens this wrapper so the rest of the
              layout stays identical on tablet/desktop. */}
          <div className="grid grid-cols-2 gap-8 sm:contents">
            <FooterColumn title="Obchod">
              <li><Link href="/">Domů</Link></li>
              <li><Link href="/o-nas">O nás</Link></li>
              <li><Link href="/shop">E-shop</Link></li>
              <li><Link href="/blog">Blog</Link></li>
            </FooterColumn>

            <FooterColumn title="Podmínky">
              <li><Link href="/obchodni-podminky">Obchodní podmínky</Link></li>
              <li><Link href="/gdpr">Ochrana osobních údajů</Link></li>
              <li><Link href="/vraceni">Reklamace a vrácení</Link></li>
              <li><Link href="/doprava">Doprava a platba</Link></li>
              <li><Link href="/cookies">Cookies</Link></li>
            </FooterColumn>
          </div>

          <FooterColumn title="Kontakt">
            <li>Levstra s.r.o.</li>
            <li>IČO: 27686281 · DIČ: CZ27686281</li>
            <li>Hněvkovského 587/39a, 617 00 Brno</li>
            <li>
              <a href="mailto:ahoj@ciaobag.cz" className="hover:underline transition">
                ahoj@ciaobag.cz
              </a>
            </li>
            <li>
              <a href="https://www.levstra.cz" target="_blank" rel="noreferrer" className="hover:underline transition">
                www.levstra.cz
              </a>
            </li>
          </FooterColumn>

          <div className="min-w-[260px] flex-1">
            <NewsletterSignup />
          </div>
        </div>
      </div>

      {/* ── Bottom bar: logo left, socials + copyright right ── */}
      <div className="mt-20 flex items-end justify-between px-8 pb-6 md:mt-28 md:px-14 md:pb-7">
        <Link href="/" className="flex items-center text-white hover:opacity-80 transition">
          <BrandLogo style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }} />
        </Link>

        <div className="flex flex-col items-end gap-4">
          <div className="flex items-center gap-5">
            <a href="https://instagram.com/levstra" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-white hover:opacity-70 transition">
              <IgIcon />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="text-white hover:opacity-70 transition">
              <FbIcon />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok" className="text-white hover:opacity-70 transition">
              <TkIcon />
            </a>
          </div>
          <p
            className="font-poppins-light text-right"
            style={{ color: 'rgba(255,255,255,0.72)', fontSize: 'var(--text-small)' }}
          >
            © {year} Ciaobag · provozovatelem e-shopu ciaobag.cz je{' '}
            <a
              href="https://www.levstra.cz"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-dotted underline-offset-2 hover:decoration-solid transition"
            >
              Levstra s.r.o.
            </a>
          </p>
        </div>
      </div>

      {/* ── Studio credit — playful agency-tag line, centered under everything ── */}
      <div
        className="border-t px-8 py-5 text-center md:px-14"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <a
          href="https://studiojakub.cz"
          target="_blank"
          rel="noreferrer"
          className="font-serif inline-flex items-center gap-1.5 italic underline decoration-dotted underline-offset-[3px] transition-colors hover:text-white hover:decoration-solid"
          style={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: 'var(--text-micro)',
            letterSpacing: '0.01em',
          }}
        >
          fatto a mano od Jakuba, léta páně 2026
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="opacity-70">
            <path
              d="M4 3h5v5M9 3L3 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-[120px]">
      <h3
        className="font-poppins-semibold text-white"
        style={{ fontSize: 'var(--text-small)', letterSpacing: '0.04em', textTransform: 'uppercase' }}
      >
        {title}
      </h3>
      <ul
        className="mt-3.5 space-y-1.5 font-poppins-regular [&_a]:transition [&_a]:hover:opacity-100"
        style={{ fontSize: 'var(--text-small)', color: 'rgba(255,255,255,0.82)', lineHeight: 1.6 }}
      >
        {children}
      </ul>
    </div>
  );
}

function IgIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function FbIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 9.5h2.5l.5-3H14V5a1.5 1.5 0 0 1 1.5-1.5H17V1h-2.5A4 4 0 0 0 10.5 5v1.5H8v3h2.5V20H14V9.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function TkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 8.5a6 6 0 0 1-3.6-1.2v7.4a5.4 5.4 0 1 1-5.4-5.4c.3 0 .6 0 .9.1v3a2.5 2.5 0 1 0 1.8 2.4V2h2.7a3.3 3.3 0 0 0 3.3 3.3h.3v3.2Z" />
    </svg>
  );
}
