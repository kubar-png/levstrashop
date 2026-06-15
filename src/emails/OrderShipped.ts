import type { OrderDoc } from '@/lib/orders';
import { EMAIL_COLORS as c, emailShell, escapeHtml } from './shared';

export function renderOrderShipped(
  order: OrderDoc,
  opts: { trackingNumber?: string; trackingUrl?: string } = {},
): { subject: string; html: string; text: string } {
  const ref = order.refId || '';
  const subject = `Vaše objednávka ${ref} je na cestě — Ciaobag`;
  const preheader = `Předali jsme balíček dopravci PPL. Sledujte zásilku online.`;

  const trackingBlock =
    opts.trackingNumber || opts.trackingUrl
      ? `
        <div style="background:${c.cream};border-radius:14px;padding:18px 20px;margin-top:20px;">
          ${
            opts.trackingNumber
              ? `<div style="font-family:Georgia,serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${c.muted};">Číslo zásilky PPL</div>
                 <div style="font-size:18px;font-weight:600;color:${c.ink};font-variant-numeric:tabular-nums;margin-top:2px;">${escapeHtml(opts.trackingNumber)}</div>`
              : ''
          }
          ${
            opts.trackingUrl
              ? `<div style="margin-top:14px;"><a href="${escapeHtml(opts.trackingUrl)}" style="display:inline-block;background:${c.forest};color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:999px;">Sledovat zásilku</a></div>`
              : ''
          }
        </div>
      `
      : '';

  const body = `
    <p style="margin:0 0 14px 0;">Skvělá zpráva — vaše objednávka <strong>${escapeHtml(ref)}</strong> právě opustila naše skladové prostory a putuje k vám.</p>
    <p style="margin:0;color:${c.muted};">Dodací doba zpravidla 1–3 pracovní dny v rámci ČR.</p>
    ${trackingBlock}
  `;

  const html = emailShell({
    preheader,
    title: 'Balíček je na cestě',
    body,
  });

  const text =
    `Vaše objednávka ${ref} je na cestě.\n` +
    (opts.trackingNumber ? `Číslo zásilky: ${opts.trackingNumber}\n` : '') +
    (opts.trackingUrl ? `Sledovat: ${opts.trackingUrl}\n` : '') +
    `\nCiaobag · https://ciaobag.cz`;

  return { subject, html, text };
}
