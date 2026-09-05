import type { MetadataRoute } from "next";
import communesData from "@/data/communes.json";
import garesData from "@/data/gares.json";
import { AEROPORTS } from "@/data/aeroports";
import type { Commune } from "@/data/commune";
import type { Gare } from "@/data/gare";
import { departementSlug } from "@/lib/communes";
import { IDF_DEPARTEMENTS, SITE_URL } from "@/lib/constants";

const communes = communesData as Commune[];
const gares = garesData as Gare[];

// Un département n'a de page dédiée qu'à partir de 2 communes couvertes
// (cf. app/vtc/departement/[departement]/page.tsx).
const MIN_COMMUNES = 2;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entry = (
    path: string,
    priority: number,
  ): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority,
  });

  const departements = Object.keys(IDF_DEPARTEMENTS)
    .filter((code) => communes.filter((c) => c.departement === code).length >= MIN_COMMUNES)
    .sort();

  return [
    entry("", 1),
    entry("/vtc", 0.6),
    entry("/vtc/aeroport", 0.8),
    ...AEROPORTS.map((a) => entry(`/vtc/aeroport/${a.slug}`, 0.9)),
    entry("/vtc/departement", 0.6),
    ...departements.map((code) => entry(`/vtc/departement/${departementSlug(code)}`, 0.7)),
    // Les pages gare ne sont référencées que si data/gares.json est enrichi
    // (sinon la route ne génère aucune page — cf. LP-22).
    ...(gares.length > 0
      ? [entry("/vtc/gare", 0.8), ...gares.map((g) => entry(`/vtc/gare/${g.slug}`, 0.8))]
      : []),
    ...communes.map((c) => entry(`/vtc/${c.slug}`, 0.7)),
  ];
}
