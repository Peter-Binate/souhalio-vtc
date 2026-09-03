import { z } from "zod";
import { coordSchema } from "@/schemas/itinerary";

// Réponse brute geo.api.gouv.fr (API Découpage administratif) — parsée avant tout usage.
// cf. https://geo.api.gouv.fr/communes?codeRegion=11&fields=nom,code,codesPostaux,population,centre,departement
export const communeApiSchema = z.object({
  nom: z.string(),
  code: z.string(), // code INSEE
  codesPostaux: z.array(z.string()).min(1),
  population: z.number().int().nonnegative(),
  centre: z.object({
    type: z.literal("Point"),
    coordinates: coordSchema, // [lon, lat]
  }),
  departement: z.object({
    code: z.string(),
    nom: z.string(),
  }),
});
export type CommuneApi = z.infer<typeof communeApiSchema>;

export const legSchema = z.object({
  km: z.number().nonnegative(),
  min: z.number().nonnegative(),
});
export type Leg = z.infer<typeof legSchema>;

// Commune enrichie (data/communes.json) — écrite par scripts/enrich-communes.ts, lue par
// app/vtc/[ville]/page.tsx et app/vtc/page.tsx.
export const communeSchema = z.object({
  insee: z.string(),
  slug: z.string(),
  nom: z.string(),
  codePostal: z.string(),
  departement: z.string(),
  population: z.number().int().nonnegative(),
  lat: z.number(),
  lon: z.number(),
  inFixedZone: z.boolean(), // département ∈ {75, 92, 93, 94}
  airports: z.object({
    orly: legSchema,
    cdg: legSchema,
    beauvais: legSchema,
  }),
  parisCentre: legSchema,
  gares: z.array(z.string()),
  nearby: z.array(z.string()), // slugs de communes proches
});
export type Commune = z.infer<typeof communeSchema>;
