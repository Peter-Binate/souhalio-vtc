// One-off : enrichit data/gares.raw.json avec des trajets réels (ORS) — vers les trois
// aéroports parisiens et vers les autres gares du jeu — puis écrit data/gares.json
// (committé, lu par app/vtc/gare/**). Cf. LP-22.
//
// Une seule requête ORS Matrix (9 gares × 12 destinations) au lieu de 108 appels Directions —
// cf. scripts/ors-throttle.ts. Action manuelle et délibérée, jamais automatisée en CI.
//
//   npm run data:enrich-gares
//
// Reprenable : une gare déjà présente dans data/gares.json (par UIC) n'est pas re-enrichie.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { z } from "zod";
import { gareRawSchema, gareSchema, type Gare } from "@/schemas/gare";
import { matrixLegs } from "@/scripts/ors-throttle";

// Points routables des aéroports — les coordonnées de AIRPORTS (lib/constants.ts) servent à
// la détection « trajet aéroport » du pricing et ne sont pas routables (ORS renvoie 404).
// Mêmes valeurs vérifiées que scripts/enrich-communes.ts.
const AIRPORT_ROUTING_COORDS = {
  orly: [2.393586, 48.73118],
  cdg: [2.5479, 49.0097],
  beauvais: [2.1116687, 49.4543222],
} as const satisfies Record<string, readonly [number, number]>;

const RAW_PATH = new URL("../data/gares.raw.json", import.meta.url);
const OUT_PATH = new URL("../data/gares.json", import.meta.url);

async function main() {
  if (!process.env.ORS_API_KEY) {
    throw new Error("ORS_API_KEY manquante — lancer via `npm run data:enrich-gares`");
  }

  const raw = z.array(gareRawSchema).parse(JSON.parse(readFileSync(RAW_PATH, "utf-8")));
  const already: Gare[] = existsSync(OUT_PATH)
    ? z.array(gareSchema).parse(JSON.parse(readFileSync(OUT_PATH, "utf-8")))
    : [];
  const doneByUic = new Map(already.map((g) => [g.uic, g]));

  const todo = raw.filter((g) => !doneByUic.has(g.uic));
  console.log(`[enrich-gares] ${raw.length - todo.length} déjà enrichie(s), ${todo.length} à traiter`);

  // Destinations : les 3 aéroports puis TOUTES les gares du jeu — la diagonale (gare vers
  // elle-même) est simplement ignorée à la lecture des lignes.
  const destinations: [number, number][] = [
    [...AIRPORT_ROUTING_COORDS.orly],
    [...AIRPORT_ROUTING_COORDS.cdg],
    [...AIRPORT_ROUTING_COORDS.beauvais],
    ...raw.map((g): [number, number] => [g.lon, g.lat]),
  ];

  const rows = todo.length > 0
    ? await matrixLegs(todo.map((g): [number, number] => [g.lon, g.lat]), destinations)
    : [];

  const freshByUic = new Map(
    todo.map((g, i) => {
      const row = rows[i];
      return [
        g.uic,
        {
          ...g,
          airports: { orly: row[0], cdg: row[1], beauvais: row[2] },
          // Les trajets de gare à gare sont calculés dans le sens réel (les sens uniques
          // rendent aller et retour asymétriques), pas déduits par symétrie.
          versGares: raw
            .map((other, j) => ({ slug: other.slug, ...row[3 + j] }))
            .filter((leg) => leg.slug !== g.slug),
        } satisfies Gare,
      ];
    }),
  );

  // Ordre de sortie = ordre du fichier source (diff lisible d'un run à l'autre).
  const enriched: Gare[] = raw
    .map((g) => doneByUic.get(g.uic) ?? freshByUic.get(g.uic))
    .filter((g): g is Gare => g !== undefined);

  writeFileSync(OUT_PATH, `${JSON.stringify(enriched, null, 2)}\n`, "utf-8");
  console.log(`[enrich-gares] terminé : ${enriched.length} gares écrites dans ${OUT_PATH.pathname}`);
}

main().catch((err) => {
  console.error("[enrich-gares] échec :", err);
  process.exitCode = 1;
});
