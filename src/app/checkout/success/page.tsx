import Link from 'next/link';
import { stripe } from '@/lib/stripe';
import { CartCleaner } from '@/components/CartCleaner';

export const dynamic = 'force-dynamic';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  let email: string | null = null;
  let total: number | null = null;
  let currency = 'CZK';

  if (session_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      email = session.customer_details?.email ?? null;
      total = session.amount_total ?? null;
      currency = (session.currency ?? 'czk').toUpperCase();
    } catch {}
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <CartCleaner />
      <p className="text-5xl">🎉</p>
      <h1 className="font-display mt-4 text-4xl font-medium md:text-5xl">Děkujeme za objednávku!</h1>
      <p className="mt-4 text-neutral-600">
        Potvrzení posíláme {email ? <strong>na {email}</strong> : 'e-mailem'}. Zboží zabalíme a
        předáme PPL co nejdřív.
      </p>
      {total !== null && (
        <p className="mt-2 text-sm text-neutral-500">
          Celkem: {(total / 100).toLocaleString('cs-CZ')} {currency}
        </p>
      )}
      <Link
        href="/shop"
        className="mt-10 inline-block rounded-full bg-neutral-900 px-7 py-3 text-sm font-medium text-white hover:bg-neutral-700"
      >
        Zpět do e-shopu
      </Link>
    </div>
  );
}
