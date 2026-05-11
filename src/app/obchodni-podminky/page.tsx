import { Eyebrow, Banner } from '@/components/ui';

export const metadata = { title: 'Obchodní podmínky — Levstra' };

const SECTIONS = [
  {
    title: '1. Úvodní ustanovení',
    body: (
      <>
        Tyto obchodní podmínky upravují vzájemná práva a povinnosti mezi prodávajícím Levstra
        s.r.o., IČO: 27686281, se sídlem Hněvkovského 587/39a, Komárov, 617 00 Brno, zapsaná
        v obchodním rejstříku vedeném u Krajského soudu v Brně, oddíl C, vložka 47338 (dále jen
        „prodávající&quot;) a kupujícím při prodeji zboží prostřednictvím internetového obchodu
        na adrese levstra.cz.
      </>
    ),
  },
  {
    title: '2. Objednávka a uzavření smlouvy',
    body: (
      <>
        Kupní smlouva vzniká odesláním objednávky kupujícím a jejím potvrzením prodávajícím.
        Potvrzení o přijetí objednávky je kupujícímu zasláno na e-mailovou adresu uvedenou
        v objednávce. Ceny zboží jsou uvedeny včetně DPH.
      </>
    ),
  },
  {
    title: '3. Doprava a platba',
    body: (
      <>
        Zboží odesíláme prostřednictvím PPL — buď na ParcelShop, nebo na adresu. Cena dopravy
        je uvedena při dokončování objednávky. U objednávek nad 1 500 Kč je doprava zdarma.
        Platba probíhá online platební kartou přes Stripe.
      </>
    ),
  },
  {
    title: '4. Odstoupení od smlouvy',
    body: (
      <>
        Kupující-spotřebitel má právo odstoupit od smlouvy bez udání důvodu ve lhůtě 14 dnů od
        převzetí zboží. Více v sekci{' '}
        <a className="underline" href="/vraceni" style={{ color: 'var(--color-forest)' }}>
          Vrácení zboží
        </a>
        .
      </>
    ),
  },
  {
    title: '5. Reklamace',
    body: (
      <>
        Záruční doba je 24 měsíců od převzetí zboží. Reklamaci uplatňuje kupující písemně na
        e-mail info@levstra.cz. Reklamaci vyřídíme nejpozději do 30 dnů.
      </>
    ),
  },
  {
    title: '6. Mimosoudní řešení sporů',
    body: (
      <>
        K mimosoudnímu řešení spotřebitelských sporů je příslušná Česká obchodní inspekce
        (www.coi.cz).
      </>
    ),
  },
  {
    title: '7. Závěrečná ustanovení',
    body: (
      <>
        Tyto obchodní podmínky jsou platné a účinné od data uvedeného nahoře. Prodávající si
        vyhrazuje právo na jejich změnu.
      </>
    ),
  },
];

export default function TermsPage() {
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
        Obchodní podmínky
      </h1>
      <p
        className="mt-3"
        style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}
      >
        Účinné od: 1. 1. 2026 · Naposledy aktualizováno: 11. 5. 2026
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
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2
              className="font-poppins-semibold"
              style={{
                fontSize: 'var(--text-h3)',
                color: 'var(--color-forest)',
                letterSpacing: '-0.02em',
              }}
            >
              {s.title}
            </h2>
            <p className="mt-2">{s.body}</p>
          </section>
        ))}
      </article>
    </div>
  );
}
