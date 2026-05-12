# PPL — manuální workflow zatím (než přijde myAPI v4)

Než PPL/DHL aktivuje OAuth přístup k REST API, štítky vytváříme ručně v PPL web aplikaci. Tento doc popisuje rychlý postup od zaplacené objednávky až po odeslaný e-mail zákaznici.

## Jednou na začátku

### 1. Sanity webhook → shipping e-mail

V <https://sanity.io/manage> → projekt levstra → **API → Webhooks → Create webhook**:

| Pole | Hodnota |
|------|---------|
| Name | `order-status-changes` |
| URL | `https://levstra.cz/api/webhooks/sanity-order` |
| Dataset | `production` |
| Trigger on | Create + Update |
| Filter | `_type == "order"` |
| Projection | nech default (`{...}`) — endpoint čte `refId` a `status` |
| HTTP method | `POST` |
| API version | `v2025-01-01` |
| Include drafts | ne |
| Secret | klikni na **Generate** — pak hodnotu zkopíruj |
| Status | enabled |

Vygenerovaný secret hoď do envů:

```bash
vercel env add SANITY_ORDER_WEBHOOK_SECRET production
vercel env add SANITY_ORDER_WEBHOOK_SECRET preview
# a do .env.local pro lokální dev
```

Redeploy, ať se secret načte.

### 2. PPL přístup do webové aplikace

- Mojepartnerstvi.ppl.cz nebo mybusiness.dhl.cz (po fúzi) — login firemními údaji
- Zkontroluj, že máš ve **smlouvě** povolené produkty, které prodáváš (PPL Parcel CZ Business, ParcelShop, eventuálně Dobírka)

## Pro každou objednávku

### A. V Sanity Studio (`/studio`)

1. Otevři sekci **Objednávka** → list je seřazený nejnovějším nahoru
2. Klikni na objednávku se statusem **✓ Zaplaceno**
3. V detailu uvidíš:
   - Číslo objednávky (refId) → vlož do PPL jako externí číslo zásilky
   - Jméno + příjmení + telefon → příjemce
   - Doručovací mód: `PPL na adresu` (s adresou) nebo `PPL ParcelShop` (s ID výdejny)
   - Celkem (Kč), hmotnost (uvnitř items)
   - Fakturační údaje (pokud klient chtěl fakturu na firmu)

### B. V PPL/DHL web aplikaci

1. **Vytvořit novou zásilku** → Standardní (PPL na adresu) nebo ParcelShop
2. Příjemce:
   - Jméno: `firstName lastName` z Sanity
   - Telefon: zkopíruj přesně (PPL si telefon ohlídá kvůli SMS notifikaci)
   - E-mail: ten z objednávky
   - Adresa: ulice, PSČ, město (jen u "na adresu")
   - Výdejna: kód z `shipping.parcelShopId` (jen u ParcelShop)
3. **Reference / Externí číslo:** vlož `refId` (např. `LEV-260512-A3K7`)
4. **Hmotnost:** součet `weightGrams / 1000` ze všech položek
5. Vytisknout štítek + nalepit na balík

### C. Zpět v Sanity Studio

1. V objednávce rozbal sekci **Expedice (fulfilment)**
2. Vyplň:
   - **PPL číslo zásilky** — to číslo, co tiskneš na štítku (slouží i pro sledování zákazníkem)
   - **PPL štítek (URL)** — volitelné, můžeš sem hodit PDF z PPL, ať to máš
   - **Interní poznámka** — pokud něco zvláštního
3. Status změň na **🚚 Odesláno**
4. Klikni **Publish**

V tu chvíli Sanity webhook zavolá `/api/webhooks/sanity-order`, ten ověří podpis, zjistí, že emailsSent.shipped ještě není set, a zavolá Resend `sendOrderShipped(order, { trackingNumber, trackingUrl })`. Zákaznice dostane e-mail s číslem zásilky a odkazem na sledování.

E-mail se odešle **právě jednou** — pokud byste status omylem flipli zpátky a znovu na "Odesláno", druhý e-mail už nepřijde (kontroluje se přes `order.emailsSent.shipped` timestamp).

## Co je hotové, co ne

- ✅ Lookup výdejen PPL ParcelShop (`/api/ppl/parcelshops`) — funguje bez auth, je v košíku
- ✅ Sběr doručovací + fakturační adresy v cart flow
- ✅ Order doc se všemi údaji potřebnými pro štítek
- ✅ Confirmation e-mail při zaplacení
- ✅ Shipping e-mail při změně statusu (skrz Sanity webhook)
- ⏳ Automatické vytvoření štítku — čeká na REST OAuth credentials od PPL
- ⏳ Automatický cron, co stahuje status z PPL (delivered) — taky čeká na REST

## Až přijdou OAuth credentials

`src/lib/ppl.ts` už má napsanou `createShipment()` funkci pro REST endpoint. Jakmile dostaneš `clientId` + `clientSecret`, hodíme to do envů a já připojím:

1. **Tlačítko „Vytvořit PPL štítek" ve Studiu** (přes Sanity Studio Action), které volá `createShipment(order)` a automaticky vyplní `fulfilment.pplShipmentNumber` + `pplLabelUrl`
2. **Cron, co ráno ve 6:00** projede odeslané objednávky a zaktualizuje status na **doručeno** dle PPL tracking API
