import { defineType, defineField } from 'sanity';

export const review = defineType({
  name: 'review',
  title: 'Recenze',
  type: 'document',
  fields: [
    defineField({
      name: 'rating',
      title: 'Hodnocení',
      type: 'number',
      options: {
        list: [
          { title: '★★★★★', value: 5 },
          { title: '★★★★', value: 4 },
          { title: '★★★', value: 3 },
          { title: '★★', value: 2 },
          { title: '★', value: 1 },
        ],
      },
      validation: (r) => r.required().min(1).max(5).integer(),
    }),
    defineField({
      name: 'text',
      title: 'Text recenze',
      type: 'text',
      rows: 4,
      validation: (r) => r.required().min(10).max(800),
    }),
    defineField({
      name: 'customerName',
      title: 'Jméno zákaznice',
      type: 'string',
      description: 'Křestní jméno + iniciál (např. „Klára M.") — kvůli GDPR neukládáme celé jméno.',
      validation: (r) => r.required().max(60),
    }),
    defineField({
      name: 'customerLocation',
      title: 'Město / lokalita',
      type: 'string',
      description: 'Volitelné. Např. „Praha", „Brno".',
    }),
    defineField({
      name: 'product',
      title: 'K jakému produktu',
      type: 'reference',
      to: [{ type: 'product' }],
      description: 'Prázdné = obecná recenze značky (zobrazí se na všech produktech).',
    }),
    defineField({
      name: 'verified',
      title: 'Ověřený nákup?',
      type: 'boolean',
      initialValue: false,
      description: 'Pokud recenze pochází od skutečného zákazníka s objednávkou.',
    }),
    defineField({
      name: 'published',
      title: 'Publikováno na webu',
      type: 'boolean',
      initialValue: false,
      description: 'Až po schválení.',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Datum recenze',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
  ],

  orderings: [
    {
      title: 'Nejnovější',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Nejlepší hodnocení',
      name: 'ratingDesc',
      by: [
        { field: 'rating', direction: 'desc' },
        { field: 'publishedAt', direction: 'desc' },
      ],
    },
  ],

  preview: {
    select: {
      name: 'customerName',
      rating: 'rating',
      text: 'text',
      published: 'published',
      verified: 'verified',
    },
    prepare: ({ name, rating, text, published, verified }) => {
      const stars = '★'.repeat(rating ?? 0).padEnd(5, '☆');
      return {
        title: `${stars} · ${name}${verified ? ' ✓' : ''}`,
        subtitle: `${published ? '● ' : '○ '}${(text ?? '').slice(0, 70)}…`,
      };
    },
  },
});
