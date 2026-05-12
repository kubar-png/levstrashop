import { defineType, defineField } from 'sanity';

export const discount = defineType({
  name: 'discount',
  title: 'Slevový kód',
  type: 'document',
  fields: [
    defineField({
      name: 'code',
      title: 'Kód',
      type: 'string',
      description:
        'Velkými písmeny bez mezer, např. VITEJTE10. Při validaci se kontroluje case-insensitive.',
      validation: (r) =>
        r
          .required()
          .min(3)
          .max(32)
          .regex(/^[A-Z0-9_-]+$/i, { name: 'kód bez mezer (jen A-Z, 0-9, _ a -)' }),
    }),
    defineField({
      name: 'description',
      title: 'Interní popis',
      type: 'string',
      description: 'K čemu kód patří (např. „Welcome flow z newsletteru"). Zákazník ho nevidí.',
    }),
    defineField({
      name: 'active',
      title: 'Aktivní?',
      type: 'boolean',
      initialValue: true,
      description: 'Vypnete-li, kód okamžitě přestane fungovat.',
    }),

    /* ── Sleva ─────────────────────────────────────────────── */
    defineField({
      name: 'type',
      title: 'Typ slevy',
      type: 'string',
      options: {
        list: [
          { title: 'Procentuální (%)', value: 'percent' },
          { title: 'Pevná částka (Kč)', value: 'fixed' },
          { title: 'Doprava zdarma', value: 'free-shipping' },
        ],
        layout: 'radio',
      },
      initialValue: 'percent',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'value',
      title: 'Hodnota slevy',
      type: 'number',
      description:
        'Procentuální = 10 znamená 10 %. Pevná = 200 znamená 200 Kč. U dopravy zdarma nemá vliv.',
      validation: (r) => r.required().min(0).max(100000),
      hidden: ({ document }) => document?.type === 'free-shipping',
    }),

    /* ── Omezení ───────────────────────────────────────────── */
    defineField({
      name: 'minOrderCents',
      title: 'Minimální hodnota košíku (haléře)',
      type: 'number',
      description: 'Např. 100000 = 1 000 Kč. Nechte prázdné = bez minimum.',
      validation: (r) => r.min(0),
    }),
    defineField({
      name: 'maxRedemptions',
      title: 'Max počet uplatnění',
      type: 'number',
      description: 'Celkový limit napříč všemi zákazníky. Prázdné = neomezeno.',
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: 'redemptionCount',
      title: 'Aktuální počet uplatnění',
      type: 'number',
      readOnly: true,
      initialValue: 0,
      description: 'Automaticky se zvyšuje při zaplacené objednávce.',
    }),
    defineField({
      name: 'validFrom',
      title: 'Platnost od',
      type: 'datetime',
      description: 'Prázdné = okamžitě.',
    }),
    defineField({
      name: 'validUntil',
      title: 'Platnost do',
      type: 'datetime',
      description: 'Prázdné = bez data konce.',
    }),
  ],

  preview: {
    select: {
      code: 'code',
      active: 'active',
      type: 'type',
      value: 'value',
      used: 'redemptionCount',
      max: 'maxRedemptions',
    },
    prepare: ({ code, active, type, value, used, max }) => {
      const typeLabel: Record<string, string> = {
        percent: `${value} %`,
        fixed: `${value} Kč`,
        'free-shipping': 'Doprava zdarma',
      };
      const usage = max ? `${used ?? 0} / ${max}` : `${used ?? 0}×`;
      return {
        title: code,
        subtitle: `${active ? '● ' : '○ '}${typeLabel[type] ?? type} · uplatněno ${usage}`,
      };
    },
  },
});
