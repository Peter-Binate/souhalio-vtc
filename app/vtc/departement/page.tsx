import type { Metadata } from "next";
import Link from "next/link";
import communesData from "@/data/communes.json";
import type { Commune } from "@/data/commune";
import { departementSlug, departementStats, groupByDepartement } from "@/lib/communes";
import { BUSINESS, IDF_DEPARTEMENTS, SITE_URL } from "@/lib/constants";
import { adminArea, breadcrumbJsonLd, serviceJsonLd } from "@/lib/jsonld";
import { Breadcrumb } from "@/components/seo/breadcrumb";
import { CtaButtons } from "@/components/seo/cta-buttons";

const communes = communesData as Commune[];

// Même seuil que la page département : en dessous, la page ferait doublon avec la page ville.
const MIN_COMMUNES = 2;

const TITLE = `VTC par département en Île-de-France | ${BUSINESS.name}`;
const DESCRIPTION = `Chauffeur VTC dans les 8 départements franciliens : Paris, Hauts-de-Seine, Seine-Saint-Denis, Val-de-Marne, Seine-et-Marne, Yvelines, Essonne, Val-d'Oise. Transferts aéroport 24h/24.`;

export function generateMetadata(): Metadata {
  const url = `${SITE_URL}/vtc/departement`;
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

export default function DepartementHubPage() {
  const groups = groupByDepartement(communes);
  const rows = Object.keys(IDF_DEPARTEMENTS)
    .sort()
    .map((code) => {
      const list = groups.get(code) ?? [];
      return { code, nom: IDF_DEPARTEMENTS[code], list, stats: departementStats(list) };
    })
    .filter((row) => row.list.length > 0);

  const crumbs = [
    { name: "Accueil", path: "/" },
    { name: "Zones desservies", path: "/vtc" },
    { name: "Départements", path: "/vtc/departement" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            serviceJsonLd({
              name: "VTC par département en Île-de-France",
              areaServed: rows.map((row) => adminArea(row.nom)),
              url: `${SITE_URL}/vtc/departement`,
            }),
            breadcrumbJsonLd(crumbs),
          ]),
        }}
      />

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <Breadcrumb items={crumbs} />
        <h1 className="font-headline mt-6 max-w-3xl text-3xl font-semibold tracking-tight text-primary md:text-5xl md:font-bold md:tracking-tighter dark:text-zinc-50">
          VTC par département en Île-de-France
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted dark:text-zinc-400">
          {BUSINESS.name} intervient dans les huit départements franciliens, {BUSINESS.hours}.
          Les transferts aéroport sont à <strong>prix fixe au départ de Paris et de la proche
          banlieue</strong> (75, 92, 93, 94) ; ailleurs en Île-de-France, le prix est arrêté sur
          devis avant la réservation. Choisissez votre département pour voir le détail commune
          par commune.
        </p>

        <div className="mt-10 overflow-x-auto rounded-card border border-border bg-surface ambient-shadow dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">
              Départements d&apos;Île-de-France desservis, nombre de communes couvertes, durée
              moyenne vers Paris et les aéroports, et zone tarifaire
            </caption>
            <thead>
              <tr className="border-b border-border dark:border-zinc-800">
                <th scope="col" className="px-4 py-3 font-semibold text-primary dark:text-zinc-50">
                  Département
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold whitespace-nowrap text-primary dark:text-zinc-50">
                  Communes
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold whitespace-nowrap text-primary dark:text-zinc-50">
                  Paris centre
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold whitespace-nowrap text-primary dark:text-zinc-50">
                  Orly
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold whitespace-nowrap text-primary dark:text-zinc-50">
                  Roissy-CDG
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold whitespace-nowrap text-primary dark:text-zinc-50">
                  Tarif aéroport
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                // Un département réduit à une seule commune couverte n'a pas de page dédiée :
                // on renvoie directement vers la page ville, qui porte le même contenu.
                const href =
                  row.list.length >= MIN_COMMUNES
                    ? `/vtc/departement/${departementSlug(row.code)}`
                    : `/vtc/${row.list[0].slug}`;
                return (
                  <tr key={row.code} className="border-b border-border last:border-b-0 dark:border-zinc-800">
                    <th scope="row" className="px-4 py-3 font-medium">
                      <Link
                        href={href}
                        className="text-primary underline-offset-4 hover:underline dark:text-zinc-50"
                      >
                        {row.nom} ({row.code})
                      </Link>
                    </th>
                    <td className="px-4 py-3 text-right text-muted dark:text-zinc-400">
                      {row.list.length}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap text-muted dark:text-zinc-400">
                      ~{row.stats.averageMinutes.parisCentre} min
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap text-muted dark:text-zinc-400">
                      ~{row.stats.averageMinutes.orly} min
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap text-muted dark:text-zinc-400">
                      ~{row.stats.averageMinutes.cdg} min
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap text-muted dark:text-zinc-400">
                      {row.stats.inFixedZone ? "Prix fixe" : "Sur devis"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted dark:text-zinc-400">
          Durées moyennes calculées sur les communes desservies de chaque département, à partir
          d&apos;itinéraires routiers réels — hors conditions de trafic exceptionnelles.
        </p>

        <div className="mt-8">
          <CtaButtons
            label="Appeler pour réserver"
            waText="Bonjour, je souhaite réserver un VTC en Île-de-France."
          />
        </div>

        <p className="mt-10 text-sm text-muted dark:text-zinc-400">
          <Link href="/vtc" className="underline hover:text-primary dark:hover:text-zinc-50">
            Toutes les communes desservies
          </Link>
          {" · "}
          <Link href="/vtc/aeroport" className="underline hover:text-primary dark:hover:text-zinc-50">
            Transferts aéroport
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
