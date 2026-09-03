import type { Metadata } from "next";
import Link from "next/link";
import communesData from "@/data/communes.json";
import type { Commune } from "@/data/commune";
import { BUSINESS, IDF_DEPARTEMENTS } from "@/lib/constants";

const communes = communesData as Commune[];

export function generateMetadata(): Metadata {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const title = `Nos zones d'intervention en Île-de-France | ${BUSINESS.name}`;
  const description = `Chauffeur VTC ${BUSINESS.name} : liste des communes d'Île-de-France desservies, avec transfert aéroport (Orly, CDG, Beauvais), 24h/24 et 7j/7.`;
  return {
    title,
    description,
    alternates: { canonical: `${base}/vtc` },
    openGraph: { title, description, url: `${base}/vtc`, siteName: BUSINESS.name, locale: "fr_FR", type: "website" },
  };
}

function groupByDepartement(list: Commune[]): Map<string, Commune[]> {
  const groups = new Map<string, Commune[]>();
  for (const c of list) {
    const group = groups.get(c.departement) ?? [];
    group.push(c);
    groups.set(c.departement, group);
  }
  for (const group of groups.values()) {
    group.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  }
  return groups;
}

export default function VtcHubPage() {
  const groups = groupByDepartement(communes);
  const departementCodes = [...groups.keys()].sort();

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
      <h1 className="font-headline max-w-2xl text-3xl font-semibold tracking-tight text-primary md:text-5xl md:font-bold md:tracking-tighter dark:text-zinc-50">
        Nos zones d&apos;intervention en Île-de-France
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted dark:text-zinc-400">
        {BUSINESS.name} dessert {communes.length} communes d&apos;Île-de-France, avec des
        transferts aéroport à prix fixe au départ de Paris et de la proche banlieue.
        Sélectionnez votre ville pour voir les distances et durées vers Orly, Roissy-CDG,
        Beauvais et Paris.
      </p>

      <div className="mt-10 space-y-10">
        {departementCodes.map((code) => (
          <div key={code}>
            <h2 className="font-headline text-xl font-semibold text-primary md:text-2xl dark:text-zinc-50">
              {IDF_DEPARTEMENTS[code] ?? code} ({code})
            </h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {groups.get(code)!.map((c) => (
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
        ))}
      </div>

      <p className="mt-10 text-sm text-muted dark:text-zinc-400">
        <Link href="/" className="underline hover:text-primary dark:hover:text-zinc-50">
          Retour à l&apos;accueil
        </Link>
      </p>
    </section>
  );
}
