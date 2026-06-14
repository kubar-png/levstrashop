import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPostBySlug, getRecentPosts } from '@/lib/data';
import { Eyebrow } from '@/components/ui';
import { PostBody } from '@/components/PostBody';

export const revalidate = 60;

const dateFmt = new Intl.DateTimeFormat('cs-CZ', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Ciaobag Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
      type: 'article',
      publishedTime: post.publishedAt,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const recent = await getRecentPosts(slug);

  return (
    <article
      className="mx-auto max-w-3xl px-6"
      style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}
    >
      {/* Back link */}
      <Link
        href="/blog"
        className="btn-tertiary"
        style={{ marginLeft: '-0.25rem' }}
      >
        ← Zpět na blog
      </Link>

      <div className="mt-4">
        <Eyebrow>
          {dateFmt.format(new Date(post.publishedAt))}
          {post.readingMinutes ? ` · ${post.readingMinutes} min čtení` : ''}
        </Eyebrow>
      </div>

      <h1
        className="mt-3 font-poppins-semibold leading-[1.05]"
        style={{
          fontSize: 'var(--text-h1)',
          color: 'var(--color-forest)',
          letterSpacing: '-0.03em',
        }}
      >
        {post.title}
      </h1>

      {post.excerpt ? (
        <p
          className="mt-4 font-serif"
          style={{
            fontSize: 'var(--text-lead)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.5,
          }}
        >
          {post.excerpt}
        </p>
      ) : null}

      {post.coverImageUrl ? (
        <div
          className="relative mt-8 w-full overflow-hidden"
          style={{
            aspectRatio: '16 / 9',
            background: 'var(--color-cream)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <Image
            src={post.coverImageUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            priority
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="mt-10">
        <PostBody value={post.body} />
      </div>

      {/* Related posts */}
      {recent.length > 0 && (
        <section
          className="mt-20"
          style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '3rem' }}
        >
          <Eyebrow tone="forest">Další články</Eyebrow>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2">
            {recent.map((p) => (
              <li key={p._id}>
                <Link href={`/blog/${p.slug}`} className="group block">
                  <div
                    className="relative w-full overflow-hidden"
                    style={{
                      aspectRatio: '3 / 2',
                      background: 'var(--color-cream)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    {p.coverImageUrl ? (
                      <Image
                        src={p.coverImageUrl}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 40vw, 100vw"
                        className="object-cover transition duration-700 group-hover:scale-[1.04]"
                      />
                    ) : null}
                  </div>
                  <p
                    className="mt-3 font-poppins-semibold transition-colors group-hover:text-[var(--color-forest)]"
                    style={{
                      fontSize: 'var(--text-body)',
                      color: 'var(--color-ink)',
                      lineHeight: 1.3,
                    }}
                  >
                    {p.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
