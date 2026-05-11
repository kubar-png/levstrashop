import { Eyebrow } from '@/components/ui';

export const metadata = { title: 'Blog — Levstra' };

export default function BlogPage() {
  return (
    <div
      className="mx-auto max-w-3xl px-6"
      style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}
    >
      <Eyebrow>Čtení</Eyebrow>
      <h1
        className="mt-2 font-poppins-semibold leading-[1.05]"
        style={{
          fontSize: 'var(--text-h1)',
          color: 'var(--color-forest)',
          letterSpacing: '-0.03em',
        }}
      >
        Blog
      </h1>
      <p
        className="mt-3 font-serif"
        style={{
          fontSize: 'var(--text-lead)',
          color: 'var(--color-text-muted)',
          lineHeight: 1.45,
        }}
      >
        Tipy na cestování, péče o kůži, novinky z dílny Marina Galanti.
      </p>
      <div
        className="mt-12 p-10 text-center"
        style={{
          border: '1px dashed var(--color-border-strong)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-body)',
        }}
      >
        Brzy přidáme první články. Sledujte nás zatím na{' '}
        <a
          href="https://instagram.com/levstra"
          target="_blank"
          rel="noreferrer"
          className="underline"
          style={{ color: 'var(--color-forest)' }}
        >
          Instagramu
        </a>
        .
      </div>
    </div>
  );
}
