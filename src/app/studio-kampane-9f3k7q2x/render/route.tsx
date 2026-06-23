import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { decodeSpec } from '@/lib/campaign/codec';
import { DIMENSIONS } from '@/lib/campaign/types';
import type { VariantSpec } from '@/lib/campaign/types';
import { renderVariant } from '@/lib/campaign/render-templates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FONT_DIR = join(process.cwd(), 'src/app/studio-kampane-9f3k7q2x/_fonts');
async function font(file: string) {
  return readFile(join(FONT_DIR, file));
}

/**
 * Rewrite a Wix media URL to request a downscaled version (max 1080px on longest side).
 * This keeps the SVG payload small enough for resvg's XML parser.
 * Non-Wix URLs are returned as-is.
 */
function wixResize(url: string, maxPx = 1080): string {
  if (!url.includes('wixstatic.com/media/')) return url;
  // Strip any existing Wix transform suffix and append a resize directive
  const base = url.replace(/\/v1\/.*$/, '');
  // Wix requires both w and h; use fit mode (lg) to preserve aspect ratio
  return `${base}/v1/fill/w_${maxPx},h_${maxPx},al_c,q_80,usm_0.66_1.00_0.01/image.jpg`;
}

/** Fetch a URL and return a base64 data URI (JPEG). */
async function toDataUri(url: string): Promise<string> {
  const res = await fetch(wixResize(url));
  if (!res.ok) return url; // fall back to original URL on fetch failure
  const buf = await res.arrayBuffer();
  const b64 = Buffer.from(buf).toString('base64');
  const mime = res.headers.get('content-type') ?? 'image/jpeg';
  return `data:${mime};base64,${b64}`;
}

/** Pre-fetch all image URLs in the spec and replace with data URIs. */
async function prefetchImages(spec: VariantSpec): Promise<VariantSpec> {
  const urls = new Set<string>();
  if (spec.lifestyleUrl) urls.add(spec.lifestyleUrl);
  if (spec.product.imageUrl) urls.add(spec.product.imageUrl);

  const cache = new Map<string, string>();
  await Promise.all(
    [...urls].map(async (u) => {
      cache.set(u, await toDataUri(u));
    }),
  );

  return {
    ...spec,
    lifestyleUrl: spec.lifestyleUrl ? (cache.get(spec.lifestyleUrl) ?? spec.lifestyleUrl) : undefined,
    product: {
      ...spec.product,
      imageUrl: cache.get(spec.product.imageUrl) ?? spec.product.imageUrl,
    },
  };
}

export async function GET(request: Request): Promise<Response> {
  const s = new URL(request.url).searchParams.get('s');
  if (!s) return new Response('missing spec', { status: 400 });

  let spec: VariantSpec;
  try {
    spec = decodeSpec(s);
  } catch {
    return new Response('bad spec', { status: 400 });
  }

  const { width, height } = DIMENSIONS[spec.format];
  const [poppinsSemi, poppinsLight, forum, resolvedSpec] = await Promise.all([
    font('Poppins-SemiBold.ttf'),
    font('Poppins-ExtraLight.ttf'),
    font('Forum-Regular.ttf'),
    prefetchImages(spec),
  ]);

  return new ImageResponse(renderVariant(resolvedSpec), {
    width,
    height,
    fonts: [
      { name: 'Poppins', data: poppinsSemi, weight: 600, style: 'normal' },
      { name: 'Poppins', data: poppinsLight, weight: 200, style: 'normal' },
      { name: 'Forum', data: forum, weight: 400, style: 'normal' },
    ],
  });
}
