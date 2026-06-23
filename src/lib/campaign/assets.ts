import type { Palette } from './types';

/** A lifestyle/model photo tagged with the product category it suits, so a
 *  suitcase ad never gets a model holding a handbag (and vice versa). */
export type Background = { url: string; category: string };

// Model photography already shipping on the live site. These are Marina Galanti
// fashion / handbag shots, so they're tagged 'Kabelky'. Add suitcase lifestyle
// photos tagged 'Kufry' here to unlock lifestyle templates for luggage.
const WIX = 'https://static.wixstatic.com/media';
export const LIFESTYLE_BACKGROUNDS: Background[] = [
  { url: `${WIX}/f0cf6b_0fb65fabc4d54b149a2b6213e5153e9e~mv2.jpg`, category: 'Kabelky' }, // Marina model
  { url: `${WIX}/f0cf6b_510434021b004f2abcfcc53a3a965203~mv2.jpg`, category: 'Kabelky' }, // Hero rotation 1
  { url: `${WIX}/f0cf6b_29b8ee8366484656828782c7267140df~mv2.jpg`, category: 'Kabelky' }, // Hero rotation 2
  { url: `${WIX}/f0cf6b_447c2054b701497e93bbfa703008a619~mv2.jpg`, category: 'Kabelky' }, // Hero rotation 3
];

// Brand-token combinations. Keep contrast high enough for white/cream text.
export const PALETTES: Palette[] = [
  { bg: '#2d5143', ink: '#f2f0eb', accent: '#e1f861', cta: '#e1f861', ctaInk: '#2b312f' }, // forest + lime
  { bg: '#1f4537', ink: '#f2f0eb', accent: '#a0c8ff', cta: '#e1f861', ctaInk: '#2b312f' }, // deep forest + sky
  { bg: '#f2f0eb', ink: '#2b312f', accent: '#ee7734', cta: '#2d5143', ctaInk: '#f2f0eb' }, // cream + forest CTA
  { bg: '#a0c8ff', ink: '#1f4537', accent: '#2d5143', cta: '#2d5143', ctaInk: '#f2f0eb' }, // sky + forest
  { bg: '#ddbfb7', ink: '#2b312f', accent: '#b43e2e', cta: '#2d5143', ctaInk: '#f2f0eb' }, // blush + forest
];
