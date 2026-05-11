import { IGParallaxRows } from './IGParallaxRows';

export function InstagramSection() {
  return (
    <section>
      <div className="px-4 pb-8 pt-12 text-center md:px-6 md:pb-10 md:pt-16">
        <span className="inline-flex h-12 w-12 items-center justify-center">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" stroke="#2B312F" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="4" stroke="#2B312F" strokeWidth="1.5" />
            <circle cx="17.5" cy="6.5" r="1.2" fill="#2B312F" />
          </svg>
        </span>
        <h2
          className="mt-4 font-poppins-semibold leading-[1.1]"
          style={{ color: '#2B312F', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
        >
          Sledujte nás na Instagramu
        </h2>
        <a
          href="https://instagram.com/levstra"
          target="_blank"
          rel="noreferrer"
          className="font-serif mt-2 block transition hover:opacity-70"
          style={{ color: '#2B312F', fontSize: 'clamp(1rem, 1.5vw, 1.3rem)' }}
        >
          @levstra
        </a>
      </div>

      <IGParallaxRows />
    </section>
  );
}
