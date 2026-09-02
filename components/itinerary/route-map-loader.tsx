"use client";

import dynamic from "next/dynamic";

export const RouteMap = dynamic<{
  route: import("@/schemas/itinerary").RouteResponse["geometry"] | null;
  className?: string;
}>(() => import("./route-map"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      aria-label="Chargement de la carte"
      className="h-full min-h-[220px] w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800"
    />
  ),
});
