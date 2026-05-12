import { NextResponse } from 'next/server';
import { subscribeToNewsletter } from '@/lib/ecomail';

export const runtime = 'nodejs';

type Body = {
  email?: string;
  name?: string;
  consent?: boolean;
  source?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Neplatný požadavek' }, { status: 400 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Zadejte platný e-mail.' }, { status: 400 });
  }
  if (!body.consent) {
    return NextResponse.json(
      { error: 'Pro přihlášení potvrďte souhlas s odběrem.' },
      { status: 400 },
    );
  }

  const result = await subscribeToNewsletter({
    email,
    name: body.name,
    source: body.source ?? 'website',
    consent: true,
  });

  if (!result.ok) {
    console.error('[newsletter] subscribe failed:', result.error);
    return NextResponse.json(
      { error: 'Přihlášení se nezdařilo. Zkuste to prosím později.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, id: result.id });
}
