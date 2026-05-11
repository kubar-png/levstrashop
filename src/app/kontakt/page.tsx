export const metadata = { title: 'Kontakt — Levstra' };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Spojte se s námi</p>
      <h1 className="mt-2 text-5xl font-medium">Kontakt</h1>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">E-mail</h2>
          <a
            href="mailto:info@levstra.cz"
            className="mt-2 block text-2xl font-medium text-neutral-900 hover:underline"
          >
            info@levstra.cz
          </a>
          <p className="mt-2 text-sm text-neutral-600">Odpovídáme v pracovní dny do 24 hodin.</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">Instagram</h2>
          <a
            href="https://instagram.com/levstra"
            target="_blank"
            rel="noreferrer"
            className="mt-2 block text-2xl font-medium text-neutral-900 hover:underline"
          >
            @levstra
          </a>
          <p className="mt-2 text-sm text-neutral-600">Novinky a zákulisí.</p>
        </div>
      </div>

      <p className="mt-10 text-sm text-neutral-500">
        Levstra s.r.o. · IČO: 27686281 · DIČ: CZ27686281 · Hněvkovského 587/39a, 617 00 Brno
      </p>
    </div>
  );
}
