import type { OrderDoc } from '@/lib/orders';
import { EMAIL_COLORS as c, emailButton, emailShell, escapeHtml, productThumb } from './shared';

/** Review request — sent a few days after the order is marked delivered. */
export function renderReviewRequest(
  order: OrderDoc,
  opts: { reviewUrl: string; incentive?: string },
): { subject: string; html: string; text: string } {
  const ref = order.refId || '';
  const subject = `Jak jste spokojeni s nákupem? — Ciaobag`;
  const preheader = `Pomozte ostatním — ohodnoťte objednávku ${ref}.`;

  const itemsRows = (order.items ?? [])
    .map(
      (it) => `
        <tr>
          <td style="padding:5px 12px 5px 0;vertical-align:middle;width:48px;">${productThumb(it.image, it.title, 48)}</td>
          <td style="padding:5px 0;vertical-align:middle;font-size:14px;color:${c.ink};">${escapeHtml(it.title)}</td>
        </tr>`,
    )
    .join('');

  const body = `
    <p style="margin:0 0 14px 0;">Doufáme, že vám zboží z objednávky <strong>${escapeHtml(ref)}</strong>
      udělalo radost a už ho stíháte naplno používat.</p>
    <p style="margin:0 0 18px 0;">Budeme moc rádi, když nám věnujete chvilku a napíšete krátké hodnocení —
      pomůžete tím ostatním při výběru.</p>
    ${itemsRows ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px 0;">${itemsRows}</table>` : ''}
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
