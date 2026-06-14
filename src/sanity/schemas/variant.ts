import { defineType, defineField } from 'sanity';

export const variant = defineType({
  name: 'variant',
  title: 'Variant',
  type: 'object',
  fields: [
    defineField({
      name: 'sku',
      type: 'string',
      description: 'Unique stock-keeping unit',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'size',
      type: 'string',
      options: {
        list: [
          { title: 'Small', value: 'S' },
          { title: 'Medium', value: 'M' },
          { title: 'Large', value: 'L' },
          { title: 'X-Large', value: 'XL' },
          { title: 'Cabin (55cm)', value: 'cabin-55' },
          { title: 'Medium (65cm)', value: 'medium-65' },
          { title: 'Large (75cm)', value: 'large-75' },
          { title: 'One Size', value: 'one-size' },
        ],
      },
    }),
    defineField({ name: 'color', type: 'string' }),
    defineField({
      name: 'images',
      title: 'Fotky varianty',
      type: 'array',
      description: 'Volitelné — přebijí fotky produktu pro tuto barvu/variantu',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
        },
      ],
      options: { layout: 'grid' },
    }),
    defineField({
      name: 'colorHex',
      type: 'string',
      description: 'Hex color for swatch display (e.g. #1c1c1c)',
    }),
    defineField({
      name: 'price',
      title: 'Cena (Kč)',
      type: 'number',
      description: 'Zadejte cenu v celých korunách, např. 299',
      validation: (r) => r.required().min(0).integer(),
    }),
    defineField({
      name: 'stock',
      type: 'number',
      validation: (r) => r.required().min(0).integer(),
      initialValue: 0,
    }),
    defineField({
      name: 'weightGrams',
      title: 'Weight (g)',
      type: 'number',
      description: 'Used for PPL shipping calculation',
    }),
    defineField({ name: 'lengthCm', title: 'Délka (cm)', type: 'number' }),
    defineField({ name: 'widthCm', title: 'Šířka (cm)', type: 'number' }),
    defineField({ name: 'heightCm', title: 'Výška (cm)', type: 'number' }),
  ],
  preview: {
    select: { sku: 'sku', size: 'size', color: 'color', stock: 'stock' },
    prepare: ({ sku, size, color, stock }) => ({
      title: sku,
      subtitle: [size, color, `stock: ${stock ?? 0}`].filter(Boolean).join(' · '),
    }),
  },
});
