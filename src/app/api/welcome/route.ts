import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { sanityWriteClient } from '@/sanity/client';
import { isSanityWritable } from '@/sanity/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Welcome popup capture.
 *
 * Stores the e-mail as a `subscriber` doc (deduped by lowercased e-mail via a
 * deterministic _id) and hands back the welcome code so the popup can auto-apply
 * it to the cart. We do NOT send any e-mail and we do NOT use Ecomail.
 *
 * Missing write token is non-fatal: we still return the code so the visitor
 * gets their discount — only the capture is skipped.
 */

const WELCOME_CODE = 'VITEJTE10';
const WELCOME_PERCENT = 10;

type Body = {
  email?: string;
};

function subscriberIdFor(email: string): string {
  const hash = createHash('sha1').update(email).digest('hex');
  return `subscriber.${hash}`;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'Neplatný požadavek' }, { status: 400 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'Zadejte platný e-mail.' }, { status: 400 });
  }

  /* Best-effort capture. Deterministic _id keeps it deduped per e-mail. */
  if (isSanityWritable()) {
    try {
      await sanityWriteClient.createOrReplace({
        _id: subscriberIdFor(email),
        _type: 'subscriber',
        email,
        source: 'welcome-popup',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      /* Don't punish the visitor for our storage hiccup — still return the code. */
      console.error('[welcome] subscriber upsert failed:', err);
    }
  } else {
    console.warn('[welcome] Sanity not writable — skipping subscriber capture.');
  }

  return NextResponse.json({ ok: true, code: WELCOME_CODE, percent: WELCOME_PERCENT });
}
