import Link from 'next/link';
import { CartCleaner } from '@/components/CartCleaner';

export const dynamic = 'force-dynamic';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ transId?: string; refId?: string }>;
}) {
  const { transId, refId } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
      <CartCleaner />

      {/* Animated star mark */}
      <div
        className="mb-10 flex h-24 w-24 items-center justify-center rounded-full"
        style={{ background: 'var(--color-lime)' }}
      >
        <svg viewBox="0 0 32 32" width="44" height="44" fill="var(--color-ink)" aria-hidden="true">
          <path d="M16 2c1.5 5.2 4.3 8 9.5 9.5C20.3 13 17.5 15.8 16 21c-1.5-5.2-4.3-8-9.5-9.5C11.7 10 14.5 7.2 16 2Z" opacity="0.92" />
          <path d="M16 11c1.5 5.2 4.3 8 9.5 9.5C20.3 22 17.5 24.8 16 30c-1.5-5.2-4.3-8-9.5-9.5C11.7 19 14.5 16.2 16 11Z" opacity="0.92" />
        </svg>
      </div>

      <p
        className="font-serif text-center"
        style={{ fontSize: '13px', letterSpacing: '0.1em', color: 'var(--color-forest)', textTransform: 'uppercase' }}
      >
        Objednávka přijata
      </p>

      <h1
        className="font-poppins-semibold mt-2 text-center leading-[1.05]"
        style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', letterSpacing: '-0.03em', color: 'var(--color-ink)' }}
      >
        Děkujeme za nákup!
      </h1>

      <p
        className="font-poppins-light mx-auto mt-5 max-w-sm text-center leading-relaxed"
        style={{ fontSize: '15px', color: 'var(--color-gray-warm)' }}
      >
        Potvrzení vám posíláme e-mailem. Zboží zabalíme a předáme PPL co nejdřív.
      </p>

      {/* Order reference */}
      {(transId || refId) && (
        <div
          className="mt-8 rounded-2xl px-8 py-5 text-center"
          style={{ background: 'var(--color-cream)' }}
        >
          {transId && (
            <div className="mb-2">
              <p className="font-poppins-semibold" style={{ fontSize: '11px', letterSpacing: '0.06em', color: 'var(--color-gray-warm)', textTransform: 'uppercase' }}>
                ID transakce
              </p>
              <p className="font-poppins-regular mt-1 tabular-nums" style={{ fontSize: '14px', color: 'var(--color-ink)' }}>
                {transId}
              </p>
            </div>
          )}
          {refId && (
            <div className={transId ? 'mt-3 border-t pt-3' : ''} style={{ borderColor: 'rgba(43,49,47,0.08)' }}>
              <p className="font-poppins-semibold" style={{ fontSize: '11px', letterSpacing: '0.06em', color: 'var(--color-gray-warm)', textTransform: 'uppercase' }}>
                Číslo objednávky
              </p>
              <p className="font-poppins-regular mt-1 tabular-nums" style={{ fontSize: '14px', color: 'var(--color-ink)' }}>
                {refId}
              </p>
            </div>
          )}
        </div>
      )}

      <Link
        href="/shop"
        className="marina-btn mt-10 inline-flex items-center rounded-xl border-2 px-10 py-4 font-poppins-semibold"
        style={{ borderColor: 'var(--color-ink)', fontSize: '14px' }}
      >
        <span className="marina-btn-text" style={{ color: 'var(--color-ink)' }}>
          Zpět do e-shopu
        </span>
      </Link>
    </div>
  );
}
