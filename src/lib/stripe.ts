import Stripe from 'stripe';

export const STRIPE_CURRENCY = (process.env.NEXT_PUBLIC_CURRENCY || 'CZK').toLowerCase();

let _stripe: Stripe | null = null;

/**
 * Lazy Stripe client. Only instantiates on first use, so the build doesn't
 * crash when STRIPE_SECRET_KEY is missing in the build environment.
 */
export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Add it to environment variables before using Stripe.',
    );
  }
  _stripe = new Stripe(key, { apiVersion: '2026-04-22.dahlia' });
  return _stripe;
}

/**
 * Proxy that forwards property access to the real Stripe client.
 * Lets existing call sites stay as `stripe.checkout.sessions.create(...)`.
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});
