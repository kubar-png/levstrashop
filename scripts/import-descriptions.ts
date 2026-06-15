/**
 * Backfill product DESCRIPTIONS + SPECIFICATIONS into Sanity for products that
 * currently lack a real description (mostly the Marina Galanti kabelky).
 *
 * Source: the live old e-shop https://www.eshop.levstra.cz (same products).
 * The scraped text is hard-coded per product `_id` in the DEFS array below so
 * it is fully reviewable and re-runnable.
 *
 * Patches ONLY `shortDescription` + `description`. Touches nothing else.
 * Skips Riga / Brunei (they already have good hand-written descriptions).
 *
 *   npx tsx scripts/import-descriptions.ts          # DRY RUN (default)
 *   npx tsx scripts/import-descriptions.ts --live    # patch Sanity (publishes)
 */

import dotenv from 'dotenv';
import fs from 'node:fs';

if (fs.existsSync('.env.local.sanity')) dotenv.config({ path: '.env.local.sanity', override: false });
dotenv.config({ path: '.env.local', override: false });
dotenv.config({ path: '.env', override: false });

import { createClient } from '@sanity/client';

const live = process.argv.includes('--live');

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId) { console.error('❌ Missing NEXT_PUBLIC_SANITY_PROJECT_ID'); process.exit(1); }
if (!token && live) { console.error('❌ Missing SANITY_API_WRITE_TOKEN (required for --live)'); process.exit(1); }
const client = createClient({ projectId, dataset, token, apiVersion: '2025-01-01', useCdn: false });

/* ─── Portable Text helper (same pattern as import-riga-new.ts) ───────────── */

const block = (key: string, text: string) => ({
  _type: 'block', _key: key, style: 'normal', markDefs: [],
  children: [{ _type: 'span', _key: `${key}s`, text, marks: [] }],
});

/**
 * One def per target product. `paras` are the description paragraphs (prose),
 * `specs` is the single specification line. All text is verbatim from the
 * matched eshop.levstra.cz page (kept faithful — no invented specs).
 */
type Def = {
  _id: string;
  title: string;        // our Sanity title (for log readability)
  source: string;       // matched eshop.levstra.cz URL
  shortDescription: string;
  paras: string[];      // description prose paragraph(s)
  specs: string;        // specification line
};

