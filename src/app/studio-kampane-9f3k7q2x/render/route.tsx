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
 * Normalise an image URL to a render-friendly size: large enough for a crisp
 * full-bleed image, small enough that resvg's XML parser stays within bounds
 * (the original 14 MB Wix files overflow it). Handles the two CDNs we use; any
 * other URL is returned untouched.
 */
function resizeImage(url: string, px = 1280): string {
  if (url.includes('wixstatic.com/media/')) {
    const base = url.replace(/\/v1\/.*$/, '');
    return `${base}/v1/fill/w_${px},h_${px},al_c,q_80,usm_0.66_1.00_0.01/image.jpg`;
  }
  if (url.includes('cdn.sanity.io/images/')) {
    // Bump the requested width so the product photo is sharp when it fills the frame.
    return /[?&]w=\d+/.test(url) ? url.replace(/([?&])w=\d+/, `$1w=${px}`) : `${url}${url.includes('?') ? '&' : '?'}w=${px}`;
  }
  return url;
}

/**
 * Rewrite the spec's image URLs to downscaled (≤1080px) variants. Satori/og then
 * fetches the small images itself at render time — this keeps resvg's XML parser
 * within bounds (the original 14 MB Wix files overflow it) without inlining the
 * bytes as base64 data URIs (which fail under the production bundle).
 */
function resizeSpecImages(spec: VariantSpec): VariantSpec {
  return {
    ...spec,
    lifestyleUrl: spec.lifestyleUrl ? resizeImage(spec.lifestyleUrl) : undefined,
    product: { ...spec.product, imageUrl: resizeImage(spec.product.imageUrl) },
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
  const [poppinsSemi, poppinsBold] = await Promise.all([
    font('Poppins-SemiBold.ttf'),
    font('Poppins-Bold.ttf'),
  ]);

  try {
    const image = new ImageResponse(renderVariant(resizeSpecImages(spec)), {
      width,
      height,
      fonts: [
        { name: 'Poppins', data: poppinsSemi, weight: 600, style: 'normal' },
        { name: 'Poppins', data: poppinsBold, weight: 700, style: 'normal' },
      ],
    });
    // Materialise the PNG instead of streaming it (the streamed body fails to
    // pipe under the production server) and surface render errors as a 500 we
    // can actually read, rather than an opaque "failed to pipe response".
    const png = await image.arrayBuffer();
    return new Response(png, {
      headers: { 'content-type': 'image/png', 'cache-control': 'no-store' },
    });
  } catch (e) {
    const err = e as { message?: string; stack?: string };
    console.error('[render] failed:', err?.message, err?.stack);
    return new Response('render failed', { status: 500 });
  }
}
