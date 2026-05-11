import Image from 'next/image';

const WIX = 'https://static.wixstatic.com/media';
/** Mix of lifestyle + product imagery — 8 tiles for the IG grid. */
const IG_IMAGES = [
  `${WIX}/f0cf6b_0fb65fabc4d54b149a2b6213e5153e9e~mv2.jpg`, // blonde + white bag
  `${WIX}/f0cf6b_29b8ee8366484656828782c7267140df~mv2.jpg`, // off-shoulder + palms
  `${WIX}/f0cf6b_8a21028ccb924868a7824d820313a55c~mv2.jpg`, // street + white bag
  `${WIX}/f0cf6b_962f00502d2a46f5b535c2d1fbe3095e~mv2.jpg`, // pink dress + peach buildings
  `${WIX}/f0cf6b_447c2054b701497e93bbfa703008a619~mv2.jpg`, // promenade
  `${WIX}/f0cf6b_e8a295dffa64400a9a72b4d9c064f98a~mv2.jpg`, // closeup hand + bag
  `${WIX}/f0cf6b_59b0236fe6ae4dd39ea9700a093c14e4~mv2.jpg`, // orange RIGA + graffiti
  `${WIX}/f0cf6b_dc69d4ff1b334f15866d84d2765dcf37~mv2.jpg`, // pink RIGA + mural
];

export function InstagramSection() {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
            </svg>
          </span>
          <h2 className="mt-5 text-2xl font-bold md:text-3xl">Sledujte nás na Instagramu</h2>
          <a
            href="https://instagram.com/levstra"
            target="_blank"
            rel="noreferrer"
            className="mt-2 text-base text-neutral-300 hover:text-white"
          >
            @levstra
          </a>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {IG_IMAGES.map((src, i) => (
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
