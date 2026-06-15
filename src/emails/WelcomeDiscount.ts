import { EMAIL_COLORS as c, EMAIL_SITE, emailButton, emailShell, escapeHtml } from './shared';

/** Welcome e-mail with a discount code — sent after the exit-intent popup signup. */
export function renderWelcomeDiscount(opts: {
  code: string;
  percent?: number;
  minOrderKc?: number;
  validDays?: number;
}): { subject: string; html: string; text: string } {
  const percent = opts.percent ?? 10;
  const subject = `Vaše sleva ${percent} % na první nákup — Ciaobag`;
  const preheader = `Tady je váš slevový kód ${opts.code} na −${percent} %.`;
  const conds = [
    opts.minOrderKc ? `platí při objednávce nad ${opts.minOrderKc} Kč` : '',
    opts.validDays ? `platnost ${opts.validDays} dní` : '',
  ].filter(Boolean).join(' · ');

  const body = `
    <p style="margin:0 0 20px 0;">Díky, že jste se přidali k Ciaobag. Jako poděkování máte na první nákup slevu
      <strong>${percent} %</strong> — stačí ji zadat při dokončení objednávky:</p>
    <div style="background:${c.cream};border:1px dashed ${c.forest};border-radius:14px;padding:22px;text-align:center;margin-bottom:22px;">
      <div style="font-family:Georgia,serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${c.muted};">Slevový kód</div>
      <div style="font-size:30px;font-weight:700;letter-spacing:0.1em;color:${c.forest};margin-top:6px;">${escapeHtml(opts.code)}</div>
      <div style="font-size:13px;color:${c.muted};margin-top:8px;">−${percent} %${conds ? ' · ' + escapeHtml(conds) : ''}</div>
    </div>
    <div style="text-align:center;">${emailButton('Začít nakupovat', `${EMAIL_SITE}/shop`, 'lime')}</div>
  `;

  const html = emailShell({
    preheader,
    title: `Vítejte — máte slevu ${percent} %`,
    intro: `<p style="margin:0;">Kufry a kabelky, které zvládnou letiště i&nbsp;večerní rande.</p>`,
    body,
  });

  const text =
    `Vítejte u Ciaobag!\n\n` +
    `Slevový kód na první nákup: ${opts.code} (−${percent} %)\n` +
    (conds ? `${conds}\n` : '') +
    `\nNakupujte na ${EMAIL_SITE}/shop`;

  return { subject, html, text };
}
