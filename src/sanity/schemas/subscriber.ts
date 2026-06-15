import { defineType, defineField } from 'sanity';

export const subscriber = defineType({
  name: 'subscriber',
  title: 'Odběratel (e-mail)',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'E-mail',
      type: 'string',
      description: 'Ukládá se vždy malými písmeny. Deduplikováno podle e-mailu.',
      validation: (r) =>
        r
          .required()
          .lowercase()
          .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { name: 'platný e-mail' }),
    }),
    defineField({
      name: 'source',
      title: 'Zdroj',
      type: 'string',
      description: 'Odkud e-mail přišel, např. „welcome-popup".',
      initialValue: 'welcome-popup',
    }),
    defineField({
      name: 'createdAt',
      title: 'Vytvořeno',
      type: 'datetime',
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
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
      email: 'email',
      source: 'source',
      createdAt: 'createdAt',
    },
    prepare: ({ email, source, createdAt }) => {
      const when = createdAt ? new Date(createdAt).toLocaleDateString('cs-CZ') : '';
      return {
        title: email,
        subtitle: [source, when].filter(Boolean).join(' · '),
      };
    },
  },
});
