// CLIENT uniquement — géocodage MapTiler avec clé publique restreinte par domaine.
import ky from "ky";
import { geocodeSchema, type GeocodeFeature } from "@/schemas/itinerary";

// Biais Paris/Île-de-France [lon, lat] pour prioriser les résultats de géocodage.
const PROXIMITY_BIAS = "2.3522,48.8566";

export async function geocode(query: string): Promise<GeocodeFeature[]> {
  if (query.trim().length < 3) return [];

  const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json`;
  const json = await ky
    .get(url, {
      searchParams: {
        key: process.env.NEXT_PUBLIC_MAPTILER_KEY!,
        country: "fr",
        proximity: PROXIMITY_BIAS,
        autocomplete: "true",
        limit: "5",
      },
      timeout: 8_000,
      retry: 1,
    })
    .json();

  return geocodeSchema.parse(json).features;
}
