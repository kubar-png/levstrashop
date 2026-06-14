import { emailShell, escapeHtml } from './shared';

export function renderContactAutoReply(opts: { name?: string; message: string }): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = 'Děkujeme za zprávu — Ciaobag';
  const preheader = 'Vaši zprávu jsme přijali, ozveme se do 24 hodin.';

  const greeting = opts.name ? `Dobrý den, ${escapeHtml(opts.name)},` : 'Dobrý den,';

  const body = `
    <p style="margin:0 0 14px 0;">${greeting}</p>
    <p style="margin:0 0 14px 0;">děkujeme za vaši zprávu. Ozveme se vám v pracovní dny zpravidla do 24 hodin.</p>
    <p style="margin:0 0 20px 0;">Pro pořádek níže přikládáme znění vaší zprávy:</p>
    <blockquote style="margin:0;padding:14px 18px;border-left:3px solid #2D5143;background:#F2F0EB;border-radius:8px;color:#2B312F;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(opts.message)}</blockquote>
  `;

  const html = emailShell({ preheader, title: 'Děkujeme za zprávu', body });
  const text = `${greeting}\n\nDěkujeme za vaši zprávu. Ozveme se do 24 hodin.\n\n— Ciaobag`;
  return { subject, html, text };
}
