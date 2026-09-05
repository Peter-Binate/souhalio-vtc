// Maillage interne : les N communes les plus proches à vol d'oiseau, pour les liens
// « communes proches également desservies » des pages ville. Purement géométrique —
// aucun appel ORS —, donc rejouable à tout moment sur data/communes.json.
import type { Commune } from "@/schemas/commune";

export const NEARBY_COUNT = 5;

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Renseigne `nearby` sur place pour chaque commune de la liste (mutation assumée : script one-off). */
export function computeNearby(communes: Commune[], count = NEARBY_COUNT): void {
  for (const c of communes) {
    c.nearby = communes
      .filter((other) => other.insee !== c.insee)
      .map((other) => ({ slug: other.slug, d: haversineKm(c.lat, c.lon, other.lat, other.lon) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, count)
      .map((x) => x.slug);
  }
}
