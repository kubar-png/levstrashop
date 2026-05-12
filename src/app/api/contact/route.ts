import { NextResponse } from 'next/server';
import { sendContactAutoReply, sendContactNotification } from '@/lib/resend';

export const runtime = 'nodejs';

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Neplatný požadavek' }, { status: 400 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  const message = (body.message ?? '').trim();
  const name = body.name?.trim();
  const phone = body.phone?.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Zadejte platný e-mail.' }, { status: 400 });
  }
  if (message.length < 5) {
    return NextResponse.json({ error: 'Zpráva je příliš krátká.' }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: 'Zpráva je příliš dlouhá.' }, { status: 400 });
  }

  /* Internal inbox notification + customer auto-reply in parallel. */
  const [internal, reply] = await Promise.all([
    sendContactNotification({ name, email, phone, message }),
    sendContactAutoReply({ to: email, name, message }),
  ]);

  if (!internal.ok) {
    console.error('[contact] internal notification failed:', internal.error);
    return NextResponse.json(
      { error: 'Zprávu se nepodařilo odeslat. Zkuste to prosím později.' },
      { status: 502 },
    );
  }
  if (!reply.ok) {
    /* Auto-reply failure is non-fatal — log and continue. */
    console.warn('[contact] auto-reply failed:', reply.error);
  }

  return NextResponse.json({ ok: true });
}
