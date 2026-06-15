import type { OrderDoc } from '@/lib/orders';
import { EMAIL_COLORS as c, emailButton, emailShell, escapeHtml } from './shared';

/** Review request — sent a few days after the order is marked delivered. */
export function renderReviewRequest(
  order: OrderDoc,
  opts: { reviewUrl: string; incentive?: string },
): { subject: string; html: string; text: string } {
  const ref = order.refId || '';
  const subject = `Jak jste spokojeni s nákupem? — Ciaobag`;
  const preheader = `Pomozte ostatním — ohodnoťte objednávku ${ref}.`;

  const itemsList = (order.items ?? [])
    .map((it) => `<li style="margin-bottom:4px;">${escapeHtml(it.title)}</li>`)
    .join('');

  const body = `
    <p style="margin:0 0 14px 0;">Doufáme, že vám zboží z objednávky <strong>${escapeHtml(ref)}</strong>
      udělalo radost a už ho stíháte naplno používat.</p>
    <p style="margin:0 0 18px 0;">Budeme moc rádi, když nám věnujete chvilku a napíšete krátké hodnocení —
      pomůžete tím ostatním při výběru.</p>
    ${itemsList ? `<ul style="margin:0 0 22px 0;padding-left:20px;color:${c.ink};font-size:14px;line-height:1.6;">${itemsList}</ul>` : ''}
    <div style="text-align:center;">${emailButton('Napsat hodnocení', opts.reviewUrl)}</div>
    ${opts.incentive ? `<p style="margin:22px 0 0 0;text-align:center;color:${c.muted};font-size:13px;">${escapeHtml(opts.incentive)}</p>` : ''}
  `;

  const html = emailShell({ preheader, title: 'Jak jste spokojeni?', body });

  const text =
    `Děkujeme za nákup (objednávka ${ref}).\n\n` +
    `Ohodnoťte prosím svůj nákup: ${opts.reviewUrl}\n` +
    (opts.incentive ? `\n${opts.incentive}\n` : '');

  return { subject, html, text };
}
