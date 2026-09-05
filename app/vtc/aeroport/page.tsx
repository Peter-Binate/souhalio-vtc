import type { Metadata } from "next";
import Link from "next/link";
import { AEROPORTS } from "@/data/aeroports";
import { AIRPORT_FARES, BUSINESS, SITE_URL } from "@/lib/constants";
import { breadcrumbJsonLd, placeArea, serviceJsonLd } from "@/lib/jsonld";
import { Breadcrumb } from "@/components/seo/breadcrumb";
import { CtaButtons } from "@/components/seo/cta-buttons";

const TITLE = `Transfert VTC aéroport Paris — Orly, Roissy-CDG, Beauvais | ${BUSINESS.name}`;
const DESCRIPTION = `Chauffeur privé pour vos transferts aéroport en Île-de-France : Orly ${AIRPORT_FARES.ORLY} €, Roissy-Charles de Gaulle ${AIRPORT_FARES.CDG} €, Beauvais ${AIRPORT_FARES.BEAUVAIS} € au départ de Paris et de la proche banlieue. Suivi des vols, 24h/24 et 7j/7.`;

export function generateMetadata(): Metadata {
  const url = `${SITE_URL}/vtc/aeroport`;
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

export default function AeroportHubPage() {
  const crumbs = [
    { name: "Accueil", path: "/" },
    { name: "Zones desservies", path: "/vtc" },
    { name: "Transferts aéroport", path: "/vtc/aeroport" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
serviceJsonLd({
              name: "Transfert VTC aéroport",
              areaServed: AEROPORTS.map((a) => placeArea(a.nom)),
              url: `${SITE_URL}/vtc/aeroport`,
              offers: AEROPORTS.map((a) => ({
                name: `Transfert VTC ${a.nom} (prix fixe, départ Paris et proche banlieue)`,
                price: AIRPORT_FARES[a.fareKey],
              })),
            }),
            breadcrumbJsonLd(crumbs),
          ]),
        }}
      />

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <Breadcrumb items={crumbs} />
        <h1 className="font-headline mt-6 max-w-3xl text-3xl font-semibold tracking-tight text-primary md:text-5xl md:font-bold md:tracking-tighter dark:text-zinc-50">
          Transfert VTC aéroport — Orly, Roissy-CDG et Beauvais
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted dark:text-zinc-400">
          Trois aéroports desservent la région parisienne, à des distances très différentes de
          Paris. Au départ de <strong>Paris et de la proche banlieue</strong>, chacun a son{" "}
          <strong>prix fixe connu à l&apos;avance</strong>, valable de jour comme de nuit,
          week-ends et jours fériés compris. Au-delà, le prix est arrêté sur devis avant la
          réservation.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {AEROPORTS.map((a) => (
            <article
              key={a.slug}
              className="flex flex-col rounded-card border border-border bg-surface p-6 ambient-shadow dark:border-zinc-800 dark:bg-zinc-950"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-accent">
                flight_takeoff
              </span>
              <h2 className="font-headline mt-3 text-xl font-semibold text-primary dark:text-zinc-50">
                <Link href={`/vtc/aeroport/${a.slug}`} className="underline-offset-4 hover:underline">
                  {a.nomCourt}
                </Link>
              </h2>
              <p className="mt-1 text-xs tracking-widest text-muted uppercase dark:text-zinc-400">
                {a.iata} · {a.terminaux.length} terminaux
              </p>
              <p className="font-headline mt-4 text-3xl font-bold text-primary dark:text-zinc-50">
                {AIRPORT_FARES[a.fareKey]} €
              </p>
              <p className="mt-1 text-xs text-muted dark:text-zinc-400">
                Prix fixe depuis Paris &amp; proche banlieue
              </p>
              <p className="mt-4 flex-1 text-sm text-muted dark:text-zinc-400">{a.presentation}</p>
              <Link
                href={`/vtc/aeroport/${a.slug}`}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-standard border border-border-input px-4 text-xs font-semibold tracking-widest text-primary uppercase transition-colors hover:bg-surface-low dark:border-zinc-600 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                Détail &amp; durées {a.nomCourt}
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-10">
          <CtaButtons
            label="Réserver votre transfert"
            waText="Bonjour, je souhaite réserver un transfert aéroport."
          />
        </div>

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
