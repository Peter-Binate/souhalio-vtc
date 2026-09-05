import { z } from "zod";

export const coordSchema = z.tuple([z.number(), z.number()]); // [lon, lat]
export type Coord = z.infer<typeof coordSchema>;

export const routeRequestSchema = z.object({
  from: coordSchema,
  to: coordSchema,
});

export const routeResponseSchema = z.object({
  geometry: z.object({
    type: z.literal("LineString"),
    coordinates: z.array(coordSchema),
  }),
  distanceKm: z.number().nonnegative(),
  durationMin: z.number().nonnegative(),
});

export type RouteRequest = z.infer<typeof routeRequestSchema>;
export type RouteResponse = z.infer<typeof routeResponseSchema>;

// Réponse brute d'OpenRouteService (Directions, GeoJSON) — parsée avant tout usage.
export const orsDirectionsSchema = z.object({
  features: z
    .array(
      z.object({
        geometry: z.object({
          type: z.literal("LineString"),
          coordinates: z.array(coordSchema),
        }),
        properties: z.object({
          summary: z.object({
            distance: z.number(), // mètres
            duration: z.number(), // secondes
          }),
        }),
      }),
    )
    .min(1),
});

// Réponse brute d'OpenRouteService (Matrix) — parsée avant tout usage.
// Le service renvoie une matrice sources × destinations ; une case peut être `null`
// lorsqu'aucun itinéraire n'est trouvé entre les deux points.
export const orsMatrixSchema = z.object({
  distances: z.array(z.array(z.number().nullable())), // mètres
  durations: z.array(z.array(z.number().nullable())), // secondes
});

// Réponse brute du géocodage MapTiler — parsée avant tout usage.
export const geocodeFeatureSchema = z.object({
  place_name: z.string(),
  center: coordSchema,
});

export const geocodeSchema = z.object({
  features: z.array(geocodeFeatureSchema),
});

export type GeocodeFeature = z.infer<typeof geocodeFeatureSchema>;
