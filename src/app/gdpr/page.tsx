export const metadata = { title: 'Ochrana osobních údajů — Levstra' };

export default function GdprPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Právní</p>
      <h1 className="font-display mt-2 text-5xl font-medium">Ochrana osobních údajů</h1>
      <p className="mt-3 text-sm text-neutral-500">
        <strong>VZOR — před spuštěním nechte zkontrolovat právníkem.</strong>
      </p>

      <article className="mt-10 space-y-8 text-neutral-800">
        <section>
          <h2 className="font-display text-2xl font-medium">1. Správce údajů</h2>
          <p className="mt-2">
            Správcem osobních údajů je Levstra s.r.o., IČO: 00000000, se sídlem [adresa],
            e-mail: info@levstra.cz. Při zpracování postupujeme v souladu s nařízením (EU)
            2016/679 (GDPR) a zákonem č. 110/2019 Sb.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-medium">2. Jaké údaje zpracováváme</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Identifikační údaje (jméno, e-mail, telefon, adresa)</li>
            <li>Platební údaje (zpracovává poskytovatel platební brány Stripe — my je nevidíme)</li>
            <li>Údaje o objednávkách a vrácení</li>
            <li>Provozní údaje (IP adresa, log soubory)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-medium">3. Účel zpracování</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Plnění kupní smlouvy a doručení zboží (právní základ: smlouva)</li>
            <li>Vystavení daňového dokladu (právní základ: zákonná povinnost)</li>
            <li>Reklamace a vyřízení vrácení (smlouva)</li>
            <li>Měření návštěvnosti webu (oprávněný zájem / souhlas)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-medium">4. Komu údaje předáváme</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>PPL — pro doručení zásilky</li>
            <li>Stripe — pro zpracování platby</li>
            <li>Vercel / Sanity — hosting a databáze (servery v EU/USA s odpovídajícími zárukami)</li>
            <li>Účetní firma — pro vedení účetnictví</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-medium">5. Doba uchování</h2>
          <p className="mt-2">
            Údaje o objednávkách uchováváme po dobu 10 let (daňová povinnost). Provozní logy 6
            měsíců. Souhlasy do jejich odvolání.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-medium">6. Vaše práva</h2>
          <p className="mt-2">
            Máte právo na přístup, opravu, výmaz, omezení zpracování, přenositelnost údajů a
            právo vznést námitku. Žádosti zasílejte na <a className="underline" href="mailto:info@levstra.cz">info@levstra.cz</a>.
            Stížnost můžete podat u Úřadu pro ochranu osobních údajů (www.uoou.cz).
          </p>
        </section>
      </article>
    </div>
  );
}
