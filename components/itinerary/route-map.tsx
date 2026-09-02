"use client";

import { useEffect, useRef } from "react";
import {
  MapLibreMap,
  NavigationControl,
  LngLatBounds,
  type GeoJSONSource,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { RouteResponse } from "@/schemas/itinerary";

const STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`;

type RouteGeometry = RouteResponse["geometry"];

export default function RouteMap({ route }: { route: RouteGeometry | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  // Init une seule fois.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new MapLibreMap({
      container: containerRef.current,
      style: STYLE_URL,
      center: [2.3522, 48.8566], // Paris [lon, lat]
      zoom: 9,
      // Deux doigts pour déplacer/zoomer sur mobile : la carte ne piège pas le scroll de page.
      cooperativeGestures: true,
    });
    map.addControl(new NavigationControl(), "top-right");
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Dessine / met à jour le tracé.
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
        (b, c) => b.extend(c),
        new LngLatBounds(coords[0], coords[0]),
      );
      map.fitBounds(bounds, { padding: 48 });
    };

    if (map.isStyleLoaded()) draw();
    else map.once("load", draw);
  }, [route]);

  return (
    <div
      ref={containerRef}
      aria-label="Carte de l'itinéraire"
      className="h-[360px] w-full rounded-lg"
    />
  );
}