const DEFS: Def[] = [
  /* ─── Marina Galanti — batohy ─────────────────────────────────────────── */
  {
    _id: 'T5me9kJ1Md13zsQPkfvp4c',
    title: 'Marina Galanti April',
    source: 'https://www.eshop.levstra.cz/marina-galanti-modni-designovy-batoh-april-ve-svetle-modre.html',
    shortDescription: 'Luxusní kožený batoh Marina Galanti v originálním designu — italská kůže, výroba v Itálii.',
    paras: [
      'Luxusní kožený batoh ve velice originálním designu. Kovové doplňky ve stříbrném provedení.',
    ],
    specs: 'Materiál: 100 % kůže · Rozměry: 29 × 30 × 15 cm (délka × výška × šířka) · Zapínání: zip · Zadní kapsa se zipem na cennosti · Textilní podšívka v béžové s kapsičkami · Kovové doplňky ve stříbrné barvě · Design italské značky Marina Galanti, výroba v Itálii.',
  },
  {
    _id: 'E7nXCLPw2spSaMTC3ZAfHw',
    title: 'Marina Galanti Sara',
    source: 'https://www.eshop.levstra.cz/marina-galanti-modni-batoh-sara-cerny.html',
    shortDescription: 'Elegantní dámský batůžek Marina Galanti z jemné hladké koženky s vnější kapsou na petlici.',
    paras: [
      'Dámský elegantní batůžek z jemné, hladké koženky. Batůžek má hlavní dvoucestný zip a vnější kapsu na petlici.',
    ],
    specs: 'Materiál: PU (polyuretan = koženka = ekokůže) v hladkém provedení · Rozměry: 28 × 30 × 12 cm (délka × výška × šířka) · Zapínání: hlavní dvoucestný zip · Vnější kapsa na petlici; vnitřní kapsa na zip s karabinkou; vnitřní otevřená kapsa · Textilní podšívka s decentními nápisy Marina Galanti.',
  },
  {
    _id: 'pgEc5d7mmeSB7eUxGRgbeZ',
    title: 'Marina Galanti Sylva',
    source: 'https://www.eshop.levstra.cz/marina-galanti-batoh-sylva-v-cerne.html',
    shortDescription: 'Městský dámský batoh Marina Galanti z kvalitní eko-kůže s jemnou texturou a čelní kapsou s petlicí.',
    paras: [
      'Městský dámský batoh z dílny italské firmy Marina Galanti. Kvalitní eko-kůže s jemnou texturou. Praktická čelní kapsa s petlicí.',
    ],
    specs: 'Materiál: PU (polyuretan = koženka = ekokůže), pevný, držící tvar s jemnou texturou · Rozměry: 28 × 30 × 12 cm (délka × výška × šířka) · Zapínání: dvoucestný horní zip · Čelní kapsa s klopou na petlici; vnitřní kapsa na zip s karabinkou na klíče; vnitřní otevřená kapsa · Textilní podšívka v béžové s decentními nápisy Marina Galanti · Kovové doplňky ve zlaté barvě.',
  },

  /* ─── Marina Galanti — kabelky ────────────────────────────────────────── */
  {
    _id: 'pgEc5d7mmeSB7eUxGRgyHV',
    title: 'Marina Galanti Bucket Bag',
    source: 'https://www.eshop.levstra.cz/marina-galanti-mala-kabelka-bucket-bag-telova.html',
    shortDescription: 'Luxusní kožená kabelka Marina Galanti v oblíbeném tvaru bucket (měšec) — do ruky i přes rameno.',
    paras: [
      'Luxusní kožená kabelka s možností nošení v ruce nebo přes rameno ve stále oblíbenějším tvaru – bucket (měšec).',
    ],
    specs: 'Materiál: kůže · Rozměry: 23,5 × 21 × 14 cm (délka × výška × šířka) · Zapínání: magnet + stahovací kožená šňůrka · Kožená podšívka v červené barvě · Vnitřní kapsička · Kovové doplňky ve stříbrné barvě · Design italské značky Marina Galanti, výroba v Itálii.',
  },
  {
    _id: 'E7nXCLPw2spSaMTC3ZAiHI',
    title: 'Marina Galanti Cabrini',
    source: 'https://www.eshop.levstra.cz/marina-galanti-shopping-bag-cabrini-s-vnejsi-kapsou-s-klopou-v-cerne.html',
    shortDescription: 'Klasický dámský shopper Marina Galanti z tvar držící koženky — do ruky, přes rameno i přes tělo.',
    paras: [
      'Dámský klasický „shopper“ z dílny italské firmy Marina Galanti vyrobený z kvalitní, tvar držící koženky. Standardní nošení v ruce či přes rameno, ale díky odnímatelnému nastavitelnému popruhu možnost nošení i přes tělo.',
    ],
    specs: 'Materiál: PU (polyuretan = koženka = ekokůže), hladké provedení, pevně držící tvar · Rozměry: 40 × 28 × 15 cm (délka × výška × šířka) · Zapínání: zip · Vnější kapsa s klopou na zámek, vnitřní kapsa na zip s textilním páskem a karabinkou, jedna otevřená vnitřní kapsa · Odnímatelný nastavitelný popruh · Textilní podšívka s decentním potiskem Marina Galanti · Kovové doplňky v černé barvě.',
  },
  {
    _id: 'pgEc5d7mmeSB7eUxGRgq7B',
    title: 'Marina Galanti Cabrini — do ruky',
    source: 'https://www.eshop.levstra.cz/marina-galanti-handbag-cabrini-kabelka-do-ruky-se-dvema-prostory-a-vnejsi-kapsou-v-cerne.html',
    shortDescription: 'Dámská kabelka Marina Galanti do ruky se dvěma prostory a vnější kapsou s klopou — i přes tělo.',
    paras: [
      'Dámská kabelka v klasické černé značky Marina Galanti vyrobená z kvalitní, tvar držící koženky. Díky odnímatelnému nastavitelnému popruhu možnost nošení i přes tělo. Kabelka má dva samostatné prostory a ještě vnější kapsu s klopou.',
    ],
    specs: 'Materiál: PU (polyuretan = koženka = ekokůže), hladké provedení, pevně držící tvar · Rozměry: 26 × 21 × 13 cm (délka × výška × šířka) · Dva samostatné prostory se zipem; vnější kapsa s klopou na zámek na čelní straně; vnitřní kapsa na zip s páskem a karabinkou na klíče, jedna otevřená kapsa · Odnímatelný nastavitelný popruh · Textilní podšívka s decentním potiskem Marina Galanti.',
  },
  {
    _id: 'E7nXCLPw2spSaMTC3ZAh4A',
    title: 'Marina Galanti Cecil',
    source: 'https://www.eshop.levstra.cz/marina-galanti-hobo-bag-cecil-telova.html',
    shortDescription: 'Středně velká hobo kabelka Marina Galanti v hladkém provedení — přes rameno i jako crossbody.',
    paras: [
      'Středně velká dámská kabelka z dílny italské firmy Marina Galanti v hladkém provedení. Standardní nošení přes rameno (pod paží), ale díky odnímatelnému nastavitelnému popruhu možnost nošení i jako crossbody bag, tedy přes tělo.',
    ],
    specs: 'Materiál: PU (polyuretan = koženka = ekokůže), hladké provedení · Rozměry: 26 × 22 × 11 cm (délka × výška × šířka) · Pevné kulaté ucho ozdobené malými cvočky · Zapínání: zip · Jedna vnitřní kapsa na zip s karabinkou na klíče, jedna otevřená kapsa · Odnímatelný nastavitelný popruh (crossbody) · Textilní podšívka světle krémová s decentním potiskem Marina Galanti · Logo a kovové doplňky ve stříbrné barvě.',
  },
  {
    _id: 'T5me9kJ1Md13zsQPkfvCCN',
    title: 'Marina Galanti Eli',
    source: 'https://www.eshop.levstra.cz/marina-galanti-hobo-bag-eli-kabelka-pres-rameno-v-imitaci-hadi-kuze.html',
    shortDescription: 'Dámská hobo kabelka Marina Galanti v imitaci hadí kůže — přes rameno i jako crossbody.',
    paras: [
      'Dámská kabelka z dílny italské firmy Marina Galanti s pevně držícím tvarem v imitaci hadí kůže. Standardní nošení přes rameno, ale díky odnímatelnému nastavitelnému popruhu možnost nošení i jako crossbody bag, tedy přes tělo. Praktická zadní kapsa na zip.',
    ],
    specs: 'Materiál: PU (polyuretan = koženka = ekokůže) – imitace hadí kůže, pevně držící tvar · Rozměry: 31 × 24 × 9 cm (délka × výška × šířka) · Zapínání: zip · Odnímatelný nastavitelný popruh · Vnější kapsa na zip, přední kapsa s ozdobnou přezkou, vnitřní kapsa na zip s karabinkou na klíče, jedna otevřená vnitřní kapsa · Textilní podšívka světle krémová s jemnými nápisy Marina Galanti · Kovové doplňky ve stříbrné barvě.',
  },
  {
    _id: 'E7nXCLPw2spSaMTC3ZAftm',
    title: 'Marina Galanti Eli — imitace hadí kůže',
    source: 'https://www.eshop.levstra.cz/marina-galanti-hobo-bag-eli-kabelka-pres-rameno-v-imitaci-hadi-kuze.html',
    shortDescription: 'Dámská hobo kabelka Marina Galanti v imitaci hadí kůže — přes rameno i jako crossbody.',
    paras: [
      'Dámská kabelka z dílny italské firmy Marina Galanti s pevně držícím tvarem v imitaci hadí kůže. Standardní nošení přes rameno, ale díky odnímatelnému nastavitelnému popruhu možnost nošení i jako crossbody bag, tedy přes tělo. Praktická zadní kapsa na zip.',
    ],
    specs: 'Materiál: PU (polyuretan = koženka = ekokůže) – imitace hadí kůže, pevně držící tvar · Rozměry: 31 × 24 × 9 cm (délka × výška × šířka) · Zapínání: zip · Odnímatelný nastavitelný popruh · Vnější kapsa na zip, přední kapsa s ozdobnou přezkou, vnitřní kapsa na zip s karabinkou na klíče, jedna otevřená vnitřní kapsa · Textilní podšívka světle krémová s jemnými nápisy Marina Galanti · Kovové doplňky ve stříbrné barvě.',
  },
  {
    _id: 'E7nXCLPw2spSaMTC3ZAgoo',
    title: 'Marina Galanti Gertruda',
    source: 'https://www.eshop.levstra.cz/marina-galanti-crossbody-bag-gertruda-v-cerne.html',
    shortDescription: 'Klasická crossbody kabelka Marina Galanti přes tělo s praktickou zadní kapsou na zip.',
    paras: [
      'Klasická dámská crossbody kabelka přes tělo v decentní černé, trendy paví zelené nebo stále oblíbenější světle hnědé barvě s praktickou zadní kapsou na zip. Luxusní provedení materiálu – kombinace hladké a jemně strukturované koženky.',
    ],
    specs: 'Materiál: PU (polyuretan = koženka = ekokůže), kombinace hladké a jemně strukturované koženky · Rozměry: 22 × 16 × 7 cm (délka × výška × šířka) · Zapínání: zip · Nastavitelný popruh pro nošení přes tělo · Vnější kapsa na zadní straně na zip; jedna vnitřní kapsa na zip · Textilní podšívka s decentními nápisy Marina Galanti · Kovové doplňky ve stříbrné barvě.',
  },
  {
    _id: 'E7nXCLPw2spSaMTC3ZAiwy',
    title: 'Marina Galanti Hobo',
    source: 'https://www.eshop.levstra.cz/marina-galanti-kozena-kabelka-pres-rameno-hobo-bag-cerna.html',
    shortDescription: 'Luxusní kožená kabelka Marina Galanti pro nošení přes rameno s nastavitelným popruhem.',
    paras: [
      'Luxusní kožená kabelka italské značky Marina Galanti pro nošení přes rameno s elegantně nastavitelným popruhem.',
    ],
    specs: 'Materiál: 100 % kůže · Rozměry: 32 × 22 × 12 cm (délka × výška × šířka) · Zapínání: zip · Textilní podšívka s kapsičkami · Kovové doplňky ve stříbrné barvě · Výroba: Itálie.',
  },
  {
    _id: 'T5me9kJ1Md13zsQPkfvzby',
    title: 'Marina Galanti Ilsa',
    source: 'https://www.eshop.levstra.cz/marina-galanti-jednoducha-vetsi-luxusni-kabelka-ilsa-do-ruky-s-moznosti-noseni-pres-telo-ze-strukturovane-kuze-v-cerne.html',
    shortDescription: 'Větší luxusní kožená kabelka Marina Galanti do ruky i přes rameno — pojme i formát A4.',
    paras: [
      'Luxusní kožená kabelka do ruky s možností nošení v ruce nebo přes rameno (díky odnímatelnému nastavitelnému popruhu). Větší velikost – pojme i formát A4. Italský design, italská kůže, výroba v Itálii.',
    ],
    specs: 'Materiál: strukturovaná kůže · Rozměry: 48 × 28 × 14 cm (délka × výška × šířka), výška uch 21 cm · Odnímatelný nastavitelný popruh (délka 110 cm) · Zapínání: horní zip · Pevná textilní podšívka · Jedna kapsička na zip, dvě otevřené kapsičky · Kovový zip a doplňky ve stříbrné barvě.',
  },
  {
    _id: 'pgEc5d7mmeSB7eUxGRglGY',
    title: 'Marina Galanti Jitka — do ruky',
    source: 'https://www.eshop.levstra.cz/marina-galanti-handbag-jitka-kabelka-do-ruky-se-dvema-prostory.html',
    shortDescription: 'Dámská kabelka Marina Galanti do ruky se dvěma uchy a praktickým rozdělením na dva prostory.',
    paras: [
      'Dámská kabelka do ruky z dílny italské firmy Marina Galanti se dvěma uchy. Pevně držící tvar kabelky. Standardní nošení v ruce, ale díky odnímatelnému nastavitelnému popruhu možnost nošení i přes tělo. Velmi praktické rozdělení vnitřního prostoru na 2.',
    ],
    specs: 'Materiál: PU (polyuretan = koženka = ekokůže), hladké provedení, pevně držící tvar · Rozměry: 32 × 20 × 9 cm (délka × výška × šířka) · Zapínání: zip · Odnímatelný nastavitelný textilní popruh · Vnitřní rozdělení na dva prostory · Vnitřní kapsa na zip s textilním páskem a karabinkou na klíče; jedna otevřená vnitřní kapsa · Textilní podšívka ve světle béžové s nápisy Marina Galanti · Kovové doplňky ve stříbrné barvě.',
  },
  {
    _id: 'pgEc5d7mmeSB7eUxGRgm21',
    title: 'Marina Galanti Jitka — přes rameno',
    source: 'https://www.eshop.levstra.cz/marina-galanti-hobo-bag-jitka-mensi-pevna-kabelka-pres-rameno-v-bile.html',
    shortDescription: 'Menší pevná dámská kabelka Marina Galanti přes rameno i do ruky, s možností nošení přes tělo.',
    paras: [
      'Dámská kabelka do ruky i přes rameno z dílny italské firmy Marina Galanti. Pevně držící tvar kabelky. Standardní nošení přes rameno či v ruce, ale díky odnímatelnému nastavitelnému popruhu možnost nošení i přes tělo.',
    ],
    specs: 'Materiál: PU (polyuretan = koženka = ekokůže), hladké provedení, pevně držící tvar · Rozměry: 25 × 18 × 10 cm (délka × výška × šířka) · Zapínání: zip · Odnímatelný nastavitelný popruh · Vnitřní kapsa na zip · Textilní podšívka světle béžová s jemnými nápisy Marina Galanti · Kovové doplňky ve stříbrné barvě.',
  },
  {
    _id: 'T5me9kJ1Md13zsQPkfvjrv',
    title: 'Marina Galanti Květa',
    source: 'https://www.eshop.levstra.cz/marina-galanti-crossbody-bag-kveta-kabelka-pres-telo-v-cerne-s-ozdobnou-stuhou.html',
    shortDescription: 'Oblíbená střední crossbody kabelka Marina Galanti přes tělo, v černé s ozdobnou mašlí.',
    paras: [
      'Oblíbený typ dámské kabelky ve střední velikosti nošené přes tělo z dílny italské firmy Marina Galanti. Kabelka je vyrobena z hladké koženky v klasické černé doplněna ozdobnou vícebarevnou mašlí.',
    ],
    specs: 'Materiál: PU (polyuretan = koženka = ekokůže), hladké provedení · Rozměry: 29 × 19 × 5 cm (délka × výška × hloubka) · Zapínání: zip (s ozdobnou stuhou jako táhlo) · Nastavitelný popruh · Jedna vnitřní kapsa na zip a jedna otevřená vnitřní kapsa · Textilní podšívka světle krémová s decentním potiskem Marina Galanti · Kovové prvky ve stříbrné barvě.',
  },
  {
    _id: 'E7nXCLPw2spSaMTC3ZAhm2',
    title: 'Marina Galanti Květa — do ruky',
    source: 'https://www.eshop.levstra.cz/marina-galanti-handbag-kveta-kabelka-do-ruky-se-zadni-kapsou-v-cerne-s-ozdobnou-stuhou.html',
    shortDescription: 'Praktická větší dámská kabelka Marina Galanti do ruky se dvěma prostory a zadní kapsou na zip.',
    paras: [
      'Praktická větší dámská kabelka se dvěma prostory do ruky z dílny italské firmy Marina Galanti. Standardní nošení v ruce (pohodlná kulatá ucha), ale díky nastavitelnému popruhu možnost nošení i přes tělo. Praktická kapsa na zip na zadní straně kabelky.',
    ],
    specs: 'Materiál: PU (polyuretan = koženka = ekokůže), hladké provedení · Rozměry: 37 × 26 × 15 cm (délka × výška × hloubka) · Zapínání: zip · Nastavitelný, odnímatelný popruh · Zadní kapsa na zip; vnitřní kapsa na zip s páskem na klíče; jedna otevřená vnitřní kapsa · Textilní podšívka světle krémová s potiskem značky.',
  },
  {
    _id: 'E7nXCLPw2spSaMTC3ZAhaW',
    title: 'Marina Galanti Liana',
    source: 'https://www.eshop.levstra.cz/marina-galanti-shopping-bag-liana-poustni-piskova-barva.html',
    shortDescription: 'Velká dámská kabelka (shopper) Marina Galanti se zajímavou strukturou materiálu — do ruky, přes rameno i přes tělo.',
    paras: [
      'Velká dámská kabelka (shopper) z dílny italské firmy Marina Galanti se zajímavou strukturou materiálu. Kabelka má praktickou zadní kapsu na zip. Standardní nošení v ruce, přes rameno, ale díky odnímatelnému nastavitelnému popruhu možnost nošení i přes tělo.',
    ],
    specs: 'Materiál: PU (polyuretan = koženka = ekokůže) s proplétanou strukturou · Rozměry: 48 × 29 × 17 cm · Barva: písková (pouštní) · Odnímatelný nastavitelný popruh · Zapínání: zip · Zadní kapsa na zip; vnitřní kapsa na zip s textilním páskem a karabinkou; jedna otevřená vnitřní kapsa · Textilní podšívka světle béžová s nápisy Marina Galanti.',
  },
  {
    _id: 'pgEc5d7mmeSB7eUxGRgycb',
    title: 'Marina Galanti Luxus',
    source: 'https://www.eshop.levstra.cz/jednoducha-luxusni-kozena-kabelka-marina-galanti-telova-barva.html',
    shortDescription: 'Jednoduchá luxusní kožená kabelka Marina Galanti do ruky i přes rameno — italský design, výroba v Itálii.',
    paras: [
      'Luxusní kožená kabelka s možností nošení v ruce nebo přes rameno.',
    ],
    specs: 'Materiál: pravá kůže, italský design a výroba (Itálie) · Rozměry: 35,5 × 33 × 13,5 cm (formát A4) · Zapínání: horní zip · Pevná textilní podšívka · Vnitřní příčka na zip dělící prostor na dvě části a vnitřní kapsa na zip · Loga značky a kovové zipy ve světle zlaté barvě.',
  },
  {
    _id: 'E7nXCLPw2spSaMTC3ZAjZu',
    title: 'Marina Galanti Odona',
    source: 'https://www.eshop.levstra.cz/marina-galanti-kozena-kabelka-pres-rameno-hobo-bag-odona-z-hladke-kuze-v-cerne.html',
    shortDescription: 'Luxusní kožená kabelka Marina Galanti Odona pro nošení pod paží i přes tělo — italská kůže, výroba v Itálii.',
    paras: [
      'Luxusní kožená kabelka italské značky Marina Galanti pro nošení pod paží, ale i přes tělo díky odnímatelnému nastavitelnému popruhu. Kabelka perfektně drží tvar. Italský design, italská kůže, výroba v Itálii.',
    ],
    specs: 'Materiál: 100 % kůže – hladká kůže v pevném provedení držící tvar · Rozměry: 28 × 23 × 7 cm (délka × výška × šířka) · Zapínání: zip · Textilní podšívka s kapsičkou na zip · Odnímatelný nastavitelný popruh pro nošení přes tělo (délka 110 cm) · Zip a kovové doplňky ve zlaté barvě · Výroba: Itálie.',
  },
  {
    _id: 'E7nXCLPw2spSaMTC3ZAf6Q',
    title: 'Marina Galanti Olivie',
    source: 'https://www.eshop.levstra.cz/marina-galanti-crossbody-bag-olivie-cerna.html',
    shortDescription: 'Dámská crossbody kabelka Marina Galanti se zajímavou laserovou perforací — pro nošení přes tělo.',
    paras: [
      'Dámská crossbody kabelka z dílny italské firmy Marina Galanti se zajímavou laserovou perforací.',
    ],
    specs: 'Materiál: PU (polyuretan = koženka = ekokůže) – jemná textura s laserovou perforací · Rozměry: 33 × 10 × 21 cm (délka × výška × šířka) · Zapínání: zip · Crossbody popruh (přes tělo) · Jedna vnitřní kapsa na zip, jedna vnitřní otevřená kapsa · Textilní podšívka v tónu kabelky · Kovové prvky ve stříbrné barvě.',
  },
];

