import Link from 'next/link';
import { Eyebrow } from '@/components/ui';

export const metadata = { title: 'O nás — Levstra' };

export default function AboutPage() {
  return (
    <div
      className="mx-auto max-w-3xl px-6"
      style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}
    >
      <Eyebrow size="md">O značce</Eyebrow>
      <h1
        className="mt-3 font-poppins-semibold leading-tight"
        style={{
          fontSize: 'var(--text-h1)',
          color: 'var(--color-forest)',
          letterSpacing: '-0.03em',
        }}
      >
        Módu dovážíme<br />už přes dvě desetiletí.
      </h1>
      <div
        className="mt-8 space-y-5"
        style={{
          color: 'var(--color-ink)',
          fontSize: 'var(--text-body)',
          lineHeight: 1.7,
        }}
      >
        <p>
          Levstra je rodinný projekt postavený na kvalitě, vkusu a dlouhých přátelstvích s
          italskými výrobci. Začínali jsme s jedním butikem a dnes přivážíme kabelky a kufry
          značky Marina Galanti do celého Česka.
        </p>
        <p>
          Každý kus, který u nás najdete, si nejdřív vybereme sami. Zajímá nás materiál, řemeslo
          a detail — ne sezónní trendy. Proto je naše kolekce úzká, ale prověřená.
        </p>
        <p>
          Pokud hledáte zavazadlo na první obchodní let nebo kabelku na svatbu kamarádky, rádi
          vám poradíme. Napište nám na{' '}
          <a
            href="mailto:info@levstra.cz"
            className="underline"
            style={{ color: 'var(--color-forest)' }}
          >
            info@levstra.cz
          </a>
          .
        </p>
      </div>

      <div className="mt-10">
        <Link href="/shop" className="btn-secondary">
          Prohlédnout kolekci
        </Link>
      </div>
    </div>
  );
}
