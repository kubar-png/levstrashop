import Image from 'next/image';

const WIX = 'https://static.wixstatic.com/media';
/** Rotation of available product imagery used as IG placeholders. */
const IMAGES = [
  `${WIX}/f0cf6b_510434021b004f2abcfcc53a3a965203~mv2.jpg`,
  `${WIX}/f0cf6b_3ce5a12e7ebe4524a196ef34a03d1e59~mv2.jpg`,
  `${WIX}/f0cf6b_8a21028ccb924868a7824d820313a55c~mv2.jpg`,
  `${WIX}/f0cf6b_962f00502d2a46f5b535c2d1fbe3095e~mv2.jpg`,
  `${WIX}/f0cf6b_eae5f5bd32ea4057a3e7c5dd47647233~mv2.png`,
  `${WIX}/f0cf6b_a2f58ca3ee384710b7f681526a75f673~mv2.png`,
];

export function InstagramSection() {
  /** 8 tiles, cycled from IMAGES. */
  const tiles = Array.from({ length: 8 }, (_, i) => IMAGES[i % IMAGES.length]);

  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
            </svg>
          </span>
          <h2 className="mt-5 text-2xl font-semibold md:text-3xl">Sledujte nás na Instagramu</h2>
          <a
            href="https://instagram.com/levstra"
            target="_blank"
            rel="noreferrer"
            className="mt-2 text-base text-neutral-300 hover:text-white"
          >
            @levstra
          </a>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          {tiles.map((src, i) => (
            <a
              key={i}
              href="https://instagram.com/levstra"
              target="_blank"
              rel="noreferrer"
              className="relative block aspect-square overflow-hidden rounded-2xl bg-white/5"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width: 1024px) 22vw, 50vw"
                className="object-cover transition duration-500 hover:scale-105"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