/* ─── Main ────────────────────────────────────────────────────────────────── */

async function main() {
  console.log(`Mode: ${live ? 'LIVE WRITE (publishes)' : 'DRY RUN'} · ${DEFS.length} product(s)\n`);

  let patched = 0;
  for (const d of DEFS) {
    const description = [
      ...d.paras.map((p, i) => block(`d${i}`, p)),
      block(`dspec`, d.specs),
    ];

    console.log(`■ ${d.title}  (${d._id})`);
    console.log(`   source: ${d.source}`);
    console.log(`   short : ${d.shortDescription}`);
    d.paras.forEach((p, i) => console.log(`   p${i}    : ${p.slice(0, 110)}${p.length > 110 ? '…' : ''}`));
    console.log(`   specs : ${d.specs.slice(0, 140)}${d.specs.length > 140 ? '…' : ''}`);

    if (live) {
      await client.patch(d._id).set({ shortDescription: d.shortDescription, description }).commit();
      console.log(`   ✅ patched\n`);
    } else {
      console.log(`   — would patch shortDescription + description (${description.length} blocks)\n`);
    }
    patched++;
  }

  console.log(live ? `✅ Done — patched ${patched} product(s).` : `DRY RUN — nothing written (${patched} product(s) ready).`);
}

main().catch((e) => { console.error('\n❌ Failed:', e); process.exit(1); });
