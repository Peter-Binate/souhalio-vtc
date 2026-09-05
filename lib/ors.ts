// SERVEUR uniquement — n'importer que dans un Route Handler (jamais depuis un composant).
import ky from "ky";
import { orsDirectionsSchema, orsMatrixSchema } from "@/schemas/itinerary";
import { ROUTE_DURATION_CORRECTION } from "@/lib/constants";

const ORS_BASE =
  "https://api.openrouteservice.org/v2/directions/driving-car/geojson";
const ORS_MATRIX = "https://api.openrouteservice.org/v2/matrix/driving-car";

// ORS n'a pas de trafic temps réel et sous-estime surtout les trajets urbains
// courts — cf. le commentaire de ROUTE_DURATION_CORRECTION dans lib/constants.ts.
function correctDurationMin(durationMin: number, distanceKm: number): number {
  const tier = ROUTE_DURATION_CORRECTION.find((t) => distanceKm <= t.maxDistanceKm)!;
  return durationMin * tier.factor;
}

export async function getDirections(
  from: [number, number], // [lon, lat]
  to: [number, number], // [lon, lat]
  // Rayon de rattachement à une route (mètres), optionnel — ORS échoue par défaut
  // (350 m) sur certains centroïdes de commune isolés (ex. forêt de Fontainebleau).
  // Non utilisé par le simulateur de la home (comportement inchangé) ; utilisé par
  // scripts/enrich-communes.ts (LP-19) pour les cas limites.
  opts?: { radiuses?: [number, number] },
) {
  const json = await ky
    .post(ORS_BASE, {
      headers: {
        Authorization: process.env.ORS_API_KEY!,
        Accept: "application/json, application/geo+json",
      },
      json: {
        coordinates: [from, to],
        // ORS attend un rayon par coordonnée (2 waypoints ici), pas un tableau imbriqué.
        ...(opts?.radiuses ? { radiuses: opts.radiuses } : {}),
      },
      timeout: 10_000,
      retry: 1,
    })
    .json();

  const parsed = orsDirectionsSchema.parse(json);
  const feature = parsed.features[0];
  const distanceKm = feature.properties.summary.distance / 1000;
  return {
    geometry: feature.geometry,
    distanceKm,
    durationMin: correctDurationMin(feature.properties.summary.duration / 60, distanceKm),
  };
}

/**
 * Matrice sources × destinations en UNE requête ORS (endpoint Matrix), au lieu d'un appel
 * Directions par trajet. Réservé aux scripts de données (LP-19/LP-22) : le quota gratuit ne
 * permet pas d'enrichir des centaines de communes trajet par trajet. Vérifié sur des trajets
 * réels : Matrix renvoie les mêmes distances/durées que Directions (même graphe de routage).
 *
 * Une case `null` (aucun itinéraire trouvé) devient `null` dans le résultat — à l'appelant
 * de décider quoi en faire plutôt que de propager un 0 silencieux.
 */
export async function getMatrix(
  sources: readonly [number, number][], // [lon, lat]
  destinations: readonly [number, number][], // [lon, lat]
): Promise<({ km: number; min: number } | null)[][]> {
  const locations = [...sources, ...destinations];
  const json = await ky
    .post(ORS_MATRIX, {
      headers: { Authorization: process.env.ORS_API_KEY! },
      json: {
        locations,
        sources: sources.map((_, i) => i),
        destinations: destinations.map((_, i) => sources.length + i),
        metrics: ["distance", "duration"],
        units: "m",
      },
      timeout: 30_000,
      retry: 1,
    })
    .json();

  const parsed = orsMatrixSchema.parse(json);
  return parsed.durations.map((row, i) =>
    row.map((seconds, j) => {
      const meters = parsed.distances[i]?.[j];
      if (seconds === null || meters === null || meters === undefined) return null;
      const distanceKm = meters / 1000;
      return {
        km: Math.round(distanceKm * 10) / 10,
        min: Math.round(correctDurationMin(seconds / 60, distanceKm)),
      };
    }),
  );
}
