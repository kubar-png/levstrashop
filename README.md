# Levstra E-shop

Next.js 16 (App Router) + Sanity CMS + Stripe Checkout + PPL myAPI.
Czech-language storefront port of the Wix `kubar0.wixstudio.com/micro-eshop` site.

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router, RSC, Turbopack) |
| Styling | Tailwind CSS v4 |
| CMS | Sanity (embedded Studio at `/studio`) |
| Cart | Zustand + localStorage |
| Payments | Stripe Checkout (hosted) |
| Shipping | PPL myAPI (parcelshops + label creation) |
| Hosting | Vercel (Fluid Compute) |

## Quick start

```bash
# 1. Install
npm install

# 2. Create env file from template
cp .env.example .env.local
# fill in Sanity + Stripe keys

# 3. Bootstrap a Sanity project (one-time)
npx sanity@latest init --env  # creates project, writes IDs into .env

# 4. Run
npm run dev
```

Open:
- Storefront → http://localhost:3000
- Sanity Studio → http://localhost:3000/studio

## Stripe webhooks (local)

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# copy the whsec_... value into STRIPE_WEBHOOK_SECRET in .env.local
```

The webhook decrements stock per SKU in Sanity and persists an `order` document.

## Sanity content model

- `category` — title, slug, description (e.g. *Kabelky*, *Kufry*)
- `product` — title, slug, category ref, images, portable-text description, `variants[]`, `featured`, `active`
- `variant` (object) — `sku`, `size`, `color`, `priceCents`, `stock`, `weightGrams`
- `order` (read-only) — auto-created by Stripe webhook

Prices are stored in **smallest currency unit** (haléře for CZK).

## Routes

| Path | Purpose |
|---|---|
| `/` | Homepage — hero, best-sellers, Marina Galanti, categories, brand story |
| `/shop` | All products |
| `/shop/[category]` | Category listing (kabelky, kufry) |
| `/shop/p/[slug]` | Product detail with variant picker |
| `/cart` | Cart + checkout button |
| `/checkout/success` | Post-payment thank-you |
| `/o-nas` | About |
| `/blog` | Blog placeholder |
| `/studio/*` | Sanity Studio |
| `/api/checkout` | Creates Stripe Checkout Session (server validates prices) |
| `/api/webhooks/stripe` | Decrements stock, creates order |
| `/api/ppl/parcelshops?zip=...` | PPL ParcelShop lookup |

## PPL integration

`src/lib/ppl.ts` wraps two endpoints: `listParcelShops(zip)` and `createShipment(req)`.
You need a PPL business contract and credentials (`PPL_CLIENT_ID`, `PPL_CLIENT_SECRET`,
`PPL_CUSTOMER_REF`). The API base URL is environment-configurable since PPL transitioned
to DHL infrastructure.

## Deployment

```bash
npx vercel link
npx vercel env pull           # local
npx vercel --prod             # deploy
```

Set environment variables in the Vercel dashboard (Settings → Environment Variables) or
via CLI: `vercel env add STRIPE_SECRET_KEY production`.

Add a Stripe webhook in the live dashboard pointing to
`https://<your-domain>/api/webhooks/stripe` and copy the signing secret into
`STRIPE_WEBHOOK_SECRET`.
