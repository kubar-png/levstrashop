import Link from 'next/link';
import { CartCleaner } from '@/components/CartCleaner';
import { Eyebrow } from '@/components/ui';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { findOrderByRefId } from '@/lib/orders';
import { formatPrice } from '@/lib/format';
import { OrderStatusPoller } from './OrderStatusPoller';

export const dynamic = 'force-dynamic';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ transId?: string; refId?: string }>;
}) {
  const { transId, refId } = await searchParams;
  const order = refId ? await findOrderByRefId(refId) : null;
  const isPaid = order?.status === 'paid' || order?.status === 'packed' || order?.status === 'shipped' || order?.status === 'delivered';
  const isFailed = order?.status === 'failed' || order?.status === 'cancelled';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
      {isPaid && <CartCleaner />}

      <div
        className="mb-10 flex h-24 w-24 items-center justify-center rounded-full"
        style={{ background: isFailed ? 'var(--color-cream)' : 'var(--color-lime)' }}
      >
        {isFailed ? (
          <svg viewBox="0 0 32 32" width="44" height="44" fill="none" stroke="var(--color-ink)" strokeWidth="2" aria-hidden="true">
            <path d="M10 10l12 12M22 10L10 22" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 32 32" width="44" height="44" fill="var(--color-ink)" aria-hidden="true">
            <path d="M16 2c1.5 5.2 4.3 8 9.5 9.5C20.3 13 17.5 15.8 16 21c-1.5-5.2-4.3-8-9.5-9.5C11.7 10 14.5 7.2 16 2Z" opacity="0.92" />
            <path d="M16 11c1.5 5.2 4.3 8 9.5 9.5C20.3 22 17.5 24.8 16 30c-1.5-5.2-4.3-8-9.5-9.5C11.7 19 14.5 16.2 16 11Z" opacity="0.92" />
          </svg>
        )}
      </div>

      <Eyebrow tone="forest" serif size="md">
        {isFailed ? 'Platba se nepovedla' : isPaid ? 'Objednávka přijata' : 'Čekáme na potvrzení'}
      </Eyebrow>

      <h1
        className="font-poppins-semibold mt-2 text-center leading-[1.05]"
        style={{
          fontSize: 'var(--text-display)',
          letterSpacing: '-0.03em',
          color: 'var(--color-ink)',
        }}
      >
        {isFailed ? 'Něco se nepovedlo' : 'Děkujeme za nákup!'}
      </h1>

      <p
        className="font-poppins-light mx-auto mt-5 max-w-md text-center leading-relaxed"
        style={{ fontSize: 'var(--text-lead)', color: 'var(--color-text-muted)' }}
      >
        {isFailed
          ? 'Vaše platba neproběhla. Zkuste objednávku zadat znovu, případně se na nás obraťte.'
          : isPaid
            ? 'Potvrzení vám posíláme e-mailem. Zboží zabalíme a předáme PPL co nejdřív.'
            : 'Platbu zpracovává brána. Tato stránka se sama obnoví, jakmile dorazí potvrzení.'}
      </p>

      {/* ── Order summary ───────────────────────────────── */}
      {order && (
        <div
          className="mt-10 w-full max-w-md p-6 text-left"
          style={{
            background: 'var(--color-cream)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div className="mb-4">
            <Eyebrow>Číslo objednávky</Eyebrow>
            <p
              className="font-poppins-semibold mt-1 tabular-nums"
              style={{ fontSize: 'var(--text-h3)', color: 'var(--color-ink)' }}
            >
              {order.refId}
            </p>
          </div>

          {order.items.map((it) => (
            <div
              key={it.sku}
              className="flex items-start justify-between gap-3 py-2"
              style={{ borderTop: '1px solid var(--color-border-subtle)' }}
            >
              <div className="min-w-0">
                <p
                  className="font-poppins-semibold truncate"
                  style={{ fontSize: 'var(--text-small)', color: 'var(--color-ink)' }}
                >
                  {it.title}
                </p>
                <p
                  className="font-poppins-regular mt-0.5"
                  style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}
                >
                  {[it.size, it.color].filter(Boolean).join(' · ')}
                  {[it.size, it.color].filter(Boolean).length > 0 ? ' · ' : ''}
                  {it.qty} ks
                </p>
              </div>
              <p
                className="font-poppins-semibold whitespace-nowrap"
                style={{ fontSize: 'var(--text-small)', color: 'var(--color-ink)' }}
              >
                {formatPrice(it.priceCents * it.qty)}
              </p>
            </div>
          ))}

          <div
            className="mt-3 flex items-center justify-between pt-3"
            style={{ borderTop: '1px solid var(--color-border-subtle)' }}
          >
            <span
              className="font-poppins-semibold"
              style={{ fontSize: 'var(--text-body)', color: 'var(--color-ink)' }}
            >
              Celkem
            </span>
            <span
              className="font-poppins-semibold"
              style={{ fontSize: 'var(--text-body)', color: 'var(--color-ink)' }}
            >
              {formatPrice(order.totalCents)}
            </span>
          </div>
        </div>
      )}

      {/* If refId given but order missing OR still pending — poll */}
      {refId && (!order || order.status === 'pending') && (
        <OrderStatusPoller refId={refId} />
      )}

      {/* Fallback IDs when no order doc found */}
      {!order && (transId || refId) && (
        <p
          className="font-poppins-regular mt-6 tabular-nums"
          style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}
        >
          {refId && <>Číslo objednávky: {refId}</>}
          {refId && transId && <> · </>}
          {transId && <>Transakce: {transId}</>}
        </p>
      )}

      <div className="mt-10 flex gap-3">
        <Link href="/shop" className="btn-secondary">
          Zpět do e-shopu
        </Link>
        {isFailed && (
          <Link href="/cart" className="btn-primary">
            Zkusit znovu
          </Link>
        )}
      </div>

      {/* Highest-intent moment for newsletter capture — they just bought. */}
      {isPaid && (
        <div
          className="mt-16 w-full max-w-md p-6 text-left"
          style={{
            background: 'var(--color-forest)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <p
            className="font-poppins-semibold"
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--color-lime)',
            }}
          >
            Buďte v obraze
          </p>
          <p
            className="font-serif mt-2"
            style={{ fontSize: 'var(--text-h3)', color: '#fff', lineHeight: 1.15 }}
          >
            Nové kousky a tipy do schránky.
          </p>
          <p
            className="font-poppins-light mt-2"
            style={{ fontSize: 'var(--text-small)', color: 'rgba(255,255,255,0.72)' }}
          >
            Posíláme párkrát do měsíce, vždy k věci.
          </p>
          <div className="mt-4">
            <NewsletterSignup variant="dark" hideHeader source="checkout-success" />
          </div>
        </div>
      )}
    </div>
  );
}
