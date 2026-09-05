import type { Metadata } from "next";
import Link from "next/link";
import communesData from "@/data/communes.json";
import { AEROPORTS } from "@/data/aeroports";
import type { Commune } from "@/data/commune";
import { departementSlug, groupByDepartement } from "@/lib/communes";
import { AIRPORT_FARES, BUSINESS, IDF_DEPARTEMENTS, SITE_URL } from "@/lib/constants";
import { adminArea, breadcrumbJsonLd, serviceJsonLd } from "@/lib/jsonld";
import { Breadcrumb } from "@/components/seo/breadcrumb";
import { CtaButtons } from "@/components/seo/cta-buttons";

const communes = communesData as Commune[];

// Un département n'a de page dédiée qu'à partir de 2 communes couvertes
// (cf. app/vtc/departement/[departement]/page.tsx).
const MIN_COMMUNES = 2;

export function generateMetadata(): Metadata {
  const title = `Nos zones d'intervention en Île-de-France | ${BUSINESS.name}`;
  const description = `Chauffeur VTC ${BUSINESS.name} : ${communes.length} communes d'Île-de-France desservies, transferts aéroport (Orly, CDG, Beauvais) et gares, 24h/24 et 7j/7.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/vtc` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/vtc`,
      siteName: BUSINESS.name,
      locale: "fr_FR",
      type: "website",
    },
  };
}

export default function VtcHubPage() {
  const groups = groupByDepartement(communes);
  const departementCodes = [...groups.keys()].sort();
  const crumbs = [
    { name: "Accueil", path: "/" },
    { name: "Zones desservies", path: "/vtc" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            serviceJsonLd({
              name: "VTC en Île-de-France",
              areaServed: departementCodes.map((code) => adminArea(IDF_DEPARTEMENTS[code] ?? code)),
              url: `${SITE_URL}/vtc`,
            }),
            breadcrumbJsonLd(crumbs),
          ]),
        }}
      />

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <Breadcrumb items={crumbs} />
        <h1 className="font-headline mt-6 max-w-2xl text-3xl font-semibold tracking-tight text-primary md:text-5xl md:font-bold md:tracking-tighter dark:text-zinc-50">
          Nos zones d&apos;intervention en Île-de-France
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted dark:text-zinc-400">
          {BUSINESS.name} dessert {communes.length} communes d&apos;Île-de-France, avec des
          transferts aéroport à prix fixe au départ de Paris et de la proche banlieue.
          Sélectionnez votre ville pour voir les distances et durées vers Orly, Roissy-CDG,
          Beauvais et Paris.
        </p>

        <nav aria-label="Pages thématiques" className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/vtc/departement"
            className="inline-flex min-h-11 items-center gap-2 rounded-standard border border-border-input px-5 text-xs font-semibold tracking-widest text-primary uppercase transition-colors hover:bg-surface-low dark:border-zinc-600 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            VTC par département
          </Link>
          <Link
            href="/vtc/aeroport"
            className="inline-flex min-h-11 items-center gap-2 rounded-standard border border-border-input px-5 text-xs font-semibold tracking-widest text-primary uppercase transition-colors hover:bg-surface-low dark:border-zinc-600 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Transferts aéroport
          </Link>
          <Link
            href="/vtc/gare"
            className="inline-flex min-h-11 items-center gap-2 rounded-standard border border-border-input px-5 text-xs font-semibold tracking-widest text-primary uppercase transition-colors hover:bg-surface-low dark:border-zinc-600 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Transferts gare
          </Link>
        </nav>

        <div className="mt-8">
          <CtaButtons
            label="Appeler pour réserver"
            waText="Bonjour, je souhaite réserver un VTC en Île-de-France."
          />
        </div>

        <div className="mt-12 space-y-10">
          {departementCodes.map((code) => {
            const list = groups.get(code)!;
            const nom = IDF_DEPARTEMENTS[code] ?? code;
            return (
              <div key={code}>
                <h2 className="font-headline text-xl font-semibold text-primary md:text-2xl dark:text-zinc-50">
                  {list.length >= MIN_COMMUNES ? (
                    <Link
                      href={`/vtc/departement/${departementSlug(code)}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {nom} ({code})
                    </Link>
                  ) : (
                    <>
                      {nom} ({code})
                    </>
                  )}
                </h2>
                <ul className="mt-4 flex flex-wrap gap-3">
                  {list.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/vtc/${c.slug}`}
                        className="inline-flex min-h-11 items-center rounded-standard border border-border bg-surface px-4 text-sm font-medium text-primary transition-colors hover:bg-surface-low dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
                      >
                        {c.nom}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <h2 className="font-headline mt-12 text-xl font-semibold text-primary md:text-2xl dark:text-zinc-50">
          Transferts aéroport
        </h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          {AEROPORTS.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/vtc/aeroport/${a.slug}`}
                className="inline-flex min-h-11 items-center rounded-standard border border-border bg-surface px-4 text-sm font-medium text-primary transition-colors hover:bg-surface-low dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                VTC {a.nomCourt} — {AIRPORT_FARES[a.fareKey]} €
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-muted dark:text-zinc-400">
          <Link href="/" className="underline hover:text-primary dark:hover:text-zinc-50">
            Retour à l&apos;accueil
          </Link>
        </p>
      </section>
    </>
  );
}
