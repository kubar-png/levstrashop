export const metadata = { title: 'Cookies — Levstra' };

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Informace</p>
      <h1 className="font-display mt-2 text-5xl font-medium">Cookies</h1>

      <div className="mt-10 space-y-6 text-neutral-700">
        <p>
          Tento web používá soubory cookies (malé textové soubory uložené ve vašem prohlížeči)
          ke třem účelům:
        </p>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="font-medium">1. Nezbytné</h2>
          <p className="mt-2 text-sm">
            Drží váš košík a relaci. Bez nich e-shop nefunguje. Nelze je vypnout.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="font-medium">2. Analytické</h2>
          <p className="mt-2 text-sm">
            Měříme návštěvnost (např. Plausible nebo Vercel Analytics) — anonymně, bez sledování
            jednotlivců. Tyto cookies se nastaví pouze s vaším souhlasem.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="font-medium">3. Marketingové</h2>
          <p className="mt-2 text-sm">
            Aktuálně žádné neukládáme. Pokud někdy přidáme remarketing, budeme se nejdřív znovu
            ptát.
          </p>
        </div>

        <p className="text-sm text-neutral-500">
          Souhlas můžete kdykoli změnit smazáním cookies pro tento web v nastavení prohlížeče.
        </p>
      </div>
    </div>
  );
}
