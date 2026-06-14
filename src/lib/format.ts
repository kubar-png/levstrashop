export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || 'CZK';
export const LOCALE = process.env.NEXT_PUBLIC_LOCALE || 'cs-CZ';

export function formatPrice(cents: number, currency: string = CURRENCY) {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** URL-safe slug of a colour label, e.g. "Světle modrá" → "svetle-modra". */
export function colorToSlug(color: string): string {
  return color
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
