import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-6 py-12 text-sm text-neutral-600">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-3 text-base font-semibold tracking-[0.2em] text-neutral-900">
              LEVSTRA
            </div>
            <p>Módu dovážíme už přes dvě desetiletí.</p>
          </div>
          <div>
            <div className="mb-3 font-medium text-neutral-900">E-shop</div>
            <ul className="space-y-1.5">
              <li><Link href="/shop/kabelky">Kabelky</Link></li>
              <li><Link href="/shop/kufry">Kufry</Link></li>
              <li><Link href="/shop">Vše</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 font-medium text-neutral-900">Podpora</div>
            <ul className="space-y-1.5">
              <li><Link href="/doprava">Doprava (PPL)</Link></li>
              <li><Link href="/vraceni">Vrácení</Link></li>
              <li><Link href="/kontakt">Kontakt</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 font-medium text-neutral-900">Sledujte nás</div>
            <ul className="space-y-1.5">
              <li>
                <a href="https://instagram.com/levstra" target="_blank" rel="noreferrer">
                  Instagram @levstra
                </a>
              </li>
              <li><Link href="/studio">Sanity Studio</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-neutral-200 pt-6 text-xs">
          © {new Date().getFullYear()} Levstra. Všechna práva vyhrazena.
        </div>
      </div>
    </footer>
  );
}
