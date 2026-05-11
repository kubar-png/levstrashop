export const metadata = { title: 'O nás — Levstra' };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">O značce</p>
      <h1 className="font-display mt-3 text-5xl font-medium leading-tight md:text-6xl">
        Módu dovážíme<br />už přes dvě desetiletí.
      </h1>
      <div className="mt-8 space-y-5 text-neutral-700">
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
          vám poradíme. Napište nám na <a href="mailto:info@levstra.cz" className="underline">info@levstra.cz</a>.
        </p>
      </div>
    </div>
  );
}
