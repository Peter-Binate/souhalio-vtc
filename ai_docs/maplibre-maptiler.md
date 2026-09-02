# MapLibre GL JS + MapTiler dans Next.js

MapLibre affiche la carte et le tracé. MapTiler fournit les tuiles (style) et le géocodage.
Clé : `NEXT_PUBLIC_MAPTILER_KEY` (publique, **restreinte par domaine** dans le dashboard MapTiler).

## Installation

```bash
npm install maplibre-gl
```

## ⚠️ MapLibre est strictement client-side

MapLibre accède à `window`/`document` → il **casse en SSR**. Deux règles :

1. Le composant carte porte `"use client"`.
2. Il est chargé via `next/dynamic` avec `{ ssr: false }` depuis son parent.
3. Importer le CSS de MapLibre.

```tsx
// components/itinerary/route-map-loader.tsx
"use client";
import dynamic from "next/dynamic";

export const RouteMap = dynamic(() => import("./route-map"), {
  ssr: false,
  loading: () => <div className="h-[360px] w-full animate-pulse rounded-lg bg-muted" />,
});
```

## Composant carte

```tsx
// components/itinerary/route-map.tsx
"use client";
import { useEffect, useRef } from "react";
import maplibregl, { type Map as MlMap, type GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`;

type LineString = { type: "LineString"; coordinates: [number, number][] };

export default function RouteMap({ route }: { route: LineString | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);

  // Init une seule fois
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [2.3522, 48.8566], // Paris [lon, lat]
      zoom: 9,
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Dessiner / mettre à jour le tracé
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !route) return;

    const draw = () => {
      const data = { type: "Feature", geometry: route, properties: {} } as const;
      const existing = map.getSource("route") as GeoJSONSource | undefined;
      if (existing) {
        existing.setData(data as GeoJSON.Feature);
      } else {
        map.addSource("route", { type: "geojson", data: data as GeoJSON.Feature });
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#111827", "line-width": 5 },
        });
      }
      const coords = route.coordinates;
      const bounds = coords.reduce(
        (b, c) => b.extend(c as [number, number]),
        new maplibregl.LngLatBounds(coords[0], coords[0]),
      );
      map.fitBounds(bounds, { padding: 48 });
    };

    if (map.isStyleLoaded()) draw();
    else map.once("load", draw);
  }, [route]);

  return <div ref={containerRef} className="h-[360px] w-full rounded-lg" />;
}
```

## Géocodage / autocomplétion (MapTiler)

Convertit le texte saisi en coordonnées `[lon, lat]`. Restreindre à la France et biaiser vers l'Île-de-France.

```
GET https://api.maptiler.com/geocoding/{query}.json
      ?key=NEXT_PUBLIC_MAPTILER_KEY
      &country=fr
      &proximity=2.3522,48.8566      # biais Paris [lon,lat]
      &autocomplete=true
      &limit=5
```

Réponse : `features[].center = [lon, lat]` + `features[].place_name`.

```ts
// lib/maptiler.ts (client)
import ky from "ky";
import { z } from "zod";

const geocodeSchema = z.object({
  features: z.array(z.object({
    place_name: z.string(),
    center: z.tuple([z.number(), z.number()]), // [lon, lat]
  })),
});

export async function geocode(query: string) {
  if (query.trim().length < 3) return [];
  const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json`;
  const json = await ky.get(url, {
    searchParams: {
      key: process.env.NEXT_PUBLIC_MAPTILER_KEY!,
      country: "fr",
      proximity: "2.3522,48.8566",
      autocomplete: "true",
      limit: "5",
    },
  }).json();
  return geocodeSchema.parse(json).features;
}
```

> Câbler l'autocomplétion avec un **debounce** (~300 ms) et TanStack Query (`useQuery` avec `enabled: query.length >= 3`) pour limiter les appels.

## Pièges fréquents

- Oublier `import "maplibre-gl/dist/maplibre-gl.css"` → carte cassée visuellement.
- Rendre la carte en SSR → erreur `window is not defined`. Toujours `ssr: false`.
- Modifier une source avant `load` → gérer via `map.once("load", …)` / `isStyleLoaded()`.
- Confondre l'ordre `[lon, lat]` (MapLibre & ORS) et `[lat, lon]`.
- Ne pas appeler `map.remove()` au démontage → fuites mémoire.

## ⚠️ Carte qui n'apparaît jamais (tuiles jamais chargées) sous Turbopack

`maplibre-gl` v6+ déduit l'URL de son Web Worker (module ES) via `import.meta.url` au runtime. Sous Turbopack (`next dev`), cette résolution échoue silencieusement : le serveur Next.js répond avec sa page HTML de fallback (`Content-Type: text/html`) au lieu du script, et la console affiche :

```
Failed to load module script: The server responded with a non-JavaScript MIME type of "text/html".
```

Symptôme côté carte : `style.json`/`sprite`/`tiles.json` se chargent bien (200), mais aucune requête de tuile (`.pbf`) n'est jamais émise, et la carte reste figée sur la couleur de fond du style (aucune erreur `map.on("error")` ne se déclenche).

**Fix** : fixer explicitement l'URL du worker vers un asset statique servi par Next.js plutôt que de laisser `maplibre-gl` la déduire.

1. `scripts/copy-maplibre-worker.mjs` copie `node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs` **et** `maplibre-gl-shared.mjs` vers `public/` (lancé via `"predev"`/`"prebuild"`/`"postinstall"` dans `package.json`, fichiers générés donc **gitignorés**). Les deux fichiers sont nécessaires : `maplibre-gl-worker.mjs` importe `./maplibre-gl-shared.mjs` en relatif — sans lui, le worker se charge (plus de MIME error) mais son propre import échoue à son tour, toujours silencieusement, et les tuiles ne se chargent toujours pas.
2. Dans `components/itinerary/route-map.tsx`, avant toute création de `Map` :

```ts
import { setWorkerUrl } from "maplibre-gl";
setWorkerUrl("/maplibre-gl-worker.mjs");
```
