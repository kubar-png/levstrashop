import { Eyebrow, Card } from '@/components/ui';

export const metadata = { title: 'Cookies — Levstra' };

const CATEGORIES = [
  {
    title: '1. Nezbytné',
    body: 'Drží váš košík a relaci. Bez nich e-shop nefunguje. Nelze je vypnout.',
  },
  {
    title: '2. Analytické',
    body:
      'Měříme návštěvnost (např. Plausible nebo Vercel Analytics) — anonymně, bez sledování ' +
      'jednotlivců. Tyto cookies se nastaví pouze s vaším souhlasem.',
  },
  {
    title: '3. Marketingové',
    body:
      'Aktuálně žádné neukládáme. Pokud někdy přidáme remarketing, budeme se nejdřív znovu ' +
      'ptát.',
  },
];

export default function CookiesPage() {
  return (
    <div
      className="mx-auto max-w-3xl px-6"
      style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}
    >
      <Eyebrow>Informace</Eyebrow>
      <h1
        className="mt-2 font-poppins-semibold leading-[1.05]"
        style={{
          fontSize: 'var(--text-h1)',
          color: 'var(--color-forest)',
          letterSpacing: '-0.03em',
        }}
      >
        Cookies
      </h1>

      <div
        className="mt-10 space-y-6"
        style={{ color: 'var(--color-ink)', fontSize: 'var(--text-body)', lineHeight: 1.7 }}
      >
        <p>
          Tento web používá soubory cookies (malé textové soubory uložené ve vašem prohlížeči)
          ke třem účelům:
        </p>

        {CATEGORIES.map((c) => (
          <Card key={c.title} padding="lg">
            <h2
              className="font-poppins-semibold"
              style={{
                fontSize: 'var(--text-h3)',
                color: 'var(--color-forest)',
                letterSpacing: '-0.02em',
              }}
            >
              {c.title}
            </h2>
            <p className="mt-2" style={{ fontSize: 'var(--text-small)' }}>
              {c.body}
            </p>
          </Card>
        ))}

        <p
          style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}
        >
          Souhlas můžete kdykoli změnit smazáním cookies pro tento web v nastavení prohlížeče.
        </p>
      </div>
    </div>
  );
}
