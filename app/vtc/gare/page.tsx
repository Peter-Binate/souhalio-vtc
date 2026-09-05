import type { Metadata } from "next";
import Link from "next/link";
import garesData from "@/data/gares.json";
import { AEROPORTS } from "@/data/aeroports";
import type { Gare } from "@/data/gare";
import { AIRPORT_FARES, BUSINESS, SITE_URL } from "@/lib/constants";
import { breadcrumbJsonLd, placeArea, serviceJsonLd } from "@/lib/jsonld";
import { Breadcrumb } from "@/components/seo/breadcrumb";
import { CtaButtons } from "@/components/seo/cta-buttons";

const gares = garesData as Gare[];

const TITLE = `Transfert VTC gare — Paris, Massy TGV, Marne-la-Vallée | ${BUSINESS.name}`;
const DESCRIPTION = `Chauffeur privé pour vos départs et arrivées en gare : Gare de Lyon, Gare du Nord, Montparnasse, Saint-Lazare, Gare de l'Est, Austerlitz, Bercy, Massy TGV, Marne-la-Vallée Chessy. 24h/24 et 7j/7.`;

export function generateMetadata(): Metadata {
  const url = `${SITE_URL}/vtc/gare`;
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: url },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url,
      siteName: BUSINESS.name,
      locale: "fr_FR",
      type: "website",
    },
  };
}

export default function GareHubPage() {
  const crumbs = [
    { name: "Accueil", path: "/" },
    { name: "Zones desservies", path: "/vtc" },
    { name: "Transferts gare", path: "/vtc/gare" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            serviceJsonLd({
              name: "Transfert VTC gare",
              areaServed: gares.map((g) => placeArea(g.nom)),
              url: `${SITE_URL}/vtc/gare`,
            }),
            breadcrumbJsonLd(crumbs),
          ]),
        }}
      />

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <Breadcrumb items={crumbs} />
        <h1 className="font-headline mt-6 max-w-3xl text-3xl font-semibold tracking-tight text-primary md:text-5xl md:font-bold md:tracking-tighter dark:text-zinc-50">
          Transfert VTC gare — Paris et Île-de-France
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted dark:text-zinc-400">
          Un train tôt le matin, une arrivée tardive, une correspondance d&apos;une gare à
          l&apos;autre avec des bagages : votre chauffeur privé vous dépose et vous récupère au
          plus près du quai, {BUSINESS.hours}. Réservation en direct, sans plateforme
          intermédiaire.
        </p>

        {gares.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gares.map((g) => (
              <article
                key={g.slug}
                className="flex flex-col rounded-card border border-border bg-surface p-6 ambient-shadow dark:border-zinc-800 dark:bg-zinc-950"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-accent">
                  train
                </span>
                <h2 className="font-headline mt-3 text-xl font-semibold text-primary dark:text-zinc-50">
                  <Link href={`/vtc/gare/${g.slug}`} className="underline-offset-4 hover:underline">
                    {g.nomCourt}
                  </Link>
                </h2>
                <p className="mt-1 text-xs tracking-widest text-muted uppercase dark:text-zinc-400">
                  {g.commune}
                </p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-muted dark:text-zinc-400">
                  {g.dessertes.slice(0, 2).map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-muted dark:text-zinc-400">
                  Orly ~{g.airports.orly.min} min · Roissy-CDG ~{g.airports.cdg.min} min
                  {g.inFixedZone && (
                    <>
                      {" "}
                      · <span className="font-semibold">prix fixe aéroport</span>
                    </>
                  )}
                </p>
                <Link
                  href={`/vtc/gare/${g.slug}`}
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-standard border border-border-input px-4 text-xs font-semibold tracking-widest text-primary uppercase transition-colors hover:bg-surface-low dark:border-zinc-600 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  Détail {g.nomCourt}
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-10 rounded-card border border-border bg-surface p-6 text-muted dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            Toutes les gares parisiennes et franciliennes sont desservies. Appelez pour
            confirmer votre prise en charge.
          </p>
        )}

        <div className="mt-10">
          <CtaButtons
            label="Appeler pour réserver"
            waText="Bonjour, je souhaite réserver un VTC pour un trajet en gare."
          />
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
          <Link href="/vtc" className="underline hover:text-primary dark:hover:text-zinc-50">
            Toutes les communes desservies
          </Link>
          {" · "}
          <Link href="/vtc/departement" className="underline hover:text-primary dark:hover:text-zinc-50">
            VTC par département
          </Link>
          {" · "}
          <Link href="/" className="underline hover:text-primary dark:hover:text-zinc-50">
            Retour à l&apos;accueil
          </Link>
        </p>
      </section>
    </>
  );
}
