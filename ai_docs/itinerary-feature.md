# Fonctionnalité : simulateur d'itinéraire

Feature centrale du hero. Objectif : engager le visiteur (itinéraire + estimation) puis le pousser à **appeler** pour confirmer.

## Comportement attendu

1. Deux champs avec autocomplétion : **Départ** et **Destination** (géocodage MapTiler → `[lon, lat]`).
2. Bouton **« Calculer l'itinéraire »** (désactivé tant que les 2 points ne sont pas résolus).
3. Au clic : `useMutation` → `POST /api/route` (ky) → `{ geometry, distanceKm, durationMin }`.
4. Affichage : tracé sur la carte MapLibre + panneau récap **« Distance · Durée · Estimation »**.
5. **Estimation** calculée par `lib/pricing.ts`. Si trajet aéroport (Orly/CDG/Beauvais depuis Paris/proche banlieue) → **tarif fixe prioritaire**.
6. Mention obligatoire : « Estimation indicative — tarif confirmé lors de la réservation. » + CTA **appel** (+ WhatsApp).

## Contrats de données

**Requête client → `/api/route`**
```ts
{ from: [number, number]; to: [number, number] } // [lon, lat]
```

**Réponse `/api/route` → client**
```ts
{
  geometry: { type: "LineString"; coordinates: [number, number][] };
  distanceKm: number;
  durationMin: number;
}
```

## Schémas Zod

```ts
// schemas/itinerary.ts
import { z } from "zod";

export const coordSchema = z.tuple([z.number(), z.number()]); // [lon, lat]

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

export type RouteResponse = z.infer<typeof routeResponseSchema>;
```

## Grille tarifaire — ⚠️ FICTIVE, à remplacer

Centralisée dans `lib/constants.ts`. Valeurs **fictives** fournies pour le développement ; le client fournira les vraies.

```ts
// lib/constants.ts (extrait)
export const PRICING = {
  baseFare: 8.0,       // prise en charge (€)
  perKm: 2.2,          // €/km
  perMin: 0.45,        // €/min
  minFare: 20.0,       // minimum de course (€)
  nightSurcharge: 0.15 // +15% nuit (20h–6h), dimanches & jours fériés
} as const;

// Tarifs fixes aéroport — au départ de Paris et proche banlieue
export const AIRPORT_FARES = {
  ORLY: 50,
  CDG: 65,       // Roissy-Charles de Gaulle
  BEAUVAIS: 120,
} as const;
```

## Logique de prix

```ts
// lib/pricing.ts
import { PRICING } from "@/lib/constants";

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
  return Math.round(total); // arrondi à l'euro
}
```

**Override aéroport** : avant d'appeler `estimatePrice`, détecter si le départ ou l'arrivée est un aéroport (rayon autour du point aéroport, ou sélection explicite dans l'autocomplétion) et, le cas échéant, afficher `AIRPORT_FARES[…]` à la place. Toujours indiquer que le tarif fixe s'applique **au départ de Paris et proche banlieue**.

## TanStack Query

```ts
// hook de calcul (client)
import { useMutation } from "@tanstack/react-query";
import { internalApi } from "@/lib/ky";
import { routeResponseSchema, type RouteResponse } from "@/schemas/itinerary";

export function useRoute() {
  return useMutation<RouteResponse, Error, { from: [number, number]; to: [number, number] }>({
    mutationFn: async (vars) => {
      const json = await internalApi.post("api/route", { json: vars }).json();
      return routeResponseSchema.parse(json);
    },
  });
}
```

```ts
// lib/ky.ts
import ky from "ky";

// API interne (Route Handlers) — relatif, côté client
export const internalApi = ky.create({ timeout: 12_000, retry: 0 });
```

## Validation du formulaire (Zod)

Le formulaire est valide quand **les deux points sont résolus en coordonnées** (pas juste du texte). Recommandé : stocker `from`/`to` comme `{ label: string; coord: [number, number] } | null` et n'activer le bouton que si les deux `coord` existent. Utiliser `react-hook-form` + `zodResolver` si le formulaire s'étoffe, sinon un état local validé par `routeRequestSchema`.

## UX & conversion

- Bouton désactivé + spinner pendant `isPending`.
- Sur erreur : message générique + repli sur le CTA téléphone (« Appelez pour votre tarif »).
- Panneau résultat toujours accompagné du **CTA appel** (prioritaire) et **WhatsApp**.
- La carte ne doit pas capturer le scroll de page sur mobile (activer l'interaction au tap/hover).

## Découpage des composants

```
components/itinerary/
  itinerary-simulator.tsx   # orchestre form + carte + résultat (client)
  address-autocomplete.tsx  # input + suggestions MapTiler (debounce)
  route-map-loader.tsx      # dynamic import ssr:false
  route-map.tsx             # MapLibre (voir maplibre-maptiler.md)
  price-estimate.tsx        # panneau distance/durée/estimation + CTA
```
