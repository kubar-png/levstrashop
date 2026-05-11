import { Eyebrow, Banner } from '@/components/ui';

export const metadata = { title: 'Ochrana osobních údajů — Levstra' };

export default function GdprPage() {
  const h2Style = {
    fontSize: 'var(--text-h3)',
    color: 'var(--color-forest)',
    letterSpacing: '-0.02em',
  } as const;

  return (
    <div
      className="mx-auto max-w-3xl px-6"
      style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}
    >
      <Eyebrow>Právní</Eyebrow>
      <h1
        className="mt-2 font-poppins-semibold leading-[1.05]"
        style={{
          fontSize: 'var(--text-h1)',
          color: 'var(--color-forest)',
          letterSpacing: '-0.03em',
        }}
      >
        Ochrana osobních údajů
      </h1>
      <p
        className="mt-3"
        style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}
      >
        Naposledy aktualizováno: 11. 5. 2026
      </p>

      <div className="mt-6">
        <Banner title="VZOR — čeká na právní kontrolu">
          Tento dokument je pracovní šablona. Před spuštěním e-shopu jej nechte
          zkontrolovat právníkem.
        </Banner>
      </div>

      <article
        className="mt-10 space-y-8"
        style={{ color: 'var(--color-ink)', fontSize: 'var(--text-body)', lineHeight: 1.7 }}
      >
        <section>
          <h2 className="font-poppins-semibold" style={h2Style}>1. Správce údajů</h2>
          <p className="mt-2">
            Správcem osobních údajů je Levstra s.r.o., IČO: 27686281, se sídlem Hněvkovského 587/39a, Komárov, 617 00 Brno,
            e-mail: info@levstra.cz. Při zpracování postupujeme v souladu s nařízením (EU)
            2016/679 (GDPR) a zákonem č. 110/2019 Sb.
          </p>
        </section>

        <section>
          <h2 className="font-poppins-semibold" style={h2Style}>2. Jaké údaje zpracováváme</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Identifikační údaje (jméno, e-mail, telefon, adresa)</li>
            <li>Platební údaje (zpracovává poskytovatel platební brány Stripe — my je nevidíme)</li>
            <li>Údaje o objednávkách a vrácení</li>
            <li>Provozní údaje (IP adresa, log soubory)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-poppins-semibold" style={h2Style}>3. Účel zpracování</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Plnění kupní smlouvy a doručení zboží (právní základ: smlouva)</li>
            <li>Vystavení daňového dokladu (právní základ: zákonná povinnost)</li>
            <li>Reklamace a vyřízení vrácení (smlouva)</li>
            <li>Měření návštěvnosti webu (oprávněný zájem / souhlas)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-poppins-semibold" style={h2Style}>4. Komu údaje předáváme</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>PPL — pro doručení zásilky</li>
            <li>Stripe — pro zpracování platby</li>
            <li>Vercel / Sanity — hosting a databáze (servery v EU/USA s odpovídajícími zárukami)</li>
            <li>Účetní firma — pro vedení účetnictví</li>
          </ul>
        </section>

        <section>
          <h2 className="font-poppins-semibold" style={h2Style}>5. Doba uchování</h2>
          <p className="mt-2">
            Údaje o objednávkách uchováváme po dobu 10 let (daňová povinnost). Provozní logy 6
            měsíců. Souhlasy do jejich odvolání.
          </p>
        </section>

        <section>
          <h2 className="font-poppins-semibold" style={h2Style}>6. Vaše práva</h2>
          <p className="mt-2">
            Máte právo na přístup, opravu, výmaz, omezení zpracování, přenositelnost údajů a
            právo vznést námitku. Žádosti zasílejte na{' '}
            <a className="underline" href="mailto:info@levstra.cz" style={{ color: 'var(--color-forest)' }}>
              info@levstra.cz
            </a>
            . Stížnost můžete podat u Úřadu pro ochranu osobních údajů (www.uoou.cz).
          </p>
        </section>
      </article>
    </div>
  );
}
