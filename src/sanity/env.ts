/**
 * Sanity env vars with graceful fallback.
 *
 * Returning a placeholder when unset lets the build complete and the storefront
 * fall back to mock data (see src/lib/data.ts). Real values activate Sanity.
 */
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder';

/**
 * Server-only write token. Required for the order pipeline:
 *   - Create / update order documents from /api/checkout and webhooks
 *   - Decrement stock after successful payment
 *
 * Create in Sanity dashboard → API → Tokens (Editor or Deploy Studio role).
 * Add to .env.local + Vercel as SANITY_API_WRITE_TOKEN.
 */
export const writeToken = process.env.SANITY_API_WRITE_TOKEN;

export function isSanityConfigured(): boolean {
  return projectId !== 'placeholder';
}

export function isSanityWritable(): boolean {
  return isSanityConfigured() && !!writeToken;
}
