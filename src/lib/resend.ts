/**
 * Resend transactional email client.
 *
 * Required env vars:
 *   RESEND_API_KEY              — from https://resend.com/api-keys
 *   RESEND_FROM_ORDERS          — e.g. "Ciaobag <objednavky@levstra.cz>"
 *   RESEND_FROM_CONTACT         — e.g. "Ciaobag <info@levstra.cz>"
 *   RESEND_REPLY_TO             — optional, e.g. "info@levstra.cz"
 *   RESEND_INTERNAL_INBOX       — where contact form notifications go (info@levstra.cz)
 *
 * Domain must be verified in Resend dashboard with SPF + DKIM DNS records.
 */

import { Resend } from 'resend';
import type { OrderDoc } from '@/lib/orders';
import { renderOrderConfirmation } from '@/emails/OrderConfirmation';
import { renderOrderShipped } from '@/emails/OrderShipped';
import { renderContactAutoReply } from '@/emails/ContactAutoReply';
import { renderContactNotification } from '@/emails/ContactNotification';
import { renderWelcomeDiscount } from '@/emails/WelcomeDiscount';
import { renderReviewRequest } from '@/emails/ReviewRequest';

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[resend] RESEND_API_KEY not set — emails will be skipped.');
    return null;
  }
  _resend = new Resend(key);
  return _resend;
}

// Sending domain verified in Resend = eshop.ciaobag.cz (subdomain). Reply-to and the
// internal inbox stay on the apex (real Active24 mailboxes).
const FROM_ORDERS = process.env.RESEND_FROM_ORDERS || 'Ciaobag <objednavky@eshop.ciaobag.cz>';
const FROM_CONTACT = process.env.RESEND_FROM_CONTACT || 'Ciaobag <ahoj@eshop.ciaobag.cz>';
const REPLY_TO = process.env.RESEND_REPLY_TO || 'ahoj@ciaobag.cz';
const INTERNAL_INBOX = process.env.RESEND_INTERNAL_INBOX || 'jirka@ciaobag.cz';

type SendResult = { ok: boolean; id?: string; error?: string };

async function send(
  from: string,
  to: string | string[],
  subject: string,
  html: string,
  text: string,
  replyTo?: string,
): Promise<SendResult> {
  const resend = getResend();
  if (!resend) return { ok: false, error: 'RESEND_API_KEY not configured' };
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      replyTo: replyTo ?? REPLY_TO,
    });
    if (error) {
      console.error('[resend] send failed:', error);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error('[resend] send threw:', err);
    return { ok: false, error: err instanceof Error ? err.message : 'unknown error' };
  }
}

/* ── Public senders ─────────────────────────────────────────────── */

export async function sendOrderConfirmation(order: OrderDoc): Promise<SendResult> {
  if (!order.email) return { ok: false, error: 'order has no email' };
  const { subject, html, text } = renderOrderConfirmation(order);
  return send(FROM_ORDERS, order.email, subject, html, text);
}

export async function sendOrderShipped(
  order: OrderDoc,
  opts: { trackingNumber?: string; trackingUrl?: string } = {},
): Promise<SendResult> {
  if (!order.email) return { ok: false, error: 'order has no email' };
  const { subject, html, text } = renderOrderShipped(order, opts);
  return send(FROM_ORDERS, order.email, subject, html, text);
}

export async function sendContactAutoReply(opts: {
  to: string;
  name?: string;
  message: string;
}): Promise<SendResult> {
  const { subject, html, text } = renderContactAutoReply(opts);
  return send(FROM_CONTACT, opts.to, subject, html, text);
}

export async function sendContactNotification(opts: {
  name?: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<SendResult> {
  const { subject, html, text } = renderContactNotification(opts);
  return send(FROM_CONTACT, INTERNAL_INBOX, subject, html, text, opts.email);
}

/** Welcome + discount code, sent after the exit-intent popup signup. */
export async function sendWelcomeDiscount(opts: {
  to: string;
  code: string;
  percent?: number;
  minOrderKc?: number;
  validDays?: number;
}): Promise<SendResult> {
  const { to, ...rest } = opts;
  const { subject, html, text } = renderWelcomeDiscount(rest);
  return send(FROM_CONTACT, to, subject, html, text);
}

/** Review request, sent a few days after the order is marked delivered. */
export async function sendReviewRequest(
  order: OrderDoc,
  opts: { reviewUrl: string; incentive?: string },
): Promise<SendResult> {
  if (!order.email) return { ok: false, error: 'order has no email' };
  const { subject, html, text } = renderReviewRequest(order, opts);
  return send(FROM_ORDERS, order.email, subject, html, text);
}

export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}
