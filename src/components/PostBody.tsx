import { PortableText, type PortableTextComponents } from '@portabletext/react';
import Image from 'next/image';
import type { PortableTextBlock } from 'next-sanity';
import { urlFor } from '@/sanity/client';

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p style={{ fontSize: 'var(--text-body)', lineHeight: 1.75, color: 'var(--color-ink)' }}>
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2
        className="font-poppins-semibold"
        style={{
          fontSize: 'var(--text-h2)',
          color: 'var(--color-forest)',
          letterSpacing: '-0.025em',
          marginTop: '2.5rem',
          lineHeight: 1.2,
        }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        className="font-poppins-semibold"
        style={{
          fontSize: 'var(--text-h3)',
          color: 'var(--color-forest)',
          letterSpacing: '-0.02em',
          marginTop: '2rem',
          lineHeight: 1.25,
        }}
      >
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote
        className="font-serif"
        style={{
          borderLeft: '3px solid var(--color-forest)',
          paddingLeft: '1.25rem',
          fontSize: 'var(--text-lead)',
          color: 'var(--color-forest)',
          lineHeight: 1.5,
          marginTop: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-poppins-semibold">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ value, children }) => {
      const href = (value as { href?: string } | undefined)?.href ?? '#';
      const external = href.startsWith('http');
      return (
        <a
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noreferrer' : undefined}
          className="underline"
          style={{ color: 'var(--color-forest)' }}
        >
          {children}
        </a>
      );
    },
  },
  list: {
    bullet: ({ children }) => (
      <ul
        className="list-disc"
        style={{
          paddingLeft: '1.25rem',
          margin: '1rem 0',
          fontSize: 'var(--text-body)',
          lineHeight: 1.7,
        }}
      >
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol
        className="list-decimal"
        style={{
          paddingLeft: '1.25rem',
          margin: '1rem 0',
          fontSize: 'var(--text-body)',
          lineHeight: 1.7,
        }}
      >
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li style={{ marginTop: '0.25rem' }}>{children}</li>,
    number: ({ children }) => <li style={{ marginTop: '0.25rem' }}>{children}</li>,
  },
  types: {
    image: ({ value }) => {
      const v = value as { asset?: { _ref?: string }; alt?: string };
      if (!v?.asset?._ref) return null;
      const src = urlFor(v).width(1400).fit('max').url();
      return (
        <figure style={{ margin: '2rem 0' }}>
          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: '16 / 10', borderRadius: 'var(--radius-md)' }}
          >
            <Image
              src={src}
              alt={v.alt ?? ''}
              fill
              sizes="(min-width: 768px) 640px, 100vw"
              className="object-cover"
            />
          </div>
        </figure>
      );
    },
  },
};

export function PostBody({ value }: { value: PortableTextBlock[] | undefined }) {
  if (!value || value.length === 0) return null;
  return (
    <div className="space-y-5">
      <PortableText value={value} components={components} />
    </div>
  );
}
