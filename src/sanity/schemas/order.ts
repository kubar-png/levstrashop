import { defineType, defineField } from 'sanity';

export const order = defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({ name: 'stripeSessionId', type: 'string' }),
    defineField({ name: 'stripePaymentIntent', type: 'string' }),
    defineField({
      name: 'status',
      type: 'string',
      options: {
        list: ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'],
      },
      initialValue: 'pending',
    }),
    defineField({ name: 'email', type: 'string' }),
    defineField({ name: 'totalCents', type: 'number' }),
    defineField({ name: 'currency', type: 'string' }),
    defineField({
      name: 'items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'productId', type: 'string' },
            { name: 'title', type: 'string' },
            { name: 'sku', type: 'string' },
            { name: 'size', type: 'string' },
            { name: 'color', type: 'string' },
            { name: 'qty', type: 'number' },
            { name: 'priceCents', type: 'number' },
          ],
        },
      ],
    }),
    defineField({
      name: 'shipping',
      type: 'object',
      fields: [
        { name: 'name', type: 'string' },
        { name: 'phone', type: 'string' },
        { name: 'street', type: 'string' },
        { name: 'city', type: 'string' },
        { name: 'zip', type: 'string' },
        { name: 'country', type: 'string' },
        { name: 'pplParcelShopId', type: 'string', description: 'If PPL ParcelShop selected' },
        { name: 'pplShipmentNumber', type: 'string' },
      ],
    }),
    defineField({ name: 'createdAt', type: 'datetime' }),
  ],
  preview: {
    select: { id: 'stripeSessionId', email: 'email', status: 'status', total: 'totalCents' },
    prepare: ({ id, email, status, total }) => ({
      title: email || id,
      subtitle: `${status} · ${(total ?? 0) / 100}`,
    }),
  },
});
