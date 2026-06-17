import { Eyebrow } from '@/components/ui';

export const metadata = {
  title: 'Cookies — Ciaobag',
  description:
    'Zásady používání cookies na ciaobag.cz. Zjistěte, jaké soubory cookies používáme, k čemu slouží a jak si můžete spravovat svůj souhlas.',
  alternates: { canonical: '/cookies' },
};

export default function CookiesPage() {
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
        Zásady používání cookies
      </h1>
      <p
        className="mt-3"
        style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}
      >
        Naposledy aktualizováno: 15. 6. 2026
      </p>

      <article
        className="mt-10 space-y-8"
        style={{ color: 'var(--color-ink)', fontSize: 'var(--text-body)', lineHeight: 1.7 }}
      >
        <section>
          <h2 className="font-poppins-semibold" style={h2Style}>1. Co jsou cookies</h2>
          <p className="mt-2">
            Cookies jsou malé textové soubory, které se při návštěvě webu ukládají do vašeho
            prohlížeče. Slouží k zajištění správného fungování e-shopu, zapamatování vašich
            preferencí a — s vaším souhlasem — k měření návštěvnosti. Vedle samotných cookies
            používáme i obdobné technologie, zejména místní úložiště prohlížeče (local storage),
            ve kterém je uložen obsah vašeho nákupního košíku a vaše volba souhlasu s cookies.
          </p>
        </section>

        <section>
          <h2 className="font-poppins-semibold" style={h2Style}>2. Kdo cookies zpracovává</h2>
          <p className="mt-2">
            Provozovatelem e-shopu ciaobag.cz a správcem údajů získaných prostřednictvím cookies
            je Levstra s.r.o., IČO: 27686281, se sídlem Hněvkovského 587/39a, Komárov,
            617 00 Brno, e-mail:{' '}
            <a className="underline" href="mailto:ahoj@ciaobag.cz" style={{ color: 'var(--color-forest)' }}>
              ahoj@ciaobag.cz
            </a>
            . Podrobnosti o zpracování osobních údajů najdete v dokumentu{' '}
            <a className="underline" href="/gdpr" style={{ color: 'var(--color-forest)' }}>
              Ochrana osobních údajů
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-poppins-semibold" style={h2Style}>3. Právní základ</h2>
          <p className="mt-2">
            Nezbytné (technické) cookies používáme na základě našeho oprávněného zájmu na
            bezchybném provozu e-shopu; pro jejich uložení není podle § 89 odst. 3 zákona
            č. 127/2005 Sb., o elektronických komunikacích, vyžadován souhlas. Analytické cookies
            ukládáme pouze na základě vašeho souhlasu uděleného prostřednictvím cookie lišty.
            Souhlas je svobodný, konkrétní a odvolatelný. Zpracování případných osobních údajů se
            řídí nařízením (EU) 2016/679 (GDPR).
          </p>
        </section>

        <section>
          <h2 className="font-poppins-semibold" style={h2Style}>4. Kategorie cookies</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <strong>Nezbytné (technické)</strong> — zajišťují základní funkce e-shopu, zejména
              uchování obsahu košíku a zapamatování vaší volby souhlasu s cookies. Bez nich web
              nefunguje, proto je nelze vypnout a neukládají se na základě souhlasu.
            </li>
            <li>
              <strong>Analytické</strong> — slouží k anonymnímu měření návštěvnosti a zlepšování
              webu. Ukládají se výhradně s vaším souhlasem; pokud souhlas neudělíte, žádné
              analytické cookies se nenastaví.
            </li>
            <li>
              <strong>Marketingové</strong> — slouží k cílení reklamy a remarketingu. Tyto cookies
              aktuálně nepoužíváme. Pokud bychom je v budoucnu zavedli, požádáme vás předem o nový
              souhlas a tyto zásady aktualizujeme.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-poppins-semibold" style={h2Style}>5. Jak udělit nebo odvolat souhlas</h2>
          <p className="mt-2">
            Při první návštěvě webu vám zobrazíme cookie lištu, kde můžete zvolit „Přijmout vše"
            (povolíte i analytické cookies) nebo „Pouze nezbytné" (povolíte jen technické cookies).
            Vaše volba se uloží do prohlížeče. Souhlas můžete kdykoli odvolat nebo změnit tak, že
            ve svém prohlížeči smažete uložené cookies a místní úložiště pro tento web; při další
            návštěvě se cookie lišta zobrazí znovu a budete moci volbu provést nově. Uložení a mazání
            cookies lze obecně spravovat také v nastavení vašeho prohlížeče.
          </p>
        </section>

        <section>
          <h2 className="font-poppins-semibold" style={h2Style}>6. Doba uchování</h2>
          <p className="mt-2">
            Záznam o vaší volbě souhlasu a obsah košíku zůstávají uloženy v prohlížeči, dokud je
            nesmažete. Případné analytické cookies se uchovávají po dobu nezbytnou k danému měření
            (obvykle nejdéle 13 měsíců), nejsou-li dříve odstraněny. Cookies můžete kdykoli smazat
            v nastavení prohlížeče.
          </p>
        </section>

        <section>
          <h2 className="font-poppins-semibold" style={h2Style}>7. Kontakt</h2>
          <p className="mt-2">
            Máte-li k používání cookies jakýkoli dotaz, napište nám na{' '}
            <a className="underline" href="mailto:ahoj@ciaobag.cz" style={{ color: 'var(--color-forest)' }}>
              ahoj@ciaobag.cz
            </a>
            . Dozorovým úřadem pro oblast ochrany osobních údajů je Úřad pro ochranu osobních údajů
            (www.uoou.cz).
          </p>
        </section>
      </article>
    </div>
  );
}
