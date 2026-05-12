import Link from 'next/link';
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
            <li>Levstra s.r.o. · IČO: 27686281</li>
            <li>Hněvkovského 587/39a</li>
            <li>617 00 Brno</li>
            <li>
              <a href="mailto:info@levstra.cz" className="hover:underline transition">
                info@levstra.cz
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
        <Link href="/" className="flex items-center gap-3 text-white hover:opacity-80 transition">
          <LogoMark />
          <span
            className="font-serif leading-none"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
          >
            levstra
          </span>
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
            className="font-poppins-light"
            style={{ color: 'rgba(255,255,255,0.72)', fontSize: 'var(--text-small)' }}
          >
            © {year} by Levstra.
          </p>
        </div>
      </div>

      {/* ── Studio credit — playful agency-tag line, centered under everything ── */}
      <div
        className="border-t px-8 py-5 text-center md:px-14"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <a
          href="https://larp.solutions"
          target="_blank"
          rel="noreferrer"
          className="font-serif inline-flex items-center gap-1.5 italic transition-colors hover:text-white"
          style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: 'var(--text-micro)',
            letterSpacing: '0.01em',
          }}
        >
          uplácáno v larpu, léta páně {year}
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

function LogoMark() {
  return (
    <span className="inline-flex items-center justify-center" aria-hidden="true">
      <svg viewBox="0 0 32 32" width="36" height="36" fill="currentColor">
        <path d="M16 2c1.5 5.2 4.3 8 9.5 9.5C20.3 13 17.5 15.8 16 21c-1.5-5.2-4.3-8-9.5-9.5C11.7 10 14.5 7.2 16 2Z" opacity="0.92" />
        <path d="M16 11c1.5 5.2 4.3 8 9.5 9.5C20.3 22 17.5 24.8 16 30c-1.5-5.2-4.3-8-9.5-9.5C11.7 19 14.5 16.2 16 11Z" opacity="0.92" />
      </svg>
    </span>
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
