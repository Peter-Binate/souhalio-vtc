"use client";

import dynamic from "next/dynamic";

export const RouteMap = dynamic(() => import("./route-map"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      aria-label="Chargement de la carte"
      className="h-[180px] w-full animate-pulse rounded-lg bg-zinc-200 sm:h-[195px] dark:bg-zinc-800"
    />
  ),
});
