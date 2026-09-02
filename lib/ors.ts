// SERVEUR uniquement — n'importer que dans un Route Handler (jamais depuis un composant).
import ky from "ky";
import { orsDirectionsSchema } from "@/schemas/itinerary";

const ORS_BASE =
  "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

export async function getDirections(
  from: [number, number], // [lon, lat]
  to: [number, number], // [lon, lat]
) {
  const json = await ky
    .post(ORS_BASE, {
      headers: {
        Authorization: process.env.ORS_API_KEY!,
        Accept: "application/json, application/geo+json",
      },
      json: { coordinates: [from, to] },
      timeout: 10_000,
      retry: 1,
    })
    .json();

  const parsed = orsDirectionsSchema.parse(json);
  const feature = parsed.features[0];
  return {
    geometry: feature.geometry,
    distanceKm: feature.properties.summary.distance / 1000,
    durationMin: feature.properties.summary.duration / 60,
  };
}
