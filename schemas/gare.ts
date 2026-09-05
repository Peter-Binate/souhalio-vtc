import { z } from "zod";
import { legSchema } from "@/schemas/commune";

// Réponse brute de l'API SNCF Open Data (jeu « gares-de-voyageurs ») — parsée avant tout usage.
// cf. https://ressources.data.sncf.com/explore/dataset/gares-de-voyageurs/
export const gareApiSchema = z.object({
  nom: z.string(),
  codeinsee: z.string(),
  codes_uic: z.string(), // une ou plusieurs UIC séparées par ";" (plusieurs plateformes)
  position_geographique: z.object({ lat: z.number(), lon: z.number() }),
});
export type GareApi = z.infer<typeof gareApiSchema>;

// Gare de référence (data/gares.raw.json) : géodonnées SNCF + éditorial curaté.
export const gareRawSchema = z.object({
  uic: z.string(), // id stable (première UIC du jeu SNCF)
  slug: z.string(),
  nom: z.string(), // libellé SNCF, ex. "Paris Gare de Lyon"
  nomCourt: z.string(), // libellé d'usage, ex. "Gare de Lyon"
  commune: z.string(), // ex. "Paris 12e"
  codeInsee: z.string(),
  departement: z.string(),
  lat: z.number(),
  lon: z.number(),
  inFixedZone: z.boolean(), // département ∈ {75, 92, 93, 94} → tarif fixe aéroport applicable
  dessertes: z.array(z.string()).min(1), // grandes destinations desservies (fait public)
  presentation: z.string(),
});
export type GareRaw = z.infer<typeof gareRawSchema>;

// Gare enrichie (data/gares.json) — écrite par scripts/enrich-gares.ts.
export const gareSchema = gareRawSchema.extend({
  airports: z.object({ orly: legSchema, cdg: legSchema, beauvais: legSchema }),
  // Trajets vers les autres gares du jeu (correspondance de gare à gare en VTC).
  versGares: z.array(legSchema.extend({ slug: z.string() })),
});
export type Gare = z.infer<typeof gareSchema>;
