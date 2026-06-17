/**
 * Email design tokens — kept in lockstep with src/app/globals.css brand colors.
 * Inline-styled HTML (tables) is used because email clients hate stylesheets.
 */

export const EMAIL_COLORS = {
  ink: '#2B312F',
  forest: '#2D5143',
  forestDeep: '#1F4537',
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
export const EMAIL_SITE = 'https://www.ciaobag.cz';
export const EMAIL_CONTACT = 'ahoj@ciaobag.cz';

export function formatPriceKc(cents: number): string {
  const v = (cents / 100).toLocaleString('cs-CZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${v} Kč`;
}

/** Append Sanity CDN transform params so emails fetch a small cropped thumbnail,
 *  not the multi-MB original. No-op for non-Sanity / already-parametrised URLs. */
export function emailImageUrl(url: string, px = 120): string {
  if (!url) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}w=${px}&h=${px}&fit=crop&auto=format`;
}

/** Rounded square product thumbnail for item lists — the product hero shot so the
 *  customer sees what they ordered. Neutral box fallback when an item has no image. */
export function productThumb(url: string | undefined, alt: string, px = 56): string {
  const radius = Math.round(px * 0.18);
  const frame = `width:${px}px;height:${px}px;border-radius:${radius}px;display:block;background:${EMAIL_COLORS.cream};`;
  if (!url) return `<span style="${frame}"></span>`;
  return `<img src="${emailImageUrl(url, px * 2)}" width="${px}" height="${px}" alt="${escapeHtml(alt)}" style="${frame}object-fit:cover;border:1px solid ${EMAIL_COLORS.border};" />`;
}

/** Branded pill button (email-safe inline anchor). */
export function emailButton(label: string, href: string, variant: 'forest' | 'lime' = 'forest'): string {
  const c = EMAIL_COLORS;
  const bg = variant === 'lime' ? c.lime : c.forest;
  const fg = variant === 'lime' ? c.ink : '#ffffff';
  return `<a href="${href}" style="display:inline-block;background:${bg};color:${fg};font-size:14px;font-weight:600;text-decoration:none;padding:14px 30px;border-radius:999px;">${escapeHtml(label)}</a>`;
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
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,0.05);">

        <!-- Brand bar -->
        <tr><td style="background:${c.forestDeep};padding:24px 32px;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:0.01em;color:#ffffff;line-height:1;">
            <span style="color:${c.lime};">&#10038;</span>&nbsp;ciaobag
          </div>
        </td></tr>
        <tr><td style="height:4px;line-height:4px;font-size:0;background:${c.lime};">&nbsp;</td></tr>

        <!-- Title -->
        <tr><td style="padding:32px 32px 0 32px;">
          <h1 style="margin:0;font-size:25px;font-weight:700;letter-spacing:-0.02em;line-height:1.15;color:${c.ink};">${escapeHtml(title)}</h1>
        </td></tr>

        ${
          intro
            ? `<tr><td style="padding:14px 32px 0 32px;font-size:16px;line-height:1.55;color:${c.ink};">${intro}</td></tr>`
            : ''
        }

        <tr><td style="padding:24px 32px 32px 32px;font-size:15px;line-height:1.55;color:${c.ink};">
          ${body}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:${c.cream};padding:22px 32px;font-size:12px;line-height:1.7;color:${c.muted};">
          ${footer ?? defaultFooter()}
        </td></tr>

      </table>
      <div style="font-size:11px;color:${c.muted};margin-top:16px;line-height:1.6;font-family:${EMAIL_FONTS};">
        Ciaobag · provozuje Levstra s.r.o. · Hněvkovského 587/39a, 617 00 Brno · IČO 27686281
      </div>
    </td></tr>
  </table>
</body></html>`;
}

function navLink(label: string, href: string): string {
  return `<a href="${href}" style="color:${EMAIL_COLORS.forest};text-decoration:none;font-weight:600;">${label}</a>`;
}

function defaultFooter(): string {
  return `
    <div style="margin-bottom:8px;">
      ${navLink('E-shop', `${EMAIL_SITE}/shop`)} &nbsp;·&nbsp;
      ${navLink('Doprava a platba', `${EMAIL_SITE}/doprava`)} &nbsp;·&nbsp;
      ${navLink('Kontakt', `${EMAIL_SITE}/kontakt`)}
    </div>
    Máte dotaz? Napište nám na <a href="mailto:${EMAIL_CONTACT}" style="color:${EMAIL_COLORS.forest};text-decoration:none;">${EMAIL_CONTACT}</a>.
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
