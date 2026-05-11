export const metadata = { title: 'Blog — Levstra' };

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Čtení</p>
      <h1 className="mt-2 text-5xl font-medium md:text-6xl">Blog</h1>
      <p className="mt-3 text-neutral-600">
        Tipy na cestování, péče o kůži, novinky z dílny Marina Galanti.
      </p>
      <div className="mt-12 rounded-lg border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
        Brzy přidáme první články. Sledujte nás zatím na{' '}
        <a
          href="https://instagram.com/levstra"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Instagramu
        </a>
        .
      </div>
    </div>
  );
}
