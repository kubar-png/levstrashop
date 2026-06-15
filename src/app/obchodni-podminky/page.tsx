import { Eyebrow } from '@/components/ui';

export const metadata = { title: 'Obchodní podmínky — Ciaobag' };

const SECTIONS = [
  {
    title: '1. Úvodní ustanovení a prodávající',
    body: (
      <>
        Tyto obchodní podmínky upravují vzájemná práva a povinnosti mezi prodávajícím
        Levstra s.r.o., IČO: 27686281, DIČ: CZ27686281, se sídlem Hněvkovského 587/39a,
        Komárov, 617 00 Brno, zapsanou v obchodním rejstříku vedeném u Krajského soudu
        v Brně, oddíl C, vložka 47338 (dále jen „prodávající&quot;), a kupujícím při prodeji
        zboží prostřednictvím internetového obchodu na adrese ciaobag.cz. Provozovatelem
        e-shopu ciaobag.cz je Levstra s.r.o. Kontakt: info@ciaobag.cz, tel. +420 516 770 609.
      </>
    ),
  },
  {
    title: '2. Objednávka a uzavření smlouvy',
    body: (
      <>
        Prezentace zboží má informativní charakter. Kupní smlouva vzniká odesláním objednávky
        kupujícím a jejím potvrzením prodávajícím. Potvrzení o přijetí objednávky je kupujícímu
        zasláno na e-mailovou adresu uvedenou v objednávce. Ceny zboží jsou uvedeny včetně DPH.
      </>
    ),
  },
  {
    title: '3. Cena zboží a platební podmínky',
    body: (
      <>
        Cenu zboží a případné náklady na dopravu hradí kupující online prostřednictvím platební
        brány ComGate Payments, a.s. — platební kartou nebo bankovním převodem (online tlačítkem
        banky). Zboží zůstává majetkem prodávajícího až do úplného zaplacení kupní ceny.
      </>
    ),
  },
  {
    title: '4. Přeprava a dodání zboží',
    body: (
      <>
        Zboží doručujeme po České republice přepravcem PPL — na adresu nebo na výdejní místo
        (ParcelShop). U objednávek nad 1 500 Kč je doprava zdarma. Aktuální ceny a doby doručení
        najdete v sekci{' '}
        <a className="underline" href="/doprava" style={{ color: 'var(--color-forest)' }}>
          Doprava a platba
        </a>
        . Kupující je povinen zboží při převzetí zkontrolovat.
      </>
    ),
  },
  {
    title: '5. Odstoupení od smlouvy',
    body: (
      <>
        Kupující-spotřebitel má právo odstoupit od smlouvy bez udání důvodu ve lhůtě 14 dnů od
        převzetí zboží (s výjimkami dle § 1837 občanského zákoníku). Náklady na vrácení zboží
        nese kupující. Postup je popsán v sekci{' '}
        <a className="underline" href="/vraceni" style={{ color: 'var(--color-forest)' }}>
          Vrácení zboží
        </a>
        . Prodávající vrátí přijaté peněžní prostředky do 14 dnů stejným způsobem, jakým je přijal.
      </>
    ),
  },
  {
    title: '6. Práva z vadného plnění a reklamace',
    body: (
      <>
        Záruční doba činí 24 měsíců od převzetí zboží. Reklamaci uplatňuje kupující písemně na
        e-mail info@ciaobag.cz nebo na adresu sídla prodávajícího. Reklamaci vyřídíme nejpozději
        do 30 dnů.
      </>
    ),
  },
  {
    title: '7. Ochrana osobních údajů',
    body: (
      <>
        Zpracování osobních údajů se řídí samostatným dokumentem{' '}
        <a className="underline" href="/gdpr" style={{ color: 'var(--color-forest)' }}>
          Ochrana osobních údajů
        </a>
        .
      </>
    ),
  },
  {
    title: '8. Mimosoudní řešení sporů',
    body: (
      <>
        K mimosoudnímu řešení spotřebitelských sporů je příslušná Česká obchodní inspekce
        (www.coi.cz).
      </>
    ),
  },
  {
    title: '9. Závěrečná ustanovení',
    body: (
      <>
        Vztah mezi prodávajícím a kupujícím se řídí českým právem. Tyto obchodní podmínky jsou
        platné a účinné od data uvedeného nahoře. Prodávající si vyhrazuje právo na jejich změnu.
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
        Účinné od: 15. 6. 2026
      </p>

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
