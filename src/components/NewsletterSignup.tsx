'use client';

import { useState } from 'react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'loading') return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setMessage('Zadejte prosím platný e-mail.');
      return;
    }
    setStatus('loading');
    setMessage(null);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent: true, source: 'footer' }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Něco se nepovedlo, zkuste to znovu.');
      setStatus('success');
      setMessage('Hotovo! Potvrzovací e-mail máte v doručené poště.');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Něco se nepovedlo.');
    }
  }

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-sm"
      aria-label="Přihlášení k odběru novinek"
    >
      <label
        className="font-poppins-semibold block"
        style={{
          fontSize: 'var(--text-small)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: '#fff',
        }}
      >
        Novinky
      </label>
      <p
        className="font-poppins-light mt-1.5"
        style={{ fontSize: 'var(--text-small)', color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}
      >
        Občasné novinky o kolekcích a akcích. Odhlášení jedním klikem.
      </p>

      <div className="mt-3 flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== 'idle') setStatus('idle');
          }}
          placeholder="váš@email.cz"
          disabled={status === 'loading'}
          autoComplete="email"
          className="font-poppins-regular flex-1 px-3.5 py-2.5 outline-none"
          style={{
            background: 'rgba(255,255,255,0.08)',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.16)',
            fontSize: 'var(--text-small)',
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="font-poppins-semibold px-4 py-2.5 transition-opacity hover:opacity-85 disabled:opacity-50"
          style={{
            background: 'var(--color-lime)',
            color: 'var(--color-ink)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-small)',
          }}
        >
          {status === 'loading' ? '…' : 'Odebírat'}
        </button>
      </div>

      {message && (
        <p
          className="font-poppins-regular mt-2.5"
          style={{
            fontSize: 'var(--text-micro)',
            color: status === 'success' ? 'var(--color-lime)' : 'rgba(255,180,180,0.95)',
            lineHeight: 1.5,
          }}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}
