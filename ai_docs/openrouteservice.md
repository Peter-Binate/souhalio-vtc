# OpenRouteService — Directions

Utilisé **uniquement côté serveur** (Route Handler `app/api/route/route.ts`), avec `ORS_API_KEY`.
Documentation officielle : https://openrouteservice.org/dev/#/api-docs

## ⚠️ Ordre des coordonnées

ORS attend des coordonnées au format **`[longitude, latitude]`** (l'inverse de l'usage courant lat/lon). Toujours vérifier l'ordre avant l'appel.

## Endpoint Directions (GeoJSON)

```
POST https://api.openrouteservice.org/v2/directions/driving-car/geojson
```

**Headers**

```
Authorization: <ORS_API_KEY>      # la clé brute, sans "Bearer"
Content-Type: application/json
Accept: application/json
```

**Body**

```json
{
  "coordinates": [
    [2.3522, 48.8566],
    [2.5479, 49.0097]
  ]
}
```

## Réponse (extrait utile)

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "LineString", "coordinates": [[2.35,48.85], ...] },
      "properties": {
        "summary": { "distance": 42350.1, "duration": 2510.4 }
      }
    }
  ]
}
```

- `summary.distance` → **mètres** → diviser par 1000 pour des km.
- `summary.duration` → **secondes** → diviser par 60 pour des minutes.
- `geometry` → `LineString` à passer tel quel à MapLibre (source GeoJSON).

## Schéma Zod de validation (réponse)

```ts
// schemas/itinerary.ts
import { z } from "zod";

export const orsDirectionsSchema = z.object({
  features: z.array(
    z.object({
      geometry: z.object({
        type: z.literal("LineString"),
        coordinates: z.array(z.tuple([z.number(), z.number()])),
      }),
      properties: z.object({
        summary: z.object({
          distance: z.number(), // mètres
          duration: z.number(), // secondes
        }),
      }),
    }),
  ).min(1),
});
```

## Client serveur (ky)

```ts
// lib/ors.ts  (SERVEUR uniquement — n'importer que dans un Route Handler)
import ky from "ky";
import { orsDirectionsSchema } from "@/schemas/itinerary";

const ORS_BASE = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

export async function getDirections(
  from: [number, number], // [lon, lat]
  to: [number, number],   // [lon, lat]
) {
  const json = await ky
    .post(ORS_BASE, {
      headers: { Authorization: process.env.ORS_API_KEY! },
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
```

## Route Handler (proxy)

```ts
// app/api/route/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDirections } from "@/lib/ors";

const bodySchema = z.object({
  from: z.tuple([z.number(), z.number()]), // [lon, lat]
  to: z.tuple([z.number(), z.number()]),
});

export async function POST(req: Request) {
  const parse = bodySchema.safeParse(await req.json());
  if (!parse.success) {
    return NextResponse.json({ error: "Coordonnées invalides." }, { status: 400 });
  }
  try {
    const result = await getDirections(parse.data.from, parse.data.to);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Calcul d'itinéraire indisponible." }, { status: 502 });
  }
}
```

## Limites & bonnes pratiques

- **Quota** : le plan gratuit ORS est limité (req/min et req/jour). Le proxy protège la clé mais pas le quota — envisager un throttling léger côté client (désactiver le bouton pendant le calcul).
- **Erreurs** : ne jamais renvoyer le message d'erreur ORS brut au client ; renvoyer un message générique.
- **Profil** : `driving-car` convient au VTC. Ne pas changer sans raison.

## Géocodage

Le géocodage/autocomplétion se fait via **MapTiler côté client** (voir `maplibre-maptiler.md`), pas via ORS, pour éviter d'exposer la clé ORS. ORS n'est utilisé que pour les **directions**.
