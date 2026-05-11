export const metadata = { title: 'Obchodní podmínky — Levstra' };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Právní</p>
      <h1 className="font-display mt-2 text-5xl font-medium">Obchodní podmínky</h1>
      <p className="mt-3 text-sm text-neutral-500">
        Účinné od: 1. 1. 2026 · <strong>VZOR — před spuštěním nechte zkontrolovat právníkem.</strong>
      </p>

      <article className="mt-10 space-y-8 text-neutral-800">
        <section>
          <h2 className="font-display text-2xl font-medium">1. Úvodní ustanovení</h2>
          <p className="mt-2">
            Tyto obchodní podmínky upravují vzájemná práva a povinnosti mezi prodávajícím Levstra
            s.r.o., IČO: 00000000, se sídlem [adresa], zapsaná v obchodním rejstříku vedeném u
            [soud], oddíl [X], vložka [Y] (dále jen „prodávající") a kupujícím při prodeji zboží
            prostřednictvím internetového obchodu na adrese levstra.cz.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-medium">2. Objednávka a uzavření smlouvy</h2>
          <p className="mt-2">
            Kupní smlouva vzniká odesláním objednávky kupujícím a jejím potvrzením prodávajícím.
            Potvrzení o přijetí objednávky je kupujícímu zasláno na e-mailovou adresu uvedenou v
            objednávce. Ceny zboží jsou uvedeny včetně DPH.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-medium">3. Doprava a platba</h2>
          <p className="mt-2">
            Zboží odesíláme prostřednictvím PPL — buď na ParcelShop, nebo na adresu. Cena dopravy
            je uvedena při dokončování objednávky. U objednávek nad 1 500 Kč je doprava zdarma.
            Platba probíhá online platební kartou přes Stripe.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-medium">4. Odstoupení od smlouvy</h2>
          <p className="mt-2">
            Kupující-spotřebitel má právo odstoupit od smlouvy bez udání důvodu ve lhůtě 14 dnů od
            převzetí zboží. Více v sekci <a className="underline" href="/vraceni">Vrácení zboží</a>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-medium">5. Reklamace</h2>
          <p className="mt-2">
            Záruční doba je 24 měsíců od převzetí zboží. Reklamaci uplatňuje kupující písemně na
            e-mail info@levstra.cz. Reklamaci vyřídíme nejpozději do 30 dnů.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-medium">6. Mimosoudní řešení sporů</h2>
          <p className="mt-2">
            K mimosoudnímu řešení spotřebitelských sporů je příslušná Česká obchodní inspekce
            (www.coi.cz).
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-medium">7. Závěrečná ustanovení</h2>
          <p className="mt-2">
            Tyto obchodní podmínky jsou platné a účinné od data uvedeného nahoře. Prodávající si
            vyhrazuje právo na jejich změnu.
          </p>
        </section>
      </article>
    </div>
  );
}
