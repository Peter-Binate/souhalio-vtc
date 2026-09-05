import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import communesData from "@/data/communes.json";
import { AEROPORTS } from "@/data/aeroports";
import type { Commune } from "@/data/commune";
import {
  byPopulationDesc,
  departementCodeFromSlug,
  departementDe,
  departementLe,
  departementSlug,
  departementStats,
  sortByNom,
} from "@/lib/communes";
import { AIRPORT_FARES, BUSINESS, IDF_DEPARTEMENTS, SITE_URL } from "@/lib/constants";
import { adminArea, breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/jsonld";
import { Breadcrumb } from "@/components/seo/breadcrumb";
import { CtaButtons, CtaCall } from "@/components/seo/cta-buttons";
import { CommuneTable } from "@/components/seo/commune-table";
import { CommuneLinks } from "@/components/seo/commune-links";

const communes = communesData as Commune[];

// Un département n'a de page que s'il apporte plus que la page ville correspondante :
// avec une seule commune couverte (cas de Paris, 75056), la page ferait doublon —
// c'est exactement le contenu mince que Google traite en « doorway page »
// (cf. programmatic-seo.md § garde-fous).
const MIN_COMMUNES = 2;

// `departementLe` renvoie une forme de milieu de phrase ("le Val-de-Marne") ; en tête de
// phrase il faut la majuscule ("Le Val-de-Marne…", "L'Essonne…").
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function communesOf(code: string): Commune[] {
  return sortByNom(communes.filter((c) => c.departement === code));
}

function eligibleCodes(): string[] {
  return Object.keys(IDF_DEPARTEMENTS)
    .filter((code) => communesOf(code).length >= MIN_COMMUNES)
    .sort();
}

// SSG : une page statique par département couvert, 404 pour tout autre slug.
export const dynamicParams = false;

export function generateStaticParams() {
  return eligibleCodes().map((code) => ({ departement: departementSlug(code) }));
}

function resolve(slug: string) {
  const code = departementCodeFromSlug(slug);
  if (!code) return null;
  const list = communesOf(code);
  if (list.length < MIN_COMMUNES) return null;
  return { code, nom: IDF_DEPARTEMENTS[code], list };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ departement: string }>;
}): Promise<Metadata> {
  const { departement } = await params;
  const found = resolve(departement);
  if (!found) return {};

  const url = `${SITE_URL}/vtc/departement/${departement}`;
  const title = `VTC ${found.nom} (${found.code}) — chauffeur privé 24h/24 | ${BUSINESS.name}`;
  const description = `Chauffeur VTC dans ${departementLe(found.code)} : ${found.list.length} communes desservies, transferts Orly, Roissy-CDG et Beauvais, gares et longue distance, 24h/24 et 7j/7. Réservez en direct.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: BUSINESS.name, locale: "fr_FR", type: "website" },
  };
}

export default async function DepartementPage({
  params,
}: {
  params: Promise<{ departement: string }>;
}) {
  const { departement } = await params;
  const found = resolve(departement);
  if (!found) notFound();

  const { code, nom, list } = found;
  // Formes accordées ("le Val-de-Marne" / "l'Essonne" / "les Yvelines") — cf. lib/constants.ts.
  const leDep = departementLe(code);
  const duDep = departementDe(code);
  const stats = departementStats(list);
  const principales = byPopulationDesc(list, 6);
  const autresDepartements = eligibleCodes().filter((c) => c !== code);

  const crumbs = [
    { name: "Accueil", path: "/" },
    { name: "Zones desservies", path: "/vtc" },
    { name: "Départements", path: "/vtc/departement" },
    { name: nom, path: `/vtc/departement/${departement}` },
  ];

  const faq = [
    {
      question: `Quel est le tarif d'un transfert aéroport depuis ${leDep} ?`,
      answer: stats.inFixedZone
        ? `${leDep} est en zone de tarif fixe : ${AIRPORT_FARES.ORLY} € vers Orly, ${AIRPORT_FARES.CDG} € vers Roissy-Charles de Gaulle et ${AIRPORT_FARES.BEAUVAIS} € vers Beauvais, quelle que soit l'heure.`
        : `${leDep} se situe au-delà de la zone de tarif fixe (Paris et proche banlieue). Le prix est établi sur devis et confirmé au téléphone avant la réservation, sans surprise à l'arrivée.`,
    },
    {
      question: `Combien de temps faut-il pour rejoindre Roissy-CDG depuis ${leDep} ?`,
      answer: `Comptez en moyenne ${stats.averageMinutes.cdg} minutes de route depuis les communes ${duDep} que nous desservons, et environ ${stats.averageMinutes.orly} minutes vers Orly. Le détail commune par commune figure sur cette page.`,
    },
    {
      question: `Réservez-vous la nuit et les jours fériés dans ${leDep} ?`,
      answer: `Oui. ${BUSINESS.name} intervient ${BUSINESS.hours}, en réservation immédiate comme anticipée, par téléphone au ${BUSINESS.phone} ou par WhatsApp.`,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            serviceJsonLd({
              name: `VTC dans ${leDep}`,
              areaServed: adminArea(nom),
              url: `${SITE_URL}/vtc/departement/${departement}`,
              offers: stats.inFixedZone
                ? AEROPORTS.map((a) => ({
                    name: `Transfert ${a.nom} depuis ${leDep}`,
                    price: AIRPORT_FARES[a.fareKey],
                  }))
                : undefined,
            }),
            breadcrumbJsonLd(crumbs),
            faqJsonLd(faq),
          ]),
        }}
      />

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <Breadcrumb items={crumbs} />
        <p className="mt-6 text-xs font-semibold tracking-widest text-muted uppercase dark:text-zinc-400">
          {nom} ({code}) · Île-de-France
        </p>
        <h1 className="font-headline mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-primary md:text-5xl md:font-bold md:tracking-tighter dark:text-zinc-50">
          VTC dans {leDep} — chauffeur privé 24h/24 et 7j/7
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted dark:text-zinc-400">
          Basé à {BUSINESS.city}, votre chauffeur dessert{" "}
          <strong>
            {list.length} communes {duDep}
          </strong>{" "}
          — soit environ {stats.population.toLocaleString("fr-FR")} habitants. Transferts
          aéroport et gare, trajets affaires et longue distance, en réservation immédiate ou
          anticipée, {BUSINESS.hours}.
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Communes desservies", value: `${list.length}` },
            { label: "Vers Paris centre", value: `~${stats.averageMinutes.parisCentre} min` },
            { label: "Vers Orly", value: `~${stats.averageMinutes.orly} min` },
            { label: "Vers Roissy-CDG", value: `~${stats.averageMinutes.cdg} min` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-card border border-border bg-surface p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <dt className="text-xs tracking-widest text-muted uppercase dark:text-zinc-400">
                {stat.label}
              </dt>
              <dd className="font-headline mt-1 text-xl font-bold text-primary dark:text-zinc-50">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-muted dark:text-zinc-400">
          Durées moyennes calculées sur les {list.length} communes desservies du département,
          à partir d&apos;itinéraires routiers réels — hors conditions de trafic
          exceptionnelles.
        </p>

        <div className="mt-8">
          <CtaButtons
            label="Appeler pour réserver"
            waText={`Bonjour, je souhaite réserver un VTC dans ${leDep}.`}
          />
        </div>
      </section>

      <section className="border-y border-border bg-surface-low py-12 md:py-20 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="font-headline text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50">
            Tarifs aéroport depuis {leDep}
          </h2>
          <p className="mt-4 text-lg text-muted dark:text-zinc-400">
            {stats.inFixedZone ? (
              <>
                {capitalize(leDep)} fait partie de la zone <strong>Paris et proche banlieue</strong> : vos
                transferts aéroport y sont facturés à un <strong>prix fixe connu à
                l&apos;avance</strong> — Orly {AIRPORT_FARES.ORLY} €, Roissy-CDG{" "}
                {AIRPORT_FARES.CDG} €, Beauvais {AIRPORT_FARES.BEAUVAIS} € — quelle que soit
                l&apos;heure, y compris la nuit, le week-end et les jours fériés.
              </>
            ) : (
              <>
                {capitalize(leDep)} se situe <strong>au-delà de la zone à tarif fixe</strong> (Paris et
                proche banlieue). Votre transfert fait l&apos;objet d&apos;une{" "}
                <strong>estimation confirmée en un appel</strong>, arrêtée avant la
                réservation : le prix annoncé est celui que vous payez.
              </>
            )}
          </p>

          <h3 className="font-headline mt-10 text-xl font-semibold text-primary dark:text-zinc-50">
            Distances et durées depuis chaque commune
          </h3>
          <CommuneTable
            communes={list}
            columns={[
              { key: "parisCentre", label: "Paris centre" },
              { key: "orly", label: "Orly" },
              { key: "cdg", label: "Roissy-CDG" },
              { key: "beauvais", label: "Beauvais" },
            ]}
            caption={`Distance et durée de trajet depuis les communes ${duDep} vers Paris centre et les trois aéroports parisiens`}
          />

          <CtaCall label={`Réservez votre trajet dans ${leDep}`} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <h2 className="font-headline text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50">
          Principales villes desservies dans {leDep}
        </h2>
        <CommuneLinks communes={principales} prefix="VTC " />

        <h2 className="font-headline mt-12 text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50">
          Questions fréquentes
        </h2>
        <dl className="mt-6 max-w-3xl space-y-6">
          {faq.map((item) => (
            <div key={item.question}>
              <dt className="font-semibold text-primary dark:text-zinc-50">{item.question}</dt>
              <dd className="mt-2 text-muted dark:text-zinc-400">{item.answer}</dd>
            </div>
          ))}
        </dl>

        <h2 className="font-headline mt-12 text-2xl font-semibold text-primary md:text-3xl dark:text-zinc-50">
          Aller plus loin
        </h2>
        <ul className="mt-6 flex flex-wrap gap-3">
          {AEROPORTS.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/vtc/aeroport/${a.slug}`}
                className="inline-flex min-h-11 items-center rounded-standard border border-border bg-surface px-4 text-sm font-medium text-primary transition-colors hover:bg-surface-low dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Transfert {a.nomCourt}
              </Link>
            </li>
          ))}
          {autresDepartements.map((c) => (
            <li key={c}>
              <Link
                href={`/vtc/departement/${departementSlug(c)}`}
                className="inline-flex min-h-11 items-center rounded-standard border border-border bg-surface px-4 text-sm font-medium text-primary transition-colors hover:bg-surface-low dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                VTC dans {departementLe(c)}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
