import Link from 'next/link';
import { CartCleaner } from '@/components/CartCleaner';
import { Eyebrow } from '@/components/ui';

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

      <Eyebrow tone="forest" serif size="md">Objednávka přijata</Eyebrow>

      <h1
        className="font-poppins-semibold mt-2 text-center leading-[1.05]"
        style={{
          fontSize: 'var(--text-display)',
          letterSpacing: '-0.03em',
          color: 'var(--color-ink)',
        }}
      >
        Děkujeme za nákup!
      </h1>

      <p
        className="font-poppins-light mx-auto mt-5 max-w-sm text-center leading-relaxed"
        style={{ fontSize: 'var(--text-lead)', color: 'var(--color-text-muted)' }}
      >
        Potvrzení vám posíláme e-mailem. Zboží zabalíme a předáme PPL co nejdřív.
      </p>

      {/* Order reference */}
      {(transId || refId) && (
        <div
          className="mt-8 px-8 py-5 text-center"
          style={{
            background: 'var(--color-cream)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {transId && (
            <div className="mb-2">
              <Eyebrow>ID transakce</Eyebrow>
              <p
                className="font-poppins-regular mt-1 tabular-nums"
                style={{ fontSize: 'var(--text-body)', color: 'var(--color-ink)' }}
              >
                {transId}
              </p>
            </div>
          )}
          {refId && (
            <div
              className={transId ? 'mt-3 pt-3' : ''}
              style={transId ? { borderTop: '1px solid var(--color-border-subtle)' } : undefined}
            >
              <Eyebrow>Číslo objednávky</Eyebrow>
              <p
                className="font-poppins-regular mt-1 tabular-nums"
                style={{ fontSize: 'var(--text-body)', color: 'var(--color-ink)' }}
              >
                {refId}
              </p>
            </div>
          )}
        </div>
      )}

      <Link href="/shop" className="btn-secondary mt-10">
        Zpět do e-shopu
      </Link>
    </div>
  );
}
