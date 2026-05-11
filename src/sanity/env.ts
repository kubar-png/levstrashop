/**
 * Sanity env vars with graceful fallback.
 *
 * Returning a placeholder when unset lets the build complete and the storefront
 * fall back to mock data (see src/lib/data.ts). Real values activate Sanity.
 */
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder';
export const writeToken = process.env.SANITY_API_WRITE_TOKEN;
