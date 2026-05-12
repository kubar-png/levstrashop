import type { OrderDoc } from '@/lib/orders';
import { EMAIL_COLORS as c, emailShell, escapeHtml, formatPriceKc } from './shared';

export function renderOrderConfirmation(order: OrderDoc): { subject: string; html: string; text: string } {
  const ref = order.refId || '';
  const subject = `Potvrzení objednávky ${ref} — Levstra`;
  const preheader = `Děkujeme za vaši objednávku ${ref}. Zboží zabalíme co nejdřív.`;

  const itemsRows = (order.items ?? [])
    .map((item) => {
      const meta = [item.size, item.color].filter(Boolean).join(' · ');
      const lineTotal = item.priceCents * item.qty;
      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid ${c.border};vertical-align:top;">
            <div style="font-size:15px;font-weight:600;color:${c.ink};">${escapeHtml(item.title)}</div>
            ${meta ? `<div style="font-size:12px;color:${c.muted};margin-top:2px;">${escapeHtml(meta)}</div>` : ''}
            <div style="font-size:12px;color:${c.muted};margin-top:2px;">${formatPriceKc(item.priceCents)} × ${item.qty}</div>
          </td>
          <td style="padding:14px 0;border-bottom:1px solid ${c.border};vertical-align:top;text-align:right;font-size:15px;font-weight:600;color:${c.ink};white-space:nowrap;">
            ${formatPriceKc(lineTotal)}
          </td>
        </tr>
      `;
    })
    .join('');

  const shippingBlock = (() => {
    const s = order.shipping ?? {};
    if (order.shippingMode === 'parcelshop') {
      return `
        <div style="font-weight:600;color:${c.ink};margin-bottom:4px;">PPL ParcelShop</div>
        ${s.parcelShopName ? `<div>${escapeHtml(s.parcelShopName)}</div>` : ''}
        ${s.parcelShopAddress ? `<div style="color:${c.muted};">${escapeHtml(s.parcelShopAddress)}</div>` : ''}
      `;
    }
    const lines = [s.name, s.street, [s.zip, s.city].filter(Boolean).join(' '), s.country]
      .filter(Boolean)
      .map((l) => `<div>${escapeHtml(l as string)}</div>`)
      .join('');
    return `
      <div style="font-weight:600;color:${c.ink};margin-bottom:4px;">Doručení na adresu (PPL)</div>
      ${lines || `<div style="color:${c.muted};">Adresa bude doplněna.</div>`}
    `;
  })();

  const totalsBlock = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
      <tr>
        <td style="padding:6px 0;font-size:14px;color:${c.muted};">Zboží</td>
        <td style="padding:6px 0;font-size:14px;color:${c.muted};text-align:right;white-space:nowrap;">${formatPriceKc(order.subtotalCents ?? 0)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:${c.muted};">Doprava</td>
        <td style="padding:6px 0;font-size:14px;color:${c.muted};text-align:right;white-space:nowrap;">${
          (order.shippingCents ?? 0) === 0 ? 'Zdarma' : formatPriceKc(order.shippingCents ?? 0)
        }</td>
      </tr>
      <tr>
        <td style="padding:12px 0 0 0;border-top:1px solid ${c.border};font-size:16px;font-weight:700;color:${c.ink};">Celkem</td>
        <td style="padding:12px 0 0 0;border-top:1px solid ${c.border};font-size:16px;font-weight:700;color:${c.ink};text-align:right;white-space:nowrap;">${formatPriceKc(order.totalCents ?? 0)}</td>
      </tr>
    </table>
  `;

  const body = `
    <div style="background:${c.cream};border-radius:14px;padding:18px 20px;margin-bottom:20px;">
      <div style="font-family:Georgia,serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${c.muted};">Číslo objednávky</div>
      <div style="font-size:22px;font-weight:600;letter-spacing:-0.01em;margin-top:2px;color:${c.ink};font-variant-numeric:tabular-nums;">${escapeHtml(ref)}</div>
    </div>

    <h3 style="margin:24px 0 8px 0;font-size:14px;letter-spacing:0.06em;text-transform:uppercase;color:${c.forest};">Položky</h3>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${itemsRows}</table>

    ${totalsBlock}

    <h3 style="margin:32px 0 8px 0;font-size:14px;letter-spacing:0.06em;text-transform:uppercase;color:${c.forest};">Doručení</h3>
    <div style="font-size:14px;line-height:1.55;color:${c.ink};">${shippingBlock}</div>

    <div style="margin-top:32px;text-align:center;">
      <a href="https://levstra.cz/shop" style="display:inline-block;background:${c.forest};color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:999px;">Pokračovat v nákupu</a>
    </div>
  `;

  const html = emailShell({
    preheader,
    title: 'Děkujeme za nákup!',
    intro: `<p style="margin:0;">Vaše objednávka <strong>${escapeHtml(ref)}</strong> byla úspěšně přijata. Co nejdřív ji zabalíme a předáme dopravci.</p>`,
    body,
  });

  const text =
    `Děkujeme za nákup!\n\n` +
    `Číslo objednávky: ${ref}\n\n` +
    (order.items ?? [])
      .map((it) => `• ${it.title} × ${it.qty} — ${formatPriceKc(it.priceCents * it.qty)}`)
      .join('\n') +
    `\n\nCelkem: ${formatPriceKc(order.totalCents ?? 0)}\n\n` +
    `Levstra · https://levstra.cz`;

  return { subject, html, text };
}
