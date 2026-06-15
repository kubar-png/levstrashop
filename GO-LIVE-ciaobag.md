# Go-live checklist — ciaobag.cz

Spouštěcí dokument pro napojení domény **ciaobag.cz** na tento e-shop (Next.js + Sanity,
hostováno na Vercelu, projekt `levstrashop`). Web zatím běží na `levstrashop.vercel.app`.

> Provozovatelem e-shopu **ciaobag.cz** je **Levstra s.r.o.** Vizuální značka je „Ciaobag",
> právní subjekt / fakturace / e-maily zůstávají Levstra. (Nikdy neměnit plošně „Levstra → Ciaobag".)

Legenda: ⬜ úkol · 🔴 blokující pro spuštění · 🟡 důležité · 🟢 nice-to-have

---

## ✅ Hotovo v kódu (15. 6. 2026)

Tyto položky jsou už hotové v kódu a propíšou se deployem:

- **Patička**: DIČ, věta „Provozovatelem e-shopu ciaobag.cz je Levstra s.r.o." + backlink na www.levstra.cz, kontakt ahoj@ciaobag.cz.
- **Obchodní podmínky**: přepsané na reálný text (ciaobag.cz, jen **PPL**, jen **ComGate**; opravena chybná zmínka „Stripe"; doplněny identifikační údaje; odstraněn baner „VZOR").
- **Doprava a platba**: doplněna sekce o platbě (ComGate).
- **GDPR**: ciaobag.cz, zpracovatelé (ComGate / PPL / Resend / Ecomail), ahoj@ciaobag.cz, odstraněn „VZOR".
- **Vrácení + Kontakt**: kontaktní e-mail ahoj@ciaobag.cz.
- **E-mailové šablony, OG obrázek, výchozí base-URL** (sitemap / robots / canonical / metadataBase) → ciaobag.cz.
- **Rozhodnutí**: kontaktní/odesílací e-mail = **ahoj@ciaobag.cz** (nutno zřídit schránku + ověřit doménu v Resendu — sekce 5). Backlink = www.levstra.cz. Sociální profily zatím @levstra (beze změny).

**Zbývá ručně (dashboardy, mimo kód):** doména + DNS ve Vercelu (1), produkční env vč. `NEXT_PUBLIC_SITE_URL` a `COMGATE_TEST=0` (2), URL v Comgate portálu (3), ostré PPL údaje (4), Resend doména + schránka ahoj@ciaobag.cz (5), Sanity webhook + CORS (6), Search Console (7).

---

## 0. Fakturační / identifikační údaje (zdroj pravdy)

Tyto údaje použít všude (patička, kontakt, OP, GDPR, faktury). Převzato z eshop.levstra.cz.

| Položka | Hodnota |
|---|---|
| Obchodní název | **Levstra s.r.o.** |
| IČO | **27686281** |
| DIČ | **CZ27686281** |
| Sídlo | **Hněvkovského 587/39a, Komárov, 617 00 Brno** |
| Zápis | Krajský soud v Brně, oddíl C, vložka 47338 |
| Bankovní účet | **217410801 / 0300** (ČSOB, a.s.) |
| Telefon | +420 516 770 609 |
| E-mail | info@levstra.cz *(viz rozhodnutí níže — případně ahoj@ciaobag.cz)* |
| Provozovatel e-shopu ciaobag.cz | Levstra s.r.o. |
| Backlink (firemní web) | https://www.levstra.cz |
| Platební brána | ComGate Payments, a.s. |
| Doprava | PPL (na adresu + výdejní místo / ParcelShop) |

---

## 1. Doména & Vercel  🔴

- ⬜ Vercel → projekt `levstrashop` → **Settings → Domains** → přidat `ciaobag.cz` **i** `www.ciaobag.cz`.
- ⬜ U registrátora nastavit DNS dle Vercelu: `A` apex `ciaobag.cz → 76.76.21.21` (nebo dle pokynu Vercelu) + `CNAME www → cname.vercel-dns.com`. Počkat na „Valid Configuration".
- ⬜ Zvolit **primární doménu** = `ciaobag.cz` a nastavit redirect `www.ciaobag.cz → ciaobag.cz` (Vercel dělá automaticky).
- ⬜ **`levstrashop.vercel.app` → 308 redirect na `ciaobag.cz`** (kvůli SEO duplicitě). Buď ve Vercelu (Domains → redirect), nebo v `vercel.ts`/middleware.
- ⬜ Ověřit platný HTTPS certifikát (Vercel vystaví automaticky).

---

## 2. Env proměnné (Vercel → Settings → Environment Variables, Production)  🔴

Nejdůležitější: **`NEXT_PUBLIC_SITE_URL`**. Teď je v kódu nejednotný fallback
(`layout.tsx` → `levstrashop.vercel.app`, ale `sitemap.ts`/`robots.ts`/PDP → `levstra.cz`).
Po nastavení env to bude jednotné.

| Proměnná | Hodnota na produkci |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://ciaobag.cz` |
| `COMGATE_TEST` | `0` (ostrý provoz!) |
| `COMGATE_MERCHANT` / `COMGATE_SECRET` | produkční hodnoty z Comgate portálu |
| `PPL_*` | produkční (ostré) údaje, ne sandbox |
| `RESEND_FROM_ORDERS` / `RESEND_FROM_CONTACT` / `RESEND_REPLY_TO` | viz sekce 5 |
| `SANITY_ORDER_WEBHOOK_SECRET` | beze změny (jen ověřit, že je v prod) |

- ⬜ Po změně env udělat **redeploy** (env se propíše až novým buildem).

---

## 3. Platební brána Comgate  🔴

V Comgate portálu (Integrace → Propojení obchodu) přepsat URL z `levstra.cz` na `ciaobag.cz`:

- ⬜ PUSH notifikace: `https://ciaobag.cz/api/webhooks/comgate`
- ⬜ Návratová URL (úspěch): `https://ciaobag.cz/checkout/success?refId={refId}&transId={transId}`
- ⬜ Návratová URL (storno): `https://ciaobag.cz/cart?cancelled=1`
- ⬜ Návratová URL (čekající): `https://ciaobag.cz/checkout/success?refId={refId}&transId={transId}`
- ⬜ `COMGATE_TEST=0` + ostré `COMGATE_MERCHANT/SECRET` (sekce 2).
- ⬜ **Testovací platba na ostro** (malá částka) → ověřit success/storno redirect + že dorazí PUSH a objednávka se zapíše do Sanity.

> Pozn.: `ENV_SETUP.md` má v příkladech ještě `levstra.cz` — po spuštění aktualizovat i tam.

---

## 4. Doprava PPL  🟡

- ⬜ Ověřit, že `PPL_*` jsou **produkční** (ne sandbox) a odpovídá adresa odesílatele.
- ⬜ Zkontrolovat ceny dopravy na webu (`/doprava`: PPL ParcelShop 129 Kč, PPL na adresu 199 Kč,
  zdarma nad 1 500 Kč) vs. reálná konfigurace v košíku/PPL. Práh „zdarma" = 1 500 Kč
  (`CartDrawer.tsx` `FREE_THRESHOLD_CENTS = 150000`).
- ⬜ Testovací objednávka → vygenerování štítku přes PPL workflow (viz `PPL_WORKFLOW.md`).

---

## 5. Transakční e-maily (Resend)  🟡

Rozhodnutí: posílat z `@ciaobag.cz`, nebo dál z `@levstra.cz`? (viz sekce „Rozhodnutí").

- ⬜ Pokud `@ciaobag.cz`: v Resendu přidat doménu `ciaobag.cz`, nastavit **SPF + DKIM** DNS
  záznamy, a změnit `RESEND_FROM_ORDERS`/`RESEND_FROM_CONTACT`/`RESEND_REPLY_TO`.
- ⬜ **Opravit natvrdo zadané `https://levstra.cz`** v patičkách e-mailů:
  - `src/emails/OrderConfirmation.ts` (`Ciaobag · https://levstra.cz`)
  - `src/emails/OrderShipped.ts` (`Ciaobag · https://levstra.cz`)
  → nahradit `https://ciaobag.cz` (ideálně přes `NEXT_PUBLIC_SITE_URL`).
- ⬜ Odeslat zkušební objednávku → ověřit potvrzovací i „odesláno" e-mail.

---

## 6. Sanity  🟡

- ⬜ **Order webhook**: Sanity manage → API → Webhooks → URL změnit na
  `https://ciaobag.cz/api/webhooks/sanity-order` (viz komentář v `src/app/api/webhooks/sanity-order/route.ts`).
- ⬜ **CORS origins**: Sanity manage → API → CORS → přidat `https://ciaobag.cz` (a `https://www.ciaobag.cz`),
  aby šel otevřít Studio i fetch z nové domény.
- ⬜ Ověřit, že `/studio` na nové doméně funguje (přihlášení + editace).

---

## 7. SEO & indexace  🟡

Po nastavení `NEXT_PUBLIC_SITE_URL=https://ciaobag.cz` se automaticky srovná:
`sitemap.ts`, `robots.ts`, kanonické URL a JSON-LD na PDP (`shop/p/[slug]`), `metadataBase` v `layout.tsx`.

- ⬜ Ověřit `https://ciaobag.cz/sitemap.xml` a `https://ciaobag.cz/robots.txt` (správná doména).
- ⬜ Ověřit OG/canonical na pár stránkách (`view-source` → `og:url`, `<link rel=canonical>`).
- ⬜ **Google Search Console**: přidat doménu `ciaobag.cz`, ověřit, odeslat sitemap.
- ⬜ (Pokud byl indexován `levstrashop.vercel.app`) ponechat 308 redirect (sekce 1) kvůli přesměrování šťávy.
- 🟢 OG obrázek (`opengraph-image.tsx`) zmiňuje „levstra.cz" — zvážit změnu textu na ciaobag.cz.

---

## 8. Právní stránky, fakturační údaje, provozovatel & backlink  🔴

### 8a. Patička (`src/components/SiteFooter.tsx`)
- ⬜ Doplnit **DIČ: CZ27686281** k IČO.
- ⬜ Přidat větu **„Provozovatelem e-shopu ciaobag.cz je Levstra s.r.o."**
- ⬜ Přidat **backlink** na `https://www.levstra.cz` (např. „Součást Levstra s.r.o." s odkazem).

### 8b. Obchodní podmínky (`src/app/obchodni-podminky/page.tsx`)  🔴
Dnes je to **VZOR** s banerem „čeká na právní kontrolu" a obsahuje **dvě faktické chyby**:
- odkazuje na „internetový obchod na adrese **levstra.cz**" → změnit na **ciaobag.cz**
- §3 tvrdí „Platba … přes **Stripe**" → ve skutečnosti **Comgate** (Stripe je jen sekundární/fallback)

Plán: převzít text z `eshop.levstra.cz/obchodni-podminky/` **1:1**, jen:
- e-shop = **ciaobag.cz**, provozovatel = Levstra s.r.o.
- platba = **pouze ComGate** (karta + online bankovní převod) — vypustit hotovost/dobírku/GSM
- doprava = **pouze PPL** (na adresu + výdejní místo) — vypustit WE-DO/Zásilkovna/DPD
- kontaktní e-mail dle rozhodnutí (info@levstra.cz / ahoj@ciaobag.cz)
- ⬜ odstranit baner „VZOR" až po doplnění + (doporučeno) právní kontrole

### 8c. Doprava a platba (`src/app/doprava/page.tsx`, v patičce „Doprava a platba")  🟡
- ⬜ Sjednotit s realitou: **PPL** (ParcelShop + adresa) + **ComGate** (karta / online převod).
  Stránka už uvádí jen PPL — doplnit část o platbě (Comgate), případně přejmenovat na
  „Doprava a platba" jako na levstra.cz.

### 8d. GDPR / Ochrana osobních údajů (`src/app/gdpr/page.tsx`)  🟡
- Správce už je správně **Levstra s.r.o., IČO 27686281**. Doplnit/ověřit:
- ⬜ zmínit e-shop **ciaobag.cz**
- ⬜ zpracovatelé: **ComGate Payments, a.s.** (platby), **PPL** (doprava), Resend (e-maily), Ecomail (newsletter)

### 8e. Reklamace / Vrácení (`src/app/vraceni/page.tsx`)  🟢
- ⬜ Ověřit shodu (14 dní odstoupení, 24 měsíců záruka, kontaktní e-mail).

> Zdroje k převzetí 1:1: `eshop.levstra.cz/obchodni-podminky/`,
> `eshop.levstra.cz/dodaci-a-platebni-podminky/`, „Souhlas se zpracováním osobních údajů".

---

## 9. Analytika, cookies, ostatní  🟢
- ⬜ Cookie lišta funguje na nové doméně (`CookieBanner`).
- ⬜ (Pokud používáte) GA4 / měřicí kód — přidat doménu ciaobag.cz.
- ⬜ Ecomail (newsletter) — ověřit doménu/odesílatele.
- ⬜ Sociální odkazy v patičce (Instagram `@levstra`, FB, TikTok) — doplnit reálné URL / zvážit ciaobag profily.

---

## 10. Finální smoke test po napojení  🔴
- ⬜ `https://ciaobag.cz` načte web (200), `www` i `vercel.app` přesměrují na apex.
- ⬜ Průchod košíkem → **ostrá** platba Comgate → success stránka → e-mail → objednávka v Sanity.
- ⬜ Sitemap/robots/canonical ukazují `ciaobag.cz`.
- ⬜ Patička: fakturační údaje + provozovatel + backlink na levstra.cz.
- ⬜ OP/Doprava/GDPR sedí s realitou (PPL + Comgate, ciaobag.cz).

---

## Rozhodnutí, která potřebuju od tebe
1. **Kontaktní/odesílací e-mail**: nechat `info@levstra.cz` (funguje hned), nebo zřídit a používat `ahoj@ciaobag.cz`?
2. **Backlink** má vést na `https://www.levstra.cz` (firemní web), nebo jinam?
3. **Sociální sítě**: zůstávají profily `@levstra`, nebo budou ciaobag profily?
4. Mám rovnou **implementovat** kódové části (patička 8a, právní stránky 8b–8d, oprava e-mailových šablon 5, env poznámky)? Texty + údaje na to mám připravené.
