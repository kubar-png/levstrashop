import { EMAIL_COLORS as c, emailShell, escapeHtml } from './shared';

export function renderContactNotification(opts: {
  name?: string;
  email: string;
  phone?: string;
  message: string;
}): { subject: string; html: string; text: string } {
  const subject = `Nová zpráva z kontaktního formuláře — ${opts.email}`;
  const preheader = `Od: ${opts.name ?? opts.email}`;

  const rows: Array<[string, string | undefined]> = [
    ['Jméno', opts.name],
    ['E-mail', opts.email],
    ['Telefon', opts.phone],
  ];

  const meta = rows
    .filter(([, v]) => !!v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 14px 6px 0;font-size:13px;color:${c.muted};">${k}</td><td style="padding:6px 0;font-size:14px;color:${c.ink};">${escapeHtml(v as string)}</td></tr>`,
    )
    .join('');

  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${meta}</table>
    <h3 style="margin:24px 0 8px 0;font-size:14px;letter-spacing:0.06em;text-transform:uppercase;color:${c.forest};">Zpráva</h3>
    <div style="background:${c.cream};border-radius:12px;padding:16px;font-size:14px;line-height:1.6;white-space:pre-wrap;color:${c.ink};">${escapeHtml(opts.message)}</div>
  `;

  const html = emailShell({ preheader, title: 'Nová zpráva z webu', body });
  const text =
    `Nová zpráva z kontaktního formuláře\n\n` +
    rows.filter(([, v]) => !!v).map(([k, v]) => `${k}: ${v}`).join('\n') +
    `\n\n${opts.message}`;
  return { subject, html, text };
}
