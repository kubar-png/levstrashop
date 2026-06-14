import { defineType, defineField } from 'sanity';

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'shortDescription',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
        },
      ],
      options: { layout: 'grid' },
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'variants',
      type: 'array',
      of: [{ type: 'variant' }],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'featuredRank',
      title: 'Pořadí mezi featured',
      type: 'number',
      description: 'Nižší číslo = více vlevo v sekci "Nejoblíbenější". Prázdné = zařadí se na konec.',
    }),
    defineField({
      name: 'colorGroup',
      type: 'string',
      description: 'Groups color variants of the same model (e.g. "riga", "nikol")',
    }),
    defineField({
      name: 'colorHex',
      type: 'string',
      description: 'Hex color of this product for color swatches (e.g. #e07a3a)',
    }),
    defineField({
      name: 'heroColor',
      type: 'string',
      description: 'Variant colour used for the catalog/hero image (PDP opens this colour).',
      readOnly: true,
    }),
    defineField({
      name: 'active',
      type: 'boolean',
      description: 'If off, product is hidden from storefront',
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: 'title', media: 'images.0', category: 'category.title' },
    prepare: ({ title, media, category }) => ({
      title,
      subtitle: category,
      media,
    }),
  },
});
