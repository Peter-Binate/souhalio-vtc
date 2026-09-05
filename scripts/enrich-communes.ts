// One-off : enrichit data/communes.raw.json avec des données de trajet réelles (ORS) —
// distance/durée vers Orly, CDG, Beauvais et Paris centre — puis écrit data/communes.json
// (committé, lu par app/vtc/** au build).
//
// Utilise l'endpoint Matrix par lots (cf. scripts/ors-throttle.ts) : ~7 requêtes ORS pour
// les 266 communes, là où un appel Directions par trajet en demandait plus de 1 000 et
// épuisait le quota gratuit en cours de route.
//
//   npm run data:enrich-communes
//   npm run data:enrich-communes -- --departements=94,92,93   (priorise la zone tarif fixe)
//
// Reprenable : une commune déjà présente dans data/communes.json (par code INSEE) n'est
// pas re-enrichie si le script est relancé après une interruption.
//
// cf. programmatic-seo.md §3 et PRPs/LP-19-seo-programmatique-villes.md.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { z } from "zod";
import { AIRPORTS } from "@/lib/constants";
import { communeApiSchema, communeSchema, type Commune } from "@/schemas/commune";
import { matrixLegs } from "@/scripts/ors-throttle";
import { computeNearby } from "@/scripts/nearby";

const RAW_PATH = new URL("../data/communes.raw.json", import.meta.url);
const OUT_PATH = new URL("../data/communes.json", import.meta.url);
const FIXED_ZONE_DEPARTEMENTS = new Set(["75", "92", "93", "94"]);

// Taille d'un lot Matrix : 40 sources × 4 destinations = 44 points, 160 trajets par requête —
// largement sous les limites du plan gratuit, et assez petit pour qu'un échec de lot
// (point non routable) ne coûte qu'une dichotomie courte.
const BATCH_SIZE = 40;

// AIRPORTS.ORLY/BEAUVAIS.coord (lib/constants.ts) servent au rayon de détection
// "trajet aéroport" (lib/pricing.ts) et ne sont PAS des points routables — ORS renvoie
// 404 ("Could not find routable point…") dessus (déjà rencontré en LP-17 pour Orly).
// Coordonnées de substitution vérifiées routables (géocodage MapTiler/Nominatim réel).
// CDG, lui, est routable tel quel.
const ORLY: [number, number] = [2.393586, 48.73118];
const CDG = AIRPORTS.CDG.coord as [number, number];
const BEAUVAIS: [number, number] = [2.1116687, 49.4543222];

function slugify(nom: string): string {
  return nom
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // retire les diacritiques (post-NFD)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeUniqueSlugs(raw: readonly { nom: string; departement: { code: string } }[]) {
  const counts = new Map<string, number>();
  for (const c of raw) {
    const base = slugify(c.nom);
    counts.set(base, (counts.get(base) ?? 0) + 1);
  }
  return raw.map((c) => {
    const base = slugify(c.nom);
    return (counts.get(base) ?? 0) > 1 ? `${base}-${c.departement.code}` : base;
  });
}

async function main() {
  if (!process.env.ORS_API_KEY) {
    throw new Error("ORS_API_KEY manquante — lancer via `npm run data:enrich-communes`");
  }

  const raw = z.array(communeApiSchema).parse(JSON.parse(readFileSync(RAW_PATH, "utf-8")));
  const slugs = makeUniqueSlugs(raw);

  // Le quota ORS gratuit peut ne pas suffire en une fois : cet argument permet de traiter
  // d'abord les départements à plus forte valeur (75/92/93/94, la zone à tarif fixe).
  const filterArg = process.argv.find((a) => a.startsWith("--departements="));
  const only = filterArg
    ? new Set(filterArg.slice("--departements=".length).split(",").map((d) => d.trim()))
    : null;
  if (only) console.log(`[enrich-communes] départements ciblés : ${[...only].join(", ")}`);

  const paris = raw.find((c) => c.code === "75056");
  if (!paris) throw new Error("Commune Paris (75056) introuvable dans communes.raw.json");
  const parisCentre = paris.centre.coordinates as [number, number];
  const destinations: [number, number][] = [ORLY, CDG, BEAUVAIS, parisCentre];

  const already: Commune[] = existsSync(OUT_PATH)
    ? z.array(communeSchema).parse(JSON.parse(readFileSync(OUT_PATH, "utf-8")))
    : [];
  const doneByInsee = new Map(already.map((c) => [c.insee, c]));

  // Ordre de sortie = ordre du fichier source, que la commune vienne du cache ou d'un
  // nouveau calcul → data/communes.json reste stable d'un run à l'autre (diff lisible).
  const enriched: Commune[] = [];
  const todo: { index: number; coord: [number, number] }[] = [];

  for (const [index, c] of raw.entries()) {
    const existing = doneByInsee.get(c.code);
    if (existing) {
      enriched.push(existing);
      continue;
    }
    if (only && !only.has(c.departement.code)) continue;
    todo.push({ index, coord: c.centre.coordinates as [number, number] });
  }

  console.log(
    `[enrich-communes] ${already.length} commune(s) déjà enrichie(s), ${todo.length} à traiter ` +
      `(${Math.ceil(todo.length / BATCH_SIZE)} requête(s) Matrix)`,
  );

  for (let start = 0; start < todo.length; start += BATCH_SIZE) {
    const batch = todo.slice(start, start + BATCH_SIZE);
    console.log(
      `[enrich-communes] lot ${start / BATCH_SIZE + 1} : ${raw[batch[0].index].nom} → ` +
        `${raw[batch[batch.length - 1].index].nom}`,
    );

    const rows = await matrixLegs(batch.map((b) => b.coord), destinations);

    batch.forEach((item, i) => {
      const c = raw[item.index];
      const [orly, cdg, beauvais, parisLeg] = rows[i];
      enriched.push({
        insee: c.code,
        slug: slugs[item.index],
        nom: c.nom,
        codePostal: c.codesPostaux[0],
        departement: c.departement.code,
        population: c.population,
        lat: item.coord[1],
        lon: item.coord[0],
        inFixedZone: FIXED_ZONE_DEPARTEMENTS.has(c.departement.code),
        airports: { orly, cdg, beauvais },
        parisCentre: parisLeg,
        gares: [],
        nearby: [],
      });
    });

    // Sauvegarde incrémentale : une interruption (quota ORS) ne perd pas les lots déjà faits.
    computeNearby(enriched);
    writeFileSync(OUT_PATH, `${JSON.stringify(enriched, null, 2)}\n`, "utf-8");
  }

  // Maillage interne : dépend de l'ensemble du jeu, donc recalculé en fin de run.
  // Rejouable seul via `npm run data:link-communes`.
  computeNearby(enriched);
  writeFileSync(OUT_PATH, `${JSON.stringify(enriched, null, 2)}\n`, "utf-8");
  console.log(`[enrich-communes] terminé : ${enriched.length} communes écrites`);
}

main().catch((err) => {
  console.error("[enrich-communes] échec :", err);
  process.exitCode = 1;
});
