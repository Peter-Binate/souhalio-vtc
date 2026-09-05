// Appels ORS pour les scripts de données (one-off, hors build).
//
// Les scripts utilisent l'endpoint **Matrix** (une requête pour N×M trajets) plutôt que
// Directions trajet par trajet : le quota gratuit ORS (~2 000 requêtes/jour) ne permet pas
// d'enrichir 266 communes × 4 destinations autrement — un run Directions complet épuise le
// quota avant la fin (constaté en LP-19 puis LP-21). Matrix renvoie les mêmes valeurs que
// Directions (même graphe de routage), vérifié sur des trajets réels.
//
// Directions reste utilisé en repli pour les points isolés qui ne s'accrochent pas au réseau
// routier dans le rayon par défaut (350 m) — Matrix n'accepte pas l'option `radiuses`.
import { getDirections, getMatrix } from "@/lib/ors";
import type { Leg } from "@/schemas/commune";

export const THROTTLE_MS = 2_500; // marge de sécurité sous ~40 req/min

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Un trajet isolé, avec élargissement du rayon de rattachement si le point est trop isolé. */
async function legViaDirections(
  from: [number, number],
  to: [number, number],
): Promise<Leg> {
  let result;
  try {
    result = await getDirections(from, to);
  } catch (err) {
    console.warn(`[ors] rayon par défaut insuffisant, réessai à 2 km (${(err as Error).message})`);
    result = await getDirections(from, to, { radiuses: [2000, 2000] });
  }
  return { km: Math.round(result.distanceKm * 10) / 10, min: Math.round(result.durationMin) };
}

/**
 * Matrice sources × destinations, robuste aux points problématiques : si ORS rejette le lot
 * (un point non routable fait échouer toute la requête), on dichotomise, puis on retombe sur
 * Directions avec un rayon élargi pour la source fautive. Throttlé entre chaque requête.
 */
export async function matrixLegs(
  sources: readonly [number, number][],
  destinations: readonly [number, number][],
): Promise<Leg[][]> {
  if (sources.length === 0) return [];

  try {
    const rows = await getMatrix(sources, destinations);
    await sleep(THROTTLE_MS);

    // Une case nulle = pas d'itinéraire trouvé pour ce couple : on repasse en Directions
    // (rayon élargi) uniquement sur les cases concernées, pas sur tout le lot.
    return await Promise.all(
      rows.map(async (row, i) =>
        Promise.all(
          row.map(async (leg, j) => leg ?? legViaDirections(sources[i], destinations[j])),
        ),
      ),
    );
  } catch (err) {
    if (sources.length === 1) {
      console.warn(
        `[ors] Matrix a rejeté ${JSON.stringify(sources[0])} (${(err as Error).message}) — repli Directions`,
      );
      const legs: Leg[] = [];
      for (const to of destinations) {
        legs.push(await legViaDirections(sources[0], to));
        await sleep(THROTTLE_MS);
      }
      return [legs];
    }

    const mid = Math.ceil(sources.length / 2);
    console.warn(
      `[ors] Matrix a échoué sur un lot de ${sources.length} (${(err as Error).message}) — dichotomie`,
    );
    const first = await matrixLegs(sources.slice(0, mid), destinations);
    const second = await matrixLegs(sources.slice(mid), destinations);
    return [...first, ...second];
  }
}
