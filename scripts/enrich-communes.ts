// One-off : enrichit data/communes.raw.json avec des données de trajet réelles (ORS) —
// distance/durée vers Orly, CDG, Beauvais et Paris centre — puis écrit data/communes.json
// (committé, lu par app/vtc/[ville]/page.tsx et app/vtc/page.tsx au build).
//
// Consomme le quota ORS réel (~4 requêtes/commune, throttlées) : action manuelle et
// délibérée du développeur, jamais automatisée dans predev/prebuild/CI.
//
//   node --env-file=.env.local --import ./scripts/register-ts-paths.mjs scripts/enrich-communes.ts
//
// Reprenable : une commune déjà présente dans data/communes.json (par code INSEE) n'est
// pas re-enrichie si le script est relancé après une interruption.
//
// cf. programmatic-seo.md §3 et PRPs/LP-19-seo-programmatique-villes.md.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { z } from "zod";
import { getDirections } from "@/lib/ors";
import { AIRPORTS } from "@/lib/constants";
import { communeApiSchema, communeSchema, type Commune, type Leg } from "@/schemas/commune";

const RAW_PATH = new URL("../data/communes.raw.json", import.meta.url);
const OUT_PATH = new URL("../data/communes.json", import.meta.url);
const THROTTLE_MS = 2_500; // marge de sécurité sous ~40 req/min du plan gratuit ORS
const QUOTA_BACKOFF_MS = [15_000, 30_000, 60_000, 120_000]; // paliers de repli si "Quota exceeded"
const FIXED_ZONE_DEPARTEMENTS = new Set(["75", "92", "93", "94"]);
const NEARBY_COUNT = 5;

// AIRPORTS.ORLY/BEAUVAIS.coord (lib/constants.ts) servent au rayon de détection
// "trajet aéroport" (lib/pricing.ts) et ne sont PAS des points routables — ORS renvoie
// 404 ("Could not find routable point…") dessus (déjà rencontré en LP-17 pour Orly).
// Coordonnées de substitution vérifiées routables (géocodage MapTiler/Nominatim réel,
// testées via getDirections avant ce run) — CDG, lui, est routable tel quel.
const AIRPORT_ROUTING_COORDS: Record<"ORLY" | "CDG" | "BEAUVAIS", [number, number]> = {
  ORLY: [2.393586, 48.73118], // Aéroport Paris-Orly (MapTiler)
  CDG: AIRPORTS.CDG.coord as [number, number],
  BEAUVAIS: [2.1116687, 49.4543222], // Aéroport de Beauvais-Tillé (Nominatim, centroïde aérodrome)
};

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

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Certains centroïdes de commune (ex. Fontainebleau, en forêt) ne sont pas assez proches
// d'une route pour le rayon de rattachement par défaut d'ORS (350 m, erreur code 2010) —
// on élargit le rayon en repli plutôt que de planter tout le run pour un cas limite isolé.
async function fetchLeg(from: [number, number], to: [number, number]): Promise<Leg> {
  let result;
  try {
    result = await getDirections(from, to);
  } catch (err) {
    console.warn(`[enrich-communes]   rayon par défaut insuffisant, réessai à 2 km (${(err as Error).message})`);
    result = await getDirections(from, to, { radiuses: [2000, 2000] });
  }
  return { km: Math.round(result.distanceKm * 10) / 10, min: Math.round(result.durationMin) };
}

// Le plan gratuit ORS renvoie occasionnellement "Quota exceeded" (limite par minute) même
// avec le throttling — repli avec palier d'attente croissant plutôt que d'arrêter tout le
// run (la sauvegarde incrémentale permet de toute façon de reprendre si besoin).
async function toLeg(from: [number, number], to: [number, number]): Promise<Leg> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetchLeg(from, to);
    } catch (err) {
      if (attempt >= QUOTA_BACKOFF_MS.length) throw err;
      const wait = QUOTA_BACKOFF_MS[attempt];
      console.warn(
        `[enrich-communes]   échec (${(err as Error).message}), attente ${wait / 1000}s avant nouvelle tentative…`,
      );
      await sleep(wait);
    }
  }
}

async function main() {
  if (!process.env.ORS_API_KEY) {
    throw new Error(
      "ORS_API_KEY manquante — lancer avec `node --env-file=.env.local --import ./scripts/register-ts-paths.mjs scripts/enrich-communes.ts`",
    );
  }

  const raw = z.array(communeApiSchema).parse(JSON.parse(readFileSync(RAW_PATH, "utf-8")));
  const slugs = makeUniqueSlugs(raw);

  const paris = raw.find((c) => c.code === "75056");
  if (!paris) throw new Error("Commune Paris (75056) introuvable dans communes.raw.json");
  const parisCentreCoord = paris.centre.coordinates;

  const already: Commune[] = existsSync(OUT_PATH)
    ? z.array(communeSchema).parse(JSON.parse(readFileSync(OUT_PATH, "utf-8")))
    : [];
  const doneByInsee = new Map(already.map((c) => [c.insee, c]));

  const enriched: Commune[] = [];

  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    const slug = slugs[i];
    const existing = doneByInsee.get(c.code);
    if (existing) {
      enriched.push(existing);
      continue;
    }

    console.log(`[enrich-communes] (${i + 1}/${raw.length}) ${c.nom}…`);
    const [lon, lat] = c.centre.coordinates;

    const [orly, cdg, beauvais, parisCentre] = await (async () => {
      const orlyLeg = await toLeg([lon, lat], AIRPORT_ROUTING_COORDS.ORLY);
      await sleep(THROTTLE_MS);
      const cdgLeg = await toLeg([lon, lat], AIRPORT_ROUTING_COORDS.CDG);
      await sleep(THROTTLE_MS);
      const beauvaisLeg = await toLeg([lon, lat], AIRPORT_ROUTING_COORDS.BEAUVAIS);
      await sleep(THROTTLE_MS);
      const parisLeg = await toLeg([lon, lat], parisCentreCoord);
      await sleep(THROTTLE_MS);
      return [orlyLeg, cdgLeg, beauvaisLeg, parisLeg];
    })();

    enriched.push({
      insee: c.code,
      slug,
      nom: c.nom,
      codePostal: c.codesPostaux[0],
      departement: c.departement.code,
      population: c.population,
      lat,
      lon,
      inFixedZone: FIXED_ZONE_DEPARTEMENTS.has(c.departement.code),
      airports: { orly, cdg, beauvais },
      parisCentre,
      gares: [],
      nearby: [],
    });

    // Sauvegarde incrémentale : une interruption ne perd pas le travail déjà fait.
    writeFileSync(OUT_PATH, `${JSON.stringify(enriched, null, 2)}\n`, "utf-8");
  }

  // Maillage interne : calculé une fois toutes les communes enrichies (nécessite lat/lon
  // de l'ensemble du jeu de données).
  for (const c of enriched) {
    const distances = enriched
      .filter((other) => other.insee !== c.insee)
      .map((other) => ({ slug: other.slug, d: haversineKm(c.lat, c.lon, other.lat, other.lon) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, NEARBY_COUNT)
      .map((x) => x.slug);
    c.nearby = distances;
  }

  writeFileSync(OUT_PATH, `${JSON.stringify(enriched, null, 2)}\n`, "utf-8");
  console.log(`[enrich-communes] terminé : ${enriched.length} communes écrites dans ${OUT_PATH.pathname}`);
}

main().catch((err) => {
  console.error("[enrich-communes] échec :", err);
  process.exitCode = 1;
});
