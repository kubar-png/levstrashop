import Link from 'next/link';
import { Eyebrow } from '@/components/ui';

export const metadata = {
  title: 'Doprava a platba — Ciaobag',
  description:
    'Doprava a platba u Ciaobag — doručení PPL na adresu i na výdejní místo, platba kartou nebo převodem. Doprava zdarma nad 1 500 Kč po celé ČR.',
  alternates: { canonical: '/doprava' },
};

export default function ShippingPage() {
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
        Doprava a platba
      </h1>

      <div
        className="mt-10 space-y-6"
        style={{ color: 'var(--color-ink)', fontSize: 'var(--text-body)', lineHeight: 1.7 }}
      >
        <p>
          Doručujeme po celé České republice prostřednictvím přepravce <strong>PPL</strong>.
          U objednávek nad <strong>1 500 Kč</strong> je doprava zdarma.
        </p>

        <div
          className="overflow-hidden"
          style={{
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <table className="w-full" style={{ fontSize: 'var(--text-small)' }}>
            <thead style={{ background: 'var(--color-cream)' }}>
              <tr>
                <th className="px-5 py-3 text-left font-poppins-semibold">Způsob</th>
                <th className="px-5 py-3 text-left font-poppins-semibold">Doba doručení</th>
                <th className="px-5 py-3 text-right font-poppins-semibold">Cena</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['PPL ParcelShop', '1–3 pracovní dny', '129 Kč'],
                ['PPL na adresu', '1–2 pracovní dny', '199 Kč'],
                ['Objednávky nad 1 500 Kč', '—', 'Zdarma'],
              ].map(([m, eta, price], i) => (
                <tr key={m} style={{ borderTop: i === 0 ? undefined : '1px solid var(--color-border-subtle)' }}>
                  <td className="px-5 py-3">{m}</td>
                  <td className="px-5 py-3">{eta}</td>
                  <td className="px-5 py-3 text-right font-poppins-semibold">{price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p>
          Po odeslání obdržíte e-mail s číslem zásilky a odkazem na sledování. Zásilky odesíláme
          v pracovní dny do 14:00.
        </p>

        <h2
          className="font-poppins-semibold pt-2"
          style={{ fontSize: 'var(--text-h3)', color: 'var(--color-forest)', letterSpacing: '-0.02em' }}
        >
          Platba
        </h2>
        <p>
          Platíte online přes platební bránu <strong>ComGate</strong> — platební kartou nebo
          okamžitým bankovním převodem přes internetové bankovnictví. Objednávku expedujeme po
          připsání platby.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link href="/vraceni" className="btn-secondary">
          Vrácení a reklamace
        </Link>
        <Link href="/kontakt" className="btn-tertiary">
          Máte dotaz? Napište nám →
        </Link>
      </div>
    </div>
  );
}
