export const metadata = { title: 'Doprava — Levstra' };

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Informace</p>
      <h1 className="mt-2 text-5xl font-medium">Doprava</h1>

      <div className="mt-10 space-y-6 text-neutral-700">
        <p>
          Doručujeme po celé České republice prostřednictvím přepravce <strong>PPL</strong>.
          U objednávek nad <strong>1 500 Kč</strong> je doprava zdarma.
        </p>

        <div className="overflow-hidden rounded-2xl border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Způsob</th>
                <th className="px-5 py-3 text-left font-medium">Doba doručení</th>
                <th className="px-5 py-3 text-right font-medium">Cena</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              <tr>
                <td className="px-5 py-3">PPL ParcelShop</td>
                <td className="px-5 py-3">1–3 pracovní dny</td>
                <td className="px-5 py-3 text-right">129 Kč</td>
              </tr>
              <tr>
                <td className="px-5 py-3">PPL na adresu</td>
                <td className="px-5 py-3">1–2 pracovní dny</td>
                <td className="px-5 py-3 text-right">199 Kč</td>
              </tr>
              <tr>
                <td className="px-5 py-3">Objednávky nad 1 500 Kč</td>
                <td className="px-5 py-3">—</td>
                <td className="px-5 py-3 text-right font-medium">Zdarma</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Po odeslání obdržíte e-mail s číslem zásilky a odkazem na sledování. Zásilky odesíláme
          v pracovní dny do 14:00.
        </p>
      </div>
    </div>
  );
}
