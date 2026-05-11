import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="bg-[var(--color-forest)] text-neutral-100" style={{ background: '#1f3528' }}>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M6 7h12l-1.4 11.2A2 2 0 0 1 14.6 20H9.4a2 2 0 0 1-2-1.8L6 7Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 7V5a3 3 0 0 1 6 0v2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="text-xl font-semibold tracking-[0.18em]">LEVSTRA</span>
            </Link>
            <p className="mt-5 max-w-xs text-sm text-neutral-300">
              Kufry a kabelky Marina Galanti. Módu dovážíme už přes dvě desetiletí.
            </p>
          </div>

          <Column title="Obchod">
            <li><Link href="/">Domů</Link></li>
            <li><Link href="/o-nas">O nás</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/kontakt">Kontakt</Link></li>
          </Column>

          <Column title="Podmínky">
            <li><Link href="/obchodni-podminky">Obchodní podmínky</Link></li>
            <li><Link href="/gdpr">Ochrana osobních údajů</Link></li>
            <li><Link href="/vraceni">Vrácení zboží</Link></li>
            <li><Link href="/doprava">Doprava</Link></li>
            <li><Link href="/cookies">Cookies</Link></li>
          </Column>

          <Column title="Kontakt">
            <li>Levstra s.r.o.</li>
            <li><a href="mailto:info@levstra.cz" className="hover:underline">info@levstra.cz</a></li>
            <li>+420 000 000 000</li>
          </Column>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-neutral-400 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} Levstra. Vyrobeno svépomocí.</div>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/levstra"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="hover:text-white"
            >
              <SocialIcon name="instagram" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="hover:text-white"
            >
              <SocialIcon name="facebook" />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              className="hover:text-white"
            >
              <SocialIcon name="tiktok" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-white">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm text-neutral-300 [&_a]:transition [&_a]:hover:text-white">
        {children}
      </ul>
    </div>
  );
}

function SocialIcon({ name }: { name: 'instagram' | 'facebook' | 'tiktok' }) {
  switch (name) {
    case 'instagram':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
        </svg>
      );
    case 'facebook':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M14 9.5h2.5l.5-3H14V5a1.5 1.5 0 0 1 1.5-1.5H17V1h-2.5A4 4 0 0 0 10.5 5v1.5H8v3h2.5V20H14V9.5Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'tiktok':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19 8.5a6 6 0 0 1-3.6-1.2v7.4a5.4 5.4 0 1 1-5.4-5.4c.3 0 .6 0 .9.1v3a2.5 2.5 0 1 0 1.8 2.4V2h2.7a3.3 3.3 0 0 0 3.3 3.3h.3v3.2Z" />
        </svg>
      );
  }
}
