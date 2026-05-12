'use client';

import { useState } from 'react';
import { Eyebrow, FormField } from './ui';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'loading') return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setError('Zadejte prosím platný e-mail.');
      return;
    }
    if (message.trim().length < 5) {
      setStatus('error');
      setError('Napište prosím alespoň krátkou zprávu.');
      return;
    }
    setStatus('loading');
    setError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Něco se nepovedlo, zkuste to znovu.');
      setStatus('success');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Něco se nepovedlo.');
    }
  }

  if (status === 'success') {
    return (
      <div
        className="p-8 text-center"
        style={{ background: 'var(--color-cream)', borderRadius: 'var(--radius-lg)' }}
      >
        <Eyebrow tone="forest" serif size="md">Děkujeme</Eyebrow>
        <p
          className="font-poppins-semibold mt-2"
          style={{ fontSize: 'var(--text-h3)', color: 'var(--color-ink)' }}
        >
          Vaše zpráva nám dorazila.
        </p>
        <p
          className="font-poppins-light mt-2"
          style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}
        >
          Odpovíme zpravidla v pracovní dny do 24 hodin.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="p-8"
      style={{ background: 'var(--color-cream)', borderRadius: 'var(--radius-lg)' }}
    >
      <Eyebrow>Napište nám</Eyebrow>

      <div className="mt-6 space-y-4">
        <FormField
          label="Jméno"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="E-mail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <FormField
            label="Telefon"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="contact-message"
            className="font-poppins-medium"
            style={{
              fontSize: 'var(--text-small)',
              color: 'var(--color-text-muted)',
              letterSpacing: '0.04em',
            }}
          >
            Zpráva
            <span aria-hidden="true" style={{ color: 'var(--color-danger)', marginLeft: '0.25rem' }}>
              *
            </span>
          </label>
          <textarea
            id="contact-message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="font-poppins-regular w-full bg-transparent outline-none transition-colors"
            style={{
              fontSize: 'var(--text-body)',
              color: 'var(--color-ink)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border-strong)',
              background: '#fff',
              resize: 'vertical',
              minHeight: 140,
              lineHeight: 1.5,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-forest)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-strong)';
            }}
          />
        </div>
      </div>

      {error && (
        <p
          className="font-poppins-regular mt-4 px-3 py-2.5"
          style={{
            fontSize: 'var(--text-small)',
            color: 'var(--color-ink)',
            background: 'rgba(180,62,46,0.12)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-primary mt-6"
      >
        {status === 'loading' ? 'Odesílám…' : 'Odeslat zprávu'}
      </button>

      <p
        className="font-poppins-light mt-4"
        style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}
      >
        Odesláním souhlasíte se zpracováním osobních údajů dle{' '}
        <a href="/gdpr" className="underline">
          zásad ochrany osobních údajů
        </a>
        .
      </p>
    </form>
  );
}
