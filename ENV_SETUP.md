# Env setup — Resend & Ecomail

This guide walks through everything that needs to be in `.env.local` (and on Vercel) for the order/email pipeline to work end-to-end.

> **TL;DR.** Copy `.env.example` to `.env.local`, fill in the values from each provider's dashboard, redeploy. Without these keys the relevant routes silently no-op (orders save but no email goes out).

---

## 1. Sanity write token

Required for: order persistence + stock decrement.

1. https://www.sanity.io/manage → your project → **API → Tokens**
2. Add token, name it `levstra-orders`, role **Editor**
3. `SANITY_API_WRITE_TOKEN=…`

If this is missing, `/api/checkout` still works but no order doc is written and webhooks log a warning.

---

## 2. Resend (transactional email)

Sends: order confirmation, shipping notification, contact form auto-reply, internal contact notification.

### Sign up

1. https://resend.com → sign up with the levstra inbox
2. **Domains → Add Domain → `levstra.cz`**
3. Add the 3 DNS records they show in your registrator (SPF TXT, DKIM TXT, optional DMARC). Propagation 5–30 min.
4. Wait for "Verified" status (refresh the page)
5. **API Keys → Create API Key** → "Full access" → copy

### Env

```env
RESEND_API_KEY=re_…
RESEND_FROM_ORDERS="Levstra <objednavky@levstra.cz>"
RESEND_FROM_CONTACT="Levstra <info@levstra.cz>"
RESEND_REPLY_TO=info@levstra.cz
RESEND_INTERNAL_INBOX=info@levstra.cz
```

`RESEND_INTERNAL_INBOX` is where contact-form submissions land in your inbox. Can be a Gmail/Seznam/whatever — doesn't need to be on the verified domain.

### Test

After deploy, fill in `/kontakt` form. You should receive:
- An email at `info@levstra.cz` with the user's message
- The user receives an auto-reply

---

## 3. Ecomail (newsletter + marketing)

Used for: newsletter signup (footer), post-purchase customer tagging, future automations (abandoned cart, post-purchase upsell, re-engagement).

> Transactional emails go through Resend. Ecomail just gets a record of paid orders so it can fire automation flows and segment customers.

### Sign up

1. https://ecomailapp.cz → registrace, vyberte plán **Free** (200 kontaktů zdarma) nebo placený podle potřeby
2. Po registraci si poznamenejte URL — `https://<vase-jmeno>.ecomailapp.cz` → hodnota `<vase-jmeno>` jde do `ECOMAIL_APP_ID`
3. **Nastavení → Domény → Ověřit doménu** → přidejte `levstra.cz`
   - **DŮLEŽITÉ:** použijte jiný DKIM selector než Resend (Ecomail dá vlastní). Nesahejte na SPF, který už nastavil Resend — místo toho Resend SPF zaktualizujte, aby zahrnoval Ecomail (Resend i Ecomail u sebe ukazují přesný řetězec).
4. **Seznam příjemců → Nový seznam** → název "Newsletter" → uložit → poznamenat numerické ID z URL
5. **Integrace → API klíče → Vygenerovat** → zkopírovat

### Env

```env
ECOMAIL_API_KEY=…
ECOMAIL_LIST_ID=42           # numeric ID z kroku 4
ECOMAIL_APP_ID=levstra       # subdomena z kroku 2
```

### Test

- Patičkou (`/`) přihlásit `test@levstra.cz` k newsletteru → kontakt se objeví v seznamu se statusem "pending confirmation" (double opt-in e-mail dorazí v cs)
- Po zaplacené objednávce v Ecomailu uvidíte kontakt se štítkem `customer` a custom_fields `last_order_*`

---

## 4. DNS — souhrn

Na zóně `levstra.cz` musíte mít:

| Typ | Host | Hodnota | Zdroj |
|-----|------|---------|-------|
| TXT | `@` | `v=spf1 include:_spf.resend.com include:_spf.ecomailapp.cz ~all` | sloučená SPF |
| TXT | `resend._domainkey` | `…` | Resend |
| TXT | `ecomail._domainkey` | `…` | Ecomail (jiný selector!) |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@levstra.cz` | volitelně, doporučeno |

Jeden TXT záznam SPF — nikdy ne dva. Pokud Resend vyžaduje `send.levstra.cz` MX/TXT pro bounces, přidejte podle pokynů.

---

## 5. Stripe + Comgate (platby)

Už nastavené v repu, jen prosím vyplňte hodnoty:

```env
# Comgate — primární platební brána pro CZK
COMGATE_MERCHANT_ID=…
COMGATE_SECRET=…
COMGATE_TEST=true            # ⚠ až do ostrého testu nech true

# Stripe — sekundární (karty bez Comgate, fallback)
STRIPE_SECRET_KEY=sk_test_…
STRIPE_WEBHOOK_SECRET=whsec_…
```

### Webhook URL k zaregistrování v dashboardech:

- **Comgate** notifyUrl: `https://levstra.cz/api/webhooks/comgate` (automaticky předáváno v každé objednávce, nemusíte zvlášť registrovat)
- **Stripe** webhook endpoint: `https://levstra.cz/api/webhooks/stripe` → events `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_failed`

---

## 6. Test scenario po nastavení

1. `npm run dev`
2. Přidat něco do košíku, projít checkoutem v Comgate test módu (`COMGATE_TEST=true`)
3. Po zaplacení by se mělo stát:
   - Order doc v Sanity přejde z `pending` → `paid`
   - Skladová zásoba varianty se sníží o objednané kusy
   - Zákazník dostane potvrzovací e-mail z Resend (`objednavky@levstra.cz`)
   - Kontakt se přidá do Ecomail seznamu se štítkem `customer`
   - `/checkout/success` zobrazí kompletní souhrn objednávky
4. Vyplnit kontaktní formulář na `/kontakt` → check že info@levstra.cz dostal zprávu a odesílatel dostal auto-reply

---

## 7. Vercel produkce

Po prvním nastavení:

```bash
vercel env pull .env.local       # stáhnout aktuální env
vercel env add RESEND_API_KEY production
vercel env add ECOMAIL_API_KEY production
# …atd.
vercel --prod
```

Nezapomeň `NEXT_PUBLIC_SITE_URL=https://levstra.cz` v production env (používá se v Comgate returnUrl/notifyUrl).
