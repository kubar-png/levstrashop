import { defineType, defineField } from 'sanity';

export const order = defineType({
  name: 'order',
  title: 'Objednávka',
  type: 'document',
  fields: [
    /* ── Identifiers ──────────────────────────────────────────── */
    defineField({
      name: 'refId',
      title: 'Číslo objednávky',
      type: 'string',
      description: 'Interní reference (předáno do Comgate / Stripe).',
      readOnly: true,
    }),
    defineField({
      name: 'paymentProvider',
      title: 'Platební brána',
      type: 'string',
      options: { list: ['comgate', 'stripe'] },
      readOnly: true,
    }),
    defineField({ name: 'comgateTransId', title: 'Comgate transId', type: 'string', readOnly: true }),
    defineField({ name: 'stripeSessionId', title: 'Stripe session ID', type: 'string', readOnly: true }),
    defineField({ name: 'stripePaymentIntent', title: 'Stripe payment intent', type: 'string', readOnly: true }),
    defineField({
      name: 'paymentMethod',
      title: 'Použitá platební metoda',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'isTest',
      title: 'Testovací platba?',
      type: 'boolean',
      initialValue: false,
      readOnly: true,
    }),

    /* ── Status ────────────────────────────────────────────────── */
    defineField({
      name: 'status',
      title: 'Stav objednávky',
      type: 'string',
      options: {
        list: [
          { title: 'Čeká na platbu', value: 'pending' },
          { title: 'Zaplaceno', value: 'paid' },
          { title: 'Zabaleno', value: 'packed' },
          { title: 'Odesláno', value: 'shipped' },
          { title: 'Doručeno', value: 'delivered' },
          { title: 'Zrušeno', value: 'cancelled' },
          { title: 'Vráceno', value: 'refunded' },
          { title: 'Platba selhala', value: 'failed' },
        ],
      },
      initialValue: 'pending',
    }),

    /* ── Customer / contact ───────────────────────────────────── */
    defineField({
      name: 'email',
      title: 'E-mail zákazníka',
      type: 'string',
      validation: (r) => r.email(),
    }),

    /* ── Money (everything in haléře / cents) ─────────────────── */
    defineField({ name: 'subtotalCents', title: 'Zboží (haléře)', type: 'number', readOnly: true }),
    defineField({ name: 'shippingCents', title: 'Doprava (haléře)', type: 'number', readOnly: true }),
    defineField({ name: 'totalCents', title: 'Celkem (haléře)', type: 'number', readOnly: true }),
    defineField({ name: 'currency', title: 'Měna', type: 'string', initialValue: 'CZK', readOnly: true }),

    /* ── Items ─────────────────────────────────────────────────── */
    defineField({
      name: 'items',
      title: 'Položky',
      type: 'array',
      readOnly: true,
      of: [
        {
          type: 'object',
          fields: [
            { name: 'productId', type: 'string' },
            { name: 'slug', type: 'string' },
            { name: 'title', type: 'string' },
            { name: 'sku', type: 'string' },
            { name: 'size', type: 'string' },
            { name: 'color', type: 'string' },
            { name: 'image', type: 'string', description: 'Image URL pro e-mail' },
            { name: 'qty', type: 'number' },
            { name: 'priceCents', type: 'number' },
          ],
          preview: {
            select: { title: 'title', sku: 'sku', qty: 'qty', price: 'priceCents' },
            prepare: ({ title, sku, qty, price }) => ({
              title: `${title || sku} × ${qty}`,
              subtitle: `${((price ?? 0) / 100).toFixed(0)} Kč/ks`,
            }),
          },
        },
      ],
    }),

    /* ── Shipping ─────────────────────────────────────────────── */
    defineField({
      name: 'shippingMode',
      title: 'Způsob dopravy',
      type: 'string',
      options: {
        list: [
          { title: 'PPL na adresu', value: 'home' },
          { title: 'PPL ParcelShop', value: 'parcelshop' },
        ],
      },
      readOnly: true,
    }),
    defineField({
      name: 'shipping',
      title: 'Doručovací údaje',
      type: 'object',
      fields: [
        { name: 'name', title: 'Jméno', type: 'string' },
        { name: 'phone', title: 'Telefon', type: 'string' },
        { name: 'street', title: 'Ulice', type: 'string' },
        { name: 'city', title: 'Město', type: 'string' },
        { name: 'zip', title: 'PSČ', type: 'string' },
        { name: 'country', title: 'Země', type: 'string' },
        {
          name: 'parcelShopId',
          title: 'PPL ParcelShop ID',
          type: 'string',
          description: 'Pokud je vybrán výdejní bod.',
        },
        { name: 'parcelShopName', title: 'PPL ParcelShop název', type: 'string' },
        { name: 'parcelShopAddress', title: 'PPL ParcelShop adresa', type: 'string' },
      ],
    }),

    /* ── Fulfilment ───────────────────────────────────────────── */
    defineField({
      name: 'fulfilment',
      title: 'Expedice',
      type: 'object',
      fields: [
        { name: 'pplShipmentNumber', title: 'PPL číslo zásilky', type: 'string' },
        { name: 'pplLabelUrl', title: 'PPL štítek (URL)', type: 'url' },
        { name: 'trackingUrl', title: 'Sledovací URL', type: 'url' },
        { name: 'note', title: 'Interní poznámka', type: 'text', rows: 3 },
      ],
    }),

    /* ── Email log ─────────────────────────────────────────────── */
    defineField({
      name: 'emailsSent',
      title: 'Odeslané e-maily',
      type: 'object',
      readOnly: true,
      fields: [
        { name: 'confirmation', title: 'Potvrzení objednávky', type: 'datetime' },
        { name: 'shipped', title: 'Zboží odesláno', type: 'datetime' },
        { name: 'paymentFailed', title: 'Platba selhala', type: 'datetime' },
      ],
    }),

    /* ── Ecomail link ─────────────────────────────────────────── */
    defineField({
      name: 'ecomailContactId',
      title: 'Ecomail contact ID',
      type: 'string',
      readOnly: true,
    }),

    /* ── Timestamps ───────────────────────────────────────────── */
    defineField({ name: 'createdAt', title: 'Vytvořeno', type: 'datetime', readOnly: true }),
    defineField({ name: 'paidAt', title: 'Zaplaceno', type: 'datetime', readOnly: true }),
    defineField({ name: 'shippedAt', title: 'Odesláno', type: 'datetime' }),
  ],

  orderings: [
    {
      title: 'Nejnovější',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
  ],

  preview: {
    select: {
      refId: 'refId',
      email: 'email',
      status: 'status',
      total: 'totalCents',
      createdAt: 'createdAt',
    },
    prepare: ({ refId, email, status, total, createdAt }) => {
      const date = createdAt ? new Date(createdAt).toLocaleDateString('cs-CZ') : '—';
      const statusLabel: Record<string, string> = {
        pending: '⌛ Čeká na platbu',
        paid: '✓ Zaplaceno',
        packed: '📦 Zabaleno',
        shipped: '🚚 Odesláno',
        delivered: '✓ Doručeno',
        cancelled: '✗ Zrušeno',
        refunded: '↩ Vráceno',
        failed: '✗ Platba selhala',
      };
      return {
        title: `${refId || '—'} · ${email || '—'}`,
        subtitle: `${statusLabel[status] ?? status} · ${((total ?? 0) / 100).toFixed(0)} Kč · ${date}`,
      };
    },
  },
});
