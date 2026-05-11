import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts } from '@/lib/data';
import { Eyebrow } from '@/components/ui';

export const revalidate = 60;
export const metadata = { title: 'Blog — Levstra' };

const dateFmt = new Intl.DateTimeFormat('cs-CZ', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div
      className="mx-auto max-w-5xl px-6"
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
          maxWidth: '46ch',
        }}
      >
        Tipy na cestování, péče o kůži, novinky z dílny Marina Galanti.
      </p>

      {posts.length === 0 ? (
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
      ) : (
        <ul className="mt-12 grid gap-8 sm:grid-cols-2">
          {posts.map((post) => (
            <li key={post._id}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <div
                  className="relative w-full overflow-hidden"
                  style={{
                    aspectRatio: '3 / 2',
                    background: 'var(--color-cream)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  {post.coverImageUrl ? (
                    <Image
                      src={post.coverImageUrl}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 40vw, 100vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.04]"
                    />
                  ) : null}
                </div>
                <div className="mt-4">
                  <p
                    style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}
                  >
                    {dateFmt.format(new Date(post.publishedAt))}
                    {post.readingMinutes ? ` · ${post.readingMinutes} min čtení` : ''}
                  </p>
                  <h2
                    className="mt-1 font-poppins-semibold transition-colors group-hover:text-[var(--color-forest)]"
                    style={{
                      fontSize: 'var(--text-h3)',
                      color: 'var(--color-ink)',
                      lineHeight: 1.25,
                      letterSpacing: '-0.015em',
                    }}
                  >
                    {post.title}
                  </h2>
                  {post.excerpt ? (
                    <p
                      className="mt-2"
                      style={{
                        fontSize: 'var(--text-body)',
                        color: 'var(--color-text-muted)',
                        lineHeight: 1.55,
                      }}
                    >
                      {post.excerpt}
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
