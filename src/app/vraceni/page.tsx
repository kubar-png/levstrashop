export const metadata = { title: 'Vrácení zboží — Levstra' };

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Informace</p>
      <h1 className="mt-2 text-5xl font-medium">Vrácení zboží</h1>

      <div className="mt-10 space-y-6 text-neutral-700">
        <p>
          Na vrácení zboží máte ze zákona <strong>14 dní</strong> od jeho převzetí. Zboží musí být
          nepoužité, nepoškozené a v původním obalu.
        </p>

        <ol className="space-y-3 pl-5 list-decimal">
          <li>Napište nám na <a className="underline" href="mailto:info@levstra.cz">info@levstra.cz</a> a uveďte číslo objednávky.</li>
          <li>Zabalte zboží a přiložte vyplněný formulář pro odstoupení od smlouvy.</li>
          <li>Odešlete na naši adresu — náklady na dopravu zpět hradí zákazník.</li>
          <li>Peníze vrátíme do 14 dnů od přijetí zboží na stejný účet, ze kterého proběhla platba.</li>
        </ol>

        <p className="rounded-2xl bg-neutral-100 p-5 text-sm">
          U reklamace vadného zboží se postupuje podle zákona o ochraně spotřebitele. Reklamaci
          vyřídíme do 30 dnů.
        </p>
      </div>
    </div>
  );
}
