# Meta Campaign Graphic Generator — Design

Date: 2026-06-23
Status: approved (design), pending implementation plan

## Goal

An internal, near-zero-input tool that auto-generates on-brand graphic creatives for
Meta (Facebook/Instagram) ad campaigns in the Ciaobag visual style, and lets the user
download any variant as a pixel-exact PNG. Hidden behind an obscure, unguessable URL.

## Principles

- **Minimal input.** The page generates a batch of variants on load. The only controls
  are: format toggle (1:1 / 9:16), "Generovat další" (reshuffle a new batch), and per-tile
  "Stáhnout PNG". No forms, no copywriting by hand.
- **Keep it simple.** No auth, no AI calls, no external infra. Reuse the site's design
  tokens and live product data.
- **WYSIWYG.** The on-screen preview IS the downloaded file.

## Decisions (locked)

| Topic | Decision |
|---|---|
| Formats | **1:1** (1080×1080) and **9:16** (1080×1920) only |
| Generation mode | Auto-generate variants; user reshuffles, no manual composition |
| Copy source | Curated CZ template library filled with product data (name/price/sale). No API. |
| Render & export | **`next/og` `ImageResponse` (Satori)** — server route renders JSX → exact-size PNG |

## Architecture

### Route & access
- Hidden page at an unguessable slug, e.g. `/studio-kampane-<random>` (final slug chosen
  at implementation time).
- `noindex` via route metadata; **excluded** from `src/app/robots.ts` and
  `src/app/sitemap.ts`. Not linked anywhere in the site.
- No login — obscurity only, as requested.

### Rendering pipeline (Satori / next/og)
- A dynamic image route (e.g. `/studio-kampane-<random>/render/route.tsx`) accepts a
  compact spec via query/encoded params (template, format, productId, headline, cta,
  palette, background) and returns a PNG via `ImageResponse` at exact 1080×1080 or
  1080×1920.
- The page renders each variant as `<img src="/.../render?...">`, so preview == download.
- Fonts (Poppins 200/600, Forum 400) embedded as font files read at the route and passed
  to `ImageResponse`. Design stays within Satori's CSS subset (flexbox, gradients,
  embedded fonts; no CSS grid).

### Data
- Products fetched live from Sanity (`active == true` only — placeholder/hidden products
  never appear). Product image, title, min price, compare-at (sale) read from existing
  `shopProductsQuery` shape.
- **Lifestyle/model background pool**: curated from existing on-site imagery (Marina
  Galanti model banner + homepage hero rotation, Wix CDN) plus product hero images.
  Easy to extend by adding URLs to one constant. (If the user supplies a dedicated folder
  of campaign model photos later, those URLs get added to the same pool.)

### Variant engine
Each generated variant is a pure deterministic function of a seed; "Generovat další"
draws a fresh batch. A variant picks:
- a product (random from active catalog),
- a creative-angle + headline from the CZ template library, with product data substituted,
- a CTA from the brand set,
- a layout/template archetype,
- a palette combo from brand tokens (forest / cream / lime / sky / orange),
- a background mode (lifestyle photo / solid brand color / product-on-color).

### Template archetypes (the "angles")
1. **Lifestyle hero** — full-bleed model/lifestyle photo + gradient + headline + lime CTA.
2. **Product on color** — product cutout on a brand color field + headline + price/sale.
3. **Product + lifestyle combo** — product photo composed together with a lifestyle photo
   in one creative (the explicitly requested "produkt + image fotka" angle).
4. **Sale/promo** — bold discount + price emphasis.

Each archetype has a 1:1 and a 9:16 layout. **9:16 respects Stories/Reels safe zones**
(top status bar, bottom CTA strip) so text/CTA never sit under platform UI.

### Page UI
- Format toggle (1:1 / 9:16).
- A grid of auto-generated variant tiles (e.g. 6–9), each an `<img>` of the render route.
- "Generovat další" → new batch.
- "Stáhnout PNG" per tile (download the render route's PNG directly).

## Out of scope (YAGNI)
- Manual text/product pickers, AI copy, video, scheduling/publishing to Meta, multi-format
  beyond 1:1 + 9:16, auth, saving/history.

## Open items
- Final random slug value.
- Whether the user has an additional folder of model photos to feed into the background
  pool (current plan uses existing site imagery; extensible).
