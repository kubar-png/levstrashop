import { Eyebrow, Card } from '@/components/ui';
import { ContactForm } from '@/components/ContactForm';

export const metadata = { title: 'Kontakt — Levstra' };

export default function ContactPage() {
  return (
    <div
      className="mx-auto max-w-5xl px-6"
      style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}
    >
      <Eyebrow>Spojte se s námi</Eyebrow>
      <h1
        className="mt-2 font-poppins-semibold leading-[1.05]"
        style={{
          fontSize: 'var(--text-h1)',
          color: 'var(--color-forest)',
          letterSpacing: '-0.03em',
        }}
      >
        Kontakt
      </h1>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <ContactForm />

        <div className="grid gap-5">
          <Card padding="lg">
            <Eyebrow>E-mail</Eyebrow>
            <a
              href="mailto:info@levstra.cz"
              className="mt-2 block font-poppins-semibold hover:underline"
              style={{ fontSize: 'var(--text-h3)', color: 'var(--color-ink)' }}
            >
              info@levstra.cz
            </a>
            <p
              className="mt-2"
              style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}
            >
              Odpovídáme v pracovní dny do 24 hodin.
            </p>
          </Card>

          <Card padding="lg">
            <Eyebrow>Instagram</Eyebrow>
            <a
              href="https://instagram.com/levstra"
              target="_blank"
              rel="noreferrer"
              className="mt-2 block font-poppins-semibold hover:underline"
              style={{ fontSize: 'var(--text-h3)', color: 'var(--color-ink)' }}
            >
              @levstra
            </a>
            <p
              className="mt-2"
              style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}
            >
              Novinky a zákulisí.
            </p>
          </Card>
        </div>
      </div>

      <p
        className="mt-12"
        style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}
      >
        Levstra s.r.o. · IČO: 27686281 · DIČ: CZ27686281 · Hněvkovského 587/39a, 617 00 Brno
      </p>
    </div>
  );
}
