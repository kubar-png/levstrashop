import { Eyebrow } from '@/components/ui';

export const metadata = { title: 'Vrácení zboží — Levstra' };

export default function ReturnsPage() {
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
        Vrácení zboží
      </h1>

      <div
        className="mt-10 space-y-6"
        style={{ color: 'var(--color-ink)', fontSize: 'var(--text-body)', lineHeight: 1.7 }}
      >
        <p>
          Na vrácení zboží máte ze zákona <strong>14 dní</strong> od jeho převzetí. Zboží musí být
          nepoužité, nepoškozené a v původním obalu.
        </p>

        <ol className="space-y-3 pl-5 list-decimal">
          <li>Napište nám na <a className="underline" href="mailto:info@levstra.cz" style={{ color: 'var(--color-forest)' }}>info@levstra.cz</a> a uveďte číslo objednávky.</li>
          <li>Zabalte zboží a přiložte vyplněný formulář pro odstoupení od smlouvy.</li>
          <li>Odešlete na naši adresu — náklady na dopravu zpět hradí zákazník.</li>
          <li>Peníze vrátíme do 14 dnů od přijetí zboží na stejný účet, ze kterého proběhla platba.</li>
        </ol>

        <p
          className="p-5"
          style={{
            background: 'var(--color-cream)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-small)',
          }}
        >
          U reklamace vadného zboží se postupuje podle zákona o ochraně spotřebitele. Reklamaci
          vyřídíme do 30 dnů.
        </p>
      </div>
    </div>
  );
}
