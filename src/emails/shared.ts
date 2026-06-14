/**
 * Email design tokens — kept in lockstep with src/app/globals.css brand colors.
 * Inline-styled HTML strings are used because email clients hate stylesheets.
 */

export const EMAIL_COLORS = {
  ink: '#2B312F',
  forest: '#2D5143',
  cream: '#F2F0EB',
  bg: '#EEEEEE',
  sky: '#A0C8FF',
  lime: '#E1F861',
  orange: '#EE7734',
  blush: '#DDBFB7',
  border: '#E0DDD4',
  muted: '#6B6F6C',
};

export const EMAIL_FONTS = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;

export function formatPriceKc(cents: number): string {
  const v = (cents / 100).toLocaleString('cs-CZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${v} Kč`;
}

export function emailShell({
  preheader,
  title,
  intro,
  body,
  footer,
}: {
  preheader: string;
  title: string;
  intro?: string;
  body: string;
  footer?: string;
}): string {
  const c = EMAIL_COLORS;
  return `<!DOCTYPE html><html lang="cs"><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${c.bg};font-family:${EMAIL_FONTS};color:${c.ink};-webkit-font-smoothing:antialiased;">
  <span style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${c.bg};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 1px 0 rgba(0,0,0,0.04);">

        <tr><td style="background:${c.forest};padding:28px 32px;color:#fff;">
          <div style="font-family:Georgia,serif;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.7);">Ciaobag</div>
          <div style="font-size:24px;font-weight:600;letter-spacing:-0.02em;margin-top:6px;line-height:1.1;">${escapeHtml(title)}</div>
        </td></tr>

        ${
          intro
            ? `<tr><td style="padding:28px 32px 8px 32px;font-size:16px;line-height:1.55;color:${c.ink};">${intro}</td></tr>`
            : ''
        }

        <tr><td style="padding:${intro ? '12px' : '28px'} 32px 32px 32px;font-size:15px;line-height:1.55;color:${c.ink};">
          ${body}
        </td></tr>

        <tr><td style="background:${c.cream};padding:24px 32px;font-size:12px;line-height:1.6;color:${c.muted};">
          ${footer ?? defaultFooter()}
        </td></tr>

      </table>
      <div style="font-size:11px;color:${c.muted};margin-top:16px;font-family:${EMAIL_FONTS};">Levstra s.r.o. · Hněvkovského 587/39a, 617 00 Brno · IČO 27686281</div>
    </td></tr>
  </table>
</body></html>`;
}

function defaultFooter() {
  return `
    Tento e-mail jste obdrželi v souvislosti s objednávkou na <a href="https://levstra.cz" style="color:${EMAIL_COLORS.forest};text-decoration:none;">levstra.cz</a>.<br>
    Máte otázku? Napište nám na <a href="mailto:info@levstra.cz" style="color:${EMAIL_COLORS.forest};text-decoration:none;">info@levstra.cz</a>.
  `;
}

export function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
