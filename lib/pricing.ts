import { AIRPORTS, AIRPORT_FARES, PRICING } from "@/lib/constants";

// Accepte aussi bien un tuple mutable (Coord de schemas/itinerary) qu'un tuple `as const` (AIRPORTS).
type Coord = readonly [number, number];

// Rayon (km) en-deçà duquel un point est considéré comme "à l'aéroport".
const AIRPORT_RADIUS_KM = 3;
const EARTH_RADIUS_KM = 6371;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function distanceKmBetween([lon1, lat1]: Coord, [lon2, lat2]: Coord): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

// Tarif fixe si départ ou arrivée est un aéroport (Orly/CDG/Beauvais) — prioritaire sur estimatePrice.
// Aéroport-à-aéroport (cas non spécifié par le produit) : ordre de priorité ORLY → CDG → BEAUVAIS.
export function getAirportFareOverride(from: Coord, to: Coord): number | null {
  for (const code of Object.keys(AIRPORTS) as (keyof typeof AIRPORTS)[]) {
    const { coord } = AIRPORTS[code];
    if (
      distanceKmBetween(from, coord) <= AIRPORT_RADIUS_KM ||
      distanceKmBetween(to, coord) <= AIRPORT_RADIUS_KM
    ) {
      return AIRPORT_FARES[code];
    }
  }
  return null;
}

export function estimatePrice(
  distanceKm: number,
  durationMin: number,
  opts: { isNightOrHoliday?: boolean } = {},
): number {
  const raw =
    PRICING.baseFare + distanceKm * PRICING.perKm + durationMin * PRICING.perMin;
  const withMin = Math.max(raw, PRICING.minFare);
  const total = opts.isNightOrHoliday
    ? withMin * (1 + PRICING.nightSurcharge)
    : withMin;
  return Math.round(total);
}

export type FareEstimate = { amount: number; isFixedAirportFare: boolean };

// Combine les deux règles de tarification : tarif fixe aéroport prioritaire, sinon grille calculée.
export function getFareEstimate(
  from: Coord,
  to: Coord,
  distanceKm: number,
  durationMin: number,
  opts: { isNightOrHoliday?: boolean } = {},
): FareEstimate {
  const airportFare = getAirportFareOverride(from, to);
  if (airportFare !== null) {
    return { amount: airportFare, isFixedAirportFare: true };
  }
  return { amount: estimatePrice(distanceKm, durationMin, opts), isFixedAirportFare: false };
}
