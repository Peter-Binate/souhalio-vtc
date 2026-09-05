// Helpers purs sur le jeu de communes enrichi (data/communes.json) — alimentent les pages
// SEO programmatiques : ville (LP-19), hub département (LP-23) et aéroport (LP-21).
// Aucune I/O, aucun état : tout est testable unitairement (cf. lib/communes.test.ts).
import { IDF_DEPARTEMENTS } from "@/lib/constants";
import type { Commune, Leg } from "@/schemas/commune";

export type AirportKey = "orly" | "cdg" | "beauvais";
export type LegKey = AirportKey | "parisCentre";

/** kebab-case sans diacritiques — même règle que scripts/enrich-communes.ts (slugs de commune). */
export function slugify(nom: string): string {
  return nom
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Trajet d'une commune vers l'un des 4 points de référence (3 aéroports + Paris centre). */
export function legOf(commune: Commune, key: LegKey): Leg {
  return key === "parisCentre" ? commune.parisCentre : commune.airports[key];
}

export function sortByNom(list: readonly Commune[]): Commune[] {
  return [...list].sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
}

export function groupByDepartement(list: readonly Commune[]): Map<string, Commune[]> {
  const groups = new Map<string, Commune[]>();
  for (const c of list) {
    const group = groups.get(c.departement) ?? [];
    group.push(c);
    groups.set(c.departement, group);
  }
  for (const [code, group] of groups) groups.set(code, sortByNom(group));
  return groups;
}

/** Communes les plus peuplées d'abord (départage par nom pour un rendu stable au build). */
export function byPopulationDesc(list: readonly Commune[], count?: number): Commune[] {
  const sorted = [...list].sort(
    (a, b) => b.population - a.population || a.nom.localeCompare(b.nom, "fr"),
  );
  return count === undefined ? sorted : sorted.slice(0, count);
}

/** Communes les plus proches (en durée) d'un point de référence — cœur du contenu des pages aéroport. */
export function fastestTo(
  list: readonly Commune[],
  key: LegKey,
  count?: number,
): Commune[] {
  const sorted = [...list].sort(
    (a, b) => legOf(a, key).min - legOf(b, key).min || a.nom.localeCompare(b.nom, "fr"),
  );
  return count === undefined ? sorted : sorted.slice(0, count);
}

/** Durée moyenne (min, arrondie) vers un point de référence ; `null` sur une liste vide. */
export function averageMinutes(list: readonly Commune[], key: LegKey): number | null {
  if (list.length === 0) return null;
  const total = list.reduce((sum, c) => sum + legOf(c, key).min, 0);
  return Math.round(total / list.length);
}

export type DepartementStats = {
  communeCount: number;
  population: number;
  inFixedZone: boolean;
  averageMinutes: Record<LegKey, number | null>;
  closestToParis: Commune | null;
};

export function departementStats(list: readonly Commune[]): DepartementStats {
  return {
    communeCount: list.length,
    population: list.reduce((sum, c) => sum + c.population, 0),
    // Le tarif fixe aéroport ne vaut que pour Paris + petite couronne : un département
    // n'est « en zone » que si toutes ses communes le sont (cf. programmatic-seo.md §« tarifs »).
    inFixedZone: list.length > 0 && list.every((c) => c.inFixedZone),
    averageMinutes: {
      orly: averageMinutes(list, "orly"),
      cdg: averageMinutes(list, "cdg"),
      beauvais: averageMinutes(list, "beauvais"),
      parisCentre: averageMinutes(list, "parisCentre"),
    },
    closestToParis: fastestTo(list, "parisCentre", 1)[0] ?? null,
  };
}

/** Slug d'un département à partir de son code INSEE : "94" → "val-de-marne". */
export function departementSlug(code: string): string {
  return slugify(IDF_DEPARTEMENTS[code] ?? code);
}

/** Inverse de `departementSlug` ; `undefined` si le slug ne correspond à aucun département IDF. */
export function departementCodeFromSlug(slug: string): string | undefined {
  return Object.keys(IDF_DEPARTEMENTS).find((code) => departementSlug(code) === slug);
}
