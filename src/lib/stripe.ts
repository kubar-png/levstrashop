import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  /* don't throw at import — only when actually used, so build doesn't crash */
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-04-22.dahlia',
});

export const STRIPE_CURRENCY = (process.env.NEXT_PUBLIC_CURRENCY || 'CZK').toLowerCase();
